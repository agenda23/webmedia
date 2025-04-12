import { json, redirect } from "@remix-run/node";
import type { LoaderFunctionArgs, ActionFunctionArgs, MetaFunction } from "@remix-run/node";
import { Link, useLoaderData, useActionData, Form, useSubmit } from "@remix-run/react";
import { requireEditor } from "~/utils/session.server";
import { getTags, createTag, updateTag, deleteTag } from "~/models/tag.server";
import { generateSlug } from "~/utils/helpers";

export const meta: MetaFunction = () => {
  return [
    { title: "タグ管理 | 管理画面" },
    { name: "robots", content: "noindex" },
  ];
};

export async function loader({ request }: LoaderFunctionArgs) {
  await requireEditor(request);
  
  const tags = await getTags();
  
  return json({ tags });
}

export async function action({ request }: ActionFunctionArgs) {
  await requireEditor(request);
  
  const formData = await request.formData();
  const action = formData.get("_action") as string;

  if (action === "create") {
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

    await createTag({
      name,
      slug,
      description,
    });

    return redirect("/admin/tags");
  }

  if (action === "update") {
    const id = formData.get("id") as string;
    const name = formData.get("name") as string;
    const slug = formData.get("slug") as string || generateSlug(name);
    const description = formData.get("description") as string || "";

    // バリデーション
    const errors: Record<string, string> = {};
    if (!id) {
      errors.id = "タグIDが必要です";
    }
    if (!name || name.trim() === "") {
      errors.name = "タグ名を入力してください";
    }

    if (Object.keys(errors).length > 0) {
      return json({ errors, values: { id, name, slug, description } });
    }

    await updateTag(id, {
      name,
      slug,
      description,
    });

    return redirect("/admin/tags");
  }

  if (action === "delete") {
    const id = formData.get("id") as string;
    
    if (!id) {
      return json({ error: "タグIDが必要です" }, { status: 400 });
    }

    await deleteTag(id);
    return redirect("/admin/tags");
  }

  return json({ error: "無効なアクションです" }, { status: 400 });
}

export default function AdminTags() {
  const { tags } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const submit = useSubmit();
  
  const handleDelete = (id: string, name: string) => {
    if (window.confirm(`タグ「${name}」を削除してもよろしいですか？このタグを使用している記事やイベントからもタグが削除されます。`)) {
      const formData = new FormData();
      formData.append("_action", "delete");
      formData.append("id", id);
      submit(formData, { method: "post" });
    }
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <header className="mb-8">
        <h1 className="mb-4 text-2xl font-bold">タグ管理</h1>
        <p className="text-gray-600">記事やイベントに付けるタグを管理します。</p>
      </header>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* タグ作成フォーム */}
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-xl font-semibold">新規タグ作成</h2>
          <Form method="post" className="space-y-4">
            <input type="hidden" name="_action" value="create" />
            
            <div>
              <label htmlFor="name" className="mb-1 block text-sm font-medium text-gray-700">
                タグ名 *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                className={`w-full rounded-lg border ${
                  actionData?.errors?.name && actionData._action === "create" 
                    ? "border-red-500" 
                    : "border-gray-300"
                } p-2`}
                defaultValue={actionData?.values?.name || ""}
              />
              {actionData?.errors?.name && actionData._action === "create" && (
                <p className="mt-1 text-sm text-red-500">{actionData.errors.name}</p>
              )}
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
                defaultValue={actionData?.values?.slug || ""}
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
                defaultValue={actionData?.values?.description || ""}
              ></textarea>
            </div>
            
            <div>
              <button
                type="submit"
                className="rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-700"
              >
                タグを作成
              </button>
            </div>
          </Form>
        </div>
        
        {/* タグ一覧 */}
        <div>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold">タグ一覧</h2>
            <span className="rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-700">
              全 {tags.length} 件
            </span>
          </div>
          
          {tags.length > 0 ? (
            <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
              <ul className="divide-y divide-gray-200">
                {tags.map((tag) => (
                  <li key={tag.id} className="p-4 hover:bg-gray-50">
                    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                      <div>
                        <h3 className="font-semibold">{tag.name}</h3>
                        <p className="text-sm text-gray-500">/{tag.slug}</p>
                        {tag.description && (
                          <p className="mt-1 text-sm text-gray-600">{tag.description}</p>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Link
                          to={`/admin/tags/${tag.id}`}
                          className="rounded bg-gray-100 px-3 py-1 text-sm font-medium text-gray-700 hover:bg-gray-200"
                        >
                          編集
                        </Link>
                        <button
                          onClick={() => handleDelete(tag.id, tag.name)}
                          className="rounded bg-red-100 px-3 py-1 text-sm font-medium text-red-700 hover:bg-red-200"
                        >
                          削除
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <div className="rounded-lg border border-gray-200 bg-white p-8 text-center shadow-sm">
              <p className="text-gray-600">タグがまだありません。</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
