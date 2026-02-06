import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const videoId = request.nextUrl.searchParams.get("v");

  if (!videoId) {
    return NextResponse.json({ error: "Missing video ID" }, { status: 400 });
  }

  try {
    const url = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${encodeURIComponent(videoId)}&format=json`;
    const res = await fetch(url, { next: { revalidate: 86400 } }); // cache 24h

    if (!res.ok) {
      return NextResponse.json({ title: null });
    }

    const data = await res.json();
    return NextResponse.json({ title: data.title ?? null });
  } catch {
    return NextResponse.json({ title: null });
  }
}
