import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// 記事作成関数
export async function createPost(data: {
  title: string;
  content: string;
  authorId: string;
  slug: string;
  excerpt?: string;
  status?: "DRAFT" | "PUBLISHED" | "SCHEDULED";
  publishedAt?: Date;
  featuredImage?: string;
  seoTitle?: string;
  seoDescription?: string;
  categoryIds?: string[];
  tagIds?: string[];
}) {
  const { categoryIds, tagIds, ...postData } = data;

  return prisma.post.create({
    data: {
      ...postData,
      category: categoryIds && categoryIds.length > 0
        ? {
            connect: { id: categoryIds[0] },
          }
        : undefined,
      tags: tagIds
        ? {
            connect: tagIds.map((id) => ({ id })),
          }
        : undefined,
    },
    include: {
      author: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      category: true,
      tags: true,
    },
  });
}

// 記事更新関数
export async function updatePost(
  id: string,
  data: {
    title?: string;
    content?: string;
    slug?: string;
    excerpt?: string;
    status?: "DRAFT" | "PUBLISHED" | "SCHEDULED";
    publishedAt?: Date | null;
    featuredImage?: string;
    seoTitle?: string;
    seoDescription?: string;
    categoryIds?: string[];
    tagIds?: string[];
  }
) {
  const { categoryIds, tagIds, ...postData } = data;

  return prisma.post.update({
    where: { id },
    data: {
      ...postData,
      category: categoryIds && categoryIds.length > 0
        ? {
            connect: { id: categoryIds[0] },
          }
        : undefined,
      tags: tagIds
        ? {
            set: tagIds.map((id) => ({ id })),
          }
        : undefined,
    },
    include: {
      author: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      category: true,
      tags: true,
    },
  });
}

// 記事取得関数
export async function getPostById(id: string) {
  return prisma.post.findUnique({
    where: { id },
    include: {
      author: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      category: true,
      tags: true,
      comments: {
        where: {
          status: "APPROVED",
        },
        include: {
          author: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      },
    },
  });
}

// 関連記事取得関数
export async function getRelatedPosts({
  postId,
  categoryIds,
  limit = 3,
}: {
  postId: string;
  categoryIds: string[];
  limit?: number;
}) {
  return prisma.post.findMany({
    where: {
      id: { not: postId },
      category: {
        some: {
          id: { in: categoryIds },
        },
      },
      published: true, // 公開済みの記事だけにしたい場合
    },
    orderBy: {
      createdAt: "desc",
    },
    take: limit,
    include: {
      author: {
        select: {
          id: true,
          name: true,
        },
      },
      category: true,
      tags: true,
    },
  });
}


// スラグによる記事取得関数
export async function getPostBySlug(slug: string) {
  return prisma.post.findUnique({
    where: { slug },
    include: {
      author: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      category: true,
      tags: true,
      comments: {
        where: {
          status: "APPROVED",
        },
        include: {
          author: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      },
    },
  });
}

// 記事一覧取得関数
export async function getPosts({
  page = 1,
  limit = 10,
  status = ["PUBLISHED"],
  categoryId,
  tagId,
  searchTerm,
}: {
  page?: number;
  limit?: number;
  status?: ("DRAFT" | "PUBLISHED" | "SCHEDULED")[];
  categoryId?: string;
  tagId?: string;
  searchTerm?: string;
}) {
  const skip = (page - 1) * limit;

  const where: any = {
    status: {
      in: status,
    },
  };

  if (categoryId) {
    where.categoryId = categoryId;
  }

  if (tagId) {
    where.tags = {
      some: {
        id: tagId,
      },
    };
  }

  if (searchTerm) {
    where.OR = [
      {
        title: {
          contains: searchTerm,
          mode: "insensitive",
        },
      },
      {
        content: {
          contains: searchTerm,
          mode: "insensitive",
        },
      },
    ];
  }

  const [posts, totalCount] = await prisma.$transaction([
    prisma.post.findMany({
      where,
      orderBy: {
        publishedAt: "desc",
      },
      skip,
      take: limit,
      include: {
        author: {
          select: {
            id: true,
            name: true,
          },
        },
        category: true,
        tags: true,
        _count: {
          select: {
            comments: true,
          },
        },
      },
    }),
    prisma.post.count({ where }),
  ]);

  return {
    posts,
    totalCount,
    totalPages: Math.ceil(totalCount / limit),
    currentPage: page,
  };
}

// 記事削除関数
export async function deletePost(id: string) {
  return prisma.post.delete({
    where: { id },
  });
}
