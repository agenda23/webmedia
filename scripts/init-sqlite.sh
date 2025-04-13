#!/bin/bash

# SQLiteデータベースディレクトリとファイルの初期設定スクリプト

# データディレクトリの確認と作成
echo "データディレクトリを確認/作成しています..."
# 本番環境では /data、開発環境では ./prisma ディレクトリを使用
if [ "$NODE_ENV" = "production" ]; then
  DB_DIR="/data"
else
  DB_DIR="./prisma"
fi

mkdir -p $DB_DIR
if [ $? -ne 0 ]; then
  echo "警告: $DB_DIR ディレクトリを作成できませんでした。パーミッションを確認してください。"
fi

# データディレクトリの権限を設定
echo "データディレクトリの権限を設定しています..."
chmod 777 $DB_DIR
if [ $? -ne 0 ]; then
  echo "警告: $DB_DIR ディレクトリの権限を変更できませんでした。"
fi

# 本番環境の場合は所有者を変更
if [ "$NODE_ENV" = "production" ]; then
  chown -R nobody:nogroup $DB_DIR 2>/dev/null || echo "所有者変更ができませんでした。"
fi

# 環境に応じたデータベースファイルパスを設定
if [ "$NODE_ENV" = "production" ]; then
  DB_FILE="$DB_DIR/webmedia.db"
else
  DB_FILE="$DB_DIR/dev.db"
fi

# データベースファイルの初期化（存在しない場合）
if [ ! -f "$DB_FILE" ]; then
  echo "SQLite データベースファイルを初期化しています..."
  touch $DB_FILE
  if [ $? -ne 0 ]; then
    echo "エラー: SQLite データベースファイルを作成できませんでした。"
    exit 1
  fi
  
  # ファイルのパーミッションを設定
  chmod 666 $DB_FILE
  if [ $? -ne 0 ]; then
    echo "警告: SQLite データベースファイルの権限を変更できませんでした。"
  fi
  
  # 本番環境の場合は所有者を変更
  if [ "$NODE_ENV" = "production" ]; then
    chown nobody:nogroup $DB_FILE 2>/dev/null || echo "ファイル所有者の変更ができませんでした。"
  fi
  
  echo "SQLite データベースファイルが正常に初期化されました。"
else
  echo "既存のSQLite データベースファイルを使用します。"
  
  # 既存ファイルのパーミッションも設定
  chmod 666 $DB_FILE
  if [ $? -ne 0 ]; then
    echo "警告: 既存のSQLite データベースファイルの権限を変更できませんでした。"
  fi
  
  # 本番環境の場合は所有者を変更
  if [ "$NODE_ENV" = "production" ]; then
    chown nobody:nogroup $DB_FILE 2>/dev/null || echo "既存ファイル所有者の変更ができませんでした。"
  fi
fi

# データベースファイルの確認
echo "データベースファイルの情報:"
ls -la $DB_FILE
