# syntax = docker/dockerfile:1

ARG NODE_VERSION=20.19.5
FROM node:${NODE_VERSION}-slim AS base

LABEL fly_launch_runtime="Next.js"
WORKDIR /app
ENV NODE_ENV="production"


# Install dependencies only
FROM base AS deps

COPY package.json package-lock.json* ./
RUN npm ci


# Build the application
FROM base AS build

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build arguments for environment variables needed at build time
ARG PAYPAL_SANDBOX_CLIENT_ID
ARG PAYPAL_SANDBOX_CLIENT_SECRET
ENV PAYPAL_SANDBOX_CLIENT_ID=${PAYPAL_SANDBOX_CLIENT_ID}
ENV PAYPAL_SANDBOX_CLIENT_SECRET=${PAYPAL_SANDBOX_CLIENT_SECRET}

RUN npm run build


# Production image - minimal runtime
FROM base

# Don't run as root
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy standalone output
COPY --from=build --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=build --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
