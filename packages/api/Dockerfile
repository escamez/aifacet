FROM node:22-alpine AS base
RUN corepack enable && corepack prepare pnpm@10 --activate
WORKDIR /app

FROM base AS deps
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY packages/schema/package.json packages/schema/
COPY packages/vault/package.json packages/vault/
COPY packages/api/package.json packages/api/
RUN pnpm install --frozen-lockfile

FROM base AS build
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/packages/schema/node_modules ./packages/schema/node_modules
COPY --from=deps /app/packages/vault/node_modules ./packages/vault/node_modules
COPY --from=deps /app/packages/api/node_modules ./packages/api/node_modules
COPY . .
RUN pnpm --filter @aifacet/schema build && \
    pnpm --filter @aifacet/vault build && \
    pnpm --filter @aifacet/api build

FROM base AS runtime
COPY --from=build /app/packages/api/dist ./dist
COPY --from=build /app/packages/api/package.json ./
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/packages/schema/dist ./packages/schema/dist
COPY --from=build /app/packages/vault/dist ./packages/vault/dist

ENV NODE_ENV=production
ENV AIFACET_API_PORT=3100
EXPOSE 3100

CMD ["node", "dist/index.js"]
