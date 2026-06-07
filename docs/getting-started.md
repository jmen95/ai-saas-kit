# Getting started

This guide walks you through running the AI SaaS Starter Kit on your machine.

## Prerequisites

| Tool | Version |
|------|---------|
| Node.js | 20+ |
| npm | 10+ |
| PostgreSQL | 16+ (local or Neon) |
| Redis | 7+ (local or Upstash) |

Optional for full features:

- [Stripe](https://stripe.com) account (test mode)
- [OpenAI](https://platform.openai.com) API key
- [Resend](https://resend.com) for transactional email
- OAuth apps for Google and GitHub

## Clone and install

```bash
git clone <your-repo-url> ai-saas-kit
cd ai-saas-kit
npm install
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.local.example apps/web/.env.local
```

## Environment setup

### API (`apps/api/.env`)

Copy from `apps/api/.env.example` or see [Environment variables](environment.md).

Minimum for local API development:

```bash
NODE_ENV=development
PORT=3001
FRONTEND_URL=http://localhost:3000
DATABASE_URL=postgresql://saas_user:saas_pass@localhost:5432/saas_db
REDIS_URL=redis://localhost:6379
JWT_SECRET=<openssl rand -base64 64>
JWT_REFRESH_SECRET=<openssl rand -base64 64>
# Optional: without a real key the chat returns mock responses
OPENAI_API_KEY=sk-...
```

Generate secrets:

```bash
openssl rand -base64 64
```

> **No external accounts needed.** The app is fully functional without OpenAI,
> Stripe, Resend or OAuth keys. Each integration degrades gracefully: the chat
> falls back to a mock provider, billing runs in "demo mode", and invitations
> fall back to copyable links. A clear banner is shown in the UI when a feature
> is in demo mode.

### Web (`apps/web/.env.local`)

Copy from `apps/web/.env.local.example`, then set:

```bash
NEXT_PUBLIC_API_URL=http://localhost:3001
```

Authentication is handled by the API's own JWT implementation (access +
rotating refresh tokens) — there is no NextAuth dependency.

## Database

Prisma reads `DATABASE_URL` from **`apps/api/.env`** (same file as the API). Ensure it exists:

```bash
cp apps/api/.env.example apps/api/.env
# Edit DATABASE_URL if needed (default matches docker-compose)

npm run db:generate
npm run db:migrate
npm run db:seed   # optional: demo account + sample conversations
```

The seed creates a ready-to-use demo account:

| Field | Value |
|-------|-------|
| Email | `demo@demo.com` |
| Password | `demo1234` |
| Organization | Demo Workspace (PRO) |

Optional: open Prisma Studio:

```bash
npx prisma studio --schema=packages/db/prisma/schema.prisma
```

## Run development servers

From the repository root:

```bash
npm run dev
```

Or run apps individually:

```bash
npx turbo dev --filter=web
npx turbo dev --filter=api
```

| App | URL |
|-----|-----|
| Web | http://localhost:3000 |
| API | http://localhost:3001 |
| Docs | http://localhost:3002 (`npm run dev --workspace=docs`) |

## Stripe webhooks (local)

Use the Stripe CLI to forward webhooks to your API:

```bash
stripe listen --forward-to localhost:3001/billing/webhook
```

Copy the webhook signing secret into `STRIPE_WEBHOOK_SECRET`.

## First-time user flow

1. Register at `/register` — creates a user and default organization.
2. You are redirected to the dashboard as **Owner**.
3. Invite teammates from **Members** (Pro plan required for multiple members on paid tiers).
4. Open **Chat** to start an AI conversation (subject to plan limits).
5. Upgrade billing under **Settings → Billing** via Stripe Checkout.

## Troubleshooting

| Issue | Check |
|-------|--------|
| API connection refused | `NEXT_PUBLIC_API_URL` matches API port; API process is running |
| Prisma errors | `DATABASE_URL` correct; migrations applied |
| OAuth redirect mismatch | Callback URLs match provider console and `.env` |
| SSE chat stalls | OpenAI key valid; plan limits not exceeded |
| Stripe webhook 400 | `STRIPE_WEBHOOK_SECRET` matches CLI or dashboard |

## Next steps

- [Architecture](architecture.md) — how the system is organized
- [API reference](api.md) — endpoints for integration testing
- [Deployment](deployment.md) — ship to Vercel + Railway
