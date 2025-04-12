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

環境変数を設定するには、以下のいずれかの方法を使用します：

### 方法1: シークレットを個別に設定

```bash
flyctl secrets set SESSION_SECRET=your-secret-key
```

### 方法2: .env.productionファイルから一括設定

.env.productionファイルのすべての環境変数をflyのシークレットとして設定するには：

```bash
npm run fly:set-secrets
```

これにより、.env.productionファイルの内容がflyのシークレットとして設定されます。

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

## ローカル開発と本番環境の切り替え

このプロジェクトでは、ローカル開発環境ではSQLite、本番環境（fly.io）ではPostgreSQLを使用します。

### ローカル開発環境の設定

ローカル開発環境ではSQLiteを使用します。最初に開発環境用のPrismaスキーマに切り替えます：

```bash
npm run prisma:use-dev
```

その後、通常通り開発サーバーを起動します：

```bash
npm run dev
```

### 本番環境へのデプロイ前の準備

デプロイ前に、本番環境用のPrismaスキーマに切り替えます：

```bash
npm run prisma:use-prod
```

その後、通常のデプロイ手順を実行します：

```bash
npm run fly:deploy
```

### 注意事項

- デプロイ後に再びローカル開発をする場合は、`npm run prisma:use-dev`を実行して開発環境用のスキーマに戻してください
- Dockerfileではビルド時に自動的に本番環境用のスキーマに切り替わるよう設定されています
