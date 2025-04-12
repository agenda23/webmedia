// admin.tsx - 管理画面のレイアウト
import { json, redirect } from "@remix-run/node";
import { Link, Outlet, useLoaderData, useLocation, useMatches } from "@remix-run/react";
import type { LoaderFunctionArgs } from "@remix-run/node";
import { requireEditor } from "~/utils/session.server";
import { getSettingValue } from "~/models/setting.server";

export async function loader({ request }: LoaderFunctionArgs) {
  // 編集者以上の権限を持つユーザーのみアクセス可能
  const user = await requireEditor(request);
  const siteName = await getSettingValue("site_name", "飲食店舗 Web メディアサイト");

  return json({
    user,
    siteName,
  });
}

export default function AdminLayout() {
  const { user, siteName } = useLoaderData<typeof loader>();
  const location = useLocation();
  const matches = useMatches();

  // 現在のパスが特定のナビゲーションリンクとマッチするか確認するヘルパー関数
  const isActiveLink = (path: string) => {
    return location.pathname.startsWith(path);
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* サイドバー */}
      <div className="w-64 bg-gray-800 text-white">
        <div className="p-4">
          <h1 className="text-xl font-bold">{siteName}</h1>
          <p className="mt-1 text-sm text-gray-400">管理画面</p>
        </div>
        <nav className="mt-6">
          <div className="px-4 py-2 text-xs font-semibold uppercase text-gray-400">
            コンテンツ管理
          </div>
          <Link
            to="/admin"
            className={`flex items-center px-4 py-3 ${
              location.pathname === "/admin" ? "bg-gray-900 text-white" : "text-gray-300 hover:bg-gray-700"
            }`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="mr-3 h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
              />
            </svg>
            ダッシュボード
          </Link>
          <Link
            to="/admin/posts"
            className={`flex items-center px-4 py-3 ${
              isActiveLink("/admin/posts") ? "bg-gray-900 text-white" : "text-gray-300 hover:bg-gray-700"
            }`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="mr-3 h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
              />
            </svg>
            記事管理
          </Link>
          <Link
            to="/admin/events"
            className={`flex items-center px-4 py-3 ${
              isActiveLink("/admin/events") ? "bg-gray-900 text-white" : "text-gray-300 hover:bg-gray-700"
            }`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="mr-3 h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            イベント管理
          </Link>
          <Link
            to="/admin/store"
            className={`flex items-center px-4 py-3 ${
              isActiveLink("/admin/store") ? "bg-gray-900 text-white" : "text-gray-300 hover:bg-gray-700"
            }`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="mr-3 h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
              />
            </svg>
            店舗情報管理
          </Link>
          <Link
            to="/admin/media"
            className={`flex items-center px-4 py-3 ${
              isActiveLink("/admin/media") ? "bg-gray-900 text-white" : "text-gray-300 hover:bg-gray-700"
            }`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="mr-3 h-5 w-5"
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
            メディア管理
          </Link>
          <Link
            to="/admin/comments"
            className={`flex items-center px-4 py-3 ${
              isActiveLink("/admin/comments") ? "bg-gray-900 text-white" : "text-gray-300 hover:bg-gray-700"
            }`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="mr-3 h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"
              />
            </svg>
            コメント管理
          </Link>

          <div className="mt-6 px-4 py-2 text-xs font-semibold uppercase text-gray-400">
            分類管理
          </div>
          <Link
            to="/admin/categories"
            className={`flex items-center px-4 py-3 ${
              isActiveLink("/admin/categories") ? "bg-gray-900 text-white" : "text-gray-300 hover:bg-gray-700"
            }`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="mr-3 h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
              />
            </svg>
            カテゴリ管理
          </Link>
          <Link
            to="/admin/tags"
            className={`flex items-center px-4 py-3 ${
              isActiveLink("/admin/tags") ? "bg-gray-900 text-white" : "text-gray-300 hover:bg-gray-700"
            }`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="mr-3 h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
              />
            </svg>
            タグ管理
          </Link>

          <div className="mt-6 px-4 py-2 text-xs font-semibold uppercase text-gray-400">
            システム
          </div>
          <Link
            to="/admin/users"
            className={`flex items-center px-4 py-3 ${
              isActiveLink("/admin/users") ? "bg-gray-900 text-white" : "text-gray-300 hover:bg-gray-700"
            }`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="mr-3 h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
              />
            </svg>
            ユーザー管理
          </Link>
          <Link
            to="/admin/settings"
            className={`flex items-center px-4 py-3 ${
              isActiveLink("/admin/settings") ? "bg-gray-900 text-white" : "text-gray-300 hover:bg-gray-700"
            }`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="mr-3 h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
            サイト設定
          </Link>
        </nav>

        <div className="absolute bottom-0 my-8 w-full px-4">
          <div className="flex flex-col">
            <div className="mb-2 flex items-center space-x-2">
              <div className="h-8 w-8 rounded-full bg-gray-300"></div>
              <div>
                <p className="text-sm font-semibold">
                  {user.name ? user.name : user.email}
                </p>
                <p className="text-xs text-gray-400">{user.role}</p>
              </div>
            </div>
            <div className="flex justify-between">
              <Link
                to="/admin/profile"
                className="rounded px-2 py-1 text-xs text-gray-300 hover:bg-gray-700"
              >
                プロフィール
              </Link>
              <form action="/logout" method="post">
                <button
                  type="submit"
                  className="rounded px-2 py-1 text-xs text-gray-300 hover:bg-gray-700"
                >
                  ログアウト
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* メインコンテンツ */}
      <div className="flex flex-1 flex-col overflow-auto">
        {/* ヘッダー */}
        <header className="bg-white p-4 shadow">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">
                {/* 現在のページタイトルを表示 */}
                {matches.length > 1 && matches[1].handle?.title ? matches[1].handle.title : "管理画面"}
              </h2>
            </div>
            <div className="flex items-center space-x-4">
              <Link to="/" className="text-sm text-gray-600 hover:text-gray-900">
                サイト表示
              </Link>
              <Link to="/admin/profile" className="text-sm text-gray-600 hover:text-gray-900">
                {user.name ? user.name : user.email}
              </Link>
            </div>
          </div>
        </header>

        {/* コンテンツエリア */}
        <main className="flex-1 overflow-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}