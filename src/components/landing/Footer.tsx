import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-[var(--border)] py-12">
      <div className="mx-auto max-w-6xl px-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[var(--accent)] to-[var(--accent-light)] flex items-center justify-center">
              <svg
                width="14"
                height="14"
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
            <span className="text-sm font-semibold tracking-tight">
              Tube<span className="gradient-text">Chat</span>
            </span>
          </Link>

          {/* Links */}
          <div className="flex items-center gap-6">
            <a
              href="#features"
              className="text-xs text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
            >
              Features
            </a>
            <a
              href="#how-it-works"
              className="text-xs text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
            >
              How it works
            </a>
            <a
              href="#compare"
              className="text-xs text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
            >
              Compare
            </a>
          </div>

          {/* Copyright */}
          <p className="text-xs text-[var(--muted-foreground)]">
            © {new Date().getFullYear()} TubeChat. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
