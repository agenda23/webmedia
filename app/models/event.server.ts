import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// イベント作成関数
export async function createEvent(data: {
  title: string;
  description: string;
  startDate: Date;
  endDate?: Date;
  location?: string;
  authorId: string;
  slug: string;
  status?: "DRAFT" | "PUBLISHED" | "SCHEDULED" | "CANCELLED";
  featuredImage?: string;
  categoryIds?: string[];
  tagIds?: string[];
}) {
  const { categoryIds, tagIds, ...eventData } = data;

  return prisma.event.create({
    data: {
      ...eventData,
      categories: categoryIds
        ? {
            connect: categoryIds.map((id) => ({ id })),
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
          firstName: true,
          lastName: true,
          email: true,
        },
      },
      categories: true,
      tags: true,
    },
  });
}

// イベント更新関数
export async function updateEvent(
  id: string,
  data: {
    title?: string;
    description?: string;
    startDate?: Date;
    endDate?: Date | null;
    location?: string;
    slug?: string;
    status?: "DRAFT" | "PUBLISHED" | "SCHEDULED" | "CANCELLED";
    featuredImage?: string;
    categoryIds?: string[];
    tagIds?: string[];
  }
) {
  const { categoryIds, tagIds, ...eventData } = data;

  return prisma.event.update({
    where: { id },
    data: {
      ...eventData,
      categories: categoryIds
        ? {
            set: categoryIds.map((id) => ({ id })),
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
          firstName: true,
          lastName: true,
          email: true,
        },
      },
      categories: true,
      tags: true,
    },
  });
}

// イベント取得関数
export async function getEventById(id: string) {
  return prisma.event.findUnique({
    where: { id },
    include: {
      author: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
        },
      },
      categories: true,
      tags: true,
      comments: {
        where: {
          status: "APPROVED",
        },
        include: {
          author: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
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

// スラグによるイベント取得関数
export async function getEventBySlug(slug: string) {
  return prisma.event.findUnique({
    where: { slug },
    include: {
      author: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
        },
      },
      categories: true,
      tags: true,
      comments: {
        where: {
          status: "APPROVED",
        },
        include: {
          author: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
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

// イベント一覧取得関数
export async function getEvents({
  page = 1,
  limit = 10,
  status = ["PUBLISHED"],
  categoryId,
  tagId,
  searchTerm,
  upcoming = true,
}: {
  page?: number;
  limit?: number;
  status?: ("DRAFT" | "PUBLISHED" | "SCHEDULED" | "CANCELLED")[];
  categoryId?: string;
  tagId?: string;
  searchTerm?: string;
  upcoming?: boolean;
}) {
  const skip = (page - 1) * limit;

  const where: any = {
    status: {
      in: status,
    },
  };

  if (upcoming) {
    where.startDate = {
      gte: new Date(),
    };
  }

  if (categoryId) {
    where.categories = {
      some: {
        id: categoryId,
      },
    };
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
        description: {
          contains: searchTerm,
          mode: "insensitive",
        },
      },
    ];
  }

  const [events, totalCount] = await prisma.$transaction([
    prisma.event.findMany({
      where,
      orderBy: {
        startDate: "asc",
      },
      skip,
      take: limit,
      include: {
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        categories: true,
        tags: true,
        _count: {
          select: {
            comments: true,
          },
        },
      },
    }),
    prisma.event.count({ where }),
  ]);

  return {
    events,
    totalCount,
    totalPages: Math.ceil(totalCount / limit),
    currentPage: page,
  };
}

// イベント削除関数
export async function deleteEvent(id: string) {
  return prisma.event.delete({
    where: { id },
  });
}
