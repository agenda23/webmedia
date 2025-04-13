#!/bin/bash
# deploy-prep.sh - fly.ioデプロイ準備スクリプト

set -e

echo "🔧 fly.ioデプロイ準備を開始します..."

# 環境変数ファイルのチェック
if [ ! -f .env.production ]; then
  echo "❌ .env.production ファイルが見つかりません"
  exit 1
fi

# データベース接続情報の設定
echo "✅ 環境変数を確認..."
grep -q "DATABASE_PROVIDER=\"postgresql\"" .env.production || {
  echo "❌ .env.production の DATABASE_PROVIDER が postgresql ではありません"
  exit 1
}
grep -q "DATABASE_URL" .env.production || {
  echo "❌ .env.production に DATABASE_URL が設定されていません"
  exit 1
}

# 本番環境用のスキーマに切り替え
echo "✅ 本番環境用のPrismaスキーマに切り替え中..."
bash ./scripts/switch-prisma-schema.sh prod
echo "✅ Prismaスキーマを本番環境用に変更しました"

# fly.io シークレットの設定
echo "✅ fly.io シークレットを設定中..."
bash ./scripts/set_fly_secrets.sh

echo "✅ デプロイの準備が完了しました！以下のコマンドを実行してデプロイしてください："
echo "   npm run fly:deploy"
echo "   npm run fly:migrate  # デプロイ後にマイグレーションを実行"
