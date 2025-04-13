#!/bin/bash

# Prismaスキーマ更新スクリプト
echo "Prismaスキーマを更新しています..."

# 現在のスキーマファイルのバックアップを作成
cp prisma/schema.prisma prisma/schema.prisma.bak

# スキーマファイルのデータソース部分をSQLiteに更新
sed -i 's/provider     = "postgresql"/provider     = "sqlite"/' prisma/schema.prisma
if [ $? -ne 0 ]; then
  echo "エラー: PostgreSQLプロバイダの置換に失敗しました。"
  exit 1
fi

# データソースのURL部分を環境変数参照に更新
sed -i 's|url          = "postgres://.*"|url          = env("DATABASE_URL")|' prisma/schema.prisma
if [ $? -ne 0 ]; then
  echo "エラー: データベースURLの置換に失敗しました。"
  exit 1
fi

echo "Prismaスキーマを確認しています..."
grep -A 3 "datasource db" prisma/schema.prisma

echo "Prismaスキーマが更新されました。"
