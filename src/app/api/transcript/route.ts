import { NextRequest, NextResponse } from "next/server";
import { YoutubeTranscript } from "youtube-transcript";

export async function POST(request: NextRequest) {
  try {
    const { videoId } = await request.json();

    if (!videoId || typeof videoId !== "string") {
      return NextResponse.json(
        { error: "Missing or invalid videoId" },
        { status: 400 }
      );
    }

    const items = await YoutubeTranscript.fetchTranscript(videoId);

    if (!items || items.length === 0) {
      return NextResponse.json(
        { error: "No transcript available for this video." },
        { status: 404 }
      );
    }

    const segments = items.map((item) => ({
      text: item.text.trim(),
      offset: round2(item.offset),
      duration: round2(item.duration),
    }));

    // Build the full transcript with timestamps
    const fullText = segments
      .map((seg) => `[${formatTime(seg.offset)}] ${seg.text}`)
      .join("\n");

    return NextResponse.json({
      videoId,
      segments,
      fullText,
    });
  } catch (error: unknown) {
    console.error("Transcript fetch error:", error);

    const message =
      error instanceof Error && error.message.includes("disabled")
        ? "Transcripts are disabled for this video."
        : "Failed to fetch transcript. Please check the URL and try again.";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

/** Convert seconds to mm:ss or h:mm:ss */
function formatTime(totalSeconds: number): string {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = Math.floor(totalSeconds % 60);

  if (h > 0) {
    return `${h}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  }
  return `${m}:${s.toString().padStart(2, "0")}`;
}
