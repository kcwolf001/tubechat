"use client";

import { ChatMessage } from "@/types";

interface MessageBubbleProps {
  message: ChatMessage;
  videoId: string;
  onTimestampClick?: (seconds: number) => void;
}

export function MessageBubble({ message, onTimestampClick }: MessageBubbleProps) {
  const isUser = message.role === "user";

  // Convert timestamp references like **[5:30]** into clickable buttons that seek the player
  const renderContent = (content: string) => {
    const parts = content.split(/(\*\*\[[\d:]+\]\*\*|\[[\d:]+\])/g);

    return parts.map((part, i) => {
      const timestampMatch = part.match(/\*?\*?\[(\d[\d:]*)\]\*?\*?/);
      if (timestampMatch) {
        const timeStr = timestampMatch[1];
        const seconds = timeToSeconds(timeStr);

        return (
          <button
            key={i}
            onClick={() => onTimestampClick?.(seconds)}
            className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-[var(--accent-glow)] text-[var(--accent-light)] text-xs font-mono font-semibold hover:bg-[var(--accent)]/30 hover:shadow-[0_0_12px_var(--accent-glow)] transition-all cursor-pointer"
            title={`Jump to ${timeStr}`}
          >
            ▶ {timeStr}
          </button>
        );
      }

      // Process remaining markdown (basic bold support)
      const boldParts = part.split(/\*\*(.*?)\*\*/g);
      return boldParts.map((bp, j) =>
        j % 2 === 1 ? (
          <strong key={`${i}-${j}`}>{bp}</strong>
        ) : (
          <span key={`${i}-${j}`}>{bp}</span>
        )
      );
    });
  };

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"} mb-4 animate-message-in`}>
      <div
        className={`max-w-[85%] md:max-w-[70%] rounded-2xl px-4 py-3 ${
          isUser
            ? "rounded-br-md bg-gradient-to-br from-[var(--accent)] to-[var(--accent-light)] text-white shadow-lg shadow-[var(--accent-glow)]"
            : "rounded-bl-md bg-[var(--card)] border border-[var(--border)]"
        }`}
      >
        {/* Label */}
        <p
          className={`text-[10px] font-medium mb-1.5 ${
            isUser ? "text-white/60" : "text-[var(--accent-light)] font-semibold"
          }`}
        >
          {isUser ? "You" : "TubeChat"}
        </p>

        {/* Message content */}
        <div
          className={`text-sm leading-relaxed whitespace-pre-wrap ${
            isUser ? "text-white" : "text-[var(--foreground)]"
          }`}
        >
          {isUser ? message.content : renderContent(message.content)}
        </div>
      </div>
    </div>
  );
}

/** Convert a timestamp string like "1:23:45" or "5:30" to total seconds */
function timeToSeconds(timeStr: string): number {
  const parts = timeStr.split(":").map(Number);
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
  if (parts.length === 2) return parts[0] * 60 + parts[1];
  return parts[0] || 0;
}
