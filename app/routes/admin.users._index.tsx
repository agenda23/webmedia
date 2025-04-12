import { json, redirect } from "@remix-run/node";
import type { LoaderFunctionArgs, ActionFunctionArgs, MetaFunction } from "@remix-run/node";
import { Link, useLoaderData, useActionData, Form, useSubmit } from "@remix-run/react";
import { requireAdmin } from "~/utils/session.server";
import { getUsers, createUser, updateUserRole, deleteUser } from "~/models/user.server";

export const meta: MetaFunction = () => {
  return [
    { title: "ユーザー管理 | 管理画面" },
    { name: "robots", content: "noindex" },
  ];
};

export async function loader({ request }: LoaderFunctionArgs) {
  const currentUser = await requireAdmin(request);
  
  const users = await getUsers();
  
  return json({ users, currentUser });
}

export async function action({ request }: ActionFunctionArgs) {
  const currentUser = await requireAdmin(request);
  
  const formData = await request.formData();
  const action = formData.get("_action") as string;

  if (action === "create") {
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const role = formData.get("role") as string;

    // バリデーション
    const errors: Record<string, string> = {};
    if (!name || name.trim() === "") {
      errors.name = "名前を入力してください";
    }
    if (!email || email.trim() === "") {
      errors.email = "メールアドレスを入力してください";
    } else if (!/^\S+@\S+\.\S+$/.test(email)) {
      errors.email = "有効なメールアドレスを入力してください";
    }
    if (!password || password.trim() === "") {
      errors.password = "パスワードを入力してください";
    } else if (password.length < 8) {
      errors.password = "パスワードは8文字以上にしてください";
    }
    if (!role || !["admin", "editor", "author"].includes(role)) {
      errors.role = "有効な権限を選択してください";
    }

    if (Object.keys(errors).length > 0) {
      return json({ errors, values: { name, email, role } });
    }

    try {
      await createUser({
        name,
        email,
        password,
        role,
      });
      return redirect("/admin/users");
    } catch (error: any) {
      if (error.message.includes("unique constraint")) {
        return json({ 
          errors: { email: "このメールアドレスは既に使用されています" },
          values: { name, email, role }
        });
      }
      return json({ 
        errors: { _form: "ユーザー作成中にエラーが発生しました" },
        values: { name, email, role }
      });
    }
  }

  if (action === "updateRole") {
    const userId = formData.get("userId") as string;
    const role = formData.get("role") as string;
    
    if (!userId) {
      return json({ error: "ユーザーIDが必要です" }, { status: 400 });
    }
    
    if (!role || !["admin", "editor", "author"].includes(role)) {
      return json({ error: "有効な権限を選択してください" }, { status: 400 });
    }
    
    // 自分自身の権限は変更できない
    if (userId === currentUser.id) {
      return json({ error: "自分自身の権限は変更できません" }, { status: 400 });
    }

    await updateUserRole(userId, role);
    return redirect("/admin/users");
  }

  if (action === "delete") {
    const userId = formData.get("userId") as string;
    
    if (!userId) {
      return json({ error: "ユーザーIDが必要です" }, { status: 400 });
    }
    
    // 自分自身は削除できない
    if (userId === currentUser.id) {
      return json({ error: "自分自身を削除することはできません" }, { status: 400 });
    }

    await deleteUser(userId);
    return redirect("/admin/users");
  }

  return json({ error: "無効なアクションです" }, { status: 400 });
}

export default function AdminUsers() {
  const { users, currentUser } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const submit = useSubmit();
  
  const handleRoleChange = (userId: string, role: string) => {
    if (userId === currentUser.id) {
      alert("自分自身の権限は変更できません");
      return;
    }
    
    const formData = new FormData();
    formData.append("_action", "updateRole");
    formData.append("userId", userId);
    formData.append("role", role);
    submit(formData, { method: "post" });
  };
  
  const handleDelete = (userId: string, name: string) => {
    if (userId === currentUser.id) {
      alert("自分自身を削除することはできません");
      return;
    }
    
    if (window.confirm(`ユーザー「${name}」を削除してもよろしいですか？この操作は元に戻せません。`)) {
      const formData = new FormData();
      formData.append("_action", "delete");
      formData.append("userId", userId);
      submit(formData, { method: "post" });
    }
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <header className="mb-8">
        <h1 className="mb-4 text-2xl font-bold">ユーザー管理</h1>
        <p className="text-gray-600">サイトの管理者、編集者、投稿者などのユーザーを管理します。</p>
      </header>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* ユーザー作成フォーム */}
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-xl font-semibold">新規ユーザー作成</h2>
          <Form method="post" className="space-y-4">
            <input type="hidden" name="_action" value="create" />
            
            <div>
              <label htmlFor="name" className="mb-1 block text-sm font-medium text-gray-700">
                名前 *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                className={`w-full rounded-lg border ${
                  actionData?.errors?.name ? "border-red-500" : "border-gray-300"
                } p-2`}
                defaultValue={actionData?.values?.name || ""}
              />
              {actionData?.errors?.name && (
                <p className="mt-1 text-sm text-red-500">{actionData.errors.name}</p>
              )}
            </div>
            
            <div>
              <label htmlFor="email" className="mb-1 block text-sm font-medium text-gray-700">
                メールアドレス *
              </label>
              <input
                type="email"
                id="email"
                name="email"
                className={`w-full rounded-lg border ${
                  actionData?.errors?.email ? "border-red-500" : "border-gray-300"
                } p-2`}
                defaultValue={actionData?.values?.email || ""}
              />
              {actionData?.errors?.email && (
                <p className="mt-1 text-sm text-red-500">{actionData.errors.email}</p>
              )}
            </div>
            
            <div>
              <label htmlFor="password" className="mb-1 block text-sm font-medium text-gray-700">
                パスワード *
              </label>
              <input
                type="password"
                id="password"
                name="password"
                className={`w-full rounded-lg border ${
                  actionData?.errors?.password ? "border-red-500" : "border-gray-300"
                } p-2`}
              />
              {actionData?.errors?.password ? (
                <p className="mt-1 text-sm text-red-500">{actionData.errors.password}</p>
              ) : (
                <p className="mt-1 text-xs text-gray-500">8文字以上のパスワードを設定してください。</p>
              )}
            </div>
            
            <div>
              <label htmlFor="role" className="mb-1 block text-sm font-medium text-gray-700">
                権限 *
              </label>
              <select
                id="role"
                name="role"
                className={`w-full rounded-lg border ${
                  actionData?.errors?.role ? "border-red-500" : "border-gray-300"
                } p-2`}
                defaultValue={actionData?.values?.role || "author"}
              >
                <option value="admin">管理者 - すべての管理機能にアクセス可能</option>
                <option value="editor">編集者 - コンテンツの作成・編集が可能</option>
                <option value="author">投稿者 - 自分の投稿のみ編集可能</option>
              </select>
              {actionData?.errors?.role && (
                <p className="mt-1 text-sm text-red-500">{actionData.errors.role}</p>
              )}
            </div>
            
            {actionData?.errors?._form && (
              <div className="rounded-md bg-red-50 p-4">
                <p className="text-sm text-red-500">{actionData.errors._form}</p>
              </div>
            )}
            
            <div>
              <button
                type="submit"
                className="rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-700"
              >
                ユーザーを作成
              </button>
            </div>
          </Form>
        </div>
        
        {/* ユーザー一覧 */}
        <div>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold">ユーザー一覧</h2>
            <span className="rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-700">
              全 {users.length} 件
            </span>
          </div>
          
          {users.length > 0 ? (
            <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
              <ul className="divide-y divide-gray-200">
                {users.map((user) => (
                  <li key={user.id} className={`p-4 ${user.id === currentUser.id ? 'bg-blue-50' : 'hover:bg-gray-50'}`}>
                    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                      <div>
                        <h3 className="font-semibold">{user.name || user.email}</h3>
                        <p className="text-sm text-gray-500">{user.email}</p>
                        <div className="mt-1">
                          <span 
                            className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                              user.role === 'admin' ? 'bg-purple-100 text-purple-800' :
                              user.role === 'editor' ? 'bg-green-100 text-green-800' :
                              'bg-blue-100 text-blue-800'
                            }`}
                          >
                            {user.role === 'admin' ? '管理者' : 
                             user.role === 'editor' ? '編集者' : '投稿者'}
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-col gap-2">
                        {/* 自分自身以外の場合のみ権限変更ドロップダウンを表示 */}
                        {user.id !== currentUser.id && (
                          <select
                            value={user.role}
                            onChange={(e) => handleRoleChange(user.id, e.target.value)}
                            className="w-full rounded border border-gray-300 p-1 text-sm"
                          >
                            <option value="admin">管理者</option>
                            <option value="editor">編集者</option>
                            <option value="author">投稿者</option>
                          </select>
                        )}
                        
                        {/* 自分自身以外の場合のみ削除ボタンを表示 */}
                        {user.id !== currentUser.id && (
                          <button
                            onClick={() => handleDelete(user.id, user.name || user.email)}
                            className="rounded bg-red-100 px-2 py-1 text-sm font-medium text-red-700 hover:bg-red-200"
                          >
                            削除
                          </button>
                        )}
                        
                        {/* 自分自身の場合はメッセージを表示 */}
                        {user.id === currentUser.id && (
                          <p className="text-center text-xs text-gray-500">現在のユーザー</p>
                        )}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <div className="rounded-lg border border-gray-200 bg-white p-8 text-center shadow-sm">
              <p className="text-gray-600">ユーザーがまだありません。</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
