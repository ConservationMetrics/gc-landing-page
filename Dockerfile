# Ultra-optimized multi-stage build with distroless
# Build stage
FROM node:20.15.0-slim AS builder

# Set the working directory
WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy package files
COPY package*.json pnpm-lock.yaml ./

# Install all dependencies (including dev dependencies for build)
RUN pnpm install --frozen-lockfile

# Copy source code
COPY . .

# Build the application
RUN pnpm run build

# Production stage - using distroless for minimal size
FROM gcr.io/distroless/nodejs20-debian12:nonroot AS production

# Set the working directory
WORKDIR /app

# Copy built application from builder stage
COPY --from=builder /app/.output ./.output

# Copy package files for runtime dependencies
COPY package*.json ./

# Install only the runtime dependencies we need
# We'll use a different approach - copy node_modules from builder
COPY --from=builder /app/node_modules ./node_modules

# Expose port
EXPOSE 8080
ENV NITRO_PORT=8080
ENV NODE_ENV=production

# Run the application
CMD [".output/server/index.mjs"]