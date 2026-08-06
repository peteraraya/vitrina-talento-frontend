# Base image
FROM node:20-alpine AS base

# 1. Deps stage
FROM base AS deps
# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Install dependencies based on the preferred package manager
COPY package.json package-lock.json* ./
RUN npm ci

# 2. Builder stage
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Environment variables must be present at build time
# if Next.js needs them to prerender pages.
# ENV NEXT_PUBLIC_API_URL=http://localhost:3002/api/v1

RUN npm run build

# 3. Runner stage (Production image)
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
# Next.js telemetry is disabled by default in CI, but you can explicitly disable it.
ENV NEXT_TELEMETRY_DISABLED=1

# Backend is on port 3000, so we use 3001 for the frontend
ENV PORT=3001
ENV HOSTNAME="0.0.0.0"

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Set the correct permission for prerender cache
RUN mkdir .next
RUN chown nextjs:nodejs .next

# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=builder /app/public ./public

# Set user
USER nextjs

COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

EXPOSE 3001

CMD ["node", "server.js"]
