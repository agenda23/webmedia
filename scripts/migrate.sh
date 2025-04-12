#!/bin/bash

# エラーハンドリング
set -e

# PostgreSQLへのマイグレーションを実行するスクリプト
echo "Generating Prisma Client..."

# Prisma Clientの生成
if ! npx prisma generate; then
  echo "Prisma client generation failed!"
  exit 1
fi

echo "Running database migrations..."

# データベースマイグレーションを適用
if ! npx prisma migrate deploy; then
  echo "Database migration failed!"
  exit 1
fi

echo "Database migrations completed successfully."