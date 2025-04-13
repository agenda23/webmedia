// 既存のヘルパー関数を保持
export function formatDate(date: Date | string | null | undefined): string {
  if ( !date) return "";
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

// 画像のフォールバック処理を追加
export function getImageUrl(path: string | null | undefined, fallback: string = "/images/placeholder.jpg"): string {
  if ( !path) return fallback;
  
  // 本番環境でのCDNパスなどの処理を追加する場合はここに実装
  
  return path;
}
 
// エラー処理用のヘルパー関数
export function handleError(error: unknown): Error {
  if (error instanceof Error) {
    return error;
  }
  return new Error(typeof error === 'string' ? error : 'Unknown error occurred');
}

// データベースエラーをハンドリングするヘルパー関数
import { Prisma } from '@prisma/client';

/**
 * データベースエラーをハンドリングするヘルパー関数
 * @param error 発生したエラー
 * @param defaultMessage デフォルトのエラーメッセージ
 * @returns エラーオブジェクト
 */
export function handleDbError(error: unknown, defaultMessage = '操作中にエラーが発生しました'): { 
  message: string; 
  code?: string;
  status: number;
} {
  console.error('Database error:', error);
  
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    // Prismaの既知のエラー
    const code = error.code;
    
    switch (code) {
      case 'P2002': // ユニーク制約違反
        return { 
          message: 'この値は既に使用されています。別の値を入力してください。', 
          code,
          status: 400
        };
      case 'P2003': // 外部キー制約違反
        return { 
          message: '関連するレコードが見つかりません。', 
          code,
          status: 400
        };
      case 'P2025': // レコードが見つからない
        return { 
          message: '指定されたレコードが見つかりません。', 
          code,
          status: 404
        };
      default:
        return { 
          message: `データベースエラー (${code}): ${error.message}`, 
          code,
          status: 500
        };
    }
  } else if (error instanceof Prisma.PrismaClientValidationError) {
    // バリデーションエラー
    return { 
      message: 'データバリデーションエラー: 入力内容を確認してください。',
      status: 400
    };
  } else if (error instanceof Error) {
    // 一般的なエラー
    return { 
      message: error.message || defaultMessage,
      status: 500
    };
  }
  
  // その他の不明なエラー
  return { 
    message: defaultMessage,
    status: 500
  };
}

// 文字列をスラグ形式に変換する関数
export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
}

// URLパラメータを解析する関数
export function getSearchParams(request: Request): URLSearchParams {
  const url = new URL(request.url);
  return url.searchParams;
}

// ページネーション用のヘルパー関数
export function getPaginationParams(request: Request, defaultLimit = 10): {
  page: number;
  limit: number;
  skip: number;
} {
  const searchParams = getSearchParams(request);
  const page = Number(searchParams.get('page') || '1');
  const limit = Number(searchParams.get('limit') || String(defaultLimit));
  const skip = (page - 1) * limit;

  return {
    page: isNaN(page) || page < 1 ? 1 : page,
    limit: isNaN(limit) || limit < 1 ? defaultLimit : limit,
    skip: isNaN(skip) || skip < 0 ? 0 : skip,
  };
}

// ファイルサイズをフォーマットする関数
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}
 