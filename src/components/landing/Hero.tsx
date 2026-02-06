"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { extractVideoId } from "@/lib/utils";

export function Hero() {
  const [url, setUrl] = useState("");
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (url.trim()) {
      // Extract video ID and navigate to chat page
      const videoId = extractVideoId(url.trim());
      if (videoId) {
        router.push(`/chat/${videoId}`);
      }
    }
  };

  return (
    <section className="relative pt-32 pb-20 md:pt-44 md:pb-32 overflow-hidden">
      {/* Background gradient orbs */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[var(--accent)] opacity-[0.07] rounded-full blur-[100px]" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[var(--accent-light)] opacity-[0.05] rounded-full blur-[100px]" />
      </div>

      <div className="relative mx-auto max-w-6xl px-6">
        {/* Badge */}
        <div className="flex justify-center mb-8 animate-fade-in-up">
          <span className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--muted)] px-4 py-1.5 text-xs font-medium text-[var(--muted-foreground)]">
            <svg
              className="h-4 w-4"
              viewBox="0 0 64 64"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Organic starburst arms radiating from center */}
              <g fill="#D4845A">
                <rect x="29" y="4" width="6" height="24" rx="3" transform="rotate(0 32 32)" />
                <rect x="29" y="4" width="6" height="24" rx="3" transform="rotate(40 32 32)" />
                <rect x="29" y="4" width="6" height="22" rx="3" transform="rotate(80 32 32)" />
                <rect x="29" y="4" width="6" height="24" rx="3" transform="rotate(120 32 32)" />
                <rect x="29" y="4" width="6" height="20" rx="3" transform="rotate(155 32 32)" />
                <rect x="29" y="4" width="6" height="24" rx="3" transform="rotate(195 32 32)" />
                <rect x="29" y="4" width="6" height="22" rx="3" transform="rotate(235 32 32)" />
                <rect x="29" y="4" width="6" height="24" rx="3" transform="rotate(275 32 32)" />
                <rect x="29" y="4" width="6" height="20" rx="3" transform="rotate(315 32 32)" />
              </g>
            </svg>
            Powered by Claude AI
          </span>
        </div>

        {/* Headline */}
        <h1 className="text-center text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.1] animate-fade-in-up">
          Talk to any
          <br />
          <span className="gradient-text">YouTube video</span>
        </h1>

        {/* Subheadline */}
        <p className="mt-6 text-center text-lg md:text-xl text-[var(--muted-foreground)] max-w-2xl mx-auto leading-relaxed animate-fade-in-up-delay-1">
          Paste a link, ask a question, get an answer with timestamps.{" "}
          <br className="hidden md:block" />
          No more scrubbing through hours of video.
        </p>

        {/* URL Input */}
        <form
          onSubmit={handleSubmit}
          className="mt-10 max-w-xl mx-auto animate-fade-in-up-delay-2"
        >
          <div className="relative">
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="Paste a YouTube URL..."
              className="w-full rounded-2xl border border-[var(--border)] bg-[var(--muted)] py-4 pl-5 pr-14 text-sm text-[var(--foreground)] placeholder-[var(--muted-foreground)] outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent-glow)] transition-all"
            />
            <button
              type="submit"
              className="absolute right-2.5 top-1/2 -translate-y-1/2 w-9 h-9 rounded-xl bg-gradient-to-r from-[var(--accent)] to-[var(--accent-light)] flex items-center justify-center text-white transition-all hover:opacity-90 hover:shadow-lg hover:shadow-[var(--accent-glow)] active:scale-[0.92]"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 19V5" />
                <path d="M5 12l7-7 7 7" />
              </svg>
            </button>
          </div>
          <p className="mt-3 text-center text-xs text-[var(--muted-foreground)]">
            Try it with any public YouTube video — no sign-up required
          </p>
        </form>
      </div>
    </section>
  );
}
