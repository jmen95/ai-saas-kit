# Features

Product capabilities of the AI SaaS Starter Kit and how they behave per subscription tier.

## Authentication & security

- **Email/password** registration and login with bcrypt-hashed passwords
- **OAuth** sign-in via Google and GitHub
- **MFA** optional TOTP (enable / verify endpoints)
- **JWT access tokens** (~15 minutes) and **refresh tokens** (~7 days) with rotation
- Refresh tokens stored as hashes only—never plaintext in the database
- **Rate limiting** on the API (stricter on `/auth` routes)

## Organizations & teams

Each user belongs to one or more **organizations** (tenants). On registration, a default workspace is created and the user becomes **Owner**.

| Capability | Description |
|------------|-------------|
| Organization profile | Name, slug, logo |
| Members | List, remove, change role |
| Invitations | Email invite with 7-day token; accept flow for new or existing users |
| RBAC | **Owner**, **Admin**, **Member** |

**Roles:**

- **Owner** — Full control; cannot be removed if sole owner
- **Admin** — Manage members and settings
- **Member** — Use product features; limited admin actions

## Billing (Stripe)

| Plan | Typical use |
|------|-------------|
| **Free** | Evaluation, solo use |
| **Pro** | Small teams, production workloads |
| **Enterprise** | Large teams, unlimited usage |

Capabilities:

- Stripe Checkout for upgrades
- Customer Portal for payment method and cancellation
- Webhook-driven sync of `plan`, subscription IDs, and billing period end
- Usage dashboard (messages used this month)

### Plan limits

| Limit | Free | Pro | Enterprise |
|-------|------|-----|------------|
| Messages / month | 50 | 2,000 | Unlimited |
| Conversations | 5 | Unlimited | Unlimited |
| Members / org | 1 | 10 | Unlimited |
| Custom system prompt | No | Yes | Yes |
| Models | gpt-4o-mini | mini + gpt-4o | mini + gpt-4o |

Limits are enforced in domain logic and guards before expensive operations (e.g. sending a chat message).

## AI chat

- Create and delete **conversations**
- Optional **system prompt** per conversation (Pro+)
- **Streaming responses** via SSE for responsive UX
- **Persistent history** stored per organization
- **Context window** — last N messages sent to the model (default 20)
- Monthly message counter on the organization (reset via scheduled job)

## User profile

- View and update name, email display fields
- Upload avatar (object storage)
- Change password (authenticated)

## Dashboard

- Overview metrics (usage vs plan limits)
- Navigation to chat, members, and settings
- Billing status and upgrade CTAs

## Planned (post-MVP)

Not in the initial scope but documented in the roadmap:

- RAG over user documents
- Programmatic API keys
- Audit log
- SAML / SSO (Enterprise)
- Outbound webhooks
- Export conversations (PDF/CSV)
- White-labeling
- Usage-based (per-token) billing

See [PROJECT_1_MASTER_PLAN.md](../PROJECT_1_MASTER_PLAN.md) §13 for the full roadmap table.
