# Architecture

High-level design of the AI SaaS Starter Kit: a Turborepo monorepo with a Next.js frontend and a NestJS API, organized with Domain-Driven Design.

## System overview

```
┌─────────────────────────────────────────────────────────┐
│                    MONOREPO (Turborepo)                  │
│                                                         │
│  ┌──────────────────┐    ┌──────────────────────────┐   │
│  │   apps/web       │    │      apps/api            │   │
│  │   Next.js 15     │◄──►│      NestJS              │   │
│  │   Port 3000      │    │      Port 3001           │   │
│  └──────────────────┘    └──────────────────────────┘   │
│                                                         │
│  ┌──────────────┐  ┌───────────────┐  ┌─────────────┐  │
│  │ packages/db  │  │ packages/ui   │  │packages/    │  │
│  │ Prisma       │  │ shadcn base   │  │shared       │  │
│  └──────────────┘  └───────────────┘  └─────────────┘  │
└─────────────────────────────────────────────────────────┘
```

### Production infrastructure

| Service | Provider |
|---------|----------|
| Frontend | Vercel |
| API | Railway (Docker) |
| PostgreSQL | Neon |
| Redis | Upstash |
| Object storage | Cloudflare R2 |
| Email | Resend |
| Payments | Stripe |
| AI | OpenAI |

## Request flow

A typical authenticated dashboard request:

```
Browser
  → Vercel Edge
  → Next.js middleware (JWT validation)
  → Server Component or client fetch
  → NestJS API
  → TenantGuard (resolve organization)
  → JwtAuthGuard
  → PlanGuard (if endpoint requires plan tier)
  → Controller → Use case → Repository
  → PostgreSQL
  → Typed JSON response
```

Tenant isolation happens in the guard layer and is reinforced in every repository query with `organizationId`.

## Bounded contexts

The backend is split into five domains that map to business capabilities:

```
┌─────────────┐  ┌─────────────┐  ┌─────────────┐
│    Auth     │  │Organization │  │   Billing   │
└──────┬──────┘  └──────┬──────┘  └──────┬──────┘
       │                │                │
       └────────────────┴────────────────┘
                        │
            ┌───────────┴───────────┐
            │                       │
      ┌─────┴─────┐           ┌─────┴─────┐
      │    AI     │           │   User    │
      └───────────┘           └───────────┘
```

| Context | Examples |
|---------|----------|
| Auth | Register, login, OAuth, MFA, token refresh |
| Organization | Create org, invite members, change roles |
| Billing | Checkout, portal, Stripe webhooks, usage |
| AI | Conversations, streaming messages, history |
| User | Profile, avatar, password |

Contexts communicate through application services and domain events—not by reaching into another module’s infrastructure layer.

## Clean Architecture layers

Each NestJS module uses four layers:

| Layer | Purpose |
|-------|---------|
| **domain** | Entities, value objects, repository interfaces, domain events |
| **application** | Use cases and DTOs—orchestration only |
| **infrastructure** | Prisma repositories, OpenAI, Stripe, email |
| **presentation** | HTTP controllers (and future WebSocket gateways) |

Dependencies point inward: presentation → application → domain. Infrastructure implements domain ports.

## Frontend structure

```
apps/web/
├── app/
│   ├── (auth)/          # login, register
│   ├── (dashboard)/     # protected: overview, chat, settings, members
│   └── api/             # optional BFF route handlers
├── components/
│   ├── chat/
│   ├── billing/
│   └── shared/
├── hooks/               # useChat (SSE), useOrganization, useSubscription
└── middleware.ts        # route protection
```

## Multi-tenancy model

**Strategy:** Shared database, shared schema, discriminator column `organizationId` on tenant tables.

**Why:** One migration path, lower operational cost, sufficient for most B2B SaaS. Organizations with strict regulatory isolation may later move to schema-per-tenant (documented as a future upgrade path).

**How isolation is enforced:**

1. JWT includes the active `orgId`.
2. `TenantGuard` loads the organization onto the request.
3. Repositories always pass `organizationId` into `where` clauses.

## AI streaming

Chat uses **Server-Sent Events (SSE)** over HTTP:

- One-way server → client stream matches the AI token flow.
- No WebSocket infrastructure or sticky sessions.
- Browser `EventSource` reconnects automatically.

See [ADR-003](adr/README.md#adr-003-sse-for-ai-streaming) for the full rationale.

## Shared packages

| Package | Role |
|---------|------|
| `packages/db` | Prisma schema and generated client |
| `packages/shared` | DTO types, plan limits, error codes |
| `packages/ui` | Reusable UI primitives |

## Further reading

- [Features](features.md) — what each plan includes
- [API reference](api.md) — HTTP surface
- [ADRs](adr/README.md) — recorded decisions
