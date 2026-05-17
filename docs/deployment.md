# Deployment

How the AI SaaS Starter Kit is built, tested, and deployed to production.

## CI pipeline

GitHub Actions runs on pushes and PRs to `main` and `develop`:

1. **Test job** — PostgreSQL service container, `npm ci`, `turbo lint`, `turbo test`, `turbo build`
2. **Deploy API** (main only) — Railway
3. **Deploy web** (main only) — Vercel

Workflow location (when added): `.github/workflows/ci.yml`

## Production topology

| Component | Provider | Notes |
|-----------|----------|-------|
| Frontend | Vercel | Edge network, Next.js optimized |
| API | Railway | Docker container, port from `PORT` |
| PostgreSQL | Neon | Serverless Postgres |
| Redis | Upstash | Serverless Redis |
| Files | Cloudflare R2 | S3-compatible API |
| Email | Resend | Transactional mail |
| Payments | Stripe | Live mode keys in production |

### Estimated cost (demo / portfolio)

| Service | Tier | ~Monthly |
|---------|------|----------|
| Vercel | Hobby | $0 |
| Railway | Starter | ~$5 |
| Neon | Free | $0 |
| Upstash | Free | $0 |
| R2 | Free | $0 |
| Resend | Free (100/day) | $0 |
| **Total** | | **~$5** |

## Deploy checklist

### Web (Vercel)

1. Import monorepo; set root directory to `apps/web` (or use Turborepo preset).
2. Set environment variables from [Environment variables](environment.md).
3. Build command: `cd ../.. && npx turbo build --filter=web`
4. Configure `NEXT_PUBLIC_API_URL` to production API URL.

### API (Railway)

1. Create service from `apps/api` Dockerfile or Nixpacks.
2. Attach Neon `DATABASE_URL` and Upstash `REDIS_URL`.
3. Set all API secrets (JWT, Stripe, OpenAI, OAuth, R2, Resend).
4. Expose HTTPS URL; update Vercel `NEXT_PUBLIC_API_URL` and OAuth callback URLs.

### Stripe

1. Create production webhook endpoint: `https://<api>/billing/webhook`
2. Subscribe to: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`
3. Store signing secret in `STRIPE_WEBHOOK_SECRET`

### Database

1. Run migrations against production: `prisma migrate deploy`
2. Never use `prisma db push` in production without a deliberate process.

### DNS & auth

1. Point app domain to Vercel.
2. Update OAuth redirect URIs and `FRONTEND_URL` / `NEXTAUTH_URL`.
3. Set CORS allowed origins on the API to the production web URL.

## Zero-downtime considerations

- Run migrations before or during deploy with backward-compatible schema changes.
- Use refresh token rotation without invalidating all sessions on deploy.
- Health check endpoint on API for Railway.

## Monitoring (recommended)

Not bundled in MVP but recommended for production:

- Structured logging (request ID, `organizationId`, user id)
- Error tracking (Sentry)
- Uptime checks on API and web
- Stripe dashboard for payment failures

## Rollback

- **Vercel** — instant rollback to previous deployment in dashboard.
- **Railway** — redeploy previous image or git SHA.
- **Database** — forward-only migrations; plan down migrations separately if needed.
