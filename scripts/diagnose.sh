#!/bin/bash

# アプリケーション診断スクリプト
echo "アプリケーション診断を開始します..."

# システム情報
echo "システム情報:"
echo "実行ユーザー: $(whoami)"
echo "カレントディレクトリ: $(pwd)"
echo "Node.jsバージョン: $(node -v)"
echo "NPMバージョン: $(npm -v)"

# プロセス確認
echo "実行中のアプリケーションプロセス:"
ps aux | grep node

# SQLiteデータベース確認
echo "SQLiteデータベース情報:"
if [ -f "/data/webmedia.db" ]; then
  echo "SQLiteデータベースファイルが存在します"
  ls -la /data/webmedia.db
  echo "データベースファイルサイズ: $(du -h /data/webmedia.db | cut -f1)"
  
  # SQLiteのバージョン確認（sqlite3コマンドがあれば）
  if command -v sqlite3 &> /dev/null; then
    echo "SQLiteバージョン: $(sqlite3 --version)"
    echo "データベーステーブル一覧:"
    sqlite3 /data/webmedia.db ".tables"
  else
    echo "sqlite3コマンドが利用できません"
  fi
else
  echo "エラー: SQLiteデータベースファイルが見つかりません"
fi

# 環境変数確認
echo "環境変数確認:"
echo "DATABASE_PROVIDER: $DATABASE_PROVIDER"
echo "DATABASE_URL: ${DATABASE_URL:0:30}..."
echo "NODE_ENV: $NODE_ENV"

# アプリケーションファイル確認
echo "アプリケーションファイル確認:"
ls -la /app/build
echo "サーバーエントリーポイント:"
ls -la /app/build/server/index.js

# ネットワーク接続の確認
echo "ネットワーク接続確認:"
netstat -tlnp 2>/dev/null || echo "netstatコマンドが利用できません"

echo "診断が完了しました"
