# Production image for the NestJS API (monorepo root build).
# Railway / Docker should build from the repository root.

FROM node:20-alpine AS base
WORKDIR /app
RUN apk add --no-cache openssl wget
COPY package.json package-lock.json ./
COPY apps/api/package.json ./apps/api/
COPY packages/db/package.json ./packages/db/
COPY packages/shared/package.json ./packages/shared/
COPY packages/eslint-config/package.json ./packages/eslint-config/
COPY packages/typescript-config/package.json ./packages/typescript-config/

FROM base AS deps
RUN npm ci

FROM deps AS builder
COPY . .
# Prisma client generation (no live DB required at build time).
RUN npx prisma generate --schema=packages/db/prisma/schema.prisma
# Build workspace packages then the API (avoids dotenv-cli .env dependency in CI).
RUN npx tsc -p packages/db/tsconfig.json
RUN npx tsc -p packages/shared/tsconfig.json
RUN npm run build --workspace=api

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
RUN apk add --no-cache wget openssl

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/api/dist ./apps/api/dist
COPY --from=builder /app/apps/api/package.json ./apps/api/package.json
COPY --from=builder /app/packages/db ./packages/db
COPY --from=builder /app/packages/shared ./packages/shared
COPY --from=builder /app/package.json ./package.json

WORKDIR /app/apps/api
EXPOSE 3001

HEALTHCHECK --interval=30s --timeout=10s --start-period=40s \
  CMD wget -qO- http://localhost:3001/health || exit 1

CMD ["node", "dist/main.js"]
