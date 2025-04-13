// 必要なモジュールをインポート
import { PrismaClient } from '@prisma/client';
import fs from 'fs';

// PostgreSQL用Prismaクライアント（データ移行元）
const prismaPg = new PrismaClient({
  datasources: {
    db: {
      url: "postgres://postgres:Dx8GkP7XLRwGQyk@broken-snow-614.internal:5432/webmedia?sslmode=disable"
    }
  }
});

// SQLite用Prismaクライアント（データ移行先）- Prisma標準のSQLiteドライバーを使用
const prismaSqlite = new PrismaClient({
  datasources: {
    db: {
      url: "file:///data/webmedia.db"
    }
  }
});

/**
 * データ移行の実行関数
 */
async function migrateData() {
  console.log('PostgreSQLからSQLiteへのデータ移行を開始します...');
  
  try {
    // ユーザーデータの移行
    await migrateUsers();
    
    // カテゴリデータの移行
    await migrateCategories();
    
    // タグデータの移行
    await migrateTags();
    
    // 投稿データの移行
    await migratePosts();

    // 投稿-タグのリレーションデータの移行
    await migratePostTags();
    
    // イベントデータの移行
    await migrateEvents();
    
    // イベント-タグのリレーションデータの移行
    await migrateEventTags();
    
    // コメントデータの移行
    await migrateComments();
    
    // 店舗情報の移行
    await migrateStores();
    
    // メディアデータの移行
    await migrateMedia();
    
    // サイト設定の移行
    await migrateSiteSettings();
    
    console.log('データ移行が完了しました！');
  } catch (error) {
    console.error('データ移行中にエラーが発生しました:', error);
    throw error;
  }
}

/**
 * ユーザーデータの移行
 */
async function migrateUsers() {
  console.log('ユーザーデータの移行を開始します...');
  const users = await prismaPg.user.findMany();
  console.log(`${users.length}人のユーザーを移行します...`);
  
  for (const user of users) {
    await prismaSqlite.user.create({
      data: {
        id: user.id,
        email: user.email,
        passwordHash: user.passwordHash,
        name: user.name,
        profilePicture: user.profilePicture,
        role: user.role,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      },
    });
  }
  console.log('ユーザーデータの移行が完了しました');
}

/**
 * カテゴリデータの移行
 */
async function migrateCategories() {
  console.log('カテゴリデータの移行を開始します...');
  const categories = await prismaPg.category.findMany();
  console.log(`${categories.length}件のカテゴリを移行します...`);
  
  // 親カテゴリが存在しないものを先に作成
  const rootCategories = categories.filter(c => !c.parentId);
  for (const category of rootCategories) {
    await prismaSqlite.category.create({
      data: {
        id: category.id,
        name: category.name,
        slug: category.slug,
        description: category.description,
        createdAt: category.createdAt,
        updatedAt: category.updatedAt
      },
    });
  }
  
  // 子カテゴリを作成
  const childCategories = categories.filter(c => c.parentId);
  for (const category of childCategories) {
    await prismaSqlite.category.create({
      data: {
        id: category.id,
        name: category.name,
        slug: category.slug,
        description: category.description,
        parentId: category.parentId,
        createdAt: category.createdAt,
        updatedAt: category.updatedAt
      },
    });
  }
  
  console.log('カテゴリデータの移行が完了しました');
}

/**
 * タグデータの移行
 */
async function migrateTags() {
  console.log('タグデータの移行を開始します...');
  const tags = await prismaPg.tag.findMany();
  console.log(`${tags.length}件のタグを移行します...`);
  
  for (const tag of tags) {
    await prismaSqlite.tag.create({
      data: {
        id: tag.id,
        name: tag.name,
        slug: tag.slug,
        createdAt: tag.createdAt,
        updatedAt: tag.updatedAt
      },
    });
  }
  
  console.log('タグデータの移行が完了しました');
}

/**
 * 投稿データの移行
 */
async function migratePosts() {
  console.log('投稿データの移行を開始します...');
  const posts = await prismaPg.post.findMany();
  console.log(`${posts.length}件の投稿を移行します...`);
  
  for (const post of posts) {
    await prismaSqlite.post.create({
      data: {
        id: post.id,
        title: post.title,
        slug: post.slug,
        content: post.content,
        excerpt: post.excerpt,
        featuredImage: post.featuredImage,
        status: post.status,
        publishedAt: post.publishedAt,
        createdAt: post.createdAt,
        updatedAt: post.updatedAt,
        categoryId: post.categoryId,
        authorId: post.authorId
      },
    });
  }
  
  console.log('投稿データの移行が完了しました');
}

/**
 * 投稿-タグのリレーションデータの移行
 */
async function migratePostTags() {
  console.log('投稿-タグのリレーションデータの移行を開始します...');
  const postTags = await prismaPg.postToTag.findMany();
  console.log(`${postTags.length}件の投稿-タグのリレーションを移行します...`);
  
  for (const postTag of postTags) {
    await prismaSqlite.postToTag.create({
      data: {
        postId: postTag.postId,
        tagId: postTag.tagId,
        createdAt: postTag.createdAt
      },
    });
  }
  
  console.log('投稿-タグのリレーションデータの移行が完了しました');
}

/**
 * イベントデータの移行
 */
async function migrateEvents() {
  console.log('イベントデータの移行を開始します...');
  const events = await prismaPg.event.findMany({
    include: {
      categories: true
    }
  });
  console.log(`${events.length}件のイベントを移行します...`);
  
  for (const event of events) {
    // カテゴリIDのリストを作成
    const categoryIds = event.categories.map(c => ({ id: c.id }));
    
    await prismaSqlite.event.create({
      data: {
        id: event.id,
        title: event.title,
        slug: event.slug,
        content: event.content,
        excerpt: event.excerpt,
        featuredImage: event.featuredImage,
        startDate: event.startDate,
        endDate: event.endDate,
        location: event.location,
        status: event.status,
        publishedAt: event.publishedAt,
        createdAt: event.createdAt,
        updatedAt: event.updatedAt,
        authorId: event.authorId,
        categories: {
          connect: categoryIds
        }
      },
    });
  }
  
  console.log('イベントデータの移行が完了しました');
}

/**
 * イベント-タグのリレーションデータの移行
 */
async function migrateEventTags() {
  console.log('イベント-タグのリレーションデータの移行を開始します...');
  const eventTags = await prismaPg.eventToTag.findMany();
  console.log(`${eventTags.length}件のイベント-タグのリレーションを移行します...`);
  
  for (const eventTag of eventTags) {
    await prismaSqlite.eventToTag.create({
      data: {
        eventId: eventTag.eventId,
        tagId: eventTag.tagId,
        createdAt: eventTag.createdAt
      },
    });
  }
  
  console.log('イベント-タグのリレーションデータの移行が完了しました');
}

/**
 * コメントデータの移行
 */
async function migrateComments() {
  console.log('コメントデータの移行を開始します...');
  // 親コメントを先に移行
  const rootComments = await prismaPg.comment.findMany({
    where: {
      parentId: null
    }
  });
  console.log(`${rootComments.length}件の親コメントを移行します...`);
  
  for (const comment of rootComments) {
    await prismaSqlite.comment.create({
      data: {
        id: comment.id,
        content: comment.content,
        status: comment.status,
        createdAt: comment.createdAt,
        updatedAt: comment.updatedAt,
        postId: comment.postId,
        eventId: comment.eventId,
        authorId: comment.authorId
      },
    });
  }
  
  // 子コメントを移行
  const childComments = await prismaPg.comment.findMany({
    where: {
      NOT: {
        parentId: null
      }
    }
  });
  console.log(`${childComments.length}件の子コメントを移行します...`);
  
  for (const comment of childComments) {
    await prismaSqlite.comment.create({
      data: {
        id: comment.id,
        content: comment.content,
        status: comment.status,
        createdAt: comment.createdAt,
        updatedAt: comment.updatedAt,
        postId: comment.postId,
        eventId: comment.eventId,
        authorId: comment.authorId,
        parentId: comment.parentId
      },
    });
  }
  
  console.log('コメントデータの移行が完了しました');
}

/**
 * 店舗データの移行
 */
async function migrateStores() {
  console.log('店舗データの移行を開始します...');
  const stores = await prismaPg.store.findMany({
    include: {
      address: true,
      businessHours: true
    }
  });
  console.log(`${stores.length}件の店舗データを移行します...`);
  
  for (const store of stores) {
    // 店舗情報を作成
    const createdStore = await prismaSqlite.store.create({
      data: {
        id: store.id,
        name: store.name,
        description: store.description,
        phone: store.phone,
        email: store.email,
        accessInfo: store.accessInfo,
        reservationUrl: store.reservationUrl,
        createdAt: store.createdAt,
        updatedAt: store.updatedAt
      },
    });
    
    // 住所情報がある場合は移行
    if (store.address) {
      await prismaSqlite.address.create({
        data: {
          id: store.address.id,
          zipCode: store.address.zipCode,
          prefecture: store.address.prefecture,
          city: store.address.city,
          street: store.address.street,
          building: store.address.building,
          createdAt: store.address.createdAt,
          updatedAt: store.address.updatedAt,
          storeId: store.id
        },
      });
    }
    
    // 営業時間情報を移行
    for (const hour of store.businessHours) {
      await prismaSqlite.businessHour.create({
        data: {
          id: hour.id,
          day: hour.day,
          isOpen: hour.isOpen,
          openTime: hour.openTime,
          closeTime: hour.closeTime,
          createdAt: hour.createdAt,
          updatedAt: hour.updatedAt,
          storeId: store.id
        },
      });
    }
  }
  
  console.log('店舗データの移行が完了しました');
}

/**
 * メディアデータの移行
 */
async function migrateMedia() {
  console.log('メディアデータの移行を開始します...');
  const mediaItems = await prismaPg.media.findMany();
  console.log(`${mediaItems.length}件のメディアデータを移行します...`);
  
  for (const media of mediaItems) {
    await prismaSqlite.media.create({
      data: {
        id: media.id,
        filename: media.filename,
        originalname: media.originalname,
        path: media.path,
        size: media.size,
        mimetype: media.mimetype,
        createdAt: media.createdAt,
        updatedAt: media.updatedAt
      },
    });
  }
  
  console.log('メディアデータの移行が完了しました');
}

/**
 * サイト設定の移行
 */
async function migrateSiteSettings() {
  console.log('サイト設定の移行を開始します...');
  const siteSettings = await prismaPg.siteSettings.findFirst();
  
  if (siteSettings) {
    await prismaSqlite.siteSettings.create({
      data: {
        id: siteSettings.id,
        siteName: siteSettings.siteName,
        siteDescription: siteSettings.siteDescription,
        logoUrl: siteSettings.logoUrl,
        faviconUrl: siteSettings.faviconUrl,
        metaTitle: siteSettings.metaTitle,
        metaDescription: siteSettings.metaDescription,
        ogImageUrl: siteSettings.ogImageUrl,
        googleAnalyticsId: siteSettings.googleAnalyticsId,
        twitterUrl: siteSettings.twitterUrl,
        facebookUrl: siteSettings.facebookUrl,
        instagramUrl: siteSettings.instagramUrl,
        youtubeUrl: siteSettings.youtubeUrl,
        lineUrl: siteSettings.lineUrl,
        adminEmail: siteSettings.adminEmail,
        sendCommentNotification: siteSettings.sendCommentNotification,
        sendContactFormNotification: siteSettings.sendContactFormNotification,
        postsPerPage: siteSettings.postsPerPage,
        showAuthorInfo: siteSettings.showAuthorInfo,
        enableComments: siteSettings.enableComments,
        primaryColor: siteSettings.primaryColor,
        secondaryColor: siteSettings.secondaryColor,
        createdAt: siteSettings.createdAt,
        updatedAt: siteSettings.updatedAt
      },
    });
    console.log('サイト設定の移行が完了しました');
  } else {
    console.log('サイト設定が見つかりませんでした');
  }
}

// メイン処理の実行
migrateData()
  .catch(error => {
    console.error('データ移行中にエラーが発生しました:', error);
    process.exit(1);
  })
  .finally(async () => {
    // データベース接続を閉じる
    await prismaPg.$disconnect();
    await prismaSqlite.$disconnect();
    console.log('データベース接続を閉じました');
  });
