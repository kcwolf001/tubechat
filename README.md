# 🎬 TubeChat — Talk to Any YouTube Video

Paste a YouTube URL and start a conversation. Get instant answers, summaries, and timestamped citations powered by AI.

## Quick Start

### Prerequisites
- **Node.js 18+** — Download from [nodejs.org](https://nodejs.org) (get the LTS version)
- **npm** — Comes bundled with Node.js

### Setup (copy-paste these commands)

```bash
# 1. Navigate to the project folder
cd tubechat

# 2. Install dependencies
npm install

# 3. Copy the environment file
cp .env.local.example .env.local

# 4. Start the dev server
npm run dev
```

Then open **http://localhost:3000** in your browser.

> **Note:** The landing page works immediately with no API keys. You'll only need API keys when we build the chat functionality in Phase 2+.

### API Keys (needed later for chat)
- **Anthropic API Key** — Sign up at [console.anthropic.com](https://console.anthropic.com)
- **Supabase** — Create a free project at [supabase.com](https://supabase.com)

## Project Structure

```
tubechat/
├── src/
│   ├── app/                  # Next.js pages
│   │   ├── layout.tsx        # Root layout (fonts, metadata)
│   │   ├── globals.css       # Global styles + theme
│   │   └── page.tsx          # Landing page
│   ├── components/
│   │   ├── landing/          # Landing page sections
│   │   │   ├── Navbar.tsx
│   │   │   ├── Hero.tsx
│   │   │   ├── Features.tsx
│   │   │   ├── HowItWorks.tsx
│   │   │   ├── Comparison.tsx
│   │   │   ├── CTA.tsx
│   │   │   └── Footer.tsx
│   │   └── ui/               # Reusable UI components (coming)
│   ├── lib/                  # Utilities (coming)
│   └── types/                # TypeScript types (coming)
├── public/                   # Static assets
├── package.json
├── tailwind.config.ts
├── tsconfig.json
└── .env.local.example
```

## Build Phases

- [x] **Phase 1** — Project setup + Landing page
- [ ] **Phase 2** — YouTube URL input + Transcript fetching
- [ ] **Phase 3** — Chat interface with embedded video player
- [ ] **Phase 4** — Supabase auth + User accounts
- [ ] **Phase 5** — Chat history + Saved videos
- [ ] **Phase 6** — Polish + Deploy to Vercel
