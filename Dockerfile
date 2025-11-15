# Stage 1: Build the Next.js app
FROM node:20-alpine AS builder

WORKDIR /app

# Copy dependency files
COPY package.json package-lock.json* yarn.lock* ./

# Install dependencies
RUN npm install sqlite3
RUN npm install --frozen-lockfile

# Copy the rest of the app
COPY . .

# Build the Next.js app
RUN npm run build

# Stage 2: Run the app in production
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

# Copy only necessary files from builder
COPY --from=builder /app/package.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public

# Expose the port
EXPOSE 3301

# Set the PORT environment variable
ENV PORT=3301

# Start the Next.js app
CMD ["npm", "start"]