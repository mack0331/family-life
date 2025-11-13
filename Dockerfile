    # Dockerfile
    # Stage 1: Install dependencies and build the application
    FROM node:20-alpine AS builder

    WORKDIR /app

    COPY package.json yarn.lock* package-lock.json* ./
    RUN npm install --frozen-lockfile

    COPY . .

    RUN npm run build

    # Stage 2: Create the production image
    FROM node:20-alpine AS runner

    WORKDIR /app

    ENV NODE_ENV production

    # Copy only the necessary files from the builder stage
    COPY --from=builder /app/.next/standalone ./
    COPY --from=builder /app/.next/static ./.next/static
    COPY --from=builder /app/public ./public

    EXPOSE 3000

    CMD ["node", "server.js"]