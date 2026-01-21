# syntax = docker/dockerfile:1

# Adjust NODE_VERSION as desired
ARG NODE_VERSION=20.19.5
FROM node:${NODE_VERSION}-slim AS base

LABEL fly_launch_runtime="Node.js"

# Node.js app lives here
WORKDIR /app

# Set production environment
ENV NODE_ENV="production"


# Throw-away build stage to reduce size of final image
FROM base AS build

# Install packages needed to build node modules
RUN apt-get update -qq && \
    apt-get install --no-install-recommends -y build-essential node-gyp pkg-config python-is-python3

# Copy server package files
COPY server/node/.npmrc server/node/package.json server/node/package-lock.json* ./server/node/

# Install node modules
WORKDIR /app/server/node
RUN npm install --include=dev

# Copy application code
WORKDIR /app
COPY server/node ./server/node
COPY client ./client

# Build application
WORKDIR /app/server/node
RUN npm run build

# Remove development dependencies
RUN npm prune --omit=dev


# Final stage for app image
FROM base

# Copy built application
COPY --from=build /app /app

# Set working directory to server
WORKDIR /app/server/node

# Start the server by default, this can be overwritten at runtime
EXPOSE 3000
CMD [ "npm", "run", "start-production" ]
