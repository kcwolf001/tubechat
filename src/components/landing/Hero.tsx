"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { extractVideoId } from "@/lib/utils";

const DEMO_URL = "https://youtube.com/watch?v=dQw4w9WgXcQ";

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

        {/* Animated demo */}
        <DemoAnimation />
      </div>
    </section>
  );
}

// Phases: typing URL -> pause -> cursor moves to button -> click -> reset
type DemoPhase = "idle" | "typing" | "pause" | "moving" | "clicking" | "done";

function DemoAnimation() {
  const [phase, setPhase] = useState<DemoPhase>("idle");
  const [typedChars, setTypedChars] = useState(0);
  const [cursorPos, setCursorPos] = useState<{ x: number; y: number } | null>(null);
  const buttonRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Run the animation loop
  useEffect(() => {
    let timeout: NodeJS.Timeout;

    const startCycle = () => {
      setTypedChars(0);
      setCursorPos(null);
      setPhase("typing");
    };

    // Initial delay
    timeout = setTimeout(startCycle, 1500);
    return () => clearTimeout(timeout);
  }, []);

  // Typing phase
  useEffect(() => {
    if (phase !== "typing") return;
    if (typedChars >= DEMO_URL.length) {
      const timeout = setTimeout(() => setPhase("pause"), 300);
      return () => clearTimeout(timeout);
    }
    const timeout = setTimeout(() => {
      setTypedChars((c) => c + 1);
    }, 35);
    return () => clearTimeout(timeout);
  }, [phase, typedChars]);

  // Pause then move cursor
  useEffect(() => {
    if (phase !== "pause") return;
    const timeout = setTimeout(() => {
      setPhase("moving");
    }, 600);
    return () => clearTimeout(timeout);
  }, [phase]);

  // Moving phase - animate cursor from input to button
  useEffect(() => {
    if (phase !== "moving") return;
    if (!buttonRef.current || !inputRef.current || !containerRef.current) return;

    const container = containerRef.current.getBoundingClientRect();
    const input = inputRef.current.getBoundingClientRect();
    const button = buttonRef.current.getBoundingClientRect();

    // Start cursor from center-bottom, below the input
    const startX = input.left - container.left + input.width / 2;
    const startY = input.bottom - container.top + 20;
    setCursorPos({ x: startX, y: startY });

    const endX = button.left - container.left + button.width / 2;
    const endY = button.top - container.top + button.height / 2;

    // Animate to button
    const timeout = setTimeout(() => {
      setCursorPos({ x: endX, y: endY });
      // After transition, click
      setTimeout(() => setPhase("clicking"), 850);
    }, 50);

    return () => clearTimeout(timeout);
  }, [phase]);

  // Click phase
  useEffect(() => {
    if (phase !== "clicking") return;
    const timeout = setTimeout(() => setPhase("done"), 400);
    return () => clearTimeout(timeout);
  }, [phase]);

  // Reset and loop
  useEffect(() => {
    if (phase !== "done") return;
    const timeout = setTimeout(() => {
      setTypedChars(0);
      setCursorPos(null);
      setPhase("idle");
      // Restart after a beat
      setTimeout(() => setPhase("typing"), 1200);
    }, 1500);
    return () => clearTimeout(timeout);
  }, [phase]);

  const displayedUrl = DEMO_URL.slice(0, typedChars);
  const isButtonHighlighted = phase === "moving" || phase === "clicking";

  return (
    <div
      ref={containerRef}
      className="relative mt-24 max-w-xl mx-auto animate-fade-in-up-delay-3"
    >
      {/* Subtle container box */}
      <div className="rounded-3xl border border-[var(--border)]/40 bg-[var(--muted)]/40 p-6 pb-20">
        {/* Mock input bar */}
        <div className="relative pointer-events-none" ref={inputRef}>
          <div className="w-full rounded-2xl border border-[var(--border)] bg-[var(--muted)] py-4 pl-5 pr-14 text-sm min-h-[54px]">
            {displayedUrl ? (
              <span className="text-[var(--foreground)]">
                {displayedUrl}
                {phase === "typing" && (
                  <span className="inline-block w-px h-4 bg-[var(--foreground)] ml-0.5 animate-pulse align-middle" />
                )}
              </span>
            ) : (
              <span className="text-[var(--muted-foreground)]">
                Paste a YouTube URL...
              </span>
            )}
          </div>
          <div
            ref={buttonRef}
            className={`absolute right-2.5 top-1/2 -translate-y-1/2 w-9 h-9 rounded-xl bg-gradient-to-r from-[var(--accent)] to-[var(--accent-light)] flex items-center justify-center text-white transition-all duration-200 ${
              isButtonHighlighted ? "shadow-lg shadow-[var(--accent-glow)] brightness-110" : ""
            } ${phase === "clicking" ? "scale-[0.85]" : ""}`}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 19V5" />
              <path d="M5 12l7-7 7 7" />
            </svg>
          </div>
        </div>
      </div>

      {/* Animated macOS-style cursor */}
      {cursorPos && (
        <div
          className="absolute z-10 transition-all duration-800 ease-in-out"
          style={{ left: cursorPos.x, top: cursorPos.y }}
        >
          <svg
            width="28"
            height="28"
            viewBox="0 0 28 28"
            fill="none"
            className="drop-shadow-[0_2px_4px_rgba(0,0,0,0.4)]"
          >
            <path
              d="M5.5 2L7.5 21L12 15.5L18.5 16.5L5.5 2Z"
              fill="white"
              stroke="black"
              strokeWidth="1.2"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      )}
    </div>
  );
}

