import { PrismaClient } from "@prisma/client";

// PrismaClientをグローバルに保持するための型定義
declare global {
  var __db: PrismaClient | undefined;
}

// 環境に応じてログレベルを調整
const logLevels = process.env.NODE_ENV === "production" 
  ? ["error", "warn"] 
  : ["query", "error", "warn"];

// 開発環境では一つのPrismaClientインスタンスを再利用する
export const prisma =
  global.__db ||
  new PrismaClient({
    log: logLevels,
  });

// 開発環境でのみグローバル変数にPrismaClientを保存
if (process.env.NODE_ENV !== "production") {
  global.__db = prisma;
}

// デフォルトエクスポート
export default prisma;