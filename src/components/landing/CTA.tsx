"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { extractVideoId } from "@/lib/utils";

export function CTA() {
  const [url, setUrl] = useState("");
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (url.trim()) {
      const videoId = extractVideoId(url.trim());
      if (videoId) {
        router.push(`/chat/${videoId}`);
      }
    }
  };

  return (
    <section className="py-24 md:py-32 bg-[var(--muted)]">
      <div className="mx-auto max-w-6xl px-6">
        <div className="relative rounded-3xl overflow-hidden">
          {/* Gradient background */}
          <div className="absolute inset-0 bg-gradient-to-br from-[var(--accent)] via-[var(--accent-light)] to-purple-400 opacity-90" />
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />

          <div className="relative px-8 py-16 md:px-16 md:py-24 text-center">
            <h2 className="text-3xl md:text-5xl font-bold text-white tracking-tight leading-tight">
              Ready to talk to
              <br />
              your next video?
            </h2>
            <p className="mt-4 text-lg text-white/80 max-w-xl mx-auto">
              Paste a YouTube URL and start getting answers in seconds. Free to
              try, no account needed.
            </p>

            <form
              onSubmit={handleSubmit}
              className="mt-10 max-w-xl mx-auto"
            >
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="text"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="Paste a YouTube URL..."
                  className="flex-1 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 py-3.5 px-5 text-sm text-white placeholder-white/50 outline-none focus:bg-white/15 focus:border-white/40 transition-all"
                />
                <button
                  type="submit"
                  className="rounded-xl bg-white px-6 py-3.5 text-sm font-semibold text-[var(--accent)] transition-all hover:bg-white/90 active:scale-[0.98] whitespace-nowrap"
                >
                  Start chatting →
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}

