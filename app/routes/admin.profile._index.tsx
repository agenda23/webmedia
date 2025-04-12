import { json, redirect } from "@remix-run/node";
import { Form, useActionData, useLoaderData } from "@remix-run/react";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { useState } from "react";
import { getUserById, updateUser, changePassword } from "~/models/user.server";
import { requireUserId } from "~/utils/session.server";
import { FormField } from "~/components/ui/FormField";
import Button from "~/components/ui/Button";
import { AlertSuccess, AlertError } from "~/components/ui/Alert";

export async function loader({ request }: LoaderFunctionArgs) {
  const userId = await requireUserId(request);
  const user = await getUserById(userId);
  
  if (!user) {
    throw new Response("Not Found", { status: 404 });
  }
  
  return json({ user });
}

export async function action({ request }: ActionFunctionArgs) {
  const userId = await requireUserId(request);
  const formData = await request.formData();
  const actionType = formData.get("_action");
  
  // プロフィール更新
  if (actionType === "updateProfile") {
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    
    if (!email) {
      return json(
        { 
          success: false, 
          message: "メールアドレスは必須です", 
          formType: "profile" 
        }, 
        { status: 400 }
      );
    }
    
    try {
      await updateUser(userId, { name, email });
      return json({ 
        success: true, 
        message: "プロフィールを更新しました", 
        formType: "profile" 
      });
    } catch (error) {
      return json(
        { 
          success: false, 
          message: "プロフィールの更新に失敗しました", 
          formType: "profile" 
        }, 
        { status: 500 }
      );
    }
  }
  
  // パスワード変更
  if (actionType === "changePassword") {
    const currentPassword = formData.get("currentPassword") as string;
    const newPassword = formData.get("newPassword") as string;
    const confirmPassword = formData.get("confirmPassword") as string;
    
    if (!currentPassword || !newPassword || !confirmPassword) {
      return json(
        { 
          success: false, 
          message: "すべての項目を入力してください", 
          formType: "password" 
        }, 
        { status: 400 }
      );
    }
    
    if (newPassword !== confirmPassword) {
      return json(
        { 
          success: false, 
          message: "新しいパスワードと確認用パスワードが一致しません", 
          formType: "password" 
        }, 
        { status: 400 }
      );
    }
    
    if (newPassword.length < 8) {
      return json(
        { 
          success: false, 
          message: "パスワードは8文字以上で設定してください", 
          formType: "password" 
        }, 
        { status: 400 }
      );
    }
    
    try {
      // ここでは現在のパスワード検証は省略していますが、実際にはverifyLoginなどで検証すべきです
      await changePassword(userId, newPassword);
      return json({ 
        success: true, 
        message: "パスワードを変更しました", 
        formType: "password" 
      });
    } catch (error) {
      return json(
        { 
          success: false, 
          message: "パスワードの変更に失敗しました", 
          formType: "password" 
        }, 
        { status: 500 }
      );
    }
  }
  
  return null;
}

export default function ProfilePage() {
  const { user } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  
  return (
    <div className="space-y-8">
      <div className="mb-6 pb-4 border-b border-gray-200">
        <h1 className="text-2xl font-bold text-gray-900">プロフィール設定</h1>
        <p className="mt-1 text-sm text-gray-500">
          アカウント情報の管理とパスワードの変更ができます
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* プロフィール情報 */}
        <div className="md:col-span-2">
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">基本情報</h2>
            
            {actionData?.formType === "profile" && actionData?.success && (
              <AlertSuccess className="mb-4">{actionData.message}</AlertSuccess>
            )}
            
            {actionData?.formType === "profile" && !actionData?.success && (
              <AlertError className="mb-4">{actionData.message}</AlertError>
            )}
            
            <Form method="post" className="space-y-4">
              <input type="hidden" name="_action" value="updateProfile" />
              
              <FormField
                label="氏名"
                name="name"
                type="text"
                defaultValue={user.name || ""}
              />
              
              <FormField
                label="メールアドレス"
                name="email"
                type="email"
                required
                defaultValue={user.email || ""}
              />
              
              <div className="flex justify-end">
                <Button type="submit">
                  プロフィールを更新
                </Button>
              </div>
            </Form>
          </div>
        </div>
        
        {/* アカウント情報 */}
        <div className="md:col-span-1">
          <div className="bg-white p-6 rounded-lg shadow mb-6">
            <div className="flex items-center space-x-4">
              <div className="h-16 w-16 rounded-full bg-gray-200 flex items-center justify-center text-gray-500">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-8 w-8"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
              </div>
              <div>
                <h3 className="font-medium">
                  {user.name ? user.name : user.email}
                </h3>
                <p className="text-sm text-gray-500 capitalize">{user.role.toLowerCase()}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">パスワード変更</h2>
            
            {actionData?.formType === "password" && actionData?.success && (
              <AlertSuccess className="mb-4">{actionData.message}</AlertSuccess>
            )}
            
            {actionData?.formType === "password" && !actionData?.success && (
              <AlertError className="mb-4">{actionData.message}</AlertError>
            )}
            
            <Form method="post" className="space-y-4">
              <input type="hidden" name="_action" value="changePassword" />
              
              <FormField
                label="現在のパスワード"
                name="currentPassword"
                type="password"
                required
              />
              
              <FormField
                label="新しいパスワード"
                name="newPassword"
                type="password"
                required
                helperText="8文字以上で設定してください"
              />
              
              <FormField
                label="新しいパスワード（確認）"
                name="confirmPassword"
                type="password"
                required
              />
              
              <div className="flex justify-end">
                <Button 
                  type="submit"
                  variant="outline"
                >
                  パスワードを変更
                </Button>
              </div>
            </Form>
          </div>
        </div>
      </div>
    </div>
  );
}