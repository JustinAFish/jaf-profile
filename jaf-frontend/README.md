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
| `NEXT_PUBLIC_APP_ORIGIN` | Canonical frontend URL (same as the site users open) |
| `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` | From Supabase project settings |
| `EMAIL_USER`, `EMAIL_PASSWORD` | SMTP for the contact API route |
| `CONTACT_TO_EMAIL` | Optional override for the contact form recipient |

**Supabase (dashboard — required for auth in production)**

In the Supabase project: **Authentication → URL configuration**, set **Site URL** to your Railway frontend URL and add **Redirect URLs** for each path users return to after sign-in (replace the host with your Railway frontend URL), for example:

- `https://<your-frontend-host>/auth/callback`

Without this, OAuth and magic-link redirects will not return users to the Railway deployment.

**CLI:** from a linked service directory, `npx @railway/cli@latest up` (after `railway login`).
