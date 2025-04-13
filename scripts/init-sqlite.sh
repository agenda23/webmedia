#!/bin/bash

# SQLiteデータベースディレクトリとファイルの初期設定スクリプト

# データディレクトリの作成
echo "データディレクトリを確認/作成しています..."
mkdir -p /data
if [ $? -ne 0 ]; then
  echo "警告: /data ディレクトリを作成できませんでした。Fly.io のパーミッションを確認してください。"
fi

# データディレクトリの権限を設定
echo "データディレクトリの権限を設定しています..."
chmod 777 /data
if [ $? -ne 0 ]; then
  echo "警告: /data ディレクトリの権限を変更できませんでした。"
fi
chown -R nobody:nogroup /data 2>/dev/null || echo "所有者変更ができませんでした。"

# データベースファイルの初期化（存在しない場合）
if [ ! -f "/data/webmedia.db" ]; then
  echo "SQLite データベースファイルを初期化しています..."
  touch /data/webmedia.db
  if [ $? -ne 0 ]; then
    echo "エラー: SQLite データベースファイルを作成できませんでした。"
    exit 1
  fi
  
  # ファイルのパーミッションを設定
  chmod 666 /data/webmedia.db
  if [ $? -ne 0 ]; then
    echo "警告: SQLite データベースファイルの権限を変更できませんでした。"
  fi
  
  # ファイルの所有者を変更
  chown nobody:nogroup /data/webmedia.db 2>/dev/null || echo "ファイル所有者の変更ができませんでした。"
  
  echo "SQLite データベースファイルが正常に初期化されました。"
else
  echo "既存のSQLite データベースファイルを使用します。"
  
  # 既存ファイルのパーミッションも設定
  chmod 666 /data/webmedia.db
  if [ $? -ne 0 ]; then
    echo "警告: 既存のSQLite データベースファイルの権限を変更できませんでした。"
  fi
  
  # 既存ファイルの所有者も変更
  chown nobody:nogroup /data/webmedia.db 2>/dev/null || echo "既存ファイル所有者の変更ができませんでした。"
fi

# データベースファイルの所有者を確認
echo "データベースファイルの所有者: $(ls -l /data/webmedia.db | awk '{print $3":"$4}')"

# データベースディレクトリの所有者を確認
echo "データディレクトリの所有者: $(ls -ld /data | awk '{print $3":"$4}')"
