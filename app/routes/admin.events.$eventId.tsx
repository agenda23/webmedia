import { useState } from "react";
import { json, redirect } from "@remix-run/node";
import { Form, useActionData, useLoaderData, useNavigation } from "@remix-run/react";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { getEvent, updateEvent } from "~/models/event.server";
import { getAllCategories } from "~/models/category.server";
import { getAllTags } from "~/models/tag.server";
import { requireEditor } from "~/utils/session.server";

export const handle = {
  title: "イベント編集",
};

export async function loader({ params, request }: LoaderFunctionArgs) {
  await requireEditor(request);
  
  const eventId = params.eventId;
  
  if (!eventId) {
    throw new Response("Event ID is required", { status: 400 });
  }

  const [event, categories, tags] = await Promise.all([
    getEvent(eventId),
    getAllCategories(),
    getAllTags(),
  ]);

  if (!event) {
    throw new Response("Event not found", { status: 404 });
  }

  return json({ 
    event, 
    categories, 
    tags,
    isNew: false 
  });
}

export async function action({ request, params }: ActionFunctionArgs) {
  const user = await requireEditor(request);
  const eventId = params.eventId;
  
  if (!eventId) {
    throw new Response("Event ID is required", { status: 400 });
  }
  
  const formData = await request.formData();
  const title = formData.get("title")?.toString();
  const content = formData.get("content")?.toString();
  const excerpt = formData.get("excerpt")?.toString();
  const featuredImage = formData.get("featuredImage")?.toString();
  const status = formData.get("status")?.toString();
  const location = formData.get("location")?.toString();
  const startDate = formData.get("startDate")?.toString();
  const endDate = formData.get("endDate")?.toString();
  const categoryIds = formData.getAll("categories").map(id => id.toString());
  const tagIds = formData.getAll("tags").map(id => id.toString());
  const publishDate = formData.get("publishDate")?.toString();

  const errors = {
    title: title ? null : "タイトルは必須です",
    content: content ? null : "説明文は必須です",
    startDate: startDate ? null : "開始日時は必須です",
  };

  const hasErrors = Object.values(errors).some(errorMessage => errorMessage);
  if (hasErrors) {
    return json({ errors, success: false });
  }

  try {
    await updateEvent({
      id: eventId,
      title: title || "",
      content: content || "",
      excerpt: excerpt || "",
      featuredImage,
      // ステータスを大文字に変換
      status: status ? status.toUpperCase() : "DRAFT",
      location: location || "",
      startDate: startDate ? new Date(startDate) : new Date(),
      endDate: endDate ? new Date(endDate) : undefined,
      categoryIds,
      tagIds,
      organizerId: user.id,
      publishDate: publishDate ? new Date(publishDate) : undefined,
    });

    return redirect("/admin/events");
  } catch (error) {
    return json({ 
      errors: { 
        form: "イベントの更新中にエラーが発生しました"
      }, 
      success: false 
    });
  }
}

export default function EditEvent() {
  const { event, categories, tags, isNew } = useLoaderData<typeof loader>();
  const actionData = useActionData<{ errors?: any; success?: boolean }>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";
  
  // 「公開予定」を選択した場合に表示する公開日時設定
  const [showScheduleOptions, setShowScheduleOptions] = useState(event.status === "SCHEDULED");
  
  // 日付入力のためのフォーマット
  function formatDateForInput(date: string | Date | null) {
    if (!date) return "";
    const d = typeof date === "string" ? new Date(date) : date;
    return d.toISOString().slice(0, 16);
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">イベント編集</h1>
        <div className="flex space-x-3">
          <a 
            href={`/events/${event.slug}`} 
            target="_blank" 
            rel="noopener noreferrer"
            className="rounded-md bg-gray-600 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700"
          >
            プレビュー
          </a>
          <a 
            href="/admin/events"
            className="rounded-md bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200"
          >
            キャンセル
          </a>
        </div>
      </div>

      <div className="rounded-lg bg-white shadow">
        <Form method="post" className="space-y-6 p-6">
          {actionData?.errors?.form && (
            <div className="rounded-md bg-red-50 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg
                    className="h-5 w-5 text-red-400"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">
                    {actionData.errors.form}
                  </h3>
                </div>
              </div>
            </div>
          )}

          <div className="grid gap-6 md:grid-cols-3">
            {/* メインコンテンツ */}
            <div className="md:col-span-2 space-y-6">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                  イベントタイトル
                </label>
                <div className="mt-1">
                  <input
                    type="text"
                    name="title"
                    id="title"
                    required
                    defaultValue={event.title}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  />
                </div>
                {actionData?.errors?.title && (
                  <p className="mt-2 text-sm text-red-600">{actionData.errors.title}</p>
                )}
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">
                    開始日時
                  </label>
                  <div className="mt-1">
                    <input
                      type="datetime-local"
                      name="startDate"
                      id="startDate"
                      required
                      defaultValue={formatDateForInput(event.startDate)}
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    />
                  </div>
                  {actionData?.errors?.startDate && (
                    <p className="mt-2 text-sm text-red-600">{actionData.errors.startDate}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="endDate" className="block text-sm font-medium text-gray-700">
                    終了日時（任意）
                  </label>
                  <div className="mt-1">
                    <input
                      type="datetime-local"
                      name="endDate"
                      id="endDate"
                      defaultValue={formatDateForInput(event.endDate)}
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label htmlFor="location" className="block text-sm font-medium text-gray-700">
                  開催場所
                </label>
                <div className="mt-1">
                  <input
                    type="text"
                    name="location"
                    id="location"
                    defaultValue={event.location || ""}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    placeholder="例：東京都渋谷区○○ XXXホール"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="content" className="block text-sm font-medium text-gray-700">
                  イベント詳細
                </label>
                <div className="mt-1">
                  <textarea
                    id="content"
                    name="content"
                    rows={10}
                    required
                    defaultValue={event.content}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  />
                </div>
                {actionData?.errors?.content && (
                  <p className="mt-2 text-sm text-red-600">{actionData.errors.content}</p>
                )}
              </div>

              <div>
                <label htmlFor="excerpt" className="block text-sm font-medium text-gray-700">
                  概要（抜粋）
                </label>
                <div className="mt-1">
                  <textarea
                    id="excerpt"
                    name="excerpt"
                    rows={3}
                    defaultValue={event.excerpt || ""}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    placeholder="イベントの簡単な説明（一覧ページなどに表示されます）"
                  />
                </div>
              </div>
            </div>

            {/* サイドバー */}
            <div className="space-y-6">
              <div className="rounded-md border border-gray-200 bg-white p-4 shadow-sm">
                <h3 className="text-lg font-medium text-gray-900">公開設定</h3>
                <div className="mt-4 space-y-4">
                  <div className="flex items-center">
                    <input
                      id="status-draft"
                      name="status"
                      type="radio"
                      value="DRAFT"
                      defaultChecked={event.status === "DRAFT"}
                      onChange={() => setShowScheduleOptions(false)}
                      className="h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <label htmlFor="status-draft" className="ml-3 block text-sm font-medium text-gray-700">
                      下書き
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      id="status-published"
                      name="status"
                      type="radio"
                      value="PUBLISHED"
                      defaultChecked={event.status === "PUBLISHED"}
                      onChange={() => setShowScheduleOptions(false)}
                      className="h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <label htmlFor="status-published" className="ml-3 block text-sm font-medium text-gray-700">
                      公開
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      id="status-scheduled"
                      name="status"
                      type="radio"
                      value="SCHEDULED"
                      defaultChecked={event.status === "SCHEDULED"}
                      onChange={() => setShowScheduleOptions(true)}
                      className="h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <label htmlFor="status-scheduled" className="ml-3 block text-sm font-medium text-gray-700">
                      公開予定
                    </label>
                  </div>
                  
                  {showScheduleOptions && (
                    <div className="mt-3 rounded border border-gray-200 bg-gray-50 p-3">
                      <label htmlFor="publishDate" className="block text-sm font-medium text-gray-700">
                        公開日時
                      </label>
                      <input
                        type="datetime-local"
                        id="publishDate"
                        name="publishDate"
                        defaultValue={event.publishedAt ? new Date(event.publishedAt).toISOString().slice(0, 16) : ""}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                      />
                    </div>
                  )}
                </div>
                
                <div className="mt-5 border-t border-gray-200 pt-5">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`w-full rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                      isSubmitting ? "opacity-75" : ""
                    }`}
                  >
                    {isSubmitting ? "保存中..." : "保存"}
                  </button>
                </div>
              </div>

              <div className="rounded-md border border-gray-200 bg-white p-4 shadow-sm">
                <h3 className="text-lg font-medium text-gray-900">カテゴリ</h3>
                <div className="mt-4 space-y-3 max-h-40 overflow-y-auto">
                  {categories.map((category) => (
                    <div key={category.id} className="flex items-start">
                      <div className="flex h-5 items-center">
                        <input
                          id={`category-${category.id}`}
                          name="categories"
                          type="checkbox"
                          value={category.id}
                          defaultChecked={event.categories?.some(c => c.id === category.id)}
                          className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                      </div>
                      <div className="ml-3 text-sm">
                        <label htmlFor={`category-${category.id}`} className="font-medium text-gray-700">
                          {category.name}
                        </label>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-md border border-gray-200 bg-white p-4 shadow-sm">
                <h3 className="text-lg font-medium text-gray-900">タグ</h3>
                <div className="mt-4 space-y-3 max-h-40 overflow-y-auto">
                  {tags.map((tag) => (
                    <div key={tag.id} className="flex items-start">
                      <div className="flex h-5 items-center">
                        <input
                          id={`tag-${tag.id}`}
                          name="tags"
                          type="checkbox"
                          value={tag.id}
                          defaultChecked={event.tags?.some(t => t.id === tag.id)}
                          className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                      </div>
                      <div className="ml-3 text-sm">
                        <label htmlFor={`tag-${tag.id}`} className="font-medium text-gray-700">
                          {tag.name}
                        </label>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-md border border-gray-200 bg-white p-4 shadow-sm">
                <h3 className="text-lg font-medium text-gray-900">アイキャッチ画像</h3>
                <div className="mt-2">
                  {event.featuredImage ? (
                    <div className="mb-3">
                      <img
                        src={event.featuredImage}
                        alt="アイキャッチ画像"
                        className="h-40 w-full rounded-md object-cover"
                      />
                    </div>
                  ) : (
                    <div className="flex h-40 w-full items-center justify-center rounded-md bg-gray-100 text-gray-400">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-12 w-12"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                    </div>
                  )}
                  <div className="mt-2">
                    <label htmlFor="featuredImage" className="block text-sm font-medium text-gray-700">
                      画像URL
                    </label>
                    <input
                      type="text"
                      name="featuredImage"
                      id="featuredImage"
                      defaultValue={event.featuredImage || ""}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      または <a href="/admin/media" className="text-blue-600 hover:underline">メディア</a> から選択
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Form>
      </div>
    </div>
  );
}