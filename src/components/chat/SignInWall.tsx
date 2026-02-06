"use client";

import { useAuth } from "@/components/AuthProvider";

export function SignInWall() {
  const { signInWithGoogle } = useAuth();

  return (
    <div className="flex-1 flex items-center justify-center px-6">
      <div className="max-w-sm w-full text-center space-y-6">
        {/* Icon */}
        <div className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-br from-[var(--accent)] to-[var(--accent-light)] flex items-center justify-center shadow-xl shadow-[var(--accent-glow)]">
          <svg
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          </svg>
        </div>

        {/* Heading */}
        <div>
          <h2 className="text-xl font-semibold mb-2">
            You&apos;ve used your free chats
          </h2>
          <p className="text-sm text-[var(--muted-foreground)] leading-relaxed">
            Sign in to continue chatting with unlimited videos.
            It&apos;s free and takes a few seconds.
          </p>
        </div>

        {/* Google sign-in button */}
        <button
          onClick={signInWithGoogle}
          className="inline-flex items-center gap-3 rounded-xl bg-white px-6 py-3 text-sm font-medium text-gray-800 shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all w-full justify-center"
        >
          {/* Google "G" logo */}
          <svg width="18" height="18" viewBox="0 0 24 24">
            <path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
              fill="#4285F4"
            />
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              fill="#34A853"
            />
            <path
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              fill="#FBBC05"
            />
            <path
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              fill="#EA4335"
            />
          </svg>
          Continue with Google
        </button>

        {/* Reassurance */}
        <p className="text-xs text-[var(--muted-foreground)]">
          We only use your email to identify your account.
          No spam, ever.
        </p>
      </div>
    </div>
  );
}
