# 飲食店舗 Web メディアサイト

飲食店舗の情報発信、イベント告知、ブログ記事投稿などを行うためのWebメディアサイトです。飲食店のブランドイメージ向上と顧客エンゲージメントの強化を目的としています。

## 技術スタック

- **フレームワーク**: [Remix](https://remix.run/)（React ベースのフルスタックフレームワーク）
- **UI**: Tailwind CSS
- **データベース**:
  - ローカル環境: SQLite
  - 本番環境: PostgreSQL（fly.io）
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

3. **PostgreSQLデータベースの作成**

```bash
# データベースの作成
npm run fly:pg:create

# アプリケーションにデータベースをアタッチ
npm run fly:pg:attach
```

4. **シークレットの設定**

```bash
# セッションシークレットの設定
flyctl secrets set SESSION_SECRET=your-secure-secret-key
```

5. **アプリケーションのデプロイ**

```bash
npm run fly:deploy
```

6. **データベースマイグレーションの実行**

```bash
npm run fly:migrate
```

これでアプリケーションが本番環境にデプロイされます。URLは `flyctl open` コマンドで確認できます。

## モニタリングとトラブルシューティング

### アプリケーションステータスの確認

```bash
flyctl status
```

### ログの確認

```bash
flyctl logs
```

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

## 貢献ガイド

1. このリポジトリをフォークする
2. 機能ブランチを作成する (`git checkout -b feature/amazing-feature`)
3. 変更をコミットする (`git commit -m 'Add some amazing feature'`)
4. ブランチにプッシュする (`git push origin feature/amazing-feature`)
5. プルリクエストを作成する

## ライセンス

ISC

## 連絡先

プロジェクト管理者: [管理者名] - [メールアドレス]
