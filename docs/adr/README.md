# Architecture Decision Records (ADRs)

ADRs capture **why** important technical choices were made. They help reviewers and future contributors understand trade-offs without re-litigating decisions.

## Index

| ID | Title | Status |
|----|-------|--------|
| [ADR-001](#adr-001-monorepo-with-turborepo) | Monorepo with Turborepo | Accepted |
| [ADR-002](#adr-002-prisma-over-typeorm) | Prisma over TypeORM | Accepted |
| [ADR-003](#adr-003-sse-for-ai-streaming) | SSE for AI streaming | Accepted |
| [ADR-004](#adr-004-column-based-multi-tenancy) | Column-based multi-tenancy | Accepted |

---

## ADR-001: Monorepo with Turborepo

**Status:** Accepted

### Context

The product has two applications (web and API) that share TypeScript types, UI primitives, and a single Prisma schema.

### Decision

Use **Turborepo** as the monorepo orchestrator with npm workspaces.

### Rationale

- Share the Prisma client and DTO types without publishing private npm packages
- Incremental builds with remote/local caching
- Unified CI: one install, one pipeline
- Simpler than Nx for a two-app repository

### Alternatives considered

- **Nx** — More powerful but heavier for this scope
- **Separate repositories** — Duplicated types and more complex CI coordination

---

## ADR-002: Prisma over TypeORM

**Status:** Accepted

### Context

The API needs a type-safe ORM with migrations suitable for NestJS and PostgreSQL.

### Decision

Use **Prisma** with the schema in `packages/db/schema.prisma` as the single source of truth.

### Rationale

- Declarative schema reduces drift between code and database
- Generated types eliminate `any` in data access
- First-class migrations and `prisma studio` for local debugging

### Alternatives considered

- **TypeORM** — Official NestJS integration, but `synchronize: true` is risky in production and generated types are weaker

---

## ADR-003: SSE for AI streaming

**Status:** Accepted

### Context

AI chat must stream partial tokens to the browser in real time.

### Decision

Use **Server-Sent Events (SSE)** via NestJS `@Sse()` on `GET /ai/conversations/:id/stream`.

### Rationale

- AI output is server → client only; SSE matches that model
- Works over standard HTTP (no WebSocket servers, no sticky sessions)
- Browser `EventSource` handles reconnection
- Easier to debug than WebSockets behind proxies

### Alternatives considered

- **WebSockets** — Bidirectional; unnecessary complexity for this flow
- **Polling** — Poor UX and high request volume

---

## ADR-004: Column-based multi-tenancy

**Status:** Accepted

### Context

Multiple customer organizations share one product instance. Data must be isolated per tenant.

### Decision

**Shared database, shared schema**, with `organizationId` on every tenant-scoped table. Enforce isolation in guards and repositories.

### Rationale

- Single migration path and one operational database
- Lower infrastructure cost than DB-per-tenant or schema-per-tenant
- Adequate for most B2B SaaS products

### Trade-offs accepted

- Not suitable for tenants requiring physical data separation for compliance without a migration path to schema-per-tenant

### Alternatives considered

- **Schema-per-tenant** — Stronger isolation, harder operations
- **Database-per-tenant** — Maximum isolation, high cost at scale

---

## Adding a new ADR

1. Copy the template above (Context / Decision / Rationale / Alternatives).
2. Number sequentially (`ADR-005`).
3. Link it in the index table.
4. Mention significant ADRs in [AGENTS.md](../../AGENTS.md) if they affect agent behavior.
