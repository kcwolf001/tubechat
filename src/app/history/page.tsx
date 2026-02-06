"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import { createClient } from "@/lib/supabase/client";
import { loadConversationList } from "@/lib/chat-persistence";
import { Conversation } from "@/types";

function timeAgo(dateStr: string): string {
  const seconds = Math.floor(
    (Date.now() - new Date(dateStr).getTime()) / 1000
  );
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  return `${months}mo ago`;
}

export default function HistoryPage() {
  const { user, loading: authLoading } = useAuth();
  const supabase = useMemo(() => createClient(), []);
  const router = useRouter();

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      setLoading(false);
      return;
    }

    async function fetchHistory() {
      const list = await loadConversationList(supabase, user!.id);
      setConversations(list);
      setLoading(false);
    }

    fetchHistory();
  }, [authLoading, user, supabase]);

  // Auth guard: show sign-in prompt for unauthenticated users
  if (!authLoading && !user) {
    return (
      <div className="min-h-screen bg-[var(--background)]">
        {/* Header */}
        <header className="border-b border-[var(--border)] bg-[var(--background)]/80 backdrop-blur-xl">
          <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[var(--accent)] to-[var(--accent-light)] flex items-center justify-center">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                  <polygon points="5 3 19 12 5 21 5 3" />
                </svg>
              </div>
              <span className="text-sm font-semibold tracking-tight">
                Tube<span className="gradient-text">Chat</span>
              </span>
            </Link>
          </div>
        </header>

        <div className="flex flex-col items-center justify-center px-6 pt-32">
          <div className="w-14 h-14 rounded-2xl bg-[var(--muted)] border border-[var(--border)] flex items-center justify-center mb-4">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--muted-foreground)" strokeWidth="2">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
          </div>
          <p className="text-sm font-semibold mb-2">Sign in to view history</p>
          <p className="text-xs text-[var(--muted-foreground)] mb-6 text-center max-w-xs">
            Your chat history is saved when you&apos;re signed in. Sign in to access your past conversations.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-[var(--accent)] to-[var(--accent-light)] px-5 py-2.5 text-sm font-medium text-white hover:opacity-90 transition-opacity"
          >
            Go to home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--background)]">
      {/* Header */}
      <header className="border-b border-[var(--border)] bg-[var(--background)]/80 backdrop-blur-xl">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[var(--accent)] to-[var(--accent-light)] flex items-center justify-center">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                <polygon points="5 3 19 12 5 21 5 3" />
              </svg>
            </div>
            <span className="text-sm font-semibold tracking-tight">
              Tube<span className="gradient-text">Chat</span>
            </span>
          </Link>

          <Link
            href="/"
            className="text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
          >
            New chat
          </Link>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-8">
        <h1 className="text-xl font-semibold mb-6">Chat History</h1>

        {/* Loading state */}
        {loading && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="rounded-xl border border-[var(--border)] bg-[var(--card)] overflow-hidden">
                <div className="aspect-video skeleton-shimmer" />
                <div className="p-4 space-y-2">
                  <div className="h-4 w-3/4 rounded skeleton-shimmer" />
                  <div className="h-3 w-1/2 rounded skeleton-shimmer" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty state */}
        {!loading && conversations.length === 0 && (
          <div className="flex flex-col items-center justify-center pt-20">
            <div className="w-14 h-14 rounded-2xl bg-[var(--muted)] border border-[var(--border)] flex items-center justify-center mb-4">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--muted-foreground)" strokeWidth="2">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
            </div>
            <p className="text-sm font-semibold mb-2">No conversations yet</p>
            <p className="text-xs text-[var(--muted-foreground)] mb-6 text-center max-w-xs">
              Start chatting with a YouTube video and your conversations will appear here.
            </p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-[var(--accent)] to-[var(--accent-light)] px-5 py-2.5 text-sm font-medium text-white hover:opacity-90 transition-opacity"
            >
              Start a conversation
            </Link>
          </div>
        )}

        {/* Conversation cards */}
        {!loading && conversations.length > 0 && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {conversations.map((conv) => (
              <button
                key={conv.id}
                onClick={() => router.push(`/chat/${conv.video_id}`)}
                className="group text-left rounded-xl border border-[var(--border)] bg-[var(--card)] overflow-hidden hover:border-[var(--accent)]/50 hover:shadow-lg hover:shadow-[var(--accent-glow)] transition-all"
              >
                {/* Thumbnail */}
                <div className="aspect-video bg-[var(--muted)] relative overflow-hidden">
                  <img
                    src={`https://img.youtube.com/vi/${conv.video_id}/mqdefault.jpg`}
                    alt=""
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>

                {/* Info */}
                <div className="p-4">
                  <p className="text-sm font-medium truncate mb-1">
                    {conv.video_title || conv.video_id}
                  </p>
                  <div className="flex items-center gap-3 text-xs text-[var(--muted-foreground)]">
                    <span>{conv.message_count} messages</span>
                    <span className="w-1 h-1 rounded-full bg-[var(--border)]" />
                    <span>{timeAgo(conv.updated_at)}</span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
