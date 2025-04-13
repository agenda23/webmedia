import { json } from "@remix-run/node";
import type { LoaderFunctionArgs } from "@remix-run/node";
import { PrismaClient } from "@prisma/client";

// ヘルスチェックエンドポイント
// Fly.ioのコンテナヘルスチェックで使用されます
export async function loader({ request }: LoaderFunctionArgs) {
  try {
    // データベース接続の確認
    const prisma = new PrismaClient();
    
    // トランザクション実行でデータベース接続テスト
    const result = await prisma.$transaction(async (tx) => {
      // システム情報を取得（環境変数など）
      return {
        databaseProvider: process.env.DATABASE_PROVIDER,
        nodeEnv: process.env.NODE_ENV,
        uptime: process.uptime(),
      };
    });
    
    await prisma.$disconnect();
    
    return json({ 
      status: "ok", 
      timestamp: new Date().toISOString(),
      database: "connected",
      system: result
    });
  } catch (error) {
    console.error("ヘルスチェックエラー:", error);
    return json({ 
      status: "error", 
      timestamp: new Date().toISOString(),
      database: "disconnected",
      error: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}

// このルートはUIを持たないので、デフォルトエクスポートは空の関数
export default function Health() {
  return null;
}
