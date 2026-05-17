# Environment variables

Reference for local and production configuration. Never commit real secrets—use `.env` files listed in `.gitignore`.

## API — `apps/api/.env`

### Application

| Variable | Description | Example |
|----------|-------------|---------|
| `NODE_ENV` | Runtime environment | `development` |
| `PORT` | HTTP port | `3001` |
| `FRONTEND_URL` | CORS / redirect origin | `http://localhost:3000` |

### Data stores

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string |
| `REDIS_URL` | Redis connection string |

### JWT

| Variable | Description |
|----------|-------------|
| `JWT_SECRET` | Access token signing secret |
| `JWT_REFRESH_SECRET` | Refresh token signing secret |

Generate with: `openssl rand -base64 64`

### OAuth — Google

| Variable | Description |
|----------|-------------|
| `GOOGLE_CLIENT_ID` | OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | OAuth client secret |
| `GOOGLE_CALLBACK_URL` | e.g. `http://localhost:3001/auth/google/callback` |

### OAuth — GitHub

| Variable | Description |
|----------|-------------|
| `GITHUB_CLIENT_ID` | OAuth client ID |
| `GITHUB_CLIENT_SECRET` | OAuth client secret |
| `GITHUB_CALLBACK_URL` | e.g. `http://localhost:3001/auth/github/callback` |

### Stripe

| Variable | Description |
|----------|-------------|
| `STRIPE_SECRET_KEY` | Secret API key (`sk_test_...` / `sk_live_...`) |
| `STRIPE_WEBHOOK_SECRET` | Webhook signing secret (`whsec_...`) |
| `STRIPE_PRICE_FREE` | Price ID for free tier |
| `STRIPE_PRICE_PRO_MONTHLY` | Pro monthly price ID |
| `STRIPE_PRICE_ENTERPRISE_MONTHLY` | Enterprise monthly price ID |

### OpenAI

| Variable | Description |
|----------|-------------|
| `OPENAI_API_KEY` | API key (`sk-...`) |

### Email (Resend)

| Variable | Description |
|----------|-------------|
| `RESEND_API_KEY` | Resend API key |
| `EMAIL_FROM` | Sender address, e.g. `noreply@yourdomain.com` |

### Storage (Cloudflare R2)

| Variable | Description |
|----------|-------------|
| `R2_ACCOUNT_ID` | Cloudflare account ID |
| `R2_ACCESS_KEY_ID` | S3-compatible access key |
| `R2_SECRET_ACCESS_KEY` | S3-compatible secret |
| `R2_BUCKET_NAME` | Bucket name |
| `R2_PUBLIC_URL` | Public base URL for assets |

### Example file

```bash
NODE_ENV=development
PORT=3001
FRONTEND_URL=http://localhost:3000
DATABASE_URL=postgresql://saas_user:saas_pass@localhost:5432/saas_db
REDIS_URL=redis://localhost:6379
JWT_SECRET=
JWT_REFRESH_SECRET=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_CALLBACK_URL=http://localhost:3001/auth/google/callback
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=
GITHUB_CALLBACK_URL=http://localhost:3001/auth/github/callback
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_FREE=price_...
STRIPE_PRICE_PRO_MONTHLY=price_...
STRIPE_PRICE_ENTERPRISE_MONTHLY=price_...
OPENAI_API_KEY=sk-...
RESEND_API_KEY=re_...
EMAIL_FROM=noreply@yourdomain.com
R2_ACCOUNT_ID=
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_BUCKET_NAME=
R2_PUBLIC_URL=
```

## Web — `apps/web/.env.local`

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_API_URL` | API base URL (browser-visible) |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe publishable key |
| `NEXTAUTH_SECRET` | Should match API `JWT_SECRET` for session compatibility |
| `NEXTAUTH_URL` | App URL, e.g. `http://localhost:3000` |

```bash
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
NEXTAUTH_SECRET=
NEXTAUTH_URL=http://localhost:3000
```

## CI/CD secrets (GitHub Actions)

| Secret | Used for |
|--------|----------|
| `RAILWAY_TOKEN` | API deploy to Railway |
| `VERCEL_TOKEN` | Web deploy to Vercel |
| `VERCEL_ORG_ID` | Vercel project org |
| `VERCEL_PROJECT_ID` | Vercel project |

Production env vars are configured in each platform’s dashboard (Vercel, Railway, Neon, Upstash).
