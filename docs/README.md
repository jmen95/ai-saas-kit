# Documentation

Welcome to the **AI SaaS Starter Kit** documentation. These guides are written for developers and operators building on or deploying this project.

## Guides

| Guide | Description |
|-------|-------------|
| [Getting started](getting-started.md) | Install, configure, and run locally |
| [Architecture](architecture.md) | Monorepo layout, DDD, and request flow |
| [Features](features.md) | Product capabilities and subscription plans |
| [API reference](api.md) | REST endpoints and error codes |
| [Environment variables](environment.md) | Complete `.env` reference |
| [Deployment](deployment.md) | CI/CD and production infrastructure |
| [Architecture decisions (ADRs)](adr/README.md) | Why key technical choices were made |
| [Master plan](master-plan.md) | Complete project blueprint (English) |

## Docs website

Browse these guides in the browser:

```bash
npm run dev --workspace=docs
```

Open [http://localhost:3002](http://localhost:3002). The site renders markdown from this `docs/` folder.

## For AI assistants

If you are an automated coding agent, read [AGENTS.md](../AGENTS.md) at the repository root and the Cursor rules in `.cursor/rules/`. The detailed blueprint lives in [PROJECT_1_MASTER_PLAN.md](../PROJECT_1_MASTER_PLAN.md).

## Implementation status

The repository may be bootstrapped incrementally. The docs describe the **target architecture** defined in the master plan. If a path (e.g. `apps/api`) is not present yet, treat the docs as the specification to implement.
