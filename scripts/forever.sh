#!/bin/bash

# アプリケーションを初期化して実行するスクリプト
echo "アプリケーション初期化・実行スクリプトを開始しています..."

# ログファイルの設定
LOG_FILE="/tmp/app.log"
touch $LOG_FILE
chmod 666 $LOG_FILE
echo "$(date): アプリケーション開始" > $LOG_FILE

# シグナル処理
trap 'kill -TERM $APP_PID' TERM INT

# 初期設定
echo "初期設定を実行しています..." | tee -a $LOG_FILE
bash /app/scripts/start.sh 2>&1 | tee -a $LOG_FILE

# サーバー依存関係の確認と修復
echo "依存関係を確認・修復しています..." | tee -a $LOG_FILE
cd /app && npm install @remix-run/serve --save 2>&1 | tee -a $LOG_FILE

# 環境変数を設定してすべてのインターフェースでリッスンするようにする
export HOST=0.0.0.0
echo "ホスト設定: $HOST:$PORT" | tee -a $LOG_FILE

# アプリケーション本体を起動
echo "アプリケーションのメインプロセスを起動します..." | tee -a $LOG_FILE
echo "NODE_ENV=$NODE_ENV HOST=$HOST PORT=$PORT" | tee -a $LOG_FILE

# より詳細なデバッグ情報を有効化
export DEBUG="*"

# サーバーファイルの存在確認
if [ -f "/app/build/server/index.js" ]; then
  echo "サーバーファイルが存在します: /app/build/server/index.js" | tee -a $LOG_FILE
else
  echo "エラー: サーバーファイルが見つかりません" | tee -a $LOG_FILE
  ls -la /app/build/ | tee -a $LOG_FILE
fi

# serve コマンドを使用してサーバーを起動（package.jsonのstartスクリプトを使用）
echo "npm start コマンドを使用してサーバーを起動..." | tee -a $LOG_FILE
cd /app && npm start &> >(tee -a $LOG_FILE) &
APP_PID=$!

# 起動確認のためのスリープ
sleep 5

# 起動確認
echo "アプリケーションの起動状態を確認しています..." | tee -a $LOG_FILE
if ! kill -0 $APP_PID 2>/dev/null; then
  echo "警告: アプリケーションプロセスが起動直後に終了しました。ログを確認してください。" | tee -a $LOG_FILE
  echo "診断情報の収集..." | tee -a $LOG_FILE
  bash /app/scripts/diagnose.sh 2>&1 | tee -a $LOG_FILE
  
  # 強制的に実行を続ける
  while true; do
    echo "$(date): プロセス監視中... スリープモード" | tee -a $LOG_FILE
    sleep 60
  done
fi

echo "アプリケーションが起動しました。PID: $APP_PID" | tee -a $LOG_FILE
echo "リッスンポート確認:" | tee -a $LOG_FILE
(netstat -tulpn | grep 8080 || echo "8080ポートでリッスンしていません") 2>&1 | tee -a $LOG_FILE

# バインドアドレスの確認（デバッグ用）
echo "バインドアドレスの確認:" | tee -a $LOG_FILE
(netstat -an | grep LISTEN) 2>&1 | tee -a $LOG_FILE

# 起動直後の診断情報
echo "起動直後の診断情報を収集中..." | tee -a $LOG_FILE
bash /app/scripts/diagnose.sh > /tmp/startup-diagnose.log 2>&1

# 定期的なヘルスチェック
echo "バックグラウンドでヘルスチェックを開始します..." | tee -a $LOG_FILE
while true; do
  sleep 30
  # 現在時刻をログに記録
  echo "$(date): ヘルスチェック実行中..." >> $LOG_FILE
  
  # ヘルスチェック（ヘルスエンドポイントにアクセスしてみる）
  if ! curl -s -f http://localhost:8080/health > /dev/null 2>&1; then
    echo "$(date): ヘルスチェック失敗: アプリケーションを再起動します" | tee -a $LOG_FILE
    kill -9 $APP_PID 2>/dev/null
    echo "リッスンポート再確認:" | tee -a $LOG_FILE
    (netstat -tulpn || echo "netstat利用不可") 2>&1 | tee -a $LOG_FILE
    
    echo "診断情報の収集..." | tee -a $LOG_FILE
    bash /app/scripts/diagnose.sh > /tmp/restart-diagnose.log 2>&1
    
    export HOST=0.0.0.0
    cd /app && npm start &> >(tee -a $LOG_FILE) &
    APP_PID=$!
  fi
  
  # プロセスが生きているか確認
  if ! kill -0 $APP_PID 2>/dev/null; then
    echo "$(date): アプリケーションプロセスが終了しました。再起動します..." | tee -a $LOG_FILE
    export HOST=0.0.0.0
    cd /app && npm start &> >(tee -a $LOG_FILE) &
    APP_PID=$!
  fi
done
