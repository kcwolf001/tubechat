export function Comparison() {
  return (
    <section id="compare" className="py-24 md:py-32">
      <div className="mx-auto max-w-6xl px-6">
        {/* Section header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <p className="text-sm font-medium text-[var(--accent-light)] mb-3">
            Why TubeChat
          </p>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
            The old way vs.{" "}
            <span className="gradient-text">the smart way</span>
          </h2>
        </div>

        {/* Comparison table */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {/* Old way */}
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center">
                <span className="text-red-500 text-lg">✕</span>
              </div>
              <h3 className="text-lg font-semibold text-[var(--muted-foreground)]">
                Without TubeChat
              </h3>
            </div>
            <ul className="space-y-4">
              {oldWay.map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <svg
                    className="mt-0.5 flex-shrink-0 text-red-400"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M18 6L6 18M6 6l12 12" />
                  </svg>
                  <span className="text-sm text-[var(--muted-foreground)] leading-relaxed">
                    {item}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* New way */}
          <div className="glow-card rounded-2xl p-8 border-[var(--accent)]/30">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center">
                <span className="text-emerald-500 text-lg">✓</span>
              </div>
              <h3 className="text-lg font-semibold">With TubeChat</h3>
            </div>
            <ul className="space-y-4">
              {newWay.map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <svg
                    className="mt-0.5 flex-shrink-0 text-emerald-400"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M20 6L9 17l-5-5" />
                  </svg>
                  <span className="text-sm leading-relaxed">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

const oldWay = [
  "Watch the entire video just to find one answer",
  "Scrub back and forth through timestamps manually",
  "Pause, rewind, replay — lose your train of thought",
  "Take notes by hand while watching",
  "No way to search inside the video content",
  "Forget key details hours after watching",
];

const newWay = [
  "Ask a question, get the answer in seconds",
  "Clickable timestamps jump you to the exact moment",
  "Have a conversation — follow-up questions welcome",
  "AI generates notes, summaries, and key takeaways",
  "Every word in the video is searchable through chat",
  "Your conversation is saved — revisit anytime",
];
