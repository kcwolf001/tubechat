import { NextRequest, NextResponse } from "next/server";

export const runtime = "edge";

const USER_AGENT =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36";

// YouTube XML formats:
// Format 3 (current): <p t="ms" d="ms">text</p> or <p t="ms" d="ms"><s>word</s>...</p>
// Legacy:             <text start="sec" dur="sec">text</text>
const RE_FORMAT3 = /<p t="(\d+)" d="(\d+)"[^>]*>([\s\S]*?)<\/p>/g;
const RE_LEGACY = /<text start="([^"]*)" dur="([^"]*)">([^<]*)<\/text>/g;
const RE_STRIP_TAGS = /<[^>]+>/g;

interface InnertubeClient {
  clientName: string;
  clientVersion: string;
}

const INNERTUBE_CLIENTS: InnertubeClient[] = [
  { clientName: "ANDROID", clientVersion: "20.10.38" },
  { clientName: "TVHTML5_SIMPLY_EMBEDDED_PLAYER", clientVersion: "2.0" },
];

/** Try a single innertube client and return caption tracks or null */
async function tryInnertubeClient(
  videoId: string,
  apiKey: string,
  client: InnertubeClient,
  cookies: string,
  visitorData?: string
): Promise<{ tracks: unknown[] | null; botBlocked: boolean }> {
  const playerResp = await fetch(
    `https://www.youtube.com/youtubei/v1/player?key=${apiKey}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: cookies,
        ...(visitorData && { "X-Goog-Visitor-Id": visitorData }),
      },
      body: JSON.stringify({
        context: {
          client: {
            ...client,
            ...(visitorData && { visitorData }),
          },
          ...(client.clientName === "TVHTML5_SIMPLY_EMBEDDED_PLAYER" && {
            thirdParty: { embedUrl: "https://www.youtube.com" },
          }),
        },
        videoId,
      }),
    }
  );
  const playerJson = await playerResp.json();
  const tracks =
    playerJson?.captions?.playerCaptionsTracklistRenderer?.captionTracks;

  if (tracks?.length) {
    return { tracks, botBlocked: false };
  }

  const reason = playerJson?.playabilityStatus?.reason ?? "";
  const isBot = reason.toLowerCase().includes("bot");
  return { tracks: null, botBlocked: isBot };
}

export async function POST(request: NextRequest) {
  try {
    const { videoId } = await request.json();

    if (!videoId || typeof videoId !== "string") {
      return NextResponse.json(
        { error: "Missing or invalid videoId" },
        { status: 400 }
      );
    }

    // 1) Establish a YouTube session by fetching the homepage first.
    const homeResp = await fetch("https://www.youtube.com/", {
      headers: { "User-Agent": USER_AGENT },
    });
    const sessionCookies = extractCookies(homeResp);

    // 2) Fetch the YouTube watch page with session cookies
    const watchResp = await fetch(
      `https://www.youtube.com/watch?v=${videoId}`,
      {
        headers: {
          "User-Agent": USER_AGENT,
          Cookie: sessionCookies,
        },
      }
    );
    const watchBody = await watchResp.text();
    const allCookies = mergeCookies(sessionCookies, extractCookies(watchResp));

    if (watchBody.includes('class="g-recaptcha"')) {
      return NextResponse.json(
        { error: "YouTube rate limit. Please try again later." },
        { status: 429 }
      );
    }

    const apiKeyMatch = watchBody.match(/"INNERTUBE_API_KEY":"([^"]+)"/);
    if (!apiKeyMatch) {
      return NextResponse.json(
        { error: "No transcript available for this video." },
        { status: 404 }
      );
    }

    const visitorData =
      watchBody.match(/"VISITOR_DATA":"([^"]+)"/)?.[1] ?? undefined;

    // 3) Try multiple innertube clients
    let captionTracks: unknown[] | null = null;
    let anyBotBlocked = false;

    for (const client of INNERTUBE_CLIENTS) {
      const result = await tryInnertubeClient(
        videoId,
        apiKeyMatch[1],
        client,
        allCookies,
        visitorData
      );
      if (result.tracks) {
        captionTracks = result.tracks;
        break;
      }
      if (result.botBlocked) {
        anyBotBlocked = true;
      }
    }

    if (!captionTracks) {
      if (anyBotBlocked) {
        return NextResponse.json(
          {
            error:
              "YouTube is temporarily blocking this video's transcript. Retrying with alternate method...",
            fallbackAvailable: true,
          },
          { status: 503 }
        );
      }
      return NextResponse.json(
        { error: "No transcript available for this video." },
        { status: 404 }
      );
    }

    // 4) Fetch transcript XML — strip fmt param to get simpler legacy format
    const transcriptURL = (
      (captionTracks[0] as { baseUrl: string }).baseUrl
    ).replace(/&fmt=[^&]+/, "");
    const transcriptResp = await fetch(transcriptURL, {
      headers: { "User-Agent": USER_AGENT },
    });
    const transcriptBody = await transcriptResp.text();

    // 5) Parse — try format 3 first (<p t="ms" d="ms">), fall back to legacy
    const segments = parseTranscriptXML(transcriptBody);

    if (segments.length === 0) {
      return NextResponse.json(
        { error: "No transcript available for this video." },
        { status: 404 }
      );
    }

    const fullText = segments
      .map((seg) => `[${formatTime(seg.offset)}] ${seg.text}`)
      .join("\n");

    return NextResponse.json({ videoId, segments, fullText });
  } catch (error: unknown) {
    console.error("Transcript fetch error:", error);
    return NextResponse.json(
      {
        error:
          "Failed to fetch transcript. Please check the URL and try again.",
      },
      { status: 500 }
    );
  }
}

/** Parse YouTube transcript XML (format 3 or legacy) into segments */
export function parseTranscriptXML(
  xml: string
): { text: string; offset: number; duration: number }[] {
  let items = [...xml.matchAll(RE_FORMAT3)]
    .map((m) => ({
      text: m[3].replace(RE_STRIP_TAGS, ""),
      offset: parseFloat(m[1]) / 1000,
      duration: parseFloat(m[2]) / 1000,
    }))
    .filter((item) => item.text.trim().length > 0);

  if (items.length === 0) {
    items = [...xml.matchAll(RE_LEGACY)].map((m) => ({
      text: m[3],
      offset: parseFloat(m[1]),
      duration: parseFloat(m[2]),
    }));
  }

  return items.map((item) => ({
    text: decodeHTMLEntities(item.text.trim()),
    offset: round2(item.offset),
    duration: round2(item.duration),
  }));
}

/** Extract Set-Cookie values into a single cookie header string */
function extractCookies(resp: Response): string {
  return (resp.headers.getSetCookie?.() ?? [])
    .map((c: string) => c.split(";")[0])
    .join("; ");
}

/** Merge two cookie strings */
function mergeCookies(a: string, b: string): string {
  return [a, b].filter(Boolean).join("; ");
}

export function decodeHTMLEntities(text: string): string {
  return text
    .replace(/&amp;/g, "&")
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)));
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

export function formatTime(totalSeconds: number): string {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = Math.floor(totalSeconds % 60);
  if (h > 0) {
    return `${h}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  }
  return `${m}:${s.toString().padStart(2, "0")}`;
}
