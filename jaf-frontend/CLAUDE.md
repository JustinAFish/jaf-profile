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
- **Chat state** — managed by Zustand in `store/chatStore.ts`, persisted to `localStorage` under `jaf-chat-storage` (with a read-only fallback to the legacy `honda-chat-storage` key). There is no server-side chat history; the store is the source of truth.
- **Auth** — Supabase SSR pattern: `lib/supabase/client.ts` (browser), `lib/supabase/server.ts` (RSC/API routes), `lib/supabase/middleware.ts` (session refresh). After email confirmation, `app/auth/callback/route.ts` exchanges the code for a session and sends a welcome email via Resend.
- **Contact form** — `app/api/contact/route.ts` calls Resend directly (not the backend service).
- **Legacy chat callback** — `app/chat/callback/page.tsx` is a client-side redirect shim to `/auth/callback` for old email links; new links point at `/auth/callback` directly.

### API protection

`middleware.ts` blocks unauthenticated requests to `/api/*` routes (expects `Authorization: Bearer <token>` header) except for the explicit public routes list (`/`, `/chat/sign-in`, `/chat/sign-up`, `/chat/callback`, `/auth/callback`, `/api/contact`). The `/chat` page itself is excluded from this check since auth is done client-side.

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

## Commenting style

Four places get comments; everything else stays silent.

**1. File-level block comment** — top of every file, before any imports. Two or three sentences: what the module does, and any key behavioral notes a reader would otherwise have to reconstruct from the code.

```ts
/**
 * Share/invite panel for a project — collects an email address, creates an invite token,
 * and sends the invitation email via the API. Can be embedded as a trigger button or opened
 * externally via the `open`/`onOpenChange` props.
 */
```

**2. Non-obvious interface props** — JSDoc on individual props only when the prop name alone doesn't fully explain the behaviour or constraint. Self-evident props (`projectId`, `title`) get nothing.

```ts
interface ShareProjectInviteProps {
  projectId: string;
  /** Slim trigger for embedding in the project top nav bar (no inner glass-card). */
  compactTrigger?: boolean;
  /** When set, modal visibility is controlled by the parent (e.g. menu closes without unmounting the modal). */
  open?: boolean;
}
```

**3. Exported component/function JSDoc** — one sentence on the exported symbol that names the key behavioral pattern. Not a restatement of the file comment.

```ts
/**
 * Invite panel that accepts an email address and sends a project invite via the API.
 * Supports both uncontrolled (self-managed trigger) and controlled (parent-managed) open state.
 */
export function ShareProjectInvite(…) {
```

**4. Internal helper JSDoc** — single-line `/** … */` on internal functions whose name alone would mislead or leave intent ambiguous. Skip it when the name is fully self-describing.

```ts
/** Closes the modal and resets the email field and any feedback message. */
const close = useCallback(…);

/** Sends the invite request and shows success or error feedback without closing the modal. */
function submit() {
```

Inline `//` comments are reserved for non-obvious logic that cannot be named away — a hidden constraint, a subtle invariant, a workaround for a specific bug.

