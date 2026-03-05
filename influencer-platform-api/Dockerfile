# Use Node.js image with Python and build tools already installed
FROM node:20 AS base

# Install dependencies only when needed
FROM base AS deps
WORKDIR /app

# Node.js image already has Python and build tools installed

# Copy package.json and package-lock.json
COPY package.json package-lock.json* ./

# Install dependencies with exact versions for reproducibility
RUN npm ci --only=production
RUN cp -R node_modules prod_node_modules
RUN npm ci

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build the project
RUN npm run build

# Production image, copy all the files and run the app
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production

# Create a non-root user for security
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 expressjs

# Copy only production dependencies and built app
COPY --from=deps /app/prod_node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json ./package.json

# Set the correct permissions
RUN mkdir -p /app/uploads && \
    chown -R expressjs:nodejs /app

# Create and configure uploads directory with correct permissions
RUN mkdir -p /app/logs && \
    chown -R expressjs:nodejs /app/logs

# Switch to non-root user
USER expressjs

# Expose the port
EXPOSE 5000

# Start the app
CMD ["node", "dist/index.js"]
