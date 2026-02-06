export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-24 md:py-32 bg-[var(--muted)]">
      <div className="mx-auto max-w-6xl px-6">
        {/* Section header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <p className="text-sm font-medium text-[var(--accent-light)] mb-3">
            How it works
          </p>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
            Three steps.{" "}
            <span className="gradient-text">Thirty seconds.</span>
          </h2>
          <p className="mt-4 text-[var(--muted-foreground)] leading-relaxed">
            No sign-up walls, no complicated setup. Just paste and go.
          </p>
        </div>

        {/* Steps */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
          {steps.map((step) => (
            <div key={step.number} className="relative text-center">
              {/* Step number */}
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br from-[var(--accent)] to-[var(--accent-light)] text-white text-lg font-bold mb-6">
                {step.number}
              </div>

              {/* Connector line (hidden on mobile, between cards on desktop) */}
              {step.number < 3 && (
                <div className="hidden md:block absolute top-6 left-[calc(50%+24px)] w-[calc(100%-48px)] h-px border-t-2 border-dashed border-[var(--border)]" />
              )}

              <h3 className="text-lg font-semibold mb-2">{step.title}</h3>
              <p className="text-sm text-[var(--muted-foreground)] leading-relaxed max-w-xs mx-auto">
                {step.description}
              </p>

              {/* Visual hint */}
              <div className="mt-6 rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-4 text-left">
                <code className="text-xs text-[var(--muted-foreground)] font-mono">
                  {step.example}
                </code>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

const steps = [
  {
    number: 1,
    title: "Paste a URL",
    description:
      "Copy any YouTube video link and paste it into TubeChat. We handle the rest.",
    example: "https://youtube.com/watch?v=dQw4w9...",
  },
  {
    number: 2,
    title: "We fetch the transcript",
    description:
      "Our system automatically pulls the full transcript with timestamps in seconds.",
    example: "[00:00] Introduction\n[02:15] Key concept...",
  },
  {
    number: 3,
    title: "Start chatting",
    description:
      "Ask anything about the video. Get answers with clickable timestamps back to the source.",
    example: 'You: "What was the main argument?"\nAI: "The speaker argues..."',
  },
];
