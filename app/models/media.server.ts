import { prisma } from "./prisma.server";

// メディア作成関数
export async function createMedia(data: {
  title: string;
  filename: string;
  path: string;
  type: string;
  size: number;
  alt?: string;
  description?: string;
}) {
  return prisma.media.create({
    data,
  });
}

// メディア更新関数
export async function updateMedia(
  id: string,
  data: {
    title?: string;
    alt?: string;
    description?: string;
  }
) {
  return prisma.media.update({
    where: { id },
    data,
  });
}

// メディア取得関数
export async function getMediaById(id: string) {
  return prisma.media.findUnique({
    where: { id },
  });
}

// メディア一覧取得関数
export async function getMediaItems({
  page = 1,
  limit = 20,
  type,
  searchTerm,
}: {
  page?: number;
  limit?: number;
  type?: string;
  searchTerm?: string;
}) {
  const skip = (page - 1) * limit;

  const where: {
    type?: string;
    OR?: { 
      title?: { contains: string; mode: "insensitive" }; 
      description?: { contains: string; mode: "insensitive" };
      filename?: { contains: string; mode: "insensitive" };
    }[];
  } = {};

  if (type) {
    where.type = type;
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
      {
        filename: {
          contains: searchTerm,
          mode: "insensitive",
        },
      },
    ];
  }

  const [media, totalCount] = await prisma.$transaction([
    prisma.media.findMany({
      where,
      orderBy: {
        createdAt: "desc",
      },
      skip,
      take: limit,
    }),
    prisma.media.count({ where }),
  ]);

  return {
    media,
    totalCount,
    totalPages: Math.ceil(totalCount / limit),
    currentPage: page,
  };
}

// メディア削除関数
export async function deleteMedia(id: string) {
  return prisma.media.delete({
    where: { id },
  });
}

// メディアアップロード関数（ファイルからメディアを作成する）
export async function uploadMedia(file: File) {
  // ファイル名から拡張子を取得
  const extension = file.name.split('.').pop()?.toLowerCase() || '';
  
  // ファイルタイプの判別
  const fileType = file.type;
  
  // ユニークなファイル名を生成（実際の実装ではより堅牢な方法が必要）
  const uniqueFilename = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${extension}`;
  
  // ファイルを保存するパス（実際にはS3やCloudinaryなどに保存する実装が必要）
  const path = `/uploads/${uniqueFilename}`;
  
  // ファイルサイズ
  const size = file.size;
  
  // タイトル（デフォルトはファイル名）
  const title = file.name;
  
  // メディアをデータベースに登録
  const media = await createMedia({
    title,
    filename: uniqueFilename,
    path,
    type: fileType,
    size,
  });
  
  // アップロードされたメディア情報を返す
  return {
    id: media.id,
    title: media.title,
    url: media.path, // 実際のURLは環境に合わせて適切に構築する必要がある
  };
}
