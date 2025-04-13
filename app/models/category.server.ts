import { prisma } from "./prisma.server";

// カテゴリ作成関数
export async function createCategory(data: {
  name: string;
  slug: string;
  description?: string;
}) {
  return prisma.category.create({
    data,
  });
}

// カテゴリ更新関数
export async function updateCategory(
  id: string,
  data: {
    name?: string;
    slug?: string;
    description?: string;
  }
) {
  return prisma.category.update({
    where: { id },
    data,
  });
}

// カテゴリ取得関数
export async function getCategoryById(id: string) {
  return prisma.category.findUnique({
    where: { id },
  });
}

// スラグによるカテゴリ取得関数
export async function getCategoryBySlug(slug: string) {
  return prisma.category.findUnique({
    where: { slug },
  });
}

// カテゴリ一覧取得関数
export async function getCategories() {
  return prisma.category.findMany({
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

// 全カテゴリ取得関数（getCategories のエイリアス）
export const getAllCategories = getCategories;

// カテゴリ削除関数
export async function deleteCategory(id: string) {
  return prisma.category.delete({
    where: { id },
  });
}
