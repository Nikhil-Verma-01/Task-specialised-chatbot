# Lean Startup Mentor Bot

A clean Next.js App Router starter for a structured, opinionated startup mentor experience.

## Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- shadcn/ui-style components
- Groq API via a Next.js route handler

## Getting Started

```bash
npm install
npm run dev
```

Create `.env.local` from `.env.example`, then open `http://localhost:3000`.

## Environment

- `GROQ_API_KEY`: Your Groq API key
- `GROQ_MODEL`: Optional model override. Default: `llama-3.3-70b-versatile`
- `GROQ_USE_MOCK`: Set to `true` to keep building without live model calls

## Vercel Deployment

1. Import the repository into Vercel.
2. Add `GROQ_API_KEY`, `GROQ_MODEL`, and optionally `GROQ_USE_MOCK` in Project Settings.
3. Deploy with the default Next.js build command.

This project stores chat memory in `localStorage`, so no database is required for the current flow.
