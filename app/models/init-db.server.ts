import { prisma } from "./prisma.server";

/**
 * 初期設定データを確認・作成する関数
 */
export async function initializeDatabase() {
  console.log("Initializing database...");
  
  try {
    // SiteSettings の存在確認
    const existingSettings = await prisma.siteSettings.findFirst();
    
    // 存在しない場合は初期データ作成
    if (!existingSettings) {
      console.log("Creating initial SiteSettings...");
      await prisma.siteSettings.create({
        data: {
          siteName: "飲食店舗 Web メディアサイト",
          siteDescription: "飲食店舗の情報発信サイト",
          adminEmail: "admin@example.com",
        }
      });
      console.log("Initial SiteSettings created.");
    } else {
      console.log("SiteSettings already exists.");
    }
    
    return { success: true };
  } catch (error) {
    console.error("Error initializing database:", error);
    return { success: false, error };
  }
}
