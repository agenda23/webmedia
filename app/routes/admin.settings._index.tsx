import { json, type ActionFunctionArgs, type LoaderFunctionArgs } from "@remix-run/node";
import { Form, useActionData, useLoaderData, useNavigation } from "@remix-run/react";
import { useState } from "react";
import { z } from "zod";
import { getSiteSettings, updateSiteSettings } from "~/models/SiteSettings.server";
import { requireAdmin } from "~/utils/session.server";
import { AdminPageHeader } from "~/components/admin/AdminPageHeader";
import { FormField } from "~/components/ui/FormField";
import Button from "~/components/ui/Button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/Tabs";
import { AlertSuccess, AlertError } from "~/components/ui/Alert";
import { MediaUpload } from "~/components/admin/MediaUpload";
import { SocialMediaLinks } from "~/components/admin/SocialMediaLinks";

// バリデーションスキーマ定義
const SiteSettingsSchema = z.object({
  // 基本設定
  siteName: z.string().min(1, "サイト名は必須です"),
  siteDescription: z.string().optional(),
  logoUrl: z.string().optional(),
  faviconUrl: z.string().optional(),
  
  // SEO設定
  metaTitle: z.string().optional(),
  metaDescription: z.string().max(160, "メタディスクリプションは160文字以内にしてください").optional(),
  ogImageUrl: z.string().optional(),
  googleAnalyticsId: z.string().optional(),
  
  // SNS設定
  socialMedia: z.object({
    twitter: z.string().url("有効なURLを入力してください").optional().or(z.literal("")),
    facebook: z.string().url("有効なURLを入力してください").optional().or(z.literal("")),
    instagram: z.string().url("有効なURLを入力してください").optional().or(z.literal("")),
    youtube: z.string().url("有効なURLを入力してください").optional().or(z.literal("")),
    line: z.string().url("有効なURLを入力してください").optional().or(z.literal("")),
  }),
  
  // 通知設定
  notifications: z.object({
    adminEmail: z.string().email("有効なメールアドレスを入力してください"),
    sendCommentNotification: z.boolean().optional(),
    sendContactFormNotification: z.boolean().optional(),
  }),
  
  // 表示設定
  display: z.object({
    postsPerPage: z.number().int().positive("1以上の値を入力してください").optional(),
    showAuthorInfo: z.boolean().optional(),
    enableComments: z.boolean().optional(),
    primaryColor: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, "有効なカラーコードを入力してください").optional(),
    secondaryColor: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, "有効なカラーコードを入力してください").optional(),
  }),
});

type SiteSettingsType = z.infer<typeof SiteSettingsSchema>;

export const loader = async ({ request }: LoaderFunctionArgs) => {
  // 管理者権限チェック
  await requireAdmin(request);
  
  // サイト設定取得
  const siteSettings = await getSiteSettings();
  
  return json({ siteSettings });
};

export const action = async ({ request }: ActionFunctionArgs) => {
  // 管理者権限チェック
  await requireAdmin(request);
  
  const formData = await request.formData();
  const rawData = Object.fromEntries(formData);
  
  try {
    // フォームデータの整形
    const settingsData = {
      siteName: rawData.siteName as string,
      siteDescription: rawData.siteDescription as string,
      logoUrl: rawData.logoUrl as string,
      faviconUrl: rawData.faviconUrl as string,
      
      metaTitle: rawData.metaTitle as string,
      metaDescription: rawData.metaDescription as string,
      ogImageUrl: rawData.ogImageUrl as string,
      googleAnalyticsId: rawData.googleAnalyticsId as string,
      
      socialMedia: {
        twitter: rawData["socialMedia.twitter"] as string,
        facebook: rawData["socialMedia.facebook"] as string,
        instagram: rawData["socialMedia.instagram"] as string,
        youtube: rawData["socialMedia.youtube"] as string,
        line: rawData["socialMedia.line"] as string,
      },
      
      notifications: {
        adminEmail: rawData["notifications.adminEmail"] as string,
        sendCommentNotification: rawData["notifications.sendCommentNotification"] === "on",
        sendContactFormNotification: rawData["notifications.sendContactFormNotification"] === "on",
      },
      
      display: {
        postsPerPage: Number(rawData["display.postsPerPage"] || 10),
        showAuthorInfo: rawData["display.showAuthorInfo"] === "on",
        enableComments: rawData["display.enableComments"] === "on",
        primaryColor: rawData["display.primaryColor"] as string,
        secondaryColor: rawData["display.secondaryColor"] as string,
      },
    };
    
    // バリデーション
    const validatedData = SiteSettingsSchema.parse(settingsData);
    
    // データ保存
    await updateSiteSettings(validatedData);
    
    return json({ success: true, message: "サイト設定を更新しました" });
  } catch (error) {
    if (error instanceof z.ZodError) {
      // バリデーションエラー
      return json({ 
        success: false, 
        message: "入力内容に誤りがあります", 
        errors: error.format() 
      }, { status: 400 });
    }
    
    // その他のエラー
    return json({ 
      success: false, 
      message: "サイト設定の更新に失敗しました"
    }, { status: 500 });
  }
};

export default function SiteSettingsPage() {
  const { siteSettings } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";
  
  // タブの状態管理
  const [activeTab, setActiveTab] = useState("general");
  
  return (
    <div className="space-y-6">
      <AdminPageHeader 
        title="サイト設定" 
        description="サイト全体の設定を管理します。店舗固有の情報は「店舗情報管理」から設定してください。"
      />
      
      {actionData?.success && (
        <AlertSuccess>{actionData.message}</AlertSuccess>
      )}
      
      {actionData?.success === false && (
        <AlertError>{actionData.message}</AlertError>
      )}
      
      <Form method="post" className="space-y-8">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="general">基本設定</TabsTrigger>
            <TabsTrigger value="seo">SEO設定</TabsTrigger>
            <TabsTrigger value="social">SNS設定</TabsTrigger>
            <TabsTrigger value="notifications">通知設定</TabsTrigger>
            <TabsTrigger value="display">表示設定</TabsTrigger>
          </TabsList>
          
          <TabsContent value="general" className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">基本設定</h2>
            <div className="grid grid-cols-1 gap-6">
              <FormField
                label="サイト名"
                name="siteName"
                type="text"
                required
                defaultValue={siteSettings.siteName}
                error={actionData?.errors?.siteName?._errors[0]}
                helperText="Webサイト全体の名称を入力します（店舗名とは異なる場合があります）"
              />
              
              <FormField
                label="サイト概要"
                name="siteDescription"
                as="textarea"
                rows={3}
                defaultValue={siteSettings.siteDescription}
                error={actionData?.errors?.siteDescription?._errors[0]}
                helperText="Webサイトの簡潔な説明文を入力します"
              />
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ロゴ
                </label>
                <MediaUpload
                  name="logoUrl"
                  defaultValue={siteSettings.logoUrl}
                  accept="image/*"
                />
                <p className="text-sm text-gray-500 mt-1">
                  サイト全体で使用するロゴ画像をアップロードします
                </p>
                {actionData?.errors?.logoUrl?._errors[0] && (
                  <p className="text-red-500 text-sm mt-1">
                    {actionData.errors.logoUrl._errors[0]}
                  </p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ファビコン
                </label>
                <MediaUpload
                  name="faviconUrl"
                  defaultValue={siteSettings.faviconUrl}
                  accept="image/x-icon,image/png"
                />
                <p className="text-sm text-gray-500 mt-1">
                  ブラウザのタブに表示される小さなアイコン（.icoまたは.png形式推奨）
                </p>
                {actionData?.errors?.faviconUrl?._errors[0] && (
                  <p className="text-red-500 text-sm mt-1">
                    {actionData.errors.faviconUrl._errors[0]}
                  </p>
                )}
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="seo" className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">SEO設定</h2>
            <div className="grid grid-cols-1 gap-6">
              <FormField
                label="メタタイトル"
                name="metaTitle"
                type="text"
                defaultValue={siteSettings.metaTitle}
                error={actionData?.errors?.metaTitle?._errors[0]}
                helperText="検索エンジンに表示されるタイトル（未設定の場合はサイト名が使用されます）"
              />
              
              <FormField
                label="メタディスクリプション"
                name="metaDescription"
                as="textarea"
                rows={3}
                defaultValue={siteSettings.metaDescription}
                error={actionData?.errors?.metaDescription?._errors[0]}
                helperText="検索結果に表示される説明文です（160文字以内推奨）"
              />
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  OGP画像
                </label>
                <MediaUpload
                  name="ogImageUrl"
                  defaultValue={siteSettings.ogImageUrl}
                  accept="image/*"
                />
                <p className="text-sm text-gray-500 mt-1">
                  SNSでシェアされた際に表示される画像です（1200x630px推奨）
                </p>
                {actionData?.errors?.ogImageUrl?._errors[0] && (
                  <p className="text-red-500 text-sm mt-1">
                    {actionData.errors.ogImageUrl._errors[0]}
                  </p>
                )}
              </div>
              
              <FormField
                label="Google Analytics ID"
                name="googleAnalyticsId"
                type="text"
                placeholder="G-XXXXXXXXXX"
                defaultValue={siteSettings.googleAnalyticsId}
                error={actionData?.errors?.googleAnalyticsId?._errors[0]}
                helperText="アクセス解析用のID（Google Analytics 4 形式）"
              />
            </div>
          </TabsContent>
          
          <TabsContent value="social" className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">SNS設定</h2>
            <p className="text-sm text-gray-500 mb-4">
              Webサイト全体のSNSアカウント情報を設定します。店舗固有のSNSは店舗情報で設定してください。
            </p>
            <SocialMediaLinks
              defaultValues={siteSettings.socialMedia}
              errors={actionData?.errors?.socialMedia}
            />
          </TabsContent>
          
          <TabsContent value="notifications" className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">通知設定</h2>
            <div className="grid grid-cols-1 gap-6">
              <FormField
                label="管理者メールアドレス"
                name="notifications.adminEmail"
                type="email"
                required
                defaultValue={siteSettings.notifications.adminEmail}
                error={actionData?.errors?.notifications?.adminEmail?._errors[0]}
                helperText="システム通知の送信先メールアドレスです"
              />
              
              <div className="space-y-4">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="sendCommentNotification"
                    name="notifications.sendCommentNotification"
                    className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    defaultChecked={siteSettings.notifications.sendCommentNotification}
                  />
                  <label htmlFor="sendCommentNotification" className="ml-2 block text-sm text-gray-700">
                    コメント投稿時に通知を受け取る
                  </label>
                </div>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="sendContactFormNotification"
                    name="notifications.sendContactFormNotification"
                    className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    defaultChecked={siteSettings.notifications.sendContactFormNotification}
                  />
                  <label htmlFor="sendContactFormNotification" className="ml-2 block text-sm text-gray-700">
                    お問い合わせフォーム送信時に通知を受け取る
                  </label>
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="display" className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">表示設定</h2>
            <div className="grid grid-cols-1 gap-6">
              <FormField
                label="1ページあたりの投稿表示数"
                name="display.postsPerPage"
                type="number"
                min={1}
                defaultValue={siteSettings.display.postsPerPage.toString()}
                error={actionData?.errors?.display?.postsPerPage?._errors[0]}
                helperText="記事一覧ページで表示する投稿数"
              />
              
              <div className="space-y-4">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="showAuthorInfo"
                    name="display.showAuthorInfo"
                    className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    defaultChecked={siteSettings.display.showAuthorInfo}
                  />
                  <label htmlFor="showAuthorInfo" className="ml-2 block text-sm text-gray-700">
                    投稿者情報を表示する
                  </label>
                </div>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="enableComments"
                    name="display.enableComments"
                    className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    defaultChecked={siteSettings.display.enableComments}
                  />
                  <label htmlFor="enableComments" className="ml-2 block text-sm text-gray-700">
                    コメント機能を有効にする
                  </label>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  label="プライマリカラー"
                  name="display.primaryColor"
                  type="color"
                  defaultValue={siteSettings.display.primaryColor}
                  error={actionData?.errors?.display?.primaryColor?._errors[0]}
                  helperText="サイトの主要カラー"
                />
                
                <FormField
                  label="セカンダリカラー"
                  name="display.secondaryColor"
                  type="color"
                  defaultValue={siteSettings.display.secondaryColor}
                  error={actionData?.errors?.display?.secondaryColor?._errors[0]}
                  helperText="サイトの補助カラー"
                />
              </div>
            </div>
          </TabsContent>
        </Tabs>
        
        <div className="flex justify-end">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "保存中..." : "設定を保存"}
          </Button>
        </div>
      </Form>
    </div>
  );
}