import { json, redirect } from "@remix-run/node";
import type { LoaderFunctionArgs, ActionFunctionArgs, MetaFunction } from "@remix-run/node";
import { Link, useLoaderData, Form } from "@remix-run/react";
import { requireEditor } from "~/utils/session.server";
import { getTagById, updateTag } from "~/models/tag.server";
import { generateSlug } from "~/utils/helpers";
import invariant from "tiny-invariant";

export const meta: MetaFunction = () => {
  return [
    { title: "タグ編集 | 管理画面" },
    { name: "robots", content: "noindex" },
  ];
};

export async function loader({ params, request }: LoaderFunctionArgs) {
  await requireEditor(request);
  invariant(params.tagId, "タグIDが必要です");
  
  const tag = await getTagById(params.tagId);
  
  if (!tag) {
    throw new Response("タグが見つかりません", { status: 404 });
  }
  
  return json({ tag });
}

export async function action({ params, request }: ActionFunctionArgs) {
  await requireEditor(request);
  invariant(params.tagId, "タグIDが必要です");
  
  const formData = await request.formData();
  const name = formData.get("name") as string;
  const slug = formData.get("slug") as string || generateSlug(name);
  const description = formData.get("description") as string || "";

  // バリデーション
  const errors: Record<string, string> = {};
  if (!name || name.trim() === "") {
    errors.name = "タグ名を入力してください";
  }

  if (Object.keys(errors).length > 0) {
    return json({ errors, values: { name, slug, description } });
  }

  await updateTag(params.tagId, {
    name,
    slug,
    description,
  });

  return redirect("/admin/tags");
}

export default function EditTag() {
  const { tag } = useLoaderData<typeof loader>();
  
  return (
    <div className="container mx-auto px-4 py-8">
      <header className="mb-8">
        <h1 className="mb-4 text-2xl font-bold">タグ編集</h1>
        <div className="flex">
          <Link to="/admin/tags" className="text-blue-600 hover:underline">
            &larr; タグ一覧に戻る
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-2xl">
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <Form method="post" className="space-y-4">
            <div>
              <label htmlFor="name" className="mb-1 block text-sm font-medium text-gray-700">
                タグ名 *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                className="w-full rounded-lg border border-gray-300 p-2"
                defaultValue={tag.name}
                required
              />
            </div>
            
            <div>
              <label htmlFor="slug" className="mb-1 block text-sm font-medium text-gray-700">
                スラッグ（URL用、英数字）
              </label>
              <input
                type="text"
                id="slug"
                name="slug"
                className="w-full rounded-lg border border-gray-300 p-2"
                placeholder="空白の場合はタグ名から自動生成"
                defaultValue={tag.slug}
              />
              <p className="mt-1 text-xs text-gray-500">
                URLの一部として使用されます。空白の場合はタグ名から自動生成します。
              </p>
            </div>
            
            <div>
              <label htmlFor="description" className="mb-1 block text-sm font-medium text-gray-700">
                説明
              </label>
              <textarea
                id="description"
                name="description"
                rows={3}
                className="w-full rounded-lg border border-gray-300 p-2"
                defaultValue={tag.description || ""}
              ></textarea>
            </div>
            
            <div className="flex justify-end space-x-3">
              <Link 
                to="/admin/tags"
                className="rounded-lg border border-gray-300 bg-white px-4 py-2 font-semibold text-gray-700 hover:bg-gray-100"
              >
                キャンセル
              </Link>
              <button
                type="submit"
                className="rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-700"
              >
                保存する
              </button>
            </div>
          </Form>
        </div>
      </div>
    </div>
  );
}
