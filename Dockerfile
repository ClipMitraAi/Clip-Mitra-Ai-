# syntax=docker/dockerfile:1
FROM node:22-bookworm-slim

# Install system dependencies including FFmpeg and fonts
RUN apt-get update && apt-get install -y --no-install-recommends \
    ffmpeg \
    fonts-liberation \
    fonts-dejavu-core \
    ca-certificates \
    curl \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy dependency definitions
COPY package*.json ./

# Install dependencies
RUN npm ci --omit=dev

# Copy application code
COPY . .

# Build Vite frontend assets
RUN npm run build

# Expose server port
EXPOSE 3000

ENV NODE_ENV=production
ENV PORT=3000

# Start server
CMD ["node", "--loader", "tsx", "server.ts"]
