FROM node:20-slim AS base

# 依存関係のインストールステージ
FROM base AS deps
WORKDIR /app
# ヘルスチェック用にcurlとOpenSSLをインストール
RUN apt-get update && apt-get install -y curl openssl && rm -rf /var/lib/apt/lists/*
COPY package.json package-lock.json ./
RUN npm ci

# ビルドステージ
FROM base AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# 本番環境用のPrismaスキーマを設定
RUN bash ./scripts/switch-prisma-schema.sh prod
RUN npx prisma generate
RUN npm run build

# 本番実行ステージ
FROM base AS runner
WORKDIR /app
# ヘルスチェック用にcurlとOpenSSLをインストール
RUN apt-get update && apt-get install -y curl openssl && rm -rf /var/lib/apt/lists/*
ENV NODE_ENV=production
ENV PORT=8080

# 必要なファイルだけをコピー（セキュリティとイメージサイズの最適化）
COPY --from=build /app/public ./public
COPY --from=build /app/build ./build
COPY --from=deps /app/node_modules ./node_modules
COPY --from=build /app/package.json ./package.json
COPY --from=build /app/prisma ./prisma
COPY --from=build /app/scripts ./scripts

EXPOSE 8080

# ヘルスチェックの設定（Fly.ioでの安定性向上）
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:8080/health || exit 1

# アプリケーションの実行
CMD ["npm", "start"]
