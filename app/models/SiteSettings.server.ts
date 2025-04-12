import { prisma } from "~/models/prisma.server";
import type { SiteSettings } from "@prisma/client";

// サイト設定の型定義
export type SiteSettingsType = {
  id: string;
  siteName: string;
  siteDescription: string | null;
  logoUrl: string | null;
  faviconUrl: string | null;
  
  metaTitle: string | null;
  metaDescription: string | null;
  ogImageUrl: string | null;
  googleAnalyticsId: string | null;
  
  socialMedia: {
    twitter: string | null;
    facebook: string | null;
    instagram: string | null;
    youtube: string | null;
    line: string | null;
  };
  
  notifications: {
    adminEmail: string;
    sendCommentNotification: boolean;
    sendContactFormNotification: boolean;
  };
  
  display: {
    postsPerPage: number;
    showAuthorInfo: boolean;
    enableComments: boolean;
    primaryColor: string | null;
    secondaryColor: string | null;
  };
};

// サイト設定の取得
export async function getSiteSettings(): Promise<SiteSettingsType> {
  // サイト設定の取得
  const settings = await prisma.siteSettings.findFirst();
  
  // サイト設定がない場合はデフォルト値を返す
  if (!settings) {
    return {
      id: "",
      siteName: "Remix Web メディア",
      siteDescription: "",
      logoUrl: null,
      faviconUrl: null,
      
      metaTitle: null,
      metaDescription: null,
      ogImageUrl: null,
      googleAnalyticsId: null,
      
      socialMedia: {
        twitter: null,
        facebook: null,
        instagram: null,
        youtube: null,
        line: null,
      },
      
      notifications: {
        adminEmail: "admin@example.com",
        sendCommentNotification: true,
        sendContactFormNotification: true,
      },
      
      display: {
        postsPerPage: 10,
        showAuthorInfo: true,
        enableComments: true,
        primaryColor: "#3b82f6",
        secondaryColor: "#10b981",
      },
    };
  }
  
  // サイト設定を整形して返す
  return {
    id: settings.id,
    siteName: settings.siteName,
    siteDescription: settings.siteDescription,
    logoUrl: settings.logoUrl,
    faviconUrl: settings.faviconUrl,
    
    metaTitle: settings.metaTitle,
    metaDescription: settings.metaDescription,
    ogImageUrl: settings.ogImageUrl,
    googleAnalyticsId: settings.googleAnalyticsId,
    
    socialMedia: {
      twitter: settings.twitterUrl,
      facebook: settings.facebookUrl,
      instagram: settings.instagramUrl,
      youtube: settings.youtubeUrl,
      line: settings.lineUrl,
    },
    
    notifications: {
      adminEmail: settings.adminEmail,
      sendCommentNotification: settings.sendCommentNotification,
      sendContactFormNotification: settings.sendContactFormNotification,
    },
    
    display: {
      postsPerPage: settings.postsPerPage,
      showAuthorInfo: settings.showAuthorInfo,
      enableComments: settings.enableComments,
      primaryColor: settings.primaryColor,
      secondaryColor: settings.secondaryColor,
    },
  };
}

// サイト設定の更新
export async function updateSiteSettings(data: Omit<SiteSettingsType, "id">): Promise<SiteSettings> {
  // 既存のサイト設定を取得
  const existingSettings = await prisma.siteSettings.findFirst();
  
  if (existingSettings) {
    // 既存設定の更新
    return await prisma.siteSettings.update({
      where: { id: existingSettings.id },
      data: {
        siteName: data.siteName,
        siteDescription: data.siteDescription,
        logoUrl: data.logoUrl,
        faviconUrl: data.faviconUrl,
        
        metaTitle: data.metaTitle,
        metaDescription: data.metaDescription,
        ogImageUrl: data.ogImageUrl,
        googleAnalyticsId: data.googleAnalyticsId,
        
        twitterUrl: data.socialMedia.twitter,
        facebookUrl: data.socialMedia.facebook,
        instagramUrl: data.socialMedia.instagram,
        youtubeUrl: data.socialMedia.youtube,
        lineUrl: data.socialMedia.line,
        
        adminEmail: data.notifications.adminEmail,
        sendCommentNotification: data.notifications.sendCommentNotification,
        sendContactFormNotification: data.notifications.sendContactFormNotification,
        
        postsPerPage: data.display.postsPerPage,
        showAuthorInfo: data.display.showAuthorInfo,
        enableComments: data.display.enableComments,
        primaryColor: data.display.primaryColor,
        secondaryColor: data.display.secondaryColor,
      },
    });
  } else {
    // 新規設定の作成
    return await prisma.siteSettings.create({
      data: {
        siteName: data.siteName,
        siteDescription: data.siteDescription,
        logoUrl: data.logoUrl,
        faviconUrl: data.faviconUrl,
        
        metaTitle: data.metaTitle,
        metaDescription: data.metaDescription,
        ogImageUrl: data.ogImageUrl,
        googleAnalyticsId: data.googleAnalyticsId,
        
        twitterUrl: data.socialMedia.twitter,
        facebookUrl: data.socialMedia.facebook,
        instagramUrl: data.socialMedia.instagram,
        youtubeUrl: data.socialMedia.youtube,
        lineUrl: data.socialMedia.line,
        
        adminEmail: data.notifications.adminEmail,
        sendCommentNotification: data.notifications.sendCommentNotification,
        sendContactFormNotification: data.notifications.sendContactFormNotification,
        
        postsPerPage: data.display.postsPerPage,
        showAuthorInfo: data.display.showAuthorInfo,
        enableComments: data.display.enableComments,
        primaryColor: data.display.primaryColor,
        secondaryColor: data.display.secondaryColor,
      },
    });
  }
}