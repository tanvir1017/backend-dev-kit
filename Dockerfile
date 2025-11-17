# Stage 1: Builder
FROM almalinux:9 AS builder

# Install build dependencies with --allowerasing to handle curl-minimal conflict
RUN dnf install -y --allowerasing curl openssl unzip && \
    curl -fsSL https://bun.sh/install | bash && \
    dnf clean all

# Set environment variables for Bun
ENV BUN_INSTALL="/root/.bun"
ENV PATH="$BUN_INSTALL/bin:$PATH"

WORKDIR /app
COPY package.json bun.lock ./
RUN bun install
COPY . .
RUN bunx prisma generate --schema=./prisma/schema
RUN bun run build

# Stage 2: Runtime
FROM almalinux:9

# Install runtime dependencies
RUN dnf install -y --allowerasing openssl unzip && \
    curl -fsSL https://bun.sh/install | bash && \
    dnf clean all

# Set environment variables for Bun
ENV BUN_INSTALL="/root/.bun"
ENV PATH="$BUN_INSTALL/bin:$PATH"

WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./
COPY --from=builder /app/bun.lock ./
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/.env ./
RUN chmod -R +x /app/node_modules/.prisma
EXPOSE 7549
CMD ["bun", "run", "dist/index.js"]
