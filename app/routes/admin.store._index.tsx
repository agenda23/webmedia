import { json, type ActionFunctionArgs, type LoaderFunctionArgs } from "@remix-run/node";
import { Form, useActionData, useLoaderData, useNavigation } from "@remix-run/react";
import { useEffect, useState } from "react";
import { z } from "zod";
import { getStoreInfo, updateStoreInfo } from "~/models/store.server";
import { requireAdmin } from "~/utils/session.server";
import { AdminPageHeader } from "~/components/admin/AdminPageHeader";
import { FormField } from "~/components/ui/FormField";
import Button from "~/components/ui/Button";
import { StoreHours } from "~/components/admin/StoreHours";
import { AddressForm } from "~/components/admin/AddressForm";
import { AlertSuccess, AlertError } from "~/components/ui/Alert";

// バリデーションスキーマ定義
const StoreInfoSchema = z.object({
  name: z.string().min(1, "店舗名は必須です"),
  description: z.string().optional(),
  phone: z.string().regex(/^\d{2,4}-?\d{2,4}-?\d{3,4}$/, "正しい電話番号形式で入力してください"),
  email: z.string().email("有効なメールアドレスを入力してください"),
  address: z.object({
    zipCode: z.string().regex(/^\d{3}-?\d{4}$/, "正しい郵便番号形式で入力してください"),
    prefecture: z.string().min(1, "都道府県は必須です"),
    city: z.string().min(1, "市区町村は必須です"),
    street: z.string().min(1, "番地は必須です"),
    building: z.string().optional(),
  }),
  businessHours: z.array(
    z.object({
      day: z.enum(["月", "火", "水", "木", "金", "土", "日"]),
      isOpen: z.boolean(),
      openTime: z.string().optional(),
      closeTime: z.string().optional(),
    })
  ),
  accessInfo: z.string().optional().nullable(),
  reservationUrl: z.string().url("有効なURLを入力してください").optional().nullable().or(z.literal("")),
});

type StoreInfoType = z.infer<typeof StoreInfoSchema>;

export const loader = async ({ request }: LoaderFunctionArgs) => {
  // 管理者権限チェック
  await requireAdmin(request);
  
  // 店舗情報取得
  const storeInfo = await getStoreInfo();
  
  return json({ storeInfo });
};

export const action = async ({ request }: ActionFunctionArgs) => {
  // 管理者権限チェック
  await requireAdmin(request);
  
  const formData = await request.formData();
  const rawData = Object.fromEntries(formData);
  
  try {
    // フォームデータの整形
    const storeData = {
      name: rawData.name as string,
      description: rawData.description as string,
      phone: rawData.phone as string,
      email: rawData.email as string,
      address: {
        zipCode: rawData["address.zipCode"] as string,
        prefecture: rawData["address.prefecture"] as string,
        city: rawData["address.city"] as string,
        street: rawData["address.street"] as string,
        building: rawData["address.building"] as string,
      },
      businessHours: JSON.parse(rawData.businessHours as string),
      accessInfo: rawData.accessInfo as string,
      reservationUrl: rawData.reservationUrl as string,
    };
    
    // バリデーション
    const validatedData = StoreInfoSchema.parse(storeData);
    
    // データ保存
    await updateStoreInfo(validatedData);
    
    return json({ success: true, message: "店舗情報を更新しました" });
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
      message: "店舗情報の更新に失敗しました"
    }, { status: 500 });
  }
};

export default function StoreInfoPage() {
  const { storeInfo } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";
  
  // ビジネスアワーのフォーム状態管理
  const [businessHours, setBusinessHours] = useState(storeInfo.businessHours || []);
  
  // StoreInfoデータの初期化
  const [formData, setFormData] = useState<StoreInfoType>({
    ...storeInfo,
    businessHours: businessHours
  });
  
  // ビジネスアワーの更新時にformDataを更新
  useEffect(() => {
    setFormData(prev => ({ ...prev, businessHours }));
  }, [businessHours]);
  
  return (
    <div className="space-y-6">
      <AdminPageHeader 
        title="店舗情報管理" 
        description="店舗の基本情報、営業時間、アクセス情報などを管理します。"
      />
      
      {actionData?.success && (
        <AlertSuccess>{actionData.message}</AlertSuccess>
      )}
      
      {actionData?.success === false && (
        <AlertError>{actionData.message}</AlertError>
      )}
      
      <Form method="post" className="space-y-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">基本情報</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              label="店舗名"
              name="name"
              type="text"
              required
              defaultValue={storeInfo.name}
              error={actionData?.errors?.name?._errors[0]}
            />
            
            <FormField
              label="電話番号"
              name="phone"
              type="tel"
              placeholder="03-1234-5678"
              required
              defaultValue={storeInfo.phone}
              error={actionData?.errors?.phone?._errors[0]}
            />
            
            <FormField
              label="メールアドレス"
              name="email"
              type="email"
              className="md:col-span-2"
              required
              defaultValue={storeInfo.email}
              error={actionData?.errors?.email?._errors[0]}
            />
            
            <div className="md:col-span-2">
              <FormField
                label="店舗説明"
                name="description"
                as="textarea"
                rows={4}
                defaultValue={storeInfo.description}
                error={actionData?.errors?.description?._errors[0]}
              />
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">住所情報</h2>
          <AddressForm 
            defaultValue={storeInfo.address} 
            errors={actionData?.errors?.address} 
          />
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">営業時間</h2>
          <StoreHours 
            businessHours={businessHours} 
            onChange={setBusinessHours} 
          />
          <input 
            type="hidden" 
            name="businessHours" 
            value={JSON.stringify(businessHours)} 
          />
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">アクセス情報</h2>
          <FormField
            label="アクセス方法"
            name="accessInfo"
            as="textarea"
            rows={4}
            placeholder="最寄り駅からの道順や、駐車場情報などを入力してください"
            defaultValue={storeInfo.accessInfo}
            error={actionData?.errors?.accessInfo?._errors[0]}
          />
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">予約情報</h2>
          <FormField
            label="予約サイトURL"
            name="reservationUrl"
            type="url"
            placeholder="https://..."
            defaultValue={storeInfo.reservationUrl}
            error={actionData?.errors?.reservationUrl?._errors[0]}
          />
        </div>
        
        <div className="flex justify-end">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "保存中..." : "店舗情報を保存"}
          </Button>
        </div>
      </Form>
    </div>
  );
}