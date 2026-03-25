FROM oven/bun:1-alpine AS base

# Install system dependencies for Chromium (if needed for puppeteer/pdf generation)
RUN apk add --no-cache \
    chromium \
    nss \
    freetype \
    harfbuzz \
    ca-certificates \
    ttf-freefont

# Set environment variables
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser

WORKDIR /app

# ── Install dependencies ──
COPY package.json bun.lock* ./
RUN bun install --frozen-lockfile

# ── Build ──
COPY . .
RUN bun run build

# ── Production ──
EXPOSE 3000

CMD ["bun", "run", "start"]
