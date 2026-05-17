# AI SaaS Starter Kit

A production-oriented SaaS starter kit with integrated AI, built as a Turborepo monorepo. It is designed for B2B products that need authentication, multi-tenancy, Stripe billing, and real-time AI chat—not a tutorial demo.

## Features

- **Authentication** — Email/password, OAuth (Google, GitHub), MFA (TOTP)
- **Multi-tenancy** — Organization-scoped data with strict tenant isolation
- **Billing** — Stripe subscriptions (Free / Pro / Enterprise), checkout, customer portal, webhooks
- **AI chat** — Streaming responses (SSE), persistent history, plan-based usage limits
- **Team management** — Invitations, members, RBAC (Owner / Admin / Member)
- **Dashboard** — Usage metrics and organization settings

## Tech stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 15 (App Router) |
| API | NestJS |
| Database | PostgreSQL (Prisma) |
| Cache | Redis |
| AI | OpenAI (GPT-4o family) |
| Payments | Stripe |
| Email | Resend |
| Storage | Cloudflare R2 |

## Repository structure

```
ai-saas-kit/
├── apps/
│   ├── web/          # Next.js dashboard (port 3000)
│   └── api/          # NestJS API (port 3001) — planned
├── packages/
│   ├── db/           # Prisma schema & client
│   ├── shared/       # Shared types & constants
│   └── ui/           # Shared UI components (shadcn)
└── docs/             # User documentation
```

## Quick start

**Requirements:** Node.js 20+, npm 10+, PostgreSQL, Redis (for full stack).

```bash
git clone <repo-url> ai-saas-kit
cd ai-saas-kit
npm install
cp apps/api/.env.example apps/api/.env      # when api exists
cp apps/web/.env.local.example apps/web/.env.local
npm run dev
```

- Web: [http://localhost:3000](http://localhost:3000)
- API: [http://localhost:3001](http://localhost:3001)

See [Getting started](docs/getting-started.md) for environment variables, database setup, and Stripe/OpenAI configuration.

## Documentation

| Document | Audience |
|----------|----------|
| [Getting started](docs/getting-started.md) | Developers setting up locally |
| [Architecture](docs/architecture.md) | System design & request flow |
| [Features](docs/features.md) | Product capabilities & plans |
| [API reference](docs/api.md) | HTTP endpoints & response format |
| [Environment variables](docs/environment.md) | `.env` reference |
| [Deployment](docs/deployment.md) | CI/CD & production infra |
| [ADRs](docs/adr/README.md) | Architecture decision records |
| [AGENTS.md](AGENTS.md) | AI assistants & coding agents |
| [Master plan](docs/master-plan.md) | Full blueprint (English) |
| [PROJECT_1_MASTER_PLAN.md](PROJECT_1_MASTER_PLAN.md) | Full blueprint (Spanish) |
| **Docs site** | `npm run dev --workspace=docs` → http://localhost:3002 |

## Development commands

```bash
npm run dev          # Start all apps (Turborepo)
npm run build        # Production build
npm run lint         # ESLint across workspace
npm run check-types  # TypeScript check
```

Run a single app:

```bash
npx turbo dev --filter=web
```

## Architecture highlights

- **DDD** — Five bounded contexts: Auth, Organization, Billing, AI, User
- **Clean Architecture** — Each NestJS module: `domain/` → `application/` → `infrastructure/` → `presentation/`
- **Multi-tenancy** — Shared schema with `organizationId` on tenant-scoped tables; every query filters by tenant
- **Streaming** — AI responses via Server-Sent Events (SSE), not WebSockets

Details: [Architecture](docs/architecture.md).

## License

Private / portfolio project — add your license here when you open-source or distribute.
