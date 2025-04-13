# 飲食店舗 Web メディアサイト

飲食店舗の情報発信、イベント告知、ブログ記事投稿などを行うためのWebメディアサイトです。飲食店のブランドイメージ向上と顧客エンゲージメントの強化を目的としています。

## デプロイ先

本アプリケーションは以下のURLにデプロイされています：
- **本番環境URL**: [https://webmedia.fly.dev/](https://webmedia.fly.dev/)

## 技術スタック

- **フレームワーク**: [Remix](https://remix.run/)（React ベースのフルスタックフレームワーク）
- **UI**: Tailwind CSS
- **データベース**: SQLite（ローカル環境・本番環境とも）
- **ORM**: Prisma
- **認証**: bcryptjs
- **バリデーション**: Zod

## 機能概要

- **コンテンツ管理**:
  - 記事（Post）管理
  - イベント管理
  - カテゴリ・タグ管理
  - メディア管理
- **店舗情報管理**:
  - 店舗基本情報
  - 営業時間
  - 住所情報
- **ユーザー管理**:
  - 権限別ユーザー（管理者、編集者、投稿者、寄稿者）
  - 認証・認可
- **コメント機能**:
  - 記事・イベントへのコメント
  - コメント承認ワークフロー
- **サイト設定**:
  - 基本設定
  - SEO設定
  - SNS連携設定

## データベースについて

**重要な変更**: 当初はローカル環境でSQLite、本番環境でPostgreSQLを使用する予定でしたが、**ローカル・本番環境ともにSQLiteを使用するように変更**しました。これにより環境間の整合性が向上し、デプロイプロセスも簡素化されました。SQLiteデータベースファイルは本番環境では永続ボリュームマウント上に保存されます。

## ローカル開発環境のセットアップ

### 前提条件

- Node.js (v20.0.0以上)
- npm (v8以上)
- Git

### 初期セットアップ

リポジトリをクローンして依存パッケージをインストールします：

```bash
# リポジトリをクローン
git clone [リポジトリURL] webmedia
cd webmedia

# 依存パッケージのインストール
npm install
```

### 環境変数の設定

`.env`ファイルをプロジェクトルートに作成します：

```env
DATABASE_PROVIDER="sqlite"
DATABASE_URL="file:./prisma/dev.db"
SESSION_SECRET="your-secret-key-here"
NODE_ENV="development"
PORT=3000
```

### データベースのセットアップ

Prismaを使用してSQLiteデータベースを初期化します：

```bash
# Prismaクライアントの生成
npx prisma generate

# マイグレーションの実行
npx prisma migrate dev --name init

# （オプション）テストデータの投入
npm run seed
```

### 開発サーバーの起動

```bash
npm run dev
```

これで開発サーバーが起動し、[http://localhost:3000](http://localhost:3000) でアプリケーションにアクセスできます。

## 本番環境へのデプロイ（fly.io）

詳細なデプロイ手順については、[DEPLOY.md](./DEPLOY.md)ファイルを参照してください。

### 前提条件

- [flyctl CLI](https://fly.io/docs/hands-on/install-flyctl/) のインストール
- fly.io アカウント

### fly.io へのデプロイ手順

1. **fly.io にログイン**

```bash
flyctl auth login
```

2. **アプリケーションの初期化**

```bash
# fly.toml設定を使ってアプリを作成
npm run fly:launch
```

3. **シークレットの設定**

```bash
# セッションシークレットの設定（自動化スクリプトを使用）
npm run fly:set-secrets

# または手動で設定
flyctl secrets set SESSION_SECRET=your-secure-secret-key
```

4. **アプリケーションのデプロイ**

```bash
# デフォルトのデプロイ
npm run fly:deploy

# またはリリースコマンド実行のタイムアウトを延長してデプロイ
npm run fly:deploy-with-timeout
```

5. **データベースの初期化**

初回デプロイ後、SQLiteデータベースを初期化します：

```bash
npm run fly:init-sqlite
```

これでアプリケーションが本番環境にデプロイされます。URLは `flyctl open` コマンドで確認できます。

## その他の運用コマンド

### データベース管理

```bash
# マイグレーションの実行
npm run fly:migrate

# スキーマの更新
npm run fly:update-schema

# Prismaスキーマの切り替え
npm run prisma:use-dev   # 開発環境用のスキーマに切り替え
npm run prisma:use-prod  # 本番環境用のスキーマに切り替え
```

### 診断・トラブルシューティング

```bash
# 診断スクリプトの実行
npm run fly:diagnose

# アプリケーションステータスの確認
flyctl status

# ログの確認
flyctl logs

# SSHでのアクセス
flyctl ssh console
```

## プロジェクト構造

```
app/                      # アプリケーションコード
├── components/           # 再利用可能なUIコンポーネント
├── models/               # データモデル関連のロジック
├── routes/               # ルート定義（ページ）
├── styles/               # スタイルシート
├── utils/                # ユーティリティ関数
├── entry.client.tsx      # クライアントエントリーポイント
├── entry.server.tsx      # サーバーエントリーポイント
└── root.tsx              # ルートコンポーネント

prisma/                   # Prisma関連ファイル
├── schema.prisma         # データベーススキーマ
├── migrations/           # マイグレーションファイル
└── seed.js               # シードスクリプト

public/                   # 静的ファイル
scripts/                  # デプロイ・マイグレーションスクリプト
```

## 開発ワークフロー

1. 機能ブランチを作成して開発
```bash
git checkout -b feature/new-feature
```

2. ローカルでテスト
```bash
npm run dev
```

3. コードの品質チェック
```bash
npm run lint
npm run typecheck
```

4. 変更をコミットしてプッシュ
```bash
git add .
git commit -m "Add new feature: description"
git push origin feature/new-feature
```

5. メインブランチへのマージ後、デプロイ
```bash
npm run fly:deploy
```

## 主な設定ファイル

- **fly.toml**: Fly.ioデプロイ設定
- **Dockerfile**: コンテナ化設定
- **prisma/schema.prisma**: データモデル定義
- **scripts/**: 運用・デプロイ用スクリプト
  - migrate.sh: マイグレーション実行
  - init-sqlite.sh: SQLite初期化
  - diagnose.sh: 診断情報収集
  - set_fly_secrets.sh: シークレット設定

## ライセンス

ISC

## 連絡先

プロジェクト管理者: [管理者名] - [メールアドレス]
