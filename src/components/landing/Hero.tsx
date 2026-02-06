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
              className="h-4 w-4 animate-claude-think"
              viewBox="0 0 60 60"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle cx="30" cy="10.5" r="5.5" fill="#E07A3A" />
              <circle cx="47.5" cy="20" r="5.5" fill="#E07A3A" />
              <circle cx="47.5" cy="40" r="5.5" fill="#E07A3A" />
              <circle cx="30" cy="49.5" r="5.5" fill="#E07A3A" />
              <circle cx="12.5" cy="40" r="5.5" fill="#E07A3A" />
              <circle cx="12.5" cy="20" r="5.5" fill="#E07A3A" />
              <circle cx="30" cy="30" r="7" fill="#E07A3A" />
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
          Paste a link, ask a question, get an answer with timestamps.
          <br className="hidden md:block" />
          No more scrubbing through hours of video.
        </p>

        {/* URL Input */}
        <form
          onSubmit={handleSubmit}
          className="mt-10 max-w-2xl mx-auto animate-fade-in-up-delay-2"
        >
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <svg
                className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)]"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
              </svg>
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="Paste a YouTube URL..."
                className="w-full rounded-xl border border-[var(--border)] bg-[var(--muted)] py-3.5 pl-12 pr-4 text-sm text-[var(--foreground)] placeholder-[var(--muted-foreground)] outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent-glow)] transition-all"
              />
            </div>
            <button
              type="submit"
              className="rounded-xl bg-gradient-to-r from-[var(--accent)] to-[var(--accent-light)] px-6 py-3.5 text-sm font-medium text-white transition-all hover:opacity-90 hover:shadow-lg hover:shadow-[var(--accent-glow)] active:scale-[0.98] whitespace-nowrap"
            >
              Start chatting →
            </button>
          </div>
          <p className="mt-3 text-center text-xs text-[var(--muted-foreground)]">
            Try it with any public YouTube video — no sign-up required
          </p>
        </form>

        {/* Chat preview mockup */}
        <div className="mt-16 max-w-3xl mx-auto animate-fade-in-up-delay-3">
          <div className="rounded-2xl border border-[var(--card-border)] bg-[var(--card)] shadow-2xl shadow-black/10 overflow-hidden">
            {/* Window chrome */}
            <div className="flex items-center gap-2 px-4 py-3 border-b border-[var(--border)]">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-[#ff5f57]" />
                <div className="w-3 h-3 rounded-full bg-[#febc2e]" />
                <div className="w-3 h-3 rounded-full bg-[#28c840]" />
              </div>
              <div className="flex-1 text-center">
                <span className="text-xs text-[var(--muted-foreground)]">
                  tubechat.ai/chat
                </span>
              </div>
            </div>

            {/* Mock chat content */}
            <div className="p-6 space-y-4">
              {/* Video title area */}
              <div className="flex items-center gap-3 pb-4 border-b border-[var(--border)]">
                <div className="w-16 h-10 rounded-lg bg-gradient-to-br from-red-500/20 to-red-600/20 flex items-center justify-center">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-red-500">
                    <polygon points="5 3 19 12 5 21 5 3" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium">How Neural Networks Learn — 3Blue1Brown</p>
                  <p className="text-xs text-[var(--muted-foreground)]">24:18 · 12.4M views</p>
                </div>
              </div>

              {/* User message */}
              <div className="flex justify-end">
                <div className="max-w-xs rounded-2xl rounded-br-md bg-gradient-to-r from-[var(--accent)] to-[var(--accent-light)] px-4 py-2.5">
                  <p className="text-sm text-white">
                    What is backpropagation in simple terms?
                  </p>
                </div>
              </div>

              {/* AI response */}
              <div className="flex justify-start">
                <div className="max-w-sm rounded-2xl rounded-bl-md bg-[var(--muted)] px-4 py-3">
                  <p className="text-sm leading-relaxed">
                    Backpropagation is the process of adjusting the network&apos;s
                    weights by working backwards from the output error. Think of
                    it as the network &quot;learning from its mistakes.&quot;
                  </p>
                  <span className="inline-block mt-2 text-xs text-[var(--accent-light)] font-medium cursor-pointer hover:underline">
                    📍 12:34 — 14:02
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

