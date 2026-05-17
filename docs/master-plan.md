# Project 1 — AI SaaS Starter Kit
## Master Plan · DDD Architecture · AI Documentation

> **Version:** 1.0.0  
> **Stack:** Next.js 16 · NestJS · PostgreSQL · Redis · OpenAI  
> **Paradigm:** Domain-Driven Design (DDD) + Clean Architecture  
> **Purpose of this document:** Source of truth for the project. Use it as full context for any AI session (Claude, ChatGPT, Cursor, Copilot). Paste this document at the start of each conversation.

---

## 1. Project Objective

### 1.1 What it is

A **production SaaS starter kit** with integrated AI. It is not a tutorial or a demo — it is a real foundation for building B2B SaaS products with the following out-of-the-box capabilities:

- Full authentication (email/password + OAuth Google/GitHub + MFA)
- Multi-tenancy: each organization has fully isolated data
- Stripe billing: Free/Pro/Enterprise plans, upgrades, cancellations, self-serve portal
- AI chat with real-time streaming, persistent history, and per-plan limits
- Invitation system and member management with RBAC
- Dashboard with usage metrics

### 1.2 Why it exists (portfolio purpose)

This project demonstrates to a CTO or Tech Lead that the candidate can:

1. **Design complete systems** from the DB schema to the UI component
2. **Apply DDD** in a real context, not just in theory
3. **Integrate AI** correctly (streaming, controlled costs, per-plan limits)
4. **Operate in production** (CI/CD, migrations, observability, zero-downtime deploys)
5. **Make architecture decisions** and document them (ADRs)

### 1.3 Target users

| Role | Primary need |
|------|----------------|
| Developer/founder | Launch a SaaS without building boilerplate from scratch |
| Organization (tenant) | Use the product's AI with its own context |
| Org admin | Manage members, view usage, control the plan |

---

## 2. General Architecture

### 2.1 High-level view

```
┌─────────────────────────────────────────────────────────┐
│                    MONOREPO (Turborepo)                  │
│                                                         │
│  ┌──────────────────┐    ┌──────────────────────────┐   │
│  │   apps/web       │    │      apps/api            │   │
│  │   Next.js 16     │◄──►│      NestJS              │   │
│  │   App Router     │    │      Port 3001           │   │
│  │   Port 3000      │    │                          │   │
│  └──────────────────┘    └──────────────────────────┘   │
│                                                         │
│  ┌──────────────┐  ┌───────────────┐  ┌─────────────┐  │
│  │ packages/db  │  │ packages/ui   │  │packages/    │  │
│  │ Prisma client│  │ shadcn base   │  │shared       │  │
│  │ + schema     │  │ + components  │  │types + utils│  │
│  └──────────────┘  └───────────────┘  └─────────────┘  │
└─────────────────────────────────────────────────────────┘

Infrastructure:
  Frontend  → Vercel (Edge Network)
  API       → Railway (Docker container)
  Database  → Neon (PostgreSQL serverless)
  Cache     → Upstash (Redis serverless)
  Storage   → Cloudflare R2 (S3-compatible)
  Email     → Resend
  Payments  → Stripe
  AI        → OpenAI API (GPT-4o)
```

### 2.2 Typical request flow

```
User → Vercel Edge → Next.js middleware (validates JWT) 
       → Next.js Server Component (fetch to API)
       → NestJS API Gateway
       → TenantGuard (resolves organization)
       → JwtAuthGuard (validates token)
       → PlanGuard (checks plan limits)
       → Controller → Service (domain logic)
       → Repository (Prisma → PostgreSQL)
       → Typed response to client
```

### 2.3 Folder structure

```
ai-saas-kit/
│
├── apps/
│   ├── web/                          # Next.js 16
│   │   ├── app/
│   │   │   ├── (auth)/               # Public routes: login, register
│   │   │   │   ├── login/page.tsx
│   │   │   │   └── register/page.tsx
│   │   │   ├── (dashboard)/          # Protected routes
│   │   │   │   ├── layout.tsx        # Dashboard shell
│   │   │   │   ├── overview/page.tsx
│   │   │   │   ├── chat/
│   │   │   │   │   ├── page.tsx
│   │   │   │   │   └── [id]/page.tsx
│   │   │   │   ├── settings/
│   │   │   │   │   ├── profile/page.tsx
│   │   │   │   │   ├── organization/page.tsx
│   │   │   │   │   └── billing/page.tsx
│   │   │   │   └── members/page.tsx
│   │   │   └── api/                  # Route handlers (proxy to API)
│   │   ├── components/
│   │   │   ├── chat/                 # ChatWindow, MessageBubble, InputBar
│   │   │   ├── billing/              # PricingTable, UsageBar, PlanBadge
│   │   │   └── shared/               # Avatar, Sidebar, ThemeToggle
│   │   ├── hooks/
│   │   │   ├── useChat.ts            # SSE streaming
│   │   │   ├── useOrganization.ts
│   │   │   └── useSubscription.ts
│   │   └── middleware.ts             # Route protection
│   │
│   └── api/                          # NestJS
│       └── src/
│           ├── main.ts
│           ├── app.module.ts
│           │
│           ├── modules/
│           │   ├── auth/             # Bounded Context: Authentication
│           │   ├── organization/     # Bounded Context: Tenancy
│           │   ├── billing/          # Bounded Context: Payments
│           │   ├── ai/               # Bounded Context: AI
│           │   └── user/             # Bounded Context: Profile
│           │
│           ├── shared/
│           │   ├── guards/           # JwtAuthGuard, PlanGuard, TenantGuard
│           │   ├── decorators/       # @CurrentUser, @CurrentOrg, @RequiresPlan
│           │   ├── filters/          # GlobalExceptionFilter
│           │   ├── interceptors/     # LoggingInterceptor, TransformInterceptor
│           │   └── pipes/            # ValidationPipe config
│           │
│           └── infrastructure/
│               ├── prisma/           # PrismaService
│               ├── redis/            # RedisService
│               └── storage/          # StorageService (R2)
│
└── packages/
    ├── db/
    │   ├── schema.prisma             # SOURCE OF TRUTH for schema
    │   └── index.ts                  # Re-export PrismaClient
    ├── shared/
    │   ├── types/                    # Shared DTOs web ↔ api
    │   └── constants/                # Plan limits, roles, etc.
    └── ui/
        └── components/               # shadcn/ui base
```

---

## 3. Domain-Driven Design (DDD)

### 3.1 What DDD is and why here

DDD is a way to organize code around the **business domain**, not around technology. Instead of thinking "I have a users table and an organizations table", we think "I have an Authentication bounded context and a Tenancy bounded context that communicate via events".

**Concrete benefits in this project:**
- Each module can change internally without breaking the others
- Code names match business names (ubiquitous language)
- Tests are easier because business logic is isolated

### 3.2 Bounded Contexts

The system is divided into 5 independent domains:

```
┌─────────────────┐   ┌─────────────────┐   ┌─────────────────┐
│  Auth Context   │   │  Org Context    │   │ Billing Context │
│                 │   │                 │   │                 │
│ - Register      │   │ - CreateOrg     │   │ - Subscribe     │
│ - Login         │   │ - InviteMember  │   │ - ChangePlan    │
│ - RefreshToken  │   │ - RemoveMember  │   │ - CancelPlan    │
│ - OAuth         │   │ - UpdateRoles   │   │ - HandleWebhook │
│ - MFA           │   │                 │   │                 │
└────────┬────────┘   └────────┬────────┘   └────────┬────────┘
         │                     │                     │
         └─────────────────────┴─────────────────────┘
                               │
              ┌────────────────┴────────────────┐
              │                                 │
   ┌──────────┴──────────┐         ┌────────────┴────────────┐
   │    AI Context       │         │    User Context         │
   │                     │         │                         │
   │ - CreateConversation│         │ - UpdateProfile         │
   │ - SendMessage       │         │ - UploadAvatar          │
   │ - StreamResponse    │         │ - ChangePassword        │
   │ - ManageHistory     │         │                         │
   └─────────────────────┘         └─────────────────────────┘
```

### 3.3 Internal structure of each module (Clean Architecture)

Each bounded context follows the same layered structure:

```
modules/ai/
├── domain/                    # Domain layer — ZERO external dependencies
│   ├── entities/
│   │   ├── conversation.entity.ts     # Aggregate root
│   │   └── message.entity.ts          # Entity within the aggregate
│   ├── value-objects/
│   │   ├── message-role.vo.ts         # USER | ASSISTANT | SYSTEM
│   │   └── token-count.vo.ts          # Limit validation
│   ├── repositories/
│   │   └── conversation.repository.interface.ts  # Port (interface)
│   ├── services/
│   │   └── ai-usage.domain-service.ts # Logic that does not belong to one entity
│   └── events/
│       ├── message-sent.event.ts
│       └── conversation-created.event.ts
│
├── application/               # Application layer — orchestrates the domain
│   ├── use-cases/
│   │   ├── send-message.use-case.ts   # One use case = one user action
│   │   ├── create-conversation.use-case.ts
│   │   └── get-history.use-case.ts
│   └── dtos/
│       ├── send-message.dto.ts
│       └── conversation-response.dto.ts
│
├── infrastructure/            # Infrastructure layer — concrete implementations
│   ├── repositories/
│   │   └── prisma-conversation.repository.ts  # Implements the port
│   ├── services/
│   │   └── openai.service.ts          # Adapter for OpenAI
│   └── ai.module.ts
│
└── presentation/              # Presentation layer — HTTP
    ├── ai.controller.ts
    └── ai.gateway.ts          # WebSocket (future)
```

### 3.4 Key Entities and Value Objects

#### Conversation (Aggregate Root)

```typescript
// domain/entities/conversation.entity.ts

export class Conversation {
  private constructor(
    public readonly id: string,
    public readonly organizationId: string,
    public title: string | null,
    public systemPrompt: string | null,
    private _messages: Message[],
    public readonly createdAt: Date,
  ) {}

  static create(props: {
    organizationId: string
    title?: string
    systemPrompt?: string
  }): Conversation {
    return new Conversation(
      generateCuid(),
      props.organizationId,
      props.title ?? null,
      props.systemPrompt ?? null,
      [],
      new Date(),
    )
  }

  addMessage(role: MessageRole, content: string): Message {
    const message = Message.create({ conversationId: this.id, role, content })
    this._messages.push(message)
    return message
  }

  // The aggregate controls its own state — it is not modified from outside
  get messages(): ReadonlyArray<Message> {
    return this._messages
  }

  getContextWindow(maxMessages = 20): Message[] {
    // Always includes the system prompt if present, then the last N messages
    return this._messages.slice(-maxMessages)
  }

  // Business logic lives here, not in the service
  canAddMessage(planLimits: PlanLimits): boolean {
    const monthlyUsage = this._messages
      .filter(m => isThisMonth(m.createdAt) && m.role === MessageRole.USER)
      .length
    return monthlyUsage < planLimits.messagesPerMonth
  }
}
```

#### MessageRole (Value Object)

```typescript
// domain/value-objects/message-role.vo.ts

export enum MessageRole {
  USER = 'USER',
  ASSISTANT = 'ASSISTANT',
  SYSTEM = 'SYSTEM',
}

// Value Objects are immutable and compared by value, not by reference
export class TokenCount {
  private constructor(private readonly value: number) {
    if (value < 0) throw new Error('Token count cannot be negative')
    if (value > 128_000) throw new Error('Exceeds maximum context window')
  }

  static of(value: number): TokenCount {
    return new TokenCount(value)
  }

  get count(): number { return this.value }

  add(other: TokenCount): TokenCount {
    return TokenCount.of(this.value + other.value)
  }
}
```

### 3.5 Repository Pattern

The domain defines the interface (port). Infrastructure implements it (adapter). The domain never imports Prisma.

```typescript
// domain/repositories/conversation.repository.interface.ts
export interface IConversationRepository {
  findById(id: string, organizationId: string): Promise<Conversation | null>
  findByOrganization(organizationId: string): Promise<Conversation[]>
  save(conversation: Conversation): Promise<void>
  delete(id: string): Promise<void>
}

// infrastructure/repositories/prisma-conversation.repository.ts
@Injectable()
export class PrismaConversationRepository implements IConversationRepository {
  constructor(private prisma: PrismaService) {}

  async findById(id: string, organizationId: string): Promise<Conversation | null> {
    const raw = await this.prisma.conversation.findFirst({
      where: { id, organizationId },
      include: { messages: { orderBy: { createdAt: 'asc' } } },
    })
    if (!raw) return null
    return this.toDomain(raw)  // map from Prisma to Domain entity
  }

  async save(conversation: Conversation): Promise<void> {
    await this.prisma.conversation.upsert({
      where: { id: conversation.id },
      update: this.toPersistence(conversation),
      create: this.toPersistence(conversation),
    })
  }

  private toDomain(raw: PrismaConversation & { messages: PrismaMessage[] }): Conversation {
    // Explicit mapping — the domain does not know the Prisma schema
    return Conversation.reconstitute({
      id: raw.id,
      organizationId: raw.organizationId,
      title: raw.title,
      systemPrompt: raw.systemPrompt,
      messages: raw.messages.map(m => Message.reconstitute({
        id: m.id,
        conversationId: m.conversationId,
        role: m.role as MessageRole,
        content: m.content,
        tokensUsed: m.tokensUsed,
        createdAt: m.createdAt,
      })),
      createdAt: raw.createdAt,
    })
  }
}
```

### 3.6 Use Cases (Application Layer)

One use case = one action a user can perform. One use case per file.

```typescript
// application/use-cases/send-message.use-case.ts

export interface SendMessageInput {
  conversationId: string
  organizationId: string
  userMessage: string
}

@Injectable()
export class SendMessageUseCase {
  constructor(
    @Inject(CONVERSATION_REPOSITORY)
    private conversationRepo: IConversationRepository,
    private openaiService: OpenAIService,
    private eventEmitter: EventEmitter2,
  ) {}

  async execute(input: SendMessageInput): Promise<Observable<StreamChunk>> {
    // 1. Load the aggregate from the repository
    const conversation = await this.conversationRepo.findById(
      input.conversationId,
      input.organizationId,
    )
    if (!conversation) throw new NotFoundException('Conversation not found')

    // 2. Apply business rules in the domain
    const org = await this.orgRepo.findById(input.organizationId)
    if (!conversation.canAddMessage(getPlanLimits(org.plan))) {
      throw new ForbiddenException('Monthly message limit reached')
    }

    // 3. Add the user message to the aggregate
    conversation.addMessage(MessageRole.USER, input.userMessage)

    // 4. Persist current state
    await this.conversationRepo.save(conversation)

    // 5. Call external service (OpenAI) — this lives in infrastructure
    return this.openaiService.streamCompletion({
      messages: conversation.getContextWindow(),
      systemPrompt: conversation.systemPrompt,
      onComplete: async (fullContent: string, tokensUsed: number) => {
        // 6. When the stream finishes, save the response
        conversation.addMessage(MessageRole.ASSISTANT, fullContent)
        await this.conversationRepo.save(conversation)

        // 7. Emit domain event
        this.eventEmitter.emit('message.sent', new MessageSentEvent({
          organizationId: input.organizationId,
          tokensUsed,
        }))
      },
    })
  }
}
```

---

## 4. Database Schema

### 4.1 Full schema (Prisma)

```prisma
// packages/db/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ─── IDENTITY & ACCESS ───────────────────────────────────────

model User {
  id            String    @id @default(cuid())
  email         String    @unique
  name          String?
  avatarUrl     String?
  passwordHash  String?
  emailVerified Boolean   @default(false)
  totpSecret    String?   // MFA
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  memberships   OrganizationMember[]
  refreshTokens RefreshToken[]
  oauthAccounts OAuthAccount[]

  @@map("users")
}

model OAuthAccount {
  id           String @id @default(cuid())
  provider     String // "google" | "github"
  providerId   String
  accessToken  String?
  refreshToken String?
  user         User   @relation(fields: [userId], references: [id], onDelete: Cascade)
  userId       String

  @@unique([provider, providerId])
  @@map("oauth_accounts")
}

model RefreshToken {
  id        String   @id @default(cuid())
  tokenHash String   @unique  // store the hash, never the plain token
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  userId    String
  expiresAt DateTime
  createdAt DateTime @default(now())

  @@map("refresh_tokens")
}

// ─── TENANCY ─────────────────────────────────────────────────

model Organization {
  id          String   @id @default(cuid())
  name        String
  slug        String   @unique
  logoUrl     String?
  plan        Plan     @default(FREE)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  // Stripe
  stripeCustomerId     String? @unique
  stripeSubscriptionId String? @unique
  stripePriceId        String?
  stripeCurrentPeriodEnd DateTime?

  // Usage limits (updated via Stripe webhook)
  messagesUsedThisMonth Int @default(0)
  lastUsageReset        DateTime @default(now())

  members       OrganizationMember[]
  invitations   Invitation[]
  conversations Conversation[]

  @@map("organizations")
}

model OrganizationMember {
  id             String       @id @default(cuid())
  role           MemberRole   @default(MEMBER)
  joinedAt       DateTime     @default(now())

  user           User         @relation(fields: [userId], references: [id], onDelete: Cascade)
  userId         String
  organization   Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  organizationId String

  @@unique([userId, organizationId])
  @@map("organization_members")
}

model Invitation {
  id             String     @id @default(cuid())
  email          String
  token          String     @unique @default(cuid())
  role           MemberRole @default(MEMBER)
  expiresAt      DateTime
  acceptedAt     DateTime?
  createdAt      DateTime   @default(now())

  organization   Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  organizationId String

  @@map("invitations")
}

// ─── AI / CONVERSATIONS ──────────────────────────────────────

model Conversation {
  id             String       @id @default(cuid())
  title          String?
  systemPrompt   String?
  createdAt      DateTime     @default(now())
  updatedAt      DateTime     @updatedAt

  organization   Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  organizationId String
  messages       Message[]

  @@index([organizationId, createdAt(sort: Desc)])
  @@map("conversations")
}

model Message {
  id             String       @id @default(cuid())
  role           MessageRole
  content        String
  tokensUsed     Int          @default(0)
  createdAt      DateTime     @default(now())

  conversation   Conversation @relation(fields: [conversationId], references: [id], onDelete: Cascade)
  conversationId String

  @@index([conversationId, createdAt(sort: Asc)])
  @@map("messages")
}

// ─── ENUMS ───────────────────────────────────────────────────

enum Plan        { FREE PRO ENTERPRISE }
enum MemberRole  { OWNER ADMIN MEMBER }
enum MessageRole { USER ASSISTANT SYSTEM }
```

### 4.2 Schema design decisions

| Decision | Rejected alternative | Reason |
|----------|----------------------|--------|
| `cuid()` as IDs | `uuid()` | CUIDs are time-sortable, more URL-friendly |
| `tokenHash` on RefreshToken | store plain token | If the DB is compromised, tokens are not usable |
| `messagesUsedThisMonth` on Org | real-time COUNT query | Avoids expensive COUNT(*) on every request; reset by cron |
| `@@index` on conversations and messages | no index | History queries are by org+date and conversation+date |
| `stripeCurrentPeriodEnd` on Org | query Stripe API | Avoids latency when checking if subscription is active |

---

## 5. API Design

### 5.1 Full endpoints

```
AUTH
POST   /auth/register              Register with email/password
POST   /auth/login                 Login → returns access + refresh tokens
POST   /auth/refresh               Renew access token
POST   /auth/logout                Invalidate refresh token
GET    /auth/google                Start Google OAuth
GET    /auth/google/callback        Google OAuth callback
GET    /auth/github                Start GitHub OAuth
GET    /auth/github/callback        GitHub OAuth callback
POST   /auth/mfa/enable            Enable TOTP MFA
POST   /auth/mfa/verify            Verify MFA code

USERS
GET    /users/me                   Current user profile
PATCH  /users/me                   Update profile
POST   /users/me/avatar            Upload avatar

ORGANIZATIONS
GET    /organizations/current      User's current organization
PATCH  /organizations/current      Update name/logo
GET    /organizations/current/members      List members
DELETE /organizations/current/members/:id  Remove member
PATCH  /organizations/current/members/:id  Change role

INVITATIONS
POST   /invitations                Create invitation (sends email)
GET    /invitations/:token         View invitation details
POST   /invitations/:token/accept  Accept invitation
DELETE /invitations/:id            Cancel invitation

BILLING
GET    /billing/plans              List available plans
GET    /billing/subscription       Current subscription
POST   /billing/checkout           Create Stripe Checkout session
POST   /billing/portal             Create Customer Portal session
POST   /billing/webhook            Stripe webhook (no JWT auth)
GET    /billing/usage              Current month usage

AI
POST   /ai/conversations           Create conversation
GET    /ai/conversations           List conversations
GET    /ai/conversations/:id       View conversation with messages
DELETE /ai/conversations/:id       Delete conversation
PATCH  /ai/conversations/:id       Update title/system prompt
GET    /ai/conversations/:id/stream  SSE — response stream
```

### 5.2 Standard response format

All responses follow this contract:

```typescript
// Success
{
  "data": { ... },          // payload
  "meta": {                 // pagination (when applicable)
    "total": 100,
    "page": 1,
    "perPage": 20
  }
}

// Error
{
  "error": {
    "code": "PLAN_LIMIT_REACHED",    // machine-readable code
    "message": "Monthly message limit reached for your plan",
    "statusCode": 403
  }
}
```

### 5.3 Domain error codes

```typescript
export enum DomainErrorCode {
  // Auth
  INVALID_CREDENTIALS    = 'INVALID_CREDENTIALS',
  EMAIL_ALREADY_EXISTS   = 'EMAIL_ALREADY_EXISTS',
  INVALID_REFRESH_TOKEN  = 'INVALID_REFRESH_TOKEN',
  MFA_REQUIRED           = 'MFA_REQUIRED',

  // Organization
  INVITATION_EXPIRED     = 'INVITATION_EXPIRED',
  ALREADY_MEMBER         = 'ALREADY_MEMBER',
  CANNOT_REMOVE_OWNER    = 'CANNOT_REMOVE_OWNER',

  // Billing
  SUBSCRIPTION_INACTIVE  = 'SUBSCRIPTION_INACTIVE',
  PLAN_LIMIT_REACHED     = 'PLAN_LIMIT_REACHED',

  // AI
  CONVERSATION_NOT_FOUND = 'CONVERSATION_NOT_FOUND',
  CONTEXT_WINDOW_EXCEEDED = 'CONTEXT_WINDOW_EXCEEDED',
}
```

---

## 6. Business Rules by Plan

### 6.1 Per-plan limits

```typescript
// packages/shared/constants/plan-limits.ts

export const PLAN_LIMITS = {
  FREE: {
    messagesPerMonth: 50,
    conversationsTotal: 5,
    membersPerOrg: 1,
    systemPromptEnabled: false,
    modelAccess: ['gpt-4o-mini'],
  },
  PRO: {
    messagesPerMonth: 2000,
    conversationsTotal: Infinity,
    membersPerOrg: 10,
    systemPromptEnabled: true,
    modelAccess: ['gpt-4o-mini', 'gpt-4o'],
  },
  ENTERPRISE: {
    messagesPerMonth: Infinity,
    conversationsTotal: Infinity,
    membersPerOrg: Infinity,
    systemPromptEnabled: true,
    modelAccess: ['gpt-4o-mini', 'gpt-4o'],
  },
} as const satisfies Record<Plan, PlanLimits>
```

### 6.2 Plan guard

```typescript
// shared/guards/plan.guard.ts

@Injectable()
export class PlanGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const requiredPlan = this.reflector.get<Plan>('requiredPlan', context.getHandler())
    if (!requiredPlan) return true

    const { organization } = context.switchToHttp().getRequest()
    const planOrder: Plan[] = ['FREE', 'PRO', 'ENTERPRISE']

    return planOrder.indexOf(organization.plan) >= planOrder.indexOf(requiredPlan)
  }
}

// Usage in controller:
@Get('advanced-feature')
@RequiresPlan('PRO')    // Custom decorator
async advancedFeature() { ... }
```

---

## 7. Security

### 7.1 Implemented security checklist

| Measure | Where | Detail |
|---------|-------|--------|
| Short-lived JWT | Auth | access token: 15min, refresh: 7 days |
| Refresh token rotation | Auth | Each refresh invalidates the previous token |
| Token hashing | DB | RefreshTokens stored as bcrypt hash |
| Rate limiting | API Gateway | 100 req/min per IP, 20 req/min on /auth |
| Tenant isolation | TenantGuard | Every query filters by organizationId |
| Stripe webhook signature | Billing | Validates `stripe-signature` header |
| SQL injection | Prisma | Parameterized queries by default |
| XSS | Next.js | React escapes by default, CSP headers |
| CORS | NestJS | Origin whitelist |

### 7.2 Tenant isolation — how it works

Every authenticated request resolves the current tenant. All repositories receive `organizationId` and include it in every query. Accessing another tenant's data is impossible by construction:

```typescript
// The guard injects the org into the request
@Injectable()
export class TenantGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest()
    const { orgId } = request.user  // from JWT

    const org = await this.prisma.organization.findUnique({
      where: { id: orgId },
    })
    if (!org) throw new ForbiddenException()

    request.organization = org  // available in controllers and services
    return true
  }
}

// In the use case — organizationId always filters
async findConversations(organizationId: string) {
  return this.prisma.conversation.findMany({
    where: { organizationId },  // ← this must never be omitted
  })
}
```

---

## 8. Critical Flows

### 8.1 Registration + onboarding flow

```
1. POST /auth/register { email, password, name }
2. Create User in DB with passwordHash
3. Create Organization "{name}'s workspace" with unique slug
4. Create OrganizationMember with role=OWNER
5. Send welcome email (async via queue)
6. Generate access token + refresh token
7. Return tokens to client
8. Client stores tokens in httpOnly cookies
9. Redirect to dashboard
```

### 8.2 Invitation flow

```
1. Admin: POST /invitations { email, role }
2. Create Invitation with unique token and expiresAt = now + 7 days
3. Send email with link: https://app.com/invite/{token}
4. Invitee: GET /invitations/{token} → view org details
5. Invitee: POST /invitations/{token}/accept (authenticated)
6. Verify token has not expired and was not used
7. Create OrganizationMember
8. Set Invitation.acceptedAt = now
9. Redirect to organization dashboard
```

### 8.3 Plan upgrade flow

```
1. User: POST /billing/checkout { priceId: 'price_pro_monthly' }
2. NestJS creates/retrieves Stripe Customer for the org
3. Create Stripe Checkout Session with:
   - customer: stripeCustomerId
   - success_url: /dashboard?upgraded=true
   - cancel_url: /settings/billing
4. Return { checkoutUrl } to client
5. Client redirects to Stripe Checkout
6. User completes payment on Stripe
7. Stripe calls POST /billing/webhook with checkout.session.completed event
8. NestJS validates stripe-signature
9. Update Organization: plan=PRO, stripeSubscriptionId, stripeCurrentPeriodEnd
10. Send upgrade confirmation email
```

### 8.4 AI chat with streaming flow

```
1. Client: EventSource('/ai/conversations/{id}/stream?message=...')
2. NestJS: JwtAuthGuard validates token
3. NestJS: TenantGuard resolves organization
4. SendMessageUseCase:
   a. Load Conversation from repository
   b. Verify plan limits (canAddMessage)
   c. Add User message to aggregate
   d. Persist to DB
   e. Call OpenAI with stream: true
5. For each OpenAI chunk:
   subscriber.next({ data: JSON.stringify({ delta: chunk }) })
6. When OpenAI finishes:
   a. Add Assistant message to aggregate
   b. Persist to DB
   c. Increment messagesUsedThisMonth on Organization
   d. subscriber.next({ data: JSON.stringify({ done: true }) })
   e. subscriber.complete()
7. Client closes EventSource
8. UI updates message with full content
```

---

## 9. Environment Variables

### 9.1 apps/api/.env

```bash
# App
NODE_ENV=development
PORT=3001
FRONTEND_URL=http://localhost:3000

# Database
DATABASE_URL=postgresql://saas_user:saas_pass@localhost:5432/saas_db

# Redis
REDIS_URL=redis://localhost:6379

# JWT
JWT_SECRET=<generate with: openssl rand -base64 64>
JWT_REFRESH_SECRET=<generate with: openssl rand -base64 64>

# OAuth
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_CALLBACK_URL=http://localhost:3001/auth/google/callback

GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=
GITHUB_CALLBACK_URL=http://localhost:3001/auth/github/callback

# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_FREE=price_...
STRIPE_PRICE_PRO_MONTHLY=price_...
STRIPE_PRICE_ENTERPRISE_MONTHLY=price_...

# OpenAI
OPENAI_API_KEY=sk-...

# Email
RESEND_API_KEY=re_...
EMAIL_FROM=noreply@yourdomain.com

# Storage
R2_ACCOUNT_ID=
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_BUCKET_NAME=
R2_PUBLIC_URL=
```

### 9.2 apps/web/.env.local

```bash
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
NEXTAUTH_SECRET=<same value as JWT_SECRET>
NEXTAUTH_URL=http://localhost:3000
```

---

## 10. CI/CD and Deployment

### 10.1 GitHub Actions workflow

```yaml
# .github/workflows/ci.yml
name: CI

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:16
        env:
          POSTGRES_DB: test_db
          POSTGRES_USER: test_user
          POSTGRES_PASSWORD: test_pass
        ports: ['5432:5432']

    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '20', cache: 'npm' }
      - run: npm ci
      - run: npx turbo lint
      - run: npx turbo test
      - run: npx turbo build

  deploy-api:
    needs: test
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Deploy to Railway
        uses: railway/deploy@v1
        with:
          railway-token: ${{ secrets.RAILWAY_TOKEN }}
          service: api

  deploy-web:
    needs: test
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
```

### 10.2 Production infrastructure

| Service | Provider | Tier | Approx. cost/month |
|---------|----------|------|-------------------|
| Frontend | Vercel | Hobby (free) | $0 |
| API | Railway | Starter | $5 |
| PostgreSQL | Neon | Free tier | $0 |
| Redis | Upstash | Free tier | $0 |
| Storage | Cloudflare R2 | Free tier | $0 |
| Email | Resend | Free (100/day) | $0 |
| **Demo total** | | | **~$5/month** |

---

## 11. Architecture Decision Records (ADRs)

ADRs document why each important decision was made. They are what differentiates a junior portfolio from a senior one.

### ADR-001: Monorepo with Turborepo

**Context:** The project has two applications (web and api) that share types and components.

**Decision:** Use Turborepo as the monorepo manager.

**Reasons:**
- Share the Prisma client across apps without publishing a private package
- Smart build cache — only recompiles what changed
- Unified CI/CD pipeline
- Single `npm install` for the whole project

**Alternatives considered:** Nx (more complex, overkill for 2 apps), separate repositories (type duplication, more complex CI).

---

### ADR-002: Prisma over TypeORM

**Context:** We need an ORM for NestJS with excellent TypeScript support.

**Decision:** Prisma as the primary ORM.

**Reasons:**
- Schema as single source of truth avoids inconsistencies between model and DB
- Automatic migrations reduce human error
- Generated typing is excellent — no `any` in queries
- `prisma studio` speeds up local development

**Alternatives considered:** TypeORM (official NestJS integration, but `synchronize:true` is a dangerous footgun in production and typing is inferior).

---

### ADR-003: SSE over WebSockets for AI streaming

**Context:** AI chat requires the server to send tokens to the client in real time.

**Decision:** Server-Sent Events (SSE) via NestJS `@Sse`.

**Reasons:**
- AI flow is unidirectional (server → client): SSE is exactly for that
- SSE uses normal HTTP — no extra infrastructure (no socket servers, no sticky sessions)
- Automatic reconnection in the browser
- Simpler to implement and debug than WebSockets

**Alternatives considered:** WebSockets (bidirectional, overkill for this case, requires extra proxy configuration), polling (poor UX, expensive in requests).

---

### ADR-004: Multi-tenancy with organizationId on each table

**Context:** The system is multi-tenant — each organization has isolated data.

**Decision:** Column-based multi-tenancy strategy (`organizationId`) in a shared schema.

**Reasons:**
- Operational simplicity: one DB, one schema, one set of migrations
- Cost: schema-per-tenant or DB-per-tenant multiplies infrastructure costs
- Sufficient for 95% of B2B SaaS

**Accepted trade-offs:** If a tenant requires total data isolation (regulatory, compliance), migration to schema-per-tenant would be needed. Documented as a known upgrade path.

**Alternatives considered:** Schema-per-tenant (better isolation, much harder to operate), DB-per-tenant (maximum isolation, prohibitive cost at scale).

---

## 12. AI Usage Guide

### 12.1 How to use this document with Claude/ChatGPT/Cursor

To get precise help from any AI, include this block at the start of your message:

```
Project context:
- It is an AI SaaS Starter Kit with Next.js 16 + NestJS
- Architecture: DDD with bounded contexts (Auth, Organization, Billing, AI, User)
- ORM: Prisma with PostgreSQL
- Each module has: domain/ application/ infrastructure/ presentation/
- Multi-tenancy: all queries filter by organizationId
- Full schema is in packages/db/schema.prisma
- Shared types are in packages/shared/

My question: [your question here]
```

### 12.2 Effective prompts by situation

**Add a new endpoint:**
```
In the AI SaaS project (NestJS + DDD), I need to add an endpoint 
PATCH /ai/conversations/:id/title that allows renaming a conversation.
Follow the existing structure: use case in application/use-cases/, 
repository pattern with IConversationRepository, and the controller in presentation/.
The endpoint requires JwtAuthGuard and TenantGuard.
```

**Debug a Prisma error:**
```
I have this Prisma error in the project:
[paste error]

The relevant schema is:
[paste relevant models from schema.prisma]

The failing code is:
[paste code]
```

**Add a billing feature:**
```
In the Billing context of the SaaS project, I need to add 
an endpoint that returns the invoice history for the current organization.
Stripe is the provider. The organization has stripeCustomerId in the DB.
Follow the existing BillingService pattern.
```

---

## 13. Future Features Roadmap

These features are documented but outside MVP scope:

| Feature | Complexity | Business value |
|---------|------------|----------------|
| RAG on own documents | High | High |
| API keys for programmatic access | Medium | High |
| Action audit log | Medium | Medium |
| SSO / SAML for Enterprise | High | High |
| Outbound webhooks | Medium | Medium |
| Export conversations (PDF/CSV) | Low | Medium |
| White-labeling | High | High |
| Usage-based billing (per token) | High | High |

---

*Generated as part of the Senior FullStack & Technical Lead portfolio.*  
*Last updated: May 2025*
