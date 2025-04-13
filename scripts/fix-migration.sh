#!/bin/bash

# マイグレーションディレクトリを削除
rm -rf /home/agenda23/workspace/webmedia/prisma/migrations

# 現在のディレクトリを表示
echo "現在のディレクトリ: $(pwd)"

# 新しいマイグレーションを作成
cd /home/agenda23/workspace/webmedia
npx prisma migrate dev --name init

# 完了メッセージ
echo "マイグレーションのリセットが完了しました"
