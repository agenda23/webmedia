#!/bin/bash

set -e

MODE=$1

echo "現在のスキーマ状態を確認中..."
grep -q "provider = \"sqlite\"" prisma/schema.prisma && CURRENT="sqlite" || CURRENT="postgresql"
echo "現在のプロバイダー: $CURRENT"

if [ "$MODE" = "dev" ]; then
  echo "開発環境用のPrismaスキーマに切り替えます..."
  cp prisma/schema.dev.prisma prisma/schema.prisma
  echo "Prismaスキーマを開発環境用に変更しました。"
elif [ "$MODE" = "prod" ]; then
  echo "本番環境用のPrismaスキーマに切り替えます..."
  # PostgreSQLスキーマファイルを作成
  cat > prisma/schema.prisma << 'EOL'
generator client {
  provider = "prisma-client-js"
  binaryTargets = ["native", "debian-openssl-3.0.x"]
}

datasource db {
  provider     = "postgresql"
  url          = env("DATABASE_URL")
  relationMode = "prisma"
}
EOL
  
  # 残りのモデル定義を追加（schema.dev.prismaから取得）
  grep -A 1000 "// ユーザーモデル" prisma/schema.dev.prisma >> prisma/schema.prisma
  
  echo "Prismaスキーマを本番環境用に変更しました。"
else
  echo "使用方法: $0 [dev|prod]"
  echo "  dev:  開発環境用のPrismaスキーマに切り替えます"
  echo "  prod: 本番環境用のPrismaスキーマに切り替えます"
  exit 1
fi

# Prismaクライアントの再生成
echo "Prismaクライアントを再生成しています..."
npx prisma generate
echo "完了しました。"
