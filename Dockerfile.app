# ==============================================================================
# Modern Next.js 14+ Optimized Multi-Stage Dockerfile
# Features:
# - Standalone output mode for minimal production images
# - Non-root user security
# - Distroless runtime for ultra-minimal size (~50MB vs ~300MB)
# - Optimized layer caching for faster builds
# - Production-ready with proper health checks
# ==============================================================================

# ----- Dependencies Stage -----
FROM node:22-alpine AS deps

# Install system dependencies required by Node.js packages
RUN apk add --no-cache libc6-compat openssl

WORKDIR /app

# Copy package files first for better Docker layer caching
COPY package.json package-lock.json ./
COPY prisma ./prisma/

# Install dependencies with clean npm cache
RUN npm ci --only=production --ignore-scripts && \
  npm cache clean --force

# Generate Prisma client (required for build)
RUN npx prisma generate

# ----- Builder Stage -----
FROM node:22-alpine AS builder

WORKDIR /app

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/prisma ./prisma

# Copy source code
COPY . .

# Install all dependencies for build (includes devDependencies)
RUN npm ci --ignore-scripts

# Regenerate Prisma client with all source code
RUN npx prisma generate

# Build the application with optimizations
ENV NEXT_TELEMETRY_DISABLED=1 \
  SKIP_ENV_VALIDATION=1 \
  NODE_ENV=production

RUN npm run build

# ----- Production Runtime Stage (Dokploy compatible) -----
# Note: Using alpine instead of distroless for Dokploy compatibility
# Distroless doesn't have shell/npm, which prevents migrations and entrypoint scripts
FROM node:22-alpine AS production

RUN apk add --no-cache libc6-compat openssl curl

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
  adduser -S nextjs -u 1001

WORKDIR /app

# Copy the standalone output from builder
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma
COPY --from=builder --chown=nextjs:nodejs /app/healthcheck.js ./healthcheck.js
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/prisma ./node_modules/prisma
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/.bin/prisma ./node_modules/.bin/prisma

# Copy entrypoint script for migrations
COPY --chown=nextjs:nodejs scripts/docker-entrypoint.sh ./entrypoint.sh
RUN chmod +x ./entrypoint.sh

# Set environment variables
ENV NODE_ENV=production \
  NEXT_TELEMETRY_DISABLED=1 \
  PORT=3000 \
  HOSTNAME="0.0.0.0"

USER nextjs

# Expose port
EXPOSE 3000

# Health check - increased start-period to allow migrations to complete
# especially when multiple containers start simultaneously
HEALTHCHECK --interval=30s --timeout=10s --start-period=120s --retries=3 \
  CMD curl -f http://localhost:3000/api/health || exit 1

# Run migrations on startup, then start app
ENTRYPOINT ["./entrypoint.sh"]
CMD ["node", "server.js"]

# ----- Development Stage -----
FROM node:22-alpine AS development

RUN apk add --no-cache libc6-compat openssl

WORKDIR /app

# Install dependencies
COPY package.json package-lock.json ./
COPY prisma ./prisma/

RUN npm ci && \
  npx prisma generate

# Copy source code  
COPY . .

# Expose development port
EXPOSE 3000

# Start development server (use dev:only to avoid concurrently issues)
CMD ["npm", "run", "dev:only"]

# ----- QA Stage (Production build with debugging tools) -----
FROM node:22-alpine AS qa

RUN apk add --no-cache libc6-compat openssl curl vim

WORKDIR /app

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
  adduser -S nextjs -u 1001

# Copy the built application from builder stage
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma

# Copy entrypoint
COPY --chown=nextjs:nodejs scripts/docker-entrypoint.sh ./entrypoint.sh
RUN chmod +x ./entrypoint.sh

# Set environment variables
ENV NODE_ENV=production \
  NEXT_PUBLIC_APP_ENV=qa \
  PORT=3000 \
  HOSTNAME="0.0.0.0"

USER nextjs

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=10s --start-period=120s --retries=3 \
  CMD curl -f http://localhost:3000/api/health || exit 1

ENTRYPOINT ["./entrypoint.sh"]
CMD ["node", "server.js"]

# ----- Staging/Development Production Stage -----
FROM production AS staging

# Inherits from production but can have different ENV vars
ENV NEXT_PUBLIC_APP_ENV=staging
