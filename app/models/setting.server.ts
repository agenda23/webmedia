import { prisma } from "./prisma.server";

// =============================================
// 一時的な対応策: SiteSettings モデルを代わりに使用
// =============================================

// 設定のキーに対応する SiteSettings のフィールドをマッピング
const settingKeyToFieldMap: Record<string, keyof any> = {
  "site_name": "siteName",
  "site_description": "siteDescription",
  "logo_url": "logoUrl",
  "favicon_url": "faviconUrl",
  "meta_title": "metaTitle",
  "meta_description": "metaDescription",
  "og_image_url": "ogImageUrl",
  "google_analytics_id": "googleAnalyticsId",
  "twitter_url": "twitterUrl",
  "facebook_url": "facebookUrl",
  "instagram_url": "instagramUrl",
  "youtube_url": "youtubeUrl",
  "line_url": "lineUrl",
  "admin_email": "adminEmail",
  "primary_color": "primaryColor",
  "secondary_color": "secondaryColor",
};

// 設定作成/更新関数
export async function setSetting(key: string, value: string, group?: string) {
  // SiteSettings 内のフィールドに対応する場合
  const fieldName = settingKeyToFieldMap[key];
  if (fieldName) {
    const existingSettings = await prisma.siteSettings.findFirst();
    if (existingSettings) {
      return prisma.siteSettings.update({
        where: { id: existingSettings.id },
        data: { [fieldName]: value },
      });
    } else {
      return prisma.siteSettings.create({
        data: { 
          siteName: key === "site_name" ? value : "飲食店舗 Web メディアサイト",
          adminEmail: key === "admin_email" ? value : "admin@example.com",
          [fieldName]: value 
        },
      });
    }
  }
  
  // SiteSettings に含まれないカスタム設定の場合は null を返す
  return null;
}

// 設定取得関数
export async function getSetting(key: string) {
  // SiteSettings 内のフィールドに対応する場合
  const fieldName = settingKeyToFieldMap[key];
  if (fieldName) {
    const settings = await prisma.siteSettings.findFirst();
    if (settings) {
      return { key, value: settings[fieldName]?.toString() || "" };
    }
  }
  
  // デフォルト値を返す
  return { key, value: "" };
}

// 設定値取得関数
export async function getSettingValue(key: string, defaultValue?: string) {
  const setting = await getSetting(key);
  return setting && setting.value ? setting.value : defaultValue;
}

// グループ別設定一覧取得関数
export async function getSettingsByGroup(group: string) {
  // このバージョンでは単純に SiteSettings の全フィールドを返す
  const settings = await prisma.siteSettings.findFirst();
  if (!settings) return [];
  
  // SiteSettings のフィールドをキーバリュー形式に変換
  const result: Array<{ key: string; value: string; group: string }> = [];
  for (const [key, field] of Object.entries(settingKeyToFieldMap)) {
    if (settings[field]) {
      result.push({
        key,
        value: settings[field].toString(),
        group: group,
      });
    }
  }
  
  return result;
}

// 設定一覧取得関数
export async function getAllSettings() {
  // SiteSettings の全フィールドを返す
  const settings = await prisma.siteSettings.findFirst();
  if (!settings) return [];
  
  // SiteSettings のフィールドをキーバリュー形式に変換
  const result: Array<{ key: string; value: string; group: string }> = [];
  for (const [key, field] of Object.entries(settingKeyToFieldMap)) {
    if (settings[field]) {
      // group は空文字列にしておく
      result.push({
        key,
        value: settings[field].toString(),
        group: "",
      });
    }
  }
  
  return result;
}

// 設定削除関数
export async function deleteSetting(key: string) {
  // このバージョンでは何もしない（SiteSettings の個別フィールドは削除できない）
  return { key };
}

// 複数設定の一括設定関数
export async function setMultipleSettings(settings: Array<{ key: string; value: string; group?: string }>) {
  const existingSettings = await prisma.siteSettings.findFirst();
  
  const data: Record<string, any> = {};
  let hasSiteName = false;
  let hasAdminEmail = false;
  
  // 更新するフィールドを準備
  for (const setting of settings) {
    const fieldName = settingKeyToFieldMap[setting.key];
    if (fieldName) {
      data[fieldName] = setting.value;
      if (setting.key === "site_name") hasSiteName = true;
      if (setting.key === "admin_email") hasAdminEmail = true;
    }
  }
  
  // 必須フィールドの設定
  if (!hasSiteName) data.siteName = "飲食店舗 Web メディアサイト";
  if (!hasAdminEmail) data.adminEmail = "admin@example.com";
  
  if (existingSettings) {
    // 既存の設定を更新
    return prisma.siteSettings.update({
      where: { id: existingSettings.id },
      data,
    });
  } else {
    // 新しい設定を作成
    return prisma.siteSettings.create({
      data,
    });
  }
}
