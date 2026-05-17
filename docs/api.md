# API reference

REST API served by `apps/api` (NestJS). All authenticated routes require a Bearer access token unless noted.

Base URL (local): `http://localhost:3001`

## Response format

### Success

```json
{
  "data": {},
  "meta": {
    "total": 100,
    "page": 1,
    "perPage": 20
  }
}
```

`meta` is included for paginated list endpoints.

### Error

```json
{
  "error": {
    "code": "PLAN_LIMIT_REACHED",
    "message": "Monthly message limit reached for your plan",
    "statusCode": 403
  }
}
```

## Domain error codes

| Code | Domain |
|------|--------|
| `INVALID_CREDENTIALS` | Auth |
| `EMAIL_ALREADY_EXISTS` | Auth |
| `INVALID_REFRESH_TOKEN` | Auth |
| `MFA_REQUIRED` | Auth |
| `INVITATION_EXPIRED` | Organization |
| `ALREADY_MEMBER` | Organization |
| `CANNOT_REMOVE_OWNER` | Organization |
| `SUBSCRIPTION_INACTIVE` | Billing |
| `PLAN_LIMIT_REACHED` | Billing / AI |
| `CONVERSATION_NOT_FOUND` | AI |
| `CONTEXT_WINDOW_EXCEEDED` | AI |

## Endpoints

### Auth

| Method | Path | Description |
|--------|------|-------------|
| POST | `/auth/register` | Register with email/password |
| POST | `/auth/login` | Login → access + refresh tokens |
| POST | `/auth/refresh` | Refresh access token |
| POST | `/auth/logout` | Invalidate refresh token |
| GET | `/auth/google` | Start Google OAuth |
| GET | `/auth/google/callback` | Google OAuth callback |
| GET | `/auth/github` | Start GitHub OAuth |
| GET | `/auth/github/callback` | GitHub OAuth callback |
| POST | `/auth/mfa/enable` | Enable TOTP MFA |
| POST | `/auth/mfa/verify` | Verify MFA code |

### Users

| Method | Path | Description |
|--------|------|-------------|
| GET | `/users/me` | Current user profile |
| PATCH | `/users/me` | Update profile |
| POST | `/users/me/avatar` | Upload avatar |

### Organizations

| Method | Path | Description |
|--------|------|-------------|
| GET | `/organizations/current` | Current organization |
| PATCH | `/organizations/current` | Update name/logo |
| GET | `/organizations/current/members` | List members |
| DELETE | `/organizations/current/members/:id` | Remove member |
| PATCH | `/organizations/current/members/:id` | Change member role |

### Invitations

| Method | Path | Description |
|--------|------|-------------|
| POST | `/invitations` | Create invitation (sends email) |
| GET | `/invitations/:token` | Invitation details (public) |
| POST | `/invitations/:token/accept` | Accept invitation |
| DELETE | `/invitations/:id` | Cancel invitation |

### Billing

| Method | Path | Description |
|--------|------|-------------|
| GET | `/billing/plans` | Available plans |
| GET | `/billing/subscription` | Current subscription |
| POST | `/billing/checkout` | Create Stripe Checkout session |
| POST | `/billing/portal` | Create Customer Portal session |
| POST | `/billing/webhook` | Stripe webhook (**no JWT**) |
| GET | `/billing/usage` | Current month usage |

### AI

| Method | Path | Description |
|--------|------|-------------|
| POST | `/ai/conversations` | Create conversation |
| GET | `/ai/conversations` | List conversations |
| GET | `/ai/conversations/:id` | Get conversation + messages |
| DELETE | `/ai/conversations/:id` | Delete conversation |
| PATCH | `/ai/conversations/:id` | Update title / system prompt |
| GET | `/ai/conversations/:id/stream` | **SSE** — stream AI response |

### Streaming (SSE)

`GET /ai/conversations/:id/stream?message=...`

Events carry JSON payloads, e.g. `{ "delta": "..." }` during generation and `{ "done": true }` when complete.

Requires: `JwtAuthGuard`, `TenantGuard`, within plan message limits.

## Guards

| Guard | Role |
|-------|------|
| `JwtAuthGuard` | Validates access token |
| `TenantGuard` | Resolves `organization` on request |
| `PlanGuard` | Enforces `@RequiresPlan('PRO')` etc. |
