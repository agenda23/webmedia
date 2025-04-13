// データベース初期化スクリプト
import { PrismaClient } from "@prisma/client";

console.log("Initializing database...");

async function initialize() {
  const prisma = new PrismaClient();
  
  try {
    // SiteSettingsが存在するか確認
    const settings = await prisma.siteSettings.findFirst();
    
    if (!settings) {
      console.log("Creating initial SiteSettings...");
      // 初期設定を作成
      await prisma.siteSettings.create({
        data: {
          siteName: "飲食店舗 Web メディアサイト",
          siteDescription: "飲食店舗の情報発信サイト",
          adminEmail: "admin@example.com"
        }
      });
      console.log("Initial SiteSettings created.");
    } else {
      console.log("SiteSettings already exists.");
    }
    
    console.log("Database initialization completed successfully");
  } catch (error) {
    console.error("Error initializing database:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

initialize()
  .then(() => {
    process.exit(0);
  })
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
