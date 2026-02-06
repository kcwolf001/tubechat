export function Features() {
  return (
    <section id="features" className="py-24 md:py-32">
      <div className="mx-auto max-w-6xl px-6">
        {/* Section header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <p className="text-sm font-medium text-[var(--accent-light)] mb-3">
            Features
          </p>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
            Everything you need to{" "}
            <span className="gradient-text">learn faster</span>
          </h2>
          <p className="mt-4 text-[var(--muted-foreground)] leading-relaxed">
            Stop watching passively. Start having conversations with your
            videos and extract the information that matters to you.
          </p>
        </div>

        {/* Feature cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="glow-card rounded-2xl p-6 group"
            >
              <div className="w-10 h-10 rounded-xl bg-[var(--accent-glow)] flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <span className="text-xl">{feature.icon}</span>
              </div>
              <h3 className="text-base font-semibold mb-2">{feature.title}</h3>
              <p className="text-sm text-[var(--muted-foreground)] leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

const features = [
  {
    icon: "💬",
    title: "Natural conversation",
    description:
      "Ask questions in plain English. The AI understands context and gives clear, relevant answers drawn directly from the video.",
  },
  {
    icon: "📍",
    title: "Timestamped citations",
    description:
      "Every answer links back to the exact moment in the video. Click a timestamp to jump right to the source.",
  },
  {
    icon: "⚡",
    title: "Instant summaries",
    description:
      "Get a concise overview of any video in seconds. Perfect for deciding if a video is worth your time.",
  },
  {
    icon: "🎯",
    title: "Smart retrieval",
    description:
      "For long videos, the AI finds the most relevant sections to answer your question — no need to send the whole transcript.",
  },
  {
    icon: "💾",
    title: "Chat history",
    description:
      "All your conversations are saved. Pick up where you left off or revisit insights from videos you chatted with before.",
  },
  {
    icon: "📱",
    title: "Works everywhere",
    description:
      "Fully responsive design that feels great on desktop, tablet, and mobile. Learn on any device.",
  },
];
