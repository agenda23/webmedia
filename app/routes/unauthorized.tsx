import { Link } from "@remix-run/react";
import type { MetaFunction } from "@remix-run/node";

export const meta: MetaFunction = () => {
  return [
    { title: "アクセス権限がありません | 飲食店舗 Web メディアサイト" },
    { name: "description", content: "このページへのアクセス権限がありません。" },
    { name: "robots", content: "noindex" },
  ];
};

export default function Unauthorized() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-4 py-16 text-center">
      <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-red-100">
        <svg
          className="h-12 w-12 text-red-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M12 15v2m0 0v2m0-2h2m-2 0H9m3-4V9m1.5-2.25a11 11 0 11-22 0 11 11 0 0122 0z"
          ></path>
        </svg>
      </div>
      <h1 className="mb-4 text-3xl font-bold text-gray-900 md:text-4xl">アクセス権限がありません</h1>
      <p className="mb-8 max-w-md text-gray-600">
        このページを表示する権限がありません。管理者にお問い合わせいただくか、適切な権限を持つアカウントでログインしてください。
      </p>
      <div className="flex flex-col gap-4 sm:flex-row">
        <Link
          to="/"
          className="rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-700"
        >
          トップページに戻る
        </Link>
        <Link
          to="/login"
          className="rounded-lg border border-gray-300 bg-white px-6 py-3 font-semibold text-gray-700 transition hover:bg-gray-100"
        >
          ログインページへ
        </Link>
      </div>
    </div>
  );
}
