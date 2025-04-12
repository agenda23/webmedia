import { PrismaClient } from "@prisma/client";
import { prisma } from "./prisma.server";

// コメント作成関数
export async function createComment(data: {
  postId: string;
  name: string;
  email: string;
  content: string;
  isApproved?: boolean;
}) {
  return prisma.comment.create({
    data: {
      postId: data.postId,
      name: data.name,
      email: data.email,
      content: data.content,
      isApproved: data.isApproved ?? false,  // デフォルトは非承認
      createdAt: new Date(),
    },
  });
}

// コメント取得関数
export async function getCommentById(id: string) {
  return prisma.comment.findUnique({
    where: { id },
    include: {
      post: {
        select: {
          id: true,
          title: true,
          slug: true,
        },
      },
    },
  });
}

// コメント一覧取得関数
export async function getComments({
  page = 1,
  limit = 20,
  status,
  search,
  postId,
  includePost = false,
}: {
  page?: number;
  limit?: number;
  status?: string;
  search?: string;
  postId?: string;
  includePost?: boolean;
}) {
  const skip = (page - 1) * limit;
  
  // 検索条件の構築
  let where: any = {};

  // 承認ステータスによるフィルター
  if (status === "approved") {
    where.isApproved = true;
  } else if (status === "pending") {
    where.isApproved = false;
  }

  // 特定の記事のコメントのみ表示
  if (postId) {
    where.postId = postId;
  }

  // 検索クエリによるフィルター
  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { email: { contains: search, mode: "insensitive" } },
      { content: { contains: search, mode: "insensitive" } },
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
      },
    }),
    prisma.comment.count({ where }),
  ]);

  return {
    comments,
    total,
  };
}

// コメントステータス更新関数
export async function updateCommentStatus(id: string, isApproved: boolean) {
  return prisma.comment.update({
    where: { id },
    data: {
      isApproved,
      updatedAt: new Date(),
    },
  });
}

// コメント削除関数
export async function deleteComment(id: string) {
  return prisma.comment.delete({
    where: { id },
  });
}
