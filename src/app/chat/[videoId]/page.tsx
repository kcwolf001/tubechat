"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ChatMessage, TranscriptSegment } from "@/types";
import { MessageBubble } from "@/components/chat/MessageBubble";
import { ChatInput } from "@/components/chat/ChatInput";
import { SignInWall } from "@/components/chat/SignInWall";
import { useAuth } from "@/components/AuthProvider";
import {
  recordVideoVisit,
  isVideoVisited,
  hasExceededFreeLimit,
} from "@/lib/freemium";
import { createClient } from "@/lib/supabase/client";
import {
  loadConversation,
  getOrCreateConversation,
  saveMessage,
  updateVideoTitle,
} from "@/lib/chat-persistence";

// Loading states for the page
type PageState = "loading" | "ready" | "error";

export default function ChatPage() {
  const params = useParams();
  const videoId = params.videoId as string;
  const { user, loading: authLoading } = useAuth();
  const supabase = useMemo(() => createClient(), []);

  const [pageState, setPageState] = useState<PageState>("loading");
  const [gated, setGated] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [transcript, setTranscript] = useState("");
  const [segments, setSegments] = useState<TranscriptSegment[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const videoContainerRef = useRef<HTMLDivElement>(null);
  const conversationIdRef = useRef<string | null>(null);

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Seek the embedded YouTube player to a specific timestamp via postMessage
  const handleSeek = useCallback((seconds: number) => {
    const iframe = document.getElementById("yt-player") as HTMLIFrameElement;
    if (iframe?.contentWindow) {
      iframe.contentWindow.postMessage(
        JSON.stringify({ event: "command", func: "seekTo", args: [seconds, true] }),
        "https://www.youtube.com"
      );
      iframe.contentWindow.postMessage(
        JSON.stringify({ event: "command", func: "playVideo", args: [] }),
        "https://www.youtube.com"
      );
    }
    videoContainerRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  // Freemium gate: check if this user can access this video
  useEffect(() => {
    if (authLoading) return;
    if (user) {
      // Signed-in users get unlimited access
      setGated(false);
      return;
    }
    // Anonymous user: check if this is a new video and they've exceeded the limit
    if (!isVideoVisited(videoId) && hasExceededFreeLimit()) {
      setGated(true);
    } else {
      setGated(false);
    }
  }, [authLoading, user, videoId]);

  // Record video visit once transcript loads successfully
  useEffect(() => {
    if (pageState === "ready" && !user) {
      recordVideoVisit(videoId);
    }
  }, [pageState, videoId, user]);

  // Fetch transcript when the page loads
  useEffect(() => {
    async function loadTranscript() {
      try {
        setPageState("loading");

        const res = await fetch("/api/transcript", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ videoId }),
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || "Failed to fetch transcript");
        }

        setTranscript(data.fullText);
        setSegments(data.segments);
        setPageState("ready");

        // Add a welcome message
        setMessages([
          {
            id: "welcome",
            role: "assistant",
            content: `I've loaded the transcript for this video (${data.segments.length} segments). Ask me anything — I can summarize it, answer specific questions, or find key moments. What would you like to know?`,
          },
        ]);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Something went wrong";
        setErrorMsg(msg);
        setPageState("error");
      }
    }

    if (videoId) {
      loadTranscript();
    }
  }, [videoId]);

  // Load existing conversation when page is ready and user is signed in
  useEffect(() => {
    if (pageState !== "ready" || !user || !supabase) return;

    let cancelled = false;

    async function restoreConversation() {
      const result = await loadConversation(supabase, user!.id, videoId);
      if (cancelled) return;

      if (result && result.messages.length > 0) {
        conversationIdRef.current = result.conversation.id;
        // Append persisted messages after the welcome message
        setMessages((prev) => {
          const welcome = prev.find((m) => m.id === "welcome");
          return welcome ? [welcome, ...result.messages] : result.messages;
        });
      }
    }

    restoreConversation();
    return () => { cancelled = true; };
  }, [pageState, user, supabase, videoId]);

  // Fetch and store video title (fire-and-forget)
  useEffect(() => {
    if (pageState !== "ready" || !user || !supabase) return;

    async function fetchAndStoreTitle() {
      const convId = conversationIdRef.current
        ?? await getOrCreateConversation(supabase, user!.id, videoId);
      if (!convId) return;
      conversationIdRef.current = convId;

      try {
        const res = await fetch(`/api/video-title?v=${encodeURIComponent(videoId)}`);
        const data = await res.json();
        if (data.title) {
          updateVideoTitle(supabase, convId, data.title);
        }
      } catch {
        // non-critical, ignore
      }
    }

    fetchAndStoreTitle();
  }, [pageState, user, supabase, videoId]);

  // Send a message and stream the AI response
  const handleSend = async (userMessage: string) => {
    // Add the user message
    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: userMessage,
    };

    const assistantMsg: ChatMessage = {
      id: `assistant-${Date.now()}`,
      role: "assistant",
      content: "",
    };

    setMessages((prev) => [...prev, userMsg, assistantMsg]);
    setIsStreaming(true);

    // Ensure conversation exists for signed-in users, save user message (fire-and-forget)
    if (user && supabase) {
      const convId = conversationIdRef.current
        ?? await getOrCreateConversation(supabase, user.id, videoId);
      if (convId) {
        conversationIdRef.current = convId;
        saveMessage(supabase, convId, "user", userMessage);
      }
    }

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMessage,
          transcript,
          history: messages.filter((m) => m.id !== "welcome"),
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Chat request failed");
      }

      // Read the SSE stream
      const reader = res.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) throw new Error("No response stream");

      let accumulated = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split("\n");

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = line.slice(6);
            if (data === "[DONE]") continue;

            try {
              const parsed = JSON.parse(data);
              if (parsed.text) {
                accumulated += parsed.text;
                // Update the assistant message in place
                setMessages((prev) =>
                  prev.map((m) =>
                    m.id === assistantMsg.id
                      ? { ...m, content: accumulated }
                      : m
                  )
                );
              }
            } catch {
              // Skip malformed JSON chunks
            }
          }
        }
      }

      // Save assistant message after streaming completes
      if (user && supabase && conversationIdRef.current && accumulated) {
        saveMessage(supabase, conversationIdRef.current, "assistant", accumulated);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Something went wrong";
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantMsg.id
            ? { ...m, content: `Error: ${msg}. Please try again.` }
            : m
        )
      );
    } finally {
      setIsStreaming(false);
    }
  };

  // Quick action buttons
  const quickActions = [
    "What are the key takeaways?",
    "What topics are covered?",
    "List the main arguments made",
  ];

  return (
    <div className="flex flex-col h-screen bg-[var(--background)]">
      {/* Header */}
      <header className="flex-shrink-0 relative bg-[var(--background)]/80 backdrop-blur-xl px-4 py-3">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[var(--accent)] to-[var(--accent-light)] flex items-center justify-center shadow-lg shadow-[var(--accent-glow)]">
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                strokeWidth="2.5"
              >
                <polygon points="5 3 19 12 5 21 5 3" />
              </svg>
            </div>
            <span className="text-sm font-semibold tracking-tight">
              Tube<span className="gradient-text">Chat</span>
            </span>
          </Link>

          {/* Video link */}
          <a
            href={`https://www.youtube.com/watch?v=${videoId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-xs text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
              <polyline points="15 3 21 3 21 9" />
              <line x1="10" y1="14" x2="21" y2="3" />
            </svg>
            Open on YouTube
          </a>
        </div>
        {/* Gradient accent border */}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[var(--accent)]/40 to-transparent" />
      </header>

      {/* Sign-in wall when free limit exceeded */}
      {gated && !authLoading && (
        <SignInWall />
      )}

      {/* Main content area */}
      {!gated && (
      <div className="flex-1 overflow-y-auto">
        {/* Skeleton loading state */}
        {pageState === "loading" && (
          <div className="max-w-3xl mx-auto px-4 py-6 animate-fade-in-up">
            {/* Video skeleton */}
            <div className="mb-5 rounded-xl overflow-hidden aspect-video skeleton-shimmer" />

            {/* Action bar skeleton */}
            <div className="flex items-center justify-between mb-6 gap-3">
              <div className="h-9 w-48 rounded-lg skeleton-shimmer" />
              <div className="h-9 w-36 rounded-lg skeleton-shimmer" />
            </div>

            {/* Message skeleton */}
            <div className="flex justify-start mb-4">
              <div className="max-w-[70%] w-full space-y-2">
                <div className="h-3 w-16 rounded skeleton-shimmer" />
                <div className="rounded-2xl rounded-bl-md p-4 border border-[var(--border)] bg-[var(--card)]">
                  <div className="space-y-2.5">
                    <div className="h-3.5 w-full rounded skeleton-shimmer" />
                    <div className="h-3.5 w-[90%] rounded skeleton-shimmer" />
                    <div className="h-3.5 w-[70%] rounded skeleton-shimmer" />
                  </div>
                </div>
              </div>
            </div>

            {/* Quick action skeletons */}
            <div className="flex gap-2 mt-4">
              <div className="h-8 w-40 rounded-full skeleton-shimmer" />
              <div className="h-8 w-44 rounded-full skeleton-shimmer" />
              <div className="h-8 w-48 rounded-full skeleton-shimmer" />
            </div>

            {/* Loading indicator */}
            <div className="mt-12 flex flex-col items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 border-2 border-[var(--accent)]/30 rounded-full" />
                <div className="absolute inset-0 w-10 h-10 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin" />
              </div>
              <div className="text-center">
                <p className="text-sm font-medium">Fetching transcript...</p>
                <p className="text-xs text-[var(--muted-foreground)] mt-1">
                  This usually takes a few seconds
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Error state */}
        {pageState === "error" && (
          <div className="flex flex-col items-center justify-center h-full gap-4 px-6">
            <div className="w-14 h-14 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="rgb(239,68,68)" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <line x1="15" y1="9" x2="9" y2="15" />
                <line x1="9" y1="9" x2="15" y2="15" />
              </svg>
            </div>
            <div className="text-center max-w-md">
              <p className="text-sm font-semibold mb-2">
                Couldn&apos;t load this video
              </p>
              <p className="text-xs text-[var(--muted-foreground)] mb-4">
                {errorMsg}
              </p>
              <Link
                href="/"
                className="inline-flex items-center gap-2 rounded-lg bg-[var(--muted)] border border-[var(--border)] px-4 py-2.5 text-sm font-medium hover:border-[var(--accent)] hover:bg-[var(--accent)]/5 transition-all"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M19 12H5" />
                  <polyline points="12 19 5 12 12 5" />
                </svg>
                Try another video
              </Link>
            </div>
          </div>
        )}

        {/* Chat messages */}
        {pageState === "ready" && (
          <div className="max-w-3xl mx-auto px-4 py-6">
            {/* Video embed */}
            <div
              ref={videoContainerRef}
              className="mb-5 rounded-xl overflow-hidden border border-[var(--border)] aspect-video shadow-2xl shadow-black/20 ring-1 ring-white/5"
            >
              <iframe
                id="yt-player"
                src={`https://www.youtube.com/embed/${videoId}?enablejsapi=1&rel=0`}
                title="YouTube video"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full"
              />
            </div>

            {/* Action bar: transcript info + summarize button */}
            <div className="flex items-center justify-between mb-6 gap-3">
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[var(--muted)] border border-[var(--border)]">
                <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.5)]" />
                <span className="text-xs text-[var(--muted-foreground)]">
                  {segments.length} segments loaded
                </span>
              </div>

              <button
                onClick={() => handleSend("Summarize this video")}
                disabled={isStreaming}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-[var(--accent)] to-[var(--accent-light)] text-white text-xs font-semibold shadow-lg shadow-[var(--accent-glow)] hover:shadow-xl hover:shadow-[var(--accent-glow)] hover:brightness-110 active:scale-[0.97] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="21" y1="10" x2="3" y2="10" />
                  <line x1="21" y1="6" x2="3" y2="6" />
                  <line x1="21" y1="14" x2="3" y2="14" />
                  <line x1="15" y1="18" x2="3" y2="18" />
                </svg>
                Summarize
              </button>
            </div>

            {/* Messages */}
            {messages.map((msg) => {
              if (msg.content === "") return null;
              return (
                <MessageBubble
                  key={msg.id}
                  message={msg}
                  videoId={videoId}
                  onTimestampClick={handleSeek}
                />
              );
            })}

            {/* Streaming indicator (shows until first token arrives) */}
            {isStreaming && messages[messages.length - 1]?.content === "" && (
              <div className="flex justify-start mb-4 animate-message-in">
                <div className="flex items-center gap-2.5 px-4 py-3 rounded-2xl rounded-bl-md bg-[var(--card)] border border-[var(--border)]">
                  <div className="flex gap-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] animate-bounce [animation-delay:0ms]" />
                    <div className="w-1.5 h-1.5 rounded-full bg-[var(--accent-light)] animate-bounce [animation-delay:150ms]" />
                    <div className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-bounce [animation-delay:300ms]" />
                  </div>
                  <span className="text-xs text-[var(--muted-foreground)]">Thinking...</span>
                </div>
              </div>
            )}

            {/* Quick actions (show when only welcome message exists) */}
            {messages.length === 1 && (
              <div className="flex flex-wrap gap-2 mt-4">
                {quickActions.map((action) => (
                  <button
                    key={action}
                    onClick={() => handleSend(action)}
                    disabled={isStreaming}
                    className="rounded-full border border-[var(--border)] bg-[var(--card)] px-4 py-2 text-xs text-[var(--muted-foreground)] hover:border-[var(--accent)]/60 hover:text-[var(--foreground)] hover:bg-[var(--accent)]/5 hover:shadow-[0_0_20px_var(--accent-glow)] transition-all disabled:opacity-50"
                  >
                    {action}
                  </button>
                ))}
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        )}
      </div>
      )}

      {/* Chat input */}
      {!gated && pageState === "ready" && (
        <ChatInput
          onSend={handleSend}
          disabled={isStreaming}
          placeholder={
            isStreaming
              ? "Waiting for response..."
              : "Ask anything about this video..."
          }
        />
      )}
    </div>
  );
}
