# syntax=docker/dockerfile:1

# ---- deps: install all dependencies (incl. dev, needed to build) ----
FROM node:20-bookworm AS deps
WORKDIR /app
COPY package.json package-lock.json ./
# `npm install` (not `npm ci`) so platform-specific optional deps resolve
# correctly when building on Linux from a lockfile generated on macOS.
RUN npm install --no-audit --no-fund

# ---- build: generate Prisma client + build Next.js ----
FROM node:20-bookworm AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npx prisma generate
RUN npm run build

# ---- runner: minimal image that serves the built app ----
FROM node:20-bookworm-slim AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000

# Prisma's query engine needs OpenSSL at runtime; the slim image omits it.
RUN apt-get update -y \
  && apt-get install -y --no-install-recommends openssl \
  && rm -rf /var/lib/apt/lists/*

# Copy the built app and its dependencies (Prisma engine + bcrypt native
# binaries are ABI-compatible since both stages are Debian bookworm).
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/.next ./.next
COPY --from=build /app/public ./public
COPY --from=build /app/package.json ./package.json
COPY --from=build /app/next.config.ts ./next.config.ts
COPY --from=build /app/tsconfig.json ./tsconfig.json
COPY --from=build /app/prisma ./prisma
COPY --from=build /app/prisma.config.ts ./prisma.config.ts

EXPOSE 3000

# Apply any pending migrations, then start the production server.
CMD ["sh", "-c", "npx prisma migrate deploy && npm run start"]
