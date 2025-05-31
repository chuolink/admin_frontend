FROM node:18-alpine

# Install Chromium and its dependencies
RUN apk add --no-cache \
    chromium \
    nss \
    freetype \
    freetype-dev \
    harfbuzz \
    ca-certificates \
    ttf-freefont \
    nodejs \
    wget \
    bash

# Set environment variables for Chromium
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser

# Set PNPM_HOME and SHELL environment variables
ENV PNPM_HOME="/root/.local/share/pnpm"
ENV PATH="${PNPM_HOME}:$PATH"
ENV SHELL="/bin/bash"

# Install pnpm using standalone script
RUN wget -qO /bin/pnpm "https://github.com/pnpm/pnpm/releases/latest/download/pnpm-linuxstatic-x64" && \
    chmod +x /bin/pnpm && \
    /bin/pnpm setup && \
    source /root/.bashrc && \
    /bin/pnpm self-update

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Install dependencies
RUN pnpm install

# RUN rm -rf .env

# Copy the rest of the application
COPY . .



# Build the application
RUN pnpm build --debug

RUN rm -rf .env
# Expose the port
EXPOSE 3000


# Start the application
CMD ["pnpm", "start"]
