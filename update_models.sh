# !/bin/bash

# モデルファイルのリスト
MODEL_FILES=(
  "category.server.ts"
  "comment.server.ts"
  "event.server.ts"
  "media.server.ts"
  "post.server.ts"
  "store.server.ts"
  "tag.server.ts"
)

# モデルディレクトリ
MODEL_DIR=~/workspace/ageyamedia/app/models

# 各モデルファイルをループ処理
for file in "${MODEL_FILES[@]}"; do
  echo "Processing $file..."
  
  # ファイルが存在するか確認
  if [ -f "$MODEL_DIR/$file" ]; then
    # ファイルの内容を取得
    content=$(cat "$MODEL_DIR/$file")
    
    # import文を置換
    new_content=$(echo "$content" | sed 's/import { PrismaClient } from "@prisma\/client";/import { prisma } from ".\/prisma.server";/')
    
    # PrismaClientのインスタンス化を削除
    new_content=$(echo "$new_content" | sed '/const prisma = new PrismaClient();/d')
    
    # 新しい内容でファイルを上書き
    echo "$new_content" > "$MODEL_DIR/$file.new"
    mv "$MODEL_DIR/$file.new" "$MODEL_DIR/$file"
    
    echo "Updated $file"
  else
    echo "File $file not found, skipping."
  fi
done

echo "All model files have been updated."
