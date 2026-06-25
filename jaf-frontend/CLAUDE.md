# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev        # Start dev server with Turbopack on port 3000
npm run build      # Production build (standalone output)
npm run lint       # ESLint
npm run test       # Vitest unit tests (run once)
npm run test:watch # Vitest in watch mode
npm run test:e2e   # Playwright E2E tests (spins up dev server + stub backend automatically)
```

Run a single Vitest test file:
```bash
npx vitest run tests/chatStore.test.ts
```

## Architecture

This is a Next.js 15 (App Router) personal portfolio site with an integrated RAG chat interface backed by a separate Python service.

### Two main surfaces

**Portfolio (`/`)** — static marketing sections assembled in `app/page.tsx` from `components/home*.tsx` components. Content lives in `lib/home*Section.ts` data files.

**Chat (`/chat`)** — an authenticated AI chat UI. Auth is Supabase-based and enforced **client-side** in `app/chat/page.tsx` (redirects to `/chat/sign-in` if unauthenticated). The middleware at `middleware.ts` only refreshes the session cookie for `/chat` routes — it does not redirect.

### Key data flows

- **Chat messages** — `app/chat/page.tsx` calls `POST /api/chat/message` on the backend service (URL from `NEXT_PUBLIC_BACKEND_URL`). The last 5 messages are sent as `conversation_history`. Responses include `response` (string) and `sources` (RAG source documents).
- **Chat state** — managed by Zustand in `store/chatStore.ts`, persisted to `localStorage` under `jaf-chat-storage`. On load, `fetchUserChats()` pulls server-side history from the backend and merges it.
- **Auth** — Supabase SSR pattern: `lib/supabase/client.ts` (browser), `lib/supabase/server.ts` (RSC/API routes), `lib/supabase/middleware.ts` (session refresh). After email confirmation, `app/auth/callback/route.ts` exchanges the code for a session and sends a welcome email via Resend.
- **Contact form** — `app/api/contact/route.ts` calls Resend directly (not the backend service).

### API protection

`middleware.ts` blocks unauthenticated requests to `/api/*` routes (expects `Authorization: Bearer <token>` header) except for the explicit public routes list. The `/chat` page is excluded from this check since auth is done client-side.

### Environment variables

| Variable | Purpose |
|---|---|
| `NEXT_PUBLIC_BACKEND_URL` | Python RAG backend base URL (must be set before build — baked in) |
| `NEXT_PUBLIC_APP_ORIGIN` | Canonical frontend URL; must match Supabase Site URL in production |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key |
| `RESEND_API_KEY` | Resend API key (contact form + welcome email) |
| `RESEND_FROM_EMAIL` | Verified Resend sender address |
| `CONTACT_TO_EMAIL` | Optional override for contact form recipient |
| `NEXT_PUBLIC_DEBUG_AUTH` | Set to `"true"` in dev to log auth checks to console |
| `NEXT_PUBLIC_E2E` | Set to `"true"` to bypass Supabase auth check (used by Playwright) |

### Testing notes

- Unit tests live in `tests/`, E2E tests in `e2e/`.
- E2E tests use `e2e/stub-backend.mjs` (a lightweight HTTP stub on port 9999) as the backend and set `NEXT_PUBLIC_E2E=true` to skip Supabase auth.
- The `@` alias resolves to the project root (set in both `tsconfig.json` and `vitest.config.ts`).

### Deployment

Built with `output: 'standalone'` for Railway/Docker. Frontend and backend deploy as two separate Railway services from the same monorepo. Set `NEXT_PUBLIC_*` env vars **before** building — they are baked into the bundle at build time.
