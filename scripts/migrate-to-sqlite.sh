#!/bin/bash

# SQLiteへの移行スクリプト

echo "PostgreSQLからローカルSQLiteへの移行を開始します..."

# Prismaの設定を更新
echo "Prismaの設定を更新しています..."
npx prisma generate

# 環境変数の確認
echo "環境変数を確認しています..."
if [ "$DATABASE_PROVIDER" != "sqlite" ]; then
  echo "警告: DATABASE_PROVIDERがsqliteに設定されていません。.env.productionファイルを確認してください。"
fi

# データベースディレクトリの確認
echo "データベースディレクトリを確認しています..."
mkdir -p /data

# マイグレーションの実行
echo "データベースマイグレーションを実行しています..."
npx prisma migrate deploy

echo "移行処理が完了しました。"
echo "次のステップ:"
echo "1. データの移行スクリプトを実行してください: node scripts/import-data.js"
echo "2. アプリケーションをデプロイしてください: npm run fly:deploy"