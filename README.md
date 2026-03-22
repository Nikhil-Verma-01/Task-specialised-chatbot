# Lean Startup Mentor Bot

Lean Startup Mentor Bot is a frontend-first startup feedback experience built with Next.js App Router. It helps founders capture the right context before chatting, then turns that context into structured, opinionated mentor feedback instead of generic AI replies.

The product is designed around a simple principle: better startup advice starts with sharper inputs. Users describe what they are building, choose their current stage, define the kind of help they need, and then move into a chat experience that keeps that context visible throughout the conversation.

## What The App Does

- Collects startup context through a guided setup flow
- Opens a structured chat experience for founder feedback
- Sends prompts to a Groq-hosted LLM through `/api/chat`
- Renders mentor replies in readable sections such as idea summary, market reality, brutal truth, and action steps
- Stores the latest session in `localStorage` so users can refresh without losing progress
- Supports dark and light mode with a polished interactive UI

## Product Experience

The app is intentionally more visual than utilitarian. The landing page uses a full-screen hero layout, animated typing copy, and cursor-reactive effects to create a strong first impression. The chat page continues that visual direction with gradients, themed surfaces, structured response cards, and a custom cursor that changes behavior inside and outside the main interaction zones.

This makes the project a strong starting point for:

- AI startup feedback products
- mentor-style chat interfaces
- structured prompt-to-response experiences
- frontend-heavy experimental SaaS landing flows

## Tech Stack

- Next.js 15 with App Router
- TypeScript
- React 19 functional components
- Tailwind CSS
- shadcn/ui-style component structure
- Zod for API validation
- Groq API for model inference

## Project Structure

```text
app/
  api/chat/route.ts        API route for mentor responses
  chat/page.tsx            Chat page entry
  layout.tsx               Root layout and global metadata
  page.tsx                 Home page entry
components/
  chat/                    Chat UI building blocks
  ui/                      Reusable UI primitives
  home-setup-page.tsx      Home page wrapper with restored session context
  setup-form.tsx           Full-screen landing and setup experience
lib/
  constants.ts             Shared copy and option lists
  prompt.ts                Mentor system prompt and message builder
  storage.ts               Local session persistence helpers
types/
  chat.ts                  Shared application types
```

## Core Flow

1. The user lands on the setup page.
2. They enter what they are building and choose stage and goal.
3. The app navigates to `/chat` with that context.
4. The chat UI sends the latest message plus startup context to `/api/chat`.
5. The API route calls the configured Groq model.
6. The response is rendered as structured mentor feedback.
7. The current session is stored locally and restored on refresh.

## Environment Variables

Create a `.env.local` file based on `.env.example`.

- `GROQ_API_KEY`: Your Groq API key
- `GROQ_MODEL`: Model name to use for chat responses
- `GROQ_USE_MOCK`: Set to `true` to bypass live model calls and return mock mentor output

Default model:

```env
GROQ_MODEL=llama-3.3-70b-versatile
```

## Local Development

Install dependencies and start the development server:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Production Build

To verify the app locally before deployment:

```bash
npm run build
npm run start
```

## Deployment On Vercel

This project is ready for Vercel deployment.

1. Import the repository into Vercel.
2. Add the required environment variables in Project Settings.
3. Deploy using the default Next.js build configuration.

Because chat memory is stored in `localStorage`, the current version does not require a database or server-side session store.

## Notes

- If Groq quota is unavailable, enable mock mode to keep developing the UI.
- The app currently uses a single-turn API request pattern with client-side session memory.
- The codebase is structured for extension if you later want streaming responses, auth, analytics, or persistent backend storage.
