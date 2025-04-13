# ローカルSQLiteへの移行手順

このドキュメントでは、PostgreSQLからローカルSQLiteファイルへの移行手順を説明します。

## 前提条件

1. このプロジェクトはRemixを使用したWebメディアサイトです
2. 環境変数とPrismaの設定はすでに変更済みです

## 注意事項

Prismaは標準でSQLiteをサポートしているため、追加のSQLiteドライバーをインストールする必要はありません。

## データ移行手順

### 1. PostgreSQLからデータをエクスポート

```bash
# 以下のコマンドを実行して、現在のデータベースからデータをエクスポートします
pg_dump -h broken-snow-614.internal -U postgres -d webmedia -F c -f backup.dump
```

### 2. Prismaスキーマを生成

```bash
# PostgreSQLからの切り替え時にスキーマを更新します
npx prisma generate
```

### 3. SQLiteデータベースの初期化

```bash
# マイグレーションを実行してSQLiteデータベースを初期化します
npx prisma migrate deploy
```

### 4. データ移行スクリプトの実行

```bash
node scripts/import-data.js
```

### 5. 動作確認

ローカル環境でアプリケーションを起動し、各機能が正常に動作するか確認してください：

```bash
npm run dev
```

### 6. 本番環境へのデプロイ

```bash
# Flyへデプロイします
npm run fly:deploy
```

## データの永続化について

fly.ioのボリュームマウントを使用して、SQLiteデータベースファイルを永続化します。これにより、アプリケーションが再起動してもデータが保持されます。

```toml
[[mounts]]
  source = 'data'
  destination = '/data'
```

## 注意事項

1. **データバックアップ**: 移行前に必ずデータのバックアップを取ってください
2. **リレーション**: SQLiteはPostgreSQLと比較して一部の制約機能が限られています
3. **トランザクション**: SQLiteはファイルロックを使用するため、高負荷時のパフォーマンスには注意が必要です
4. **同時接続**: SQLiteは同時書き込みに制限があるため、アクセスが多いサイトでは注意が必要です

## トラブルシューティング

- データベース接続エラーが発生した場合は、環境変数の設定を確認してください
- プリズマのエラーが発生した場合は、`npx prisma generate`を再実行してください
- データ型の互換性の問題が発生した場合は、スキーマを適宜調整してください

## 参考資料

- [Prisma SQLite Documentation](https://www.prisma.io/docs/concepts/database-connectors/sqlite)
- [Fly.io Volumes Documentation](https://fly.io/docs/reference/volumes/)
