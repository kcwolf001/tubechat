import { NextRequest, NextResponse } from "next/server";
import { execFile } from "child_process";
import { promisify } from "util";
import path from "path";

const execFileAsync = promisify(execFile);

export async function POST(request: NextRequest) {
  try {
    const { videoId } = await request.json();

    if (!videoId || typeof videoId !== "string") {
      return NextResponse.json(
        { error: "Missing or invalid videoId" },
        { status: 400 }
      );
    }

    // Call the Python script to fetch the transcript
    const scriptPath = path.join(process.cwd(), "scripts", "fetch-transcript.py");

    const { stdout, stderr } = await execFileAsync("python3", [scriptPath, videoId], {
      timeout: 30000, // 30 second timeout
    });

    if (stderr && !stderr.includes("NotOpenSSLWarning")) {
      console.error("Python stderr:", stderr);
    }

    const result = JSON.parse(stdout);

    if (result.error) {
      return NextResponse.json(
        { error: result.error },
        { status: 404 }
      );
    }

    const segments = result.segments;

    if (!segments || segments.length === 0) {
      return NextResponse.json(
        { error: "No transcript available for this video." },
        { status: 404 }
      );
    }

    // Build the full transcript with timestamps
    const fullText = segments
      .map((seg: { offset: number; text: string }) => `[${formatTime(seg.offset)}] ${seg.text}`)
      .join("\n");

    return NextResponse.json({
      videoId,
      segments,
      fullText,
    });
  } catch (error: unknown) {
    console.error("Transcript fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch transcript. Please check the URL and try again." },
      { status: 500 }
    );
  }
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
