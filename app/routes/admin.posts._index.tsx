import { json } from "@remix-run/node";
import { Link, useLoaderData, useSearchParams } from "@remix-run/react";
import type { LoaderFunctionArgs } from "@remix-run/node";
import { getPosts } from "~/models/post.server";
import { formatDate } from "~/utils/helpers";

export const handle = {
  title: "記事管理",
};

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const page = parseInt(url.searchParams.get("page") || "1", 10);
  const limit = 10;
  const search = url.searchParams.get("search") || "";
  const statusParam = url.searchParams.get("status") || "";
  const categoryId = url.searchParams.get("category") || "";

  // ステータスパラメータをPrismaの期待する形式に変換
  let status;
  if (statusParam === "published") {
    status = ["PUBLISHED"];
  } else if (statusParam === "draft") {
    status = ["DRAFT"];
  } else if (statusParam === "scheduled") {
    status = ["SCHEDULED"];
  } else {
    // すべてのステータスを含める
    status = ["PUBLISHED", "DRAFT", "SCHEDULED"];
  }

  const { posts, totalCount } = await getPosts({
    page,
    limit,
    searchTerm: search,
    status,
    categoryId,
  });

  return json({
    posts,
    totalCount,
    page,
    limit,
    totalPages: Math.ceil(totalCount / limit),
  });
}

export default function PostsAdmin() {
  const { posts, totalCount, page, limit, totalPages } = useLoaderData<typeof loader>();
  const [searchParams, setSearchParams] = useSearchParams();

  function handlePageChange(newPage: number) {
    const params = new URLSearchParams(searchParams);
    params.set("page", newPage.toString());
    setSearchParams(params);
  }

  function handleSearch(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const search = formData.get("search")?.toString() || "";
    const status = formData.get("status")?.toString() || "";
    const category = formData.get("category")?.toString() || "";

    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (status) params.set("status", status);
    if (category) params.set("category", category);
    params.set("page", "1");
    setSearchParams(params);
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">記事管理</h1>
        <Link
          to="/admin/posts/new"
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          新規記事作成
        </Link>
      </div>

      {/* 検索フィルター */}
      <div className="mb-6 rounded-lg bg-white p-4 shadow-sm">
        <form onSubmit={handleSearch} className="flex flex-wrap items-end gap-4">
          <div className="flex-1">
            <label htmlFor="search" className="mb-1 block text-sm font-medium text-gray-700">
              キーワード検索
            </label>
            <input
              type="text"
              id="search"
              name="search"
              defaultValue={searchParams.get("search") || ""}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              placeholder="タイトルや内容で検索..."
            />
          </div>
          <div className="w-40">
            <label htmlFor="status" className="mb-1 block text-sm font-medium text-gray-700">
              ステータス
            </label>
            <select
              id="status"
              name="status"
              defaultValue={searchParams.get("status") || ""}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            >
              <option value="">すべて</option>
              <option value="published">公開済み</option>
              <option value="draft">下書き</option>
              <option value="scheduled">予約投稿</option>
            </select>
          </div>
          <div className="w-40">
            <label htmlFor="category" className="mb-1 block text-sm font-medium text-gray-700">
              カテゴリ
            </label>
            <select
              id="category"
              name="category"
              defaultValue={searchParams.get("category") || ""}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            >
              <option value="">すべて</option>
              {/* カテゴリリストは本来データベースから取得 */}
              <option value="1">ニュース</option>
              <option value="2">イベント</option>
              <option value="3">コラム</option>
            </select>
          </div>
          <div>
            <button
              type="submit"
              className="rounded-md bg-gray-800 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700"
            >
              検索
            </button>
          </div>
        </form>
      </div>

      {/* 記事リスト */}
      <div className="overflow-hidden rounded-lg bg-white shadow">
        <div className="min-w-full divide-y divide-gray-200">
          <div className="bg-gray-50">
            <div className="grid grid-cols-12 px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
              <div className="col-span-6">記事タイトル</div>
              <div className="col-span-2">ステータス</div>
              <div className="col-span-2">更新日</div>
              <div className="col-span-2">アクション</div>
            </div>
          </div>
          <div className="divide-y divide-gray-200 bg-white">
            {posts.length === 0 ? (
              <div className="px-6 py-4 text-center text-sm text-gray-500">記事が見つかりませんでした</div>
            ) : (
              posts.map((post) => (
                <div key={post.id} className="grid grid-cols-12 px-6 py-4">
                  <div className="col-span-6">
                    <div className="flex items-center">
                      {post.featuredImage ? (
                        <img
                          src={post.featuredImage}
                          alt=""
                          className="mr-3 h-10 w-10 rounded-md object-cover"
                        />
                      ) : (
                        <div className="mr-3 flex h-10 w-10 items-center justify-center rounded-md bg-gray-100">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-6 w-6 text-gray-400"
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
                      <div>
                        <div className="font-medium text-gray-900">
                          <Link to={`/admin/posts/${post.id}`}>{post.title}</Link>
                        </div>
                        <div className="mt-1 flex text-xs text-gray-500">
                          <span className="mr-2">By {post.author.name || post.author.email}</span>
                          <span>
                            {post.categories?.length > 0 && (
                              <>
                                {post.categories.map((category) => category.name).join(", ")}
                              </>
                            )}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="col-span-2 flex items-center">
                    {post.status === "published" ? (
                      <span className="inline-flex rounded-full bg-green-100 px-2 text-xs font-semibold leading-5 text-green-800">
                        公開中
                      </span>
                    ) : post.status === "scheduled" ? (
                      <span className="inline-flex rounded-full bg-blue-100 px-2 text-xs font-semibold leading-5 text-blue-800">
                        予約投稿
                      </span>
                    ) : (
                      <span className="inline-flex rounded-full bg-gray-100 px-2 text-xs font-semibold leading-5 text-gray-800">
                        下書き
                      </span>
                    )}
                  </div>
                  <div className="col-span-2 flex items-center text-sm text-gray-500">
                    {formatDate(post.updatedAt)}
                  </div>
                  <div className="col-span-2 flex items-center space-x-2">
                    <Link
                      to={`/admin/posts/${post.id}`}
                      className="rounded bg-gray-100 p-1 text-gray-600 hover:bg-gray-200"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                        />
                      </svg>
                    </Link>
                    <form method="post" action={`/admin/posts/${post.id}/delete`}>
                      <button
                        type="submit"
                        className="rounded bg-gray-100 p-1 text-gray-600 hover:bg-gray-200"
                        onClick={(e) => {
                          if (!confirm("この記事を削除してもよろしいですか？")) {
                            e.preventDefault();
                          }
                        }}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                      </button>
                    </form>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* ページネーション */}
      {totalPages > 1 && (
        <div className="mt-5 flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6">
          <div className="flex flex-1 justify-between sm:hidden">
            <button
              onClick={() => handlePageChange(Math.max(1, page - 1))}
              disabled={page === 1}
              className={`relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium ${
                page === 1
                  ? "cursor-not-allowed text-gray-300"
                  : "text-gray-700 hover:bg-gray-50"
              }`}
            >
              前へ
            </button>
            <button
              onClick={() => handlePageChange(Math.min(totalPages, page + 1))}
              disabled={page === totalPages}
              className={`relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium ${
                page === totalPages
                  ? "cursor-not-allowed text-gray-300"
                  : "text-gray-700 hover:bg-gray-50"
              }`}
            >
              次へ
            </button>
          </div>
          <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                <span className="font-medium">{totalCount}</span> 件中{" "}
                <span className="font-medium">{(page - 1) * limit + 1}</span> から{" "}
                <span className="font-medium">
                  {Math.min(page * limit, totalCount)}
                </span>{" "}
                件を表示
              </p>
            </div>
            <div>
              <nav
                className="isolate inline-flex -space-x-px rounded-md shadow-sm"
                aria-label="Pagination"
              >
                <button
                  onClick={() => handlePageChange(Math.max(1, page - 1))}
                  disabled={page === 1}
                  className={`relative inline-flex items-center rounded-l-md px-2 py-2 ${
                    page === 1
                      ? "cursor-not-allowed text-gray-300"
                      : "text-gray-400 hover:bg-gray-50"
                  }`}
                >
                  <span className="sr-only">前へ</span>
                  <svg
                    className="h-5 w-5"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
                {/* ページ番号ボタン */}
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  // 現在のページを中心に表示するため、表示するページ番号の開始位置を計算
                  let start = Math.max(1, page - 2);
                  if (page > totalPages - 2) {
                    start = Math.max(1, totalPages - 4);
                  }
                  const pageNum = start + i;
                  if (pageNum <= totalPages) {
                    return (
                      <button
                        key={pageNum}
                        onClick={() => handlePageChange(pageNum)}
                        className={`relative inline-flex items-center px-4 py-2 text-sm font-medium ${
                          page === pageNum
                            ? "z-10 bg-blue-50 border-blue-500 text-blue-600"
                            : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  }
                  return null;
                })}
                <button
                  onClick={() => handlePageChange(Math.min(totalPages, page + 1))}
                  disabled={page === totalPages}
                  className={`relative inline-flex items-center rounded-r-md px-2 py-2 ${
                    page === totalPages
                      ? "cursor-not-allowed text-gray-300"
                      : "text-gray-400 hover:bg-gray-50"
                  }`}
                >
                  <span className="sr-only">次へ</span>
                  <svg
                    className="h-5 w-5"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              </nav>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}