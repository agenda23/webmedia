#!/bin/bash

# 前面プロセスとしてアプリケーションを起動するスクリプト
echo "アプリケーションをフォアグラウンドで起動します..."

# 環境変数チェック
echo "環境変数:"
echo "NODE_ENV: $NODE_ENV"
echo "DATABASE_PROVIDER: $DATABASE_PROVIDER"
echo "DATABASE_URL: ${DATABASE_URL:0:30}..."

# データベースファイル確認
# 環境に応じたデータベースパスを設定
if [ "$NODE_ENV" = "production" ]; then
  DB_PATH="/data/webmedia.db"
else
  DB_PATH="./prisma/dev.db"
fi

if [ -f "$DB_PATH" ]; then
  echo "SQLiteデータベースファイルを検出しました: $DB_PATH"
  ls -la $DB_PATH
else
  echo "警告: SQLiteデータベースファイルが見つかりません"
  echo "初期化が必要です"
  
  # 環境に応じたディレクトリを作成
  if [ "$NODE_ENV" = "production" ]; then
    mkdir -p /data
    touch /data/webmedia.db
    chmod 666 /data/webmedia.db
    echo "SQLiteデータベースファイルを作成しました: /data/webmedia.db"
    ls -la /data/webmedia.db
  else
    mkdir -p ./prisma
    touch ./prisma/dev.db
    chmod 666 ./prisma/dev.db
    echo "SQLiteデータベースファイルを作成しました: ./prisma/dev.db"
    ls -la ./prisma/dev.db
  fi
fi

# データベース接続テスト
echo "データベース接続をテストしています..."
npx prisma migrate status

# アプリケーション初期化
echo "アプリケーションを初期化しています..."
node /app/build/server/initialize.js || true

# アプリケーション起動（フォアグラウンドで実行）
echo "Remix Webメディアを起動しています..."
exec /usr/local/bin/node /app/build/server/index.js
