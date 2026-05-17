# AI Agent Guide — AI SaaS Starter Kit

This file is the **operational context** for coding agents (Cursor, Copilot, Claude, etc.). For the full blueprint with code samples, see [docs/master-plan.md](docs/master-plan.md) (English) or [PROJECT_1_MASTER_PLAN.md](PROJECT_1_MASTER_PLAN.md) (Spanish). For human-oriented docs, see [docs/](docs/).

## Project identity

| Item | Value |
|------|--------|
| Name | AI SaaS Starter Kit |
| Paradigm | Domain-Driven Design (DDD) + Clean Architecture |
| Monorepo | Turborepo (`apps/*`, `packages/*`) |
| Frontend | `apps/web` — Next.js 15, App Router, port **3000** |
| API | `apps/api` — NestJS, port **3001** |
| Schema source of truth | `packages/db/schema.prisma` |
| Shared types/constants | `packages/shared/` |

## Bounded contexts (NestJS modules)

Each context is a NestJS module under `apps/api/src/modules/`:

| Context | Responsibility |
|---------|----------------|
| `auth` | Register, login, refresh, OAuth, MFA |
| `organization` | Orgs, members, invitations, RBAC |
| `billing` | Stripe checkout, portal, webhooks, usage |
| `ai` | Conversations, messages, OpenAI streaming |
| `user` | Profile, avatar, password |

## Module layout (mandatory)

Every bounded context follows this structure:

```
modules/<context>/
├── domain/           # Entities, VOs, repository interfaces, domain events — NO Prisma/HTTP
├── application/      # Use cases (one file per user action), DTOs
├── infrastructure/   # Prisma repos, external adapters (OpenAI, Stripe)
└── presentation/     # Controllers, gateways
```

**Rules:**

1. **Domain never imports** Prisma, NestJS HTTP, or third-party SDKs.
2. **Repositories** are interfaces in `domain/repositories/`; implementations live in `infrastructure/repositories/`.
3. **Use cases** orchestrate: load aggregate → apply domain rules → persist → call ports → emit events.
4. **One use case per file** in `application/use-cases/`.
5. Map Prisma rows to domain entities explicitly (`toDomain` / `toPersistence`).

## Multi-tenancy (non-negotiable)

- Every authenticated request resolves `organization` via `TenantGuard`.
- **All** tenant-scoped reads/writes MUST filter by `organizationId`.
- Never expose or query resources without `organizationId` from the JWT/request context.
- Controllers use `@CurrentOrg()` / `@CurrentUser()` decorators from `shared/decorators/`.

## Request pipeline (API)

```
HTTP → TenantGuard → JwtAuthGuard → PlanGuard (if @RequiresPlan) → Controller → UseCase → Repository → DB
```

Shared cross-cutting code: `apps/api/src/shared/` (guards, decorators, filters, interceptors).

## API response contract

Success:

```json
{ "data": { }, "meta": { "total": 100, "page": 1, "perPage": 20 } }
```

Error:

```json
{ "error": { "code": "PLAN_LIMIT_REACHED", "message": "...", "statusCode": 403 } }
```

Use `DomainErrorCode` from shared constants for machine-readable codes.

## Plan limits

Defined in `packages/shared/constants/plan-limits.ts`:

- **FREE** — 50 msgs/mo, 5 conversations, 1 member, no custom system prompt
- **PRO** — 2000 msgs/mo, unlimited conversations, 10 members
- **ENTERPRISE** — unlimited messages & members

Enforce limits in **domain entities** (e.g. `conversation.canAddMessage()`) and via `PlanGuard` for feature gates.

## AI streaming

- Use **SSE** (`GET /ai/conversations/:id/stream`), not WebSockets.
- Flow: validate tenant → load conversation → check limits → save user message → stream OpenAI → on complete, save assistant message → increment `messagesUsedThisMonth`.
- Frontend: `EventSource` / `useChat` hook in `apps/web/hooks/`.

## Security checklist

| Concern | Implementation |
|---------|----------------|
| Access token | JWT, ~15 min |
| Refresh token | ~7 days, rotation, stored as **hash** only |
| Rate limits | 100/min global, 20/min on `/auth` |
| Stripe webhooks | Verify `stripe-signature` |
| Tenant isolation | `organizationId` on every query |

## Adding a new endpoint (template)

1. Define or extend domain entity method if business rule applies.
2. Add use case in `application/use-cases/<action>.use-case.ts`.
3. Extend repository interface + Prisma implementation if persistence changes.
4. Add DTO in `application/dtos/`.
5. Wire provider in `infrastructure/<context>.module.ts`.
6. Add controller method with `JwtAuthGuard`, `TenantGuard`, and `@RequiresPlan()` if needed.
7. Add shared types in `packages/shared/types/` if the web app needs them.

## Frontend conventions (`apps/web`)

- **Route groups:** `(auth)/` public, `(dashboard)/` protected (middleware JWT check).
- **Data fetching:** Server Components call API; route handlers under `app/api/` proxy when needed.
- **Components:** `components/chat/`, `components/billing/`, `components/shared/`.
- Use `@repo/ui` for base shadcn components.

## Database

- IDs: `cuid()` (not UUID).
- Enums: `Plan`, `MemberRole`, `MessageRole`.
- Usage counter: `Organization.messagesUsedThisMonth` (reset by cron, not COUNT per request).

## Environment

See [docs/environment.md](docs/environment.md). Never commit secrets.

## ADRs (decisions already made)

| ADR | Decision |
|-----|----------|
| 001 | Turborepo monorepo |
| 002 | Prisma over TypeORM |
| 003 | SSE over WebSockets for AI |
| 004 | Column-based multi-tenancy (`organizationId`) |

Full text: [docs/adr/README.md](docs/adr/README.md).

## Effective prompts (for users)

When asking an agent to implement something, include:

```
Context: AI SaaS Starter Kit — Next.js 15 + NestJS, DDD bounded contexts,
Prisma in packages/db/schema.prisma, multi-tenant via organizationId.
Module structure: domain / application / infrastructure / presentation.

Task: [specific change]
Guards required: JwtAuthGuard, TenantGuard
```

## Out of scope (MVP)

RAG, API keys, audit log, SAML/SSO, outbound webhooks, white-label, usage-based billing — see roadmap in master plan §13.

## Related files

- Cursor rules: `.cursor/rules/*.mdc`
- User docs: `docs/`
- Master plan: `PROJECT_1_MASTER_PLAN.md`
