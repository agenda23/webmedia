#!/bin/bash

# PostgreSQLへのマイグレーションを実行するスクリプト
echo "Generating Prisma Client..."
npx prisma generate

echo "Running database migrations..."
npx prisma migrate deploy

echo "Database migrations completed."
