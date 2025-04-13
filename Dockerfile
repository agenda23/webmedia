# ベースステージ
FROM node:20-slim AS base

# 依存関係インストール
FROM node:20-slim AS deps
WORKDIR /app
RUN apt-get update && apt-get install -y curl openssl sqlite3 && rm -rf /var/lib/apt/lists/*
COPY package.json package-lock.json ./
RUN npm ci

# ビルドステージ
FROM base AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# スキーマ切り替えの確認
RUN echo "切替前のPrismaスキーマ:"
RUN grep -A 5 "datasource db" prisma/schema.prisma || true

# 本番環境用スキーマに切り替え
RUN bash ./scripts/switch-prisma-schema.sh prod

# 切り替え確認
RUN echo "切替後のPrismaスキーマ:"
RUN grep -A 5 "datasource db" prisma/schema.prisma

# Prismaクライアント生成
RUN npx prisma generate
RUN npm run build

# 本番実行ステージ
FROM base AS runner
WORKDIR /app
RUN apt-get update && apt-get install -y curl openssl sqlite3 && rm -rf /var/lib/apt/lists/*
ENV NODE_ENV=production
ENV PORT=8080

# 必要なファイルを最適化してコピー
COPY --from=build /app/public ./public
COPY --from=build /app/build ./build
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/package.json ./package.json
COPY --from=build /app/prisma ./prisma
COPY --from=build /app/scripts ./scripts

EXPOSE 8080

# ヘルスチェック設定
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:8080/health || exit 1

# アプリケーション実行
CMD ["bash", "/app/scripts/start.sh"]