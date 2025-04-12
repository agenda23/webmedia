import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// タグ作成関数
export async function createTag(data: {
  name: string;
  slug: string;
}) {
  return prisma.tag.create({
    data,
  });
}

// タグ更新関数
export async function updateTag(
  id: string,
  data: {
    name?: string;
    slug?: string;
  }
) {
  return prisma.tag.update({
    where: { id },
    data,
  });
}

// タグ取得関数
export async function getTagById(id: string) {
  return prisma.tag.findUnique({
    where: { id },
  });
}

// スラグによるタグ取得関数
export async function getTagBySlug(slug: string) {
  return prisma.tag.findUnique({
    where: { slug },
  });
}

// タグ一覧取得関数
export async function getTags() {
  return prisma.tag.findMany({
    orderBy: {
      name: "asc",
    },
    include: {
      _count: {
        select: {
          posts: true,
          events: true,
        },
      },
    },
  });
}

// 全タグ取得関数（getTags のエイリアス）
export const getAllTags = getTags;

// タグ削除関数
export async function deleteTag(id: string) {
  return prisma.tag.delete({
    where: { id },
  });
}
