# ベースステージ
FROM node:20-slim AS base

# 依存関係インストール
FROM base AS deps
WORKDIR /app
RUN apt-get update && apt-get install -y curl openssl && rm -rf /var/lib/apt/lists/*
COPY package.json package-lock.json ./
RUN npm ci

# ビルドステージ
FROM base AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN bash ./scripts/switch-prisma-schema.sh prod
RUN npx prisma generate # Prisma Clientを生成
RUN npm run build

# 本番実行ステージ
FROM base AS runner
WORKDIR /app
RUN apt-get update && apt-get install -y curl openssl && rm -rf /var/lib/apt/lists/*
ENV NODE_ENV=production
ENV PORT=8080

# 必要なファイルを最適化してコピー
COPY --from=build /app/public ./public
COPY --from=build /app/build ./build
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/package.json ./package.json
COPY --from=build /app/prisma ./prisma # .prisma/client が必要！
COPY --from=build /app/scripts ./scripts

EXPOSE 8080

# ヘルスチェック設定
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:8080/health || exit 1

# アプリケーション実行
CMD ["npm", "start"]