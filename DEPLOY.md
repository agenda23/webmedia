# fly.io デプロイ手順書

このドキュメントでは、Remix Web メディアサイトを fly.io にデプロイするための手順を説明します。

## 前提条件

- flyctlコマンドラインツールがインストールされていること
  ```bash
  curl -L https://fly.io/install.sh | sh
  ```
- fly.io アカウントを作成済みであること
- fly.io にログイン済みであること
  ```bash
  flyctl auth login
  ```

## デプロイ手順

### 1. アプリの初期化（初回のみ）

```bash
# fly.toml設定を使ってアプリを作成
npm run fly:launch
```

### 2. PostgreSQLデータベースの作成（初回のみ）

```bash
# PostgreSQLデータベースの作成
npm run fly:pg:create

# アプリにデータベースをアタッチ
npm run fly:pg:attach
```

これにより、自動的に `DATABASE_URL` シークレットが設定されます。

### 3. アプリケーションのデプロイ

```bash
# アプリケーションをデプロイ
npm run fly:deploy
```

### 4. データベースマイグレーションの実行

```bash
# データベースマイグレーションを実行
npm run fly:migrate
```

## 環境変数の設定

以下の環境変数が必要です：

- `DATABASE_URL`: PostgreSQL接続文字列（fly postgres attachで自動設定）
- `DATABASE_PROVIDER`: "postgresql"（fly.tomlで設定済み）
- `SESSION_SECRET`: セッション用のシークレットキー（手動で設定）

シークレットを追加する場合は以下のコマンドを使用します：

```bash
flyctl secrets set SESSION_SECRET=your-secret-key
```

## モニタリングとログ

アプリケーションのログを確認する：

```bash
flyctl logs
```

アプリケーションステータスを確認する：

```bash
flyctl status
```

## スケーリング

アプリケーションをスケールする：

```bash
flyctl scale count 2  # インスタンス数を2に設定
```

## トラブルシューティング

### SSHでのアクセス

問題が発生した場合、SSHでインスタンスに接続して調査できます：

```bash
flyctl ssh console
```

### データベースへの直接接続

データベースに直接接続したい場合：

```bash
flyctl postgres connect -a webmedia-db
```

これでPsqlのコンソールが開きます。

### マイグレーションエラー

マイグレーションでエラーが発生した場合、SSHでアクセスして手動でマイグレーションを実行できます：

```bash
flyctl ssh console
cd /app
DATABASE_PROVIDER=postgresql npx prisma migrate deploy
```

## ローカル開発環境への切り戻し

ローカル開発に戻る場合は、通常通り`.env`ファイルに設定されたSQLiteデータベースが使用されます：

```bash
npm run dev
```
