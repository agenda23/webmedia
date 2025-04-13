import { prisma } from "./prisma.server";
import { handleDbError } from "../utils/helpers";

// コメント作成関数
export async function createComment(data: {
  postId: string;
  content: string;
  authorId?: string;
  eventId?: string;
  parentId?: string;
  status?: "PENDING" | "APPROVED" | "REJECTED";
}) {
  try {
    return await prisma.comment.create({
      data: {
        postId: data.postId,
        content: data.content,
        status: data.status || "PENDING",  // デフォルトは審査待ち
        authorId: data.authorId,
        eventId: data.eventId,
        parentId: data.parentId,
      },
    });
  } catch (error) {
    const errorDetails = handleDbError(error, "コメントの作成中にエラーが発生しました");
    throw new Error(errorDetails.message);
  }
}

// コメント取得関数
export async function getCommentById(id: string) {
  try {
    return await prisma.comment.findUnique({
      where: { id },
      include: {
        post: {
          select: {
            id: true,
            title: true,
            slug: true,
          },
        },
        event: {
          select: {
            id: true,
            title: true,
            slug: true,
          },
        },
        author: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        parent: true,
        replies: true,
      },
    });
  } catch (error) {
    const errorDetails = handleDbError(error, "コメントの取得中にエラーが発生しました");
    throw new Error(errorDetails.message);
  }
}

// コメント一覧取得関数
export async function getComments({
  page = 1,
  limit = 20,
  status,
  search,
  postId,
  eventId,
  includePost = false,
}: {
  page?: number;
  limit?: number;
  status?: "PENDING" | "APPROVED" | "REJECTED" | string;
  search?: string;
  postId?: string;
  eventId?: string;
  includePost?: boolean;
}) {
  try {
    const skip = (page - 1) * limit;
    
    // 検索条件の構築
    let where: {
      status?: string;
      postId?: string;
      eventId?: string;
      OR?: { 
        content?: { contains: string; mode: "insensitive" };
        author?: { 
          name?: { contains: string; mode: "insensitive" };
          email?: { contains: string; mode: "insensitive" };
        };
      }[];
    } = {};

    // ステータスによるフィルター
    if (status === "APPROVED" || status === "PENDING" || status === "REJECTED") {
      where.status = status;
    } else if (status === "approved") {
      where.status = "APPROVED";
    } else if (status === "pending") {
      where.status = "PENDING";
    } else if (status === "rejected") {
      where.status = "REJECTED";
    }

    // 特定の記事のコメントのみ表示
    if (postId) {
      where.postId = postId;
    }

    // 特定のイベントのコメントのみ表示
    if (eventId) {
      where.eventId = eventId;
    }

    // 検索クエリによるフィルター
    if (search) {
      where.OR = [
        { content: { contains: search, mode: "insensitive" } },
        { author: { name: { contains: search, mode: "insensitive" } } },
        { author: { email: { contains: search, mode: "insensitive" } } },
      ];
    }

    // コメント一覧と総数を取得
    const [comments, total] = await Promise.all([
      prisma.comment.findMany({
        where,
        orderBy: {
          createdAt: "desc",
        },
        skip,
        take: limit,
        include: {
          post: includePost ? {
            select: {
              id: true,
              title: true,
              slug: true,
            },
          } : undefined,
          author: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          event: includePost ? {
            select: {
              id: true,
              title: true,
              slug: true,
            },
          } : undefined,
          parent: false,
          _count: {
            select: {
              replies: true,
            },
          },
        },
      }),
      prisma.comment.count({ where }),
    ]);

    return {
      comments,
      total,
    };
  } catch (error) {
    const errorDetails = handleDbError(error, "コメント一覧の取得中にエラーが発生しました");
    throw new Error(errorDetails.message);
  }
}

// コメントステータス更新関数
export async function updateCommentStatus(id: string, status: "APPROVED" | "PENDING" | "REJECTED") {
  try {
    return await prisma.comment.update({
      where: { id },
      data: {
        status,
      },
    });
  } catch (error) {
    const errorDetails = handleDbError(error, "コメントのステータス更新中にエラーが発生しました");
    throw new Error(errorDetails.message);
  }
}

// コメント削除関数
export async function deleteComment(id: string) {
  try {
    return await prisma.comment.delete({
      where: { id },
    });
  } catch (error) {
    const errorDetails = handleDbError(error, "コメントの削除中にエラーが発生しました");
    throw new Error(errorDetails.message);
  }
}
