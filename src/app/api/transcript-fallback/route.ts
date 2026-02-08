import { NextRequest, NextResponse } from "next/server";
import {
  parseTranscriptXML,
  formatTime,
} from "@/app/api/transcript/route";

export const runtime = "edge";

// Deliberately different User-Agent from main route
const FALLBACK_UA =
  "com.google.android.youtube/19.29.37 (Linux; U; Android 14; en_US) gzip";

// Use a hardcoded innertube API key (public, used by YouTube's own clients)
const INNERTUBE_API_KEY = "AIzaSyA8eiZmM1FaDVjRy-df2KTyQ_vz_yYM39w";

export async function POST(request: NextRequest) {
  try {
    const { videoId } = await request.json();

    if (!videoId || typeof videoId !== "string") {
      return NextResponse.json(
        { error: "Missing or invalid videoId" },
        { status: 400 }
      );
    }

    // Skip session establishment entirely — use a bare innertube request
    // with ANDROID client and embed context for a different fingerprint
    const playerResp = await fetch(
      `https://www.youtube.com/youtubei/v1/player?key=${INNERTUBE_API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "User-Agent": FALLBACK_UA,
        },
        body: JSON.stringify({
          context: {
            client: {
              clientName: "ANDROID",
              clientVersion: "19.29.37",
              androidSdkVersion: 34,
              hl: "en",
              gl: "US",
            },
            thirdParty: {
              embedUrl: "https://www.google.com",
            },
          },
          videoId,
          contentCheckOk: true,
          racyCheckOk: true,
        }),
      }
    );

    const playerJson = await playerResp.json();
    const tracks =
      playerJson?.captions?.playerCaptionsTracklistRenderer?.captionTracks;

    if (!tracks?.length) {
      const reason = playerJson?.playabilityStatus?.reason ?? "";
      const isBot = reason.toLowerCase().includes("bot");
      return NextResponse.json(
        {
          error: isBot
            ? "YouTube is blocking this video's transcript from cloud servers. Please try again later or try a different video."
            : "No transcript available for this video.",
        },
        { status: isBot ? 503 : 404 }
      );
    }

    // Fetch transcript XML
    const transcriptURL = (tracks[0].baseUrl as string).replace(
      /&fmt=[^&]+/,
      ""
    );
    const transcriptResp = await fetch(transcriptURL, {
      headers: { "User-Agent": FALLBACK_UA },
    });
    const transcriptBody = await transcriptResp.text();

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
    console.error("Transcript fallback error:", error);
    return NextResponse.json(
      {
        error:
          "Failed to fetch transcript. Please check the URL and try again.",
      },
      { status: 500 }
    );
  }
}
