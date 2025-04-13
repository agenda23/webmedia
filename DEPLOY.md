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

## デプロイ先

アプリケーションは以下のURLにデプロイされています：
- **本番環境URL**: [https://webmedia.fly.dev/](https://webmedia.fly.dev/)

## データベースについて

**重要な変更**: 当初はローカル環境でSQLite、本番環境でPostgreSQLを使用する予定でしたが、**ローカル・本番環境ともにSQLiteを使用するように変更**しました。これにより環境間の整合性が向上し、デプロイプロセスも簡素化されました。

SQLiteデータベースファイルは本番環境では永続ボリュームマウント上（`/data/sqlite.db`）に保存されます。このために、fly.tomlファイルで以下のようなボリュームマウント設定を行っています：

```toml
[[mounts]]
  source = 'data'
  destination = '/data'
  auto_extend_size_threshold = 80
  auto_extend_size_increment = "1GB"
```

## デプロイ手順

### 1. アプリの初期化（初回のみ）

```bash
# fly.toml設定を使ってアプリを作成
npm run fly:launch
```

### 2. シークレットの設定

```bash
# セッションシークレットの設定（自動化スクリプトを使用）
npm run fly:set-secrets

# または手動で設定
flyctl secrets set SESSION_SECRET=your-secure-secret-key
```

### 3. アプリケーションのデプロイ

```bash
# デフォルトのデプロイ
npm run fly:deploy

# またはリリースコマンド実行のタイムアウトを延長してデプロイ
npm run fly:deploy-with-timeout
```

### 4. データベースの初期化（初回のみ）

初回デプロイ後、SQLiteデータベースを初期化します：

```bash
npm run fly:init-sqlite
```

これにより、SQLiteデータベースが作成され、マイグレーションが実行されます。

## 環境変数の設定

以下の環境変数が必要です：

- `DATABASE_PROVIDER`: "sqlite"（fly.tomlで設定済み）
- `DATABASE_URL`: SQLiteファイルパス（コンテナ内で自動設定）
- `SESSION_SECRET`: セッション用のシークレットキー（手動で設定）
- `NODE_ENV`: "production"（fly.tomlで設定済み）
- `PORT`: "8080"（fly.tomlで設定済み）
- `HOST`: "0.0.0.0"（fly.tomlで設定済み）

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

## データベース管理

SQLiteデータベースを管理するためのコマンド：

```bash
# マイグレーションの実行
npm run fly:migrate

# スキーマの更新
npm run fly:update-schema
```

## スケーリング

アプリケーションをスケールする：

```bash
flyctl scale count 2  # インスタンス数を2に設定
```

**注意**: SQLiteを使用する場合、マルチインスタンス構成では注意が必要です。データの整合性を保つためには、読み取り専用レプリカとして追加インスタンスを設定するか、データベースアクセスを主要インスタンスに制限する必要があります。

## トラブルシューティング

### 診断ツールの実行

問題が発生した場合、診断スクリプトを実行してシステムの状態を確認できます：

```bash
npm run fly:diagnose
```

### SSHでのアクセス

問題が発生した場合、SSHでインスタンスに接続して調査できます：

```bash
flyctl ssh console
```

### データベースファイルの検査

SQLiteデータベースファイルを直接検査するには：

```bash
flyctl ssh console
sqlite3 /data/sqlite.db
```

その後、SQLiteのコマンドを使用してデータベースを調査できます：

```sql
.tables                 -- テーブル一覧を表示
.schema User            -- Userテーブルのスキーマを表示
SELECT * FROM User;     -- Userテーブルのデータを表示
.exit                   -- SQLiteを終了
```

### マイグレーションエラー

マイグレーションでエラーが発生した場合、SSHでアクセスして手動でマイグレーションを実行できます：

```bash
flyctl ssh console
cd /app
DATABASE_PROVIDER=sqlite DATABASE_URL="file:/data/sqlite.db" npx prisma migrate deploy
```

## Prismaスキーマの開発環境と本番環境の切り替え

このプロジェクトでは、開発環境と本番環境の両方でSQLiteを使用しますが、ファイルパスなどの設定が異なります。開発環境と本番環境でPrismaスキーマを切り替えるためのコマンドを用意しています：

```bash
# 開発環境用のPrismaスキーマに切り替え
npm run prisma:use-dev

# 本番環境用のPrismaスキーマに切り替え
npm run prisma:use-prod
```

### 注意事項

- デプロイ前に、本番環境用のPrismaスキーマに切り替えることをお勧めします
- Dockerfileではビルド時に自動的に本番環境用のスキーマに切り替わるよう設定されています
- ローカル開発時は開発環境用のスキーマを使用してください

## リリース時の処理

アプリケーションのデプロイ時に自動的に実行される処理は以下のとおりです（fly.tomlの設定）：

```toml
[deploy]
  release_command = "bash /app/scripts/migrate.sh"
  release_command_timeout = 900
  strategy = "immediate"
```

これにより、デプロイ時に自動的にマイグレーションスクリプト（`/app/scripts/migrate.sh`）が実行されます。このスクリプトは、データベースのマイグレーションとその他の初期化処理を行います。

## 永続データの管理

SQLiteデータベースファイルは、永続的なボリュームマウント上に保存されています。定期的にバックアップを取ることをお勧めします：

```bash
# SSHでアクセス
flyctl ssh console

# データベースファイルのバックアップを作成（コンテナ内）
sqlite3 /data/sqlite.db ".backup '/data/backup-$(date +%Y%m%d).db'"

# バックアップファイルを確認
ls -la /data
```

## その他の運用コマンド

```bash
# アプリケーションを再起動する
flyctl apps restart webmedia

# ボリュームのリスト表示
flyctl volumes list

# リージョンを確認する
flyctl regions list

# アプリケーション情報を表示する
flyctl apps info webmedia
```
