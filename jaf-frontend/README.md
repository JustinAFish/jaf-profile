This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Deploy on Railway (monorepo)

You can deploy this app as **two** Railway services from the same repo. Set **Root Directory** to `jaf-backend` or `jaf-frontend` respectively. Build and start commands are defined in each folder’s [`railway.json`](railway.json).

1. Deploy **backend** first, then copy its public URL.
2. Add **frontend** variables (below) and redeploy so `NEXT_PUBLIC_*` values are baked into the build.

**Backend (`jaf-backend`) — variables (Railway dashboard)**

| Variable | Notes |
|----------|--------|
| `ENVIRONMENT` | `production` (required for startup validation) |
| `OPENAI_API_KEY` | Required in production |
| `PINECONE_API_KEY` | Required in production |
| `PINECONE_ENVIRONMENT`, `PINECONE_INDEX_NAME`, `PINECONE_NAMESPACE` | As used locally / Lambda |
| `CORS_ORIGINS` | Comma-separated; include your frontend origin, e.g. `https://your-app.up.railway.app` |
| Optional | LangSmith vars if you use tracing |

**Frontend (`jaf-frontend`) — variables**

| Variable | Notes |
|----------|--------|
| `NEXT_PUBLIC_BACKEND_URL` | Full URL of the Railway backend (set **before** `npm run build`) |
| `NEXT_PUBLIC_APP_ORIGIN` | Canonical frontend URL (same as the site users open); must match **Supabase Site URL** in production |
| `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` | From Supabase project settings |
| `RESEND_API_KEY` | Resend API key (used by `/api/contact` and the post-auth welcome email in `app/auth/callback`) |
| `RESEND_FROM_EMAIL` | Verified Resend sender, e.g. `Name <hello@yourdomain.com>` |
| `CONTACT_TO_EMAIL` | Optional override for the contact form recipient |

**Supabase Auth email (signup / password reset)**

Sign-up calls Supabase’s hosted `POST /auth/v1/signup`. The **contact form does not send those messages**—it uses the Next.js `/api/contact` route and Resend. Auth confirmation and magic links are sent by **Supabase’s Auth mailer** (built-in or custom SMTP in the Supabase dashboard).

If signup returns **500** with a body like `Error sending confirmation email`, the fix is in the Supabase project, not in the contact route:

1. **Confirm the error** — Supabase **Logs** (Auth / API) around the request, or reproduce with a direct signup request and read the JSON `msg` field.
2. **Custom SMTP (recommended if you already use Resend)** — In Supabase: **Project Settings → Authentication** (or **Authentication → Emails → SMTP Settings**, depending on dashboard layout). Use Resend’s SMTP ([Resend × Supabase](https://resend.com/docs/send-with-supabase-smtp), [Supabase SMTP guide](https://supabase.com/docs/guides/auth/auth-smtp)):
   - **Host:** `smtp.resend.com`
   - **Port:** `465` (TLS)
   - **Username:** `resend`
   - **Password:** your Resend API key (create a dedicated key for production if you prefer)
   - **Sender email / name:** must use a domain verified in Resend (same domain as `RESEND_FROM_EMAIL` is a good default).
3. **Remove or fix broken SMTP** — If custom SMTP was enabled with wrong credentials, either correct them or temporarily clear custom SMTP to use Supabase’s default mailer (subject to provider limits), then re-enable Resend SMTP for production.

**Supabase URL configuration (redirects after email links)**

In the Supabase project: **Authentication → URL configuration**:

- **Site URL:** your canonical public frontend origin (e.g. `https://jaf.averonai.org` or your Railway URL). This should match `NEXT_PUBLIC_APP_ORIGIN` in that environment.
- **Redirect URLs:** include the auth callback route, e.g. `https://jaf.averonai.org/auth/callback` (add `http://localhost:3000/auth/callback` for local dev if needed).

Without this, email confirmation and OAuth redirects may not return users to your deployment.

**Verify signup after SMTP and URLs are set**

From a shell with `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` set, a successful signup should return **HTTP 200** (and a JSON body with `user`, often without `session` until email is confirmed):

```bash
curl -sS -w "\n%{http_code}\n" -X POST "${NEXT_PUBLIC_SUPABASE_URL}/auth/v1/signup" \
  -H "apikey: ${NEXT_PUBLIC_SUPABASE_ANON_KEY}" \
  -H "Authorization: Bearer ${NEXT_PUBLIC_SUPABASE_ANON_KEY}" \
  -H "Content-Type: application/json" \
  -d '{"email":"your-test@example.com","password":"YourLongPassword1","options":{"email_redirect_to":"https://YOUR_ORIGIN/auth/callback?next=%2Fchat"}}'
```

Then confirm the confirmation email arrives and that opening the link lands on `/auth/callback` and redirects into the app.

**CLI:** from a linked service directory, `npx @railway/cli@latest up` (after `railway login`).
