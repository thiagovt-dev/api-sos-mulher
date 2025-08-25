# Multi-stage Dockerfile for Bun + NestJS + Prisma

# Base image (Debian-based for Prisma compatibility)
FROM oven/bun:1 AS base
WORKDIR /app

# Install system deps commonly needed (openssl for Prisma)
RUN apt-get update && apt-get install -y --no-install-recommends \
    openssl ca-certificates \
 && rm -rf /var/lib/apt/lists/*

# ---------- Development image ----------
FROM base AS dev

# Copy lockfile and package manifest first for better caching
COPY bun.lock* package.json ./

# Install all dependencies (dev included)
RUN bun install

# Copy the rest of the app
COPY . .

# Generate Prisma client (depends on schema)
RUN bunx prisma generate

ENV NODE_ENV=development
ENV PORT=4000
EXPOSE 4000

# Default dev command (watch mode)
CMD sh -c "bunx prisma migrate deploy && bunx prisma generate && bun run start:dev"

# ---------- Builder for production ----------
FROM base AS builder

ENV NODE_ENV=production

COPY bun.lock* package.json ./
RUN bun install --frozen-lockfile

COPY . .
# Generate Prisma client and build TS → JS
RUN bunx prisma generate \
 && bun run build

# ---------- Production runtime ----------
FROM base AS production

ENV NODE_ENV=production
ENV PORT=4000
WORKDIR /app

# Copy only necessary artifacts from builder
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/public ./public
COPY package.json bun.lock* ./

EXPOSE 4000

# Run DB migrations at start, then start app
CMD sh -c "bunx prisma migrate deploy && node dist/main.js"


