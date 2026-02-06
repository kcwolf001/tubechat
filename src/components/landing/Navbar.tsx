"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, loading, signInWithGoogle, signOut } = useAuth();
  const pathname = usePathname();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-[var(--border)] bg-[var(--background)]/80 backdrop-blur-xl">
      <div className="mx-auto max-w-6xl px-6 py-4 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[var(--accent)] to-[var(--accent-light)] flex items-center justify-center">
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polygon points="5 3 19 12 5 21 5 3" />
            </svg>
          </div>
          <span className="text-lg font-semibold tracking-tight">
            Tube<span className="gradient-text">Chat</span>
          </span>
        </Link>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-8">
          <a
            href="#features"
            className="text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
          >
            Features
          </a>
          <a
            href="#how-it-works"
            className="text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
          >
            How it works
          </a>
          <a
            href="#compare"
            className="text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
          >
            Compare
          </a>
          {user && (
            <Link
              href="/history"
              className={`text-sm transition-colors ${
                pathname === "/history"
                  ? "text-[var(--foreground)]"
                  : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
              }`}
            >
              History
            </Link>
          )}
        </div>

        {/* CTA + Mobile toggle */}
        <div className="flex items-center gap-4">
          {/* Desktop auth area */}
          <div className="hidden md:flex items-center gap-3">
            {loading ? (
              <div className="w-20 h-9 rounded-lg skeleton-shimmer" />
            ) : user ? (
              <>
                {user.user_metadata?.avatar_url && (
                  <img
                    src={user.user_metadata.avatar_url}
                    alt=""
                    className="w-8 h-8 rounded-full border border-[var(--border)]"
                  />
                )}
                <span className="text-sm text-[var(--foreground)] max-w-[120px] truncate">
                  {user.user_metadata?.full_name || user.email}
                </span>
                <button
                  onClick={signOut}
                  className="text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
                >
                  Sign out
                </button>
              </>
            ) : (
              <button
                onClick={signInWithGoogle}
                className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-[var(--accent)] to-[var(--accent-light)] px-4 py-2 text-sm font-medium text-white transition-all hover:opacity-90 hover:shadow-lg hover:shadow-[var(--accent-glow)]"
              >
                Sign in
              </button>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
            aria-label="Toggle menu"
          >
            {mobileOpen ? (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 12h18M3 6h18M3 18h18" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-[var(--border)] bg-[var(--background)] px-6 py-4 space-y-4">
          <a
            href="#features"
            onClick={() => setMobileOpen(false)}
            className="block text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
          >
            Features
          </a>
          <a
            href="#how-it-works"
            onClick={() => setMobileOpen(false)}
            className="block text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
          >
            How it works
          </a>
          <a
            href="#compare"
            onClick={() => setMobileOpen(false)}
            className="block text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
          >
            Compare
          </a>
          {user && (
            <Link
              href="/history"
              onClick={() => setMobileOpen(false)}
              className={`block text-sm ${
                pathname === "/history"
                  ? "text-[var(--foreground)]"
                  : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
              }`}
            >
              History
            </Link>
          )}

          {/* Mobile auth */}
          {!loading && (
            user ? (
              <div className="flex items-center gap-3 pt-2 border-t border-[var(--border)]">
                {user.user_metadata?.avatar_url && (
                  <img
                    src={user.user_metadata.avatar_url}
                    alt=""
                    className="w-8 h-8 rounded-full border border-[var(--border)]"
                  />
                )}
                <span className="text-sm text-[var(--foreground)] truncate flex-1">
                  {user.user_metadata?.full_name || user.email}
                </span>
                <button
                  onClick={() => { signOut(); setMobileOpen(false); }}
                  className="text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                >
                  Sign out
                </button>
              </div>
            ) : (
              <button
                onClick={() => { signInWithGoogle(); setMobileOpen(false); }}
                className="block w-full text-center rounded-lg bg-gradient-to-r from-[var(--accent)] to-[var(--accent-light)] px-4 py-2 text-sm font-medium text-white"
              >
                Sign in with Google
              </button>
            )
          )}
        </div>
      )}
    </nav>
  );
}
