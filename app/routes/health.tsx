import { json } from "@remix-run/node";
import type { LoaderFunctionArgs } from "@remix-run/node";

// ヘルスチェックエンドポイント
// Fly.ioのコンテナヘルスチェックで使用されます
export async function loader({ request }: LoaderFunctionArgs) {
  // データベース接続のような重要なサービスの状態も確認できます
  // ここではシンプルに200 OKを返します
  return json({ status: "ok", timestamp: new Date().toISOString() });
}

// このルートはUIを持たないので、デフォルトエクスポートは空の関数
export default function Health() {
  return null;
}
