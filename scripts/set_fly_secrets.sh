#!/bin/bash

# .env.productionファイルからfly.ioのシークレットを設定するスクリプト

# 現在のディレクトリのパスを取得
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
ENV_FILE="$DIR/../.env.production"

# .env.productionファイルが存在するか確認
if [ ! -f "$ENV_FILE" ]; then
  echo "エラー: $ENV_FILE が見つかりません"
  exit 1
fi

echo "fly.ioにシークレットを設定します..."

# .env.productionファイルを1行ずつ読み込み、flyctl secretsコマンドを実行
while IFS= read -r line || [[ -n "$line" ]]; do
  # 空行または#で始まる行（コメント）をスキップ
  if [[ -z "$line" || "$line" =~ ^# ]]; then
    continue
  fi
  
  # 変数名と値を抽出
  if [[ "$line" =~ ^([A-Za-z0-9_]+)=(.*)$ ]]; then
    name="${BASH_REMATCH[1]}"
    value="${BASH_REMATCH[2]}"
    
    # 引用符を削除
    value="${value%\"}"
    value="${value#\"}"
    
    echo "設定中: $name"
    flyctl secrets set "$name=$value"
  fi
done < "$ENV_FILE"

echo "シークレットの設定が完了しました"
