#!/bin/bash

# アプリケーションスタートアップスクリプト
echo "アプリケーションを起動します..."

# 環境変数チェック
echo "環境変数:"
echo "NODE_ENV: $NODE_ENV"
echo "DATABASE_PROVIDER: $DATABASE_PROVIDER"
echo "DATABASE_URL: ${DATABASE_URL:0:30}..."

# データベースファイル確認
if [ -f "/data/webmedia.db" ]; then
  echo "SQLiteデータベースファイルを検出しました: /data/webmedia.db"
  ls -la /data/webmedia.db
else
  echo "警告: SQLiteデータベースファイルが見つかりません"
  echo "初期化が必要です"
  mkdir -p /data
  touch /data/webmedia.db
  chmod 666 /data/webmedia.db
  
  echo "SQLiteデータベースファイルを作成しました: /data/webmedia.db"
  ls -la /data/webmedia.db
fi

# データベース接続テスト
echo "データベース接続をテストしています..."
npx prisma migrate status

# アプリケーション起動
echo "Remix Webメディアを起動しています..."
/usr/local/bin/node /app/build/server/index.js
