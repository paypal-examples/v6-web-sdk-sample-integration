# syntax = docker/dockerfile:1

ARG NODE_VERSION=20.19.5
FROM node:${NODE_VERSION}-slim AS base

LABEL fly_launch_runtime="Node.js"
WORKDIR /app
ENV NODE_ENV="production"


# Build stage - install dependencies and build all applications
FROM base AS build

RUN apt-get update -qq && \
    apt-get install --no-install-recommends -y build-essential node-gyp pkg-config python-is-python3

# Install dependencies for server
COPY server/node/.npmrc server/node/package.json server/node/package-lock.json* ./server/node/
WORKDIR /app/server/node
RUN npm install --include=dev

# Install dependencies for React app
WORKDIR /app
COPY client/prebuiltPages/react/package.json ./client/prebuiltPages/react/
WORKDIR /app/client/prebuiltPages/react
RUN npm install --include=dev

# Install dependencies for TypeScript app
WORKDIR /app
COPY client/components/paypalPayments/oneTimePayment/typescript/package.json ./client/components/paypalPayments/oneTimePayment/typescript/
WORKDIR /app/client/components/paypalPayments/oneTimePayment/typescript
RUN npm install --include=dev

# Copy all application code
WORKDIR /app
COPY server/node ./server/node
COPY client ./client

# Build all applications and remove dev dependencies
WORKDIR /app/server/node
RUN npm run build && npm prune --omit=dev

WORKDIR /app/client/prebuiltPages/react
RUN npm run build && npm prune --omit=dev

WORKDIR /app/client/components/paypalPayments/oneTimePayment/typescript
RUN npm run build && npm prune --omit=dev


# Production stage - minimal runtime image
FROM base

COPY --from=build /app /app
WORKDIR /app/server/node
ENV CLIENT_STATIC_DIRECTORY="/app/client"

EXPOSE 3000
CMD [ "npm", "run", "start-production" ]
