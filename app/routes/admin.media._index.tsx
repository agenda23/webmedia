import { useState } from "react";
import { json } from "@remix-run/node";
import { Link, useLoaderData, useSearchParams } from "@remix-run/react";
import type { LoaderFunctionArgs } from "@remix-run/node";
import { getMediaItems } from "~/models/media.server";
import { requireEditor } from "~/utils/session.server";
import { formatDate, formatFileSize } from "~/utils/helpers";

export const handle = {
  title: "メディア管理",
};

export async function loader({ request }: LoaderFunctionArgs) {
  await requireEditor(request);
  
  const url = new URL(request.url);
  const page = parseInt(url.searchParams.get("page") || "1", 10);
  const limit = 20;
  const search = url.searchParams.get("search") || "";
  const type = url.searchParams.get("type") || "";

  const { media, totalCount } = await getMediaItems({
    page,
    limit,
    searchTerm: search,
    type,
  });
  
  // 返却データの名前を変更（mediaとmediaItemsの整合性を取る）
  const mediaItems = media;

  return json({
    mediaItems,
    totalCount,
    page,
    limit,
    totalPages: Math.ceil(totalCount / limit),
  });
}

export default function MediaAdmin() {
  const { mediaItems, totalCount, page, limit, totalPages } = useLoaderData<typeof loader>();
  const [searchParams, setSearchParams] = useSearchParams();
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedMedia, setSelectedMedia] = useState<string | null>(null);

  function handlePageChange(newPage: number) {
    const params = new URLSearchParams(searchParams);
    params.set("page", newPage.toString());
    setSearchParams(params);
  }

  function handleSearch(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const search = formData.get("search")?.toString() || "";
    const type = formData.get("type")?.toString() || "";

    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (type) params.set("type", type);
    params.set("page", "1");
    setSearchParams(params);
  }

  function handleMediaSelect(id: string) {
    if (selectedMedia === id) {
      setSelectedMedia(null);
    } else {
      setSelectedMedia(id);
    }
  }

  // URLをクリップボードにコピーする関数
  function copyToClipboard(text: string) {
    navigator.clipboard.writeText(text)
      .then(() => {
        alert("URLをクリップボードにコピーしました");
      })
      .catch((err) => {
        console.error("クリップボードのコピーに失敗しました:", err);
      });
  }

  // ファイルタイプに基づいてアイコンを表示
  function getFileTypeIcon(fileType: string) {
    if (fileType.startsWith("image/")) {
      return (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5 text-blue-500"
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
      );
    } else if (fileType.startsWith("video/")) {
      return (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5 text-red-500"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
          />
        </svg>
      );
    } else if (fileType.startsWith("audio/")) {
      return (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5 text-green-500"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"
          />
        </svg>
      );
    } else if (
      fileType === "application/pdf" ||
      fileType === "application/msword" ||
      fileType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ) {
      return (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5 text-orange-500"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
          />
        </svg>
      );
    } else {
      return (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5 text-gray-500"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
          />
        </svg>
      );
    }
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">メディア管理</h1>
        <Link
          to="/admin/media/upload"
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          メディアをアップロード
        </Link>
      </div>

      {/* 検索フィルター */}
      <div className="mb-6 rounded-lg bg-white p-4 shadow-sm">
        <form onSubmit={handleSearch} className="flex flex-wrap items-end gap-4">
          <div className="flex-1">
            <label htmlFor="search" className="mb-1 block text-sm font-medium text-gray-700">
              検索
            </label>
            <input
              type="text"
              id="search"
              name="search"
              defaultValue={searchParams.get("search") || ""}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              placeholder="ファイル名で検索..."
            />
          </div>
          <div className="w-40">
            <label htmlFor="type" className="mb-1 block text-sm font-medium text-gray-700">
              ファイルタイプ
            </label>
            <select
              id="type"
              name="type"
              defaultValue={searchParams.get("type") || ""}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            >
              <option value="">すべて</option>
              <option value="image">画像</option>
              <option value="video">動画</option>
              <option value="audio">音声</option>
              <option value="document">ドキュメント</option>
              <option value="other">その他</option>
            </select>
          </div>
          <div className="flex space-x-2">
            <button
              type="submit"
              className="rounded-md bg-gray-800 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700"
            >
              検索
            </button>
            <div className="flex items-center border border-gray-300 rounded-md">
              <button
                type="button"
                onClick={() => setViewMode("grid")}
                className={`px-3 py-2 ${
                  viewMode === "grid"
                    ? "bg-gray-100 text-gray-800"
                    : "text-gray-500 hover:bg-gray-50"
                }`}
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
                    d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
                  />
                </svg>
              </button>
              <button
                type="button"
                onClick={() => setViewMode("list")}
                className={`px-3 py-2 ${
                  viewMode === "list"
                    ? "bg-gray-100 text-gray-800"
                    : "text-gray-500 hover:bg-gray-50"
                }`}
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
                    d="M4 6h16M4 10h16M4 14h16M4 18h16"
                  />
                </svg>
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* メディアコンテンツ */}
      <div className="bg-white rounded-lg shadow">
        {mediaItems.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            メディアが見つかりませんでした
          </div>
        ) : viewMode === "grid" ? (
          // グリッド表示
          <div className="p-4">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {mediaItems.map((media) => (
                <div
                  key={media.id}
                  className={`group rounded-lg border ${
                    selectedMedia === media.id
                      ? "border-blue-500 ring-2 ring-blue-500"
                      : "border-gray-200 hover:border-blue-300"
                  } overflow-hidden transition-all duration-200 cursor-pointer`}
                  onClick={() => handleMediaSelect(media.id)}
                >
                  <div className="aspect-square bg-gray-100 relative">
                    {media.fileType.startsWith("image/") ? (
                      <img
                        src={media.url}
                        alt={media.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        {getFileTypeIcon(media.fileType)}
                      </div>
                    )}
                    <div
                      className={`absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity ${
                        selectedMedia === media.id ? "opacity-100" : ""
                      }`}
                    >
                      <div className="flex space-x-2">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            copyToClipboard(media.url);
                          }}
                          className="rounded-full bg-white p-2 text-gray-700 hover:bg-blue-50 hover:text-blue-600"
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
                              d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"
                            />
                          </svg>
                        </button>
                        <Link
                          to={`/admin/media/${media.id}`}
                          onClick={(e) => e.stopPropagation()}
                          className="rounded-full bg-white p-2 text-gray-700 hover:bg-blue-50 hover:text-blue-600"
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
                      </div>
                    </div>
                  </div>
                  <div className="p-2">
                    <p className="text-sm font-medium text-gray-900 truncate" title={media.name}>
                      {media.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatFileSize(media.fileSize)} • {formatDate(media.createdAt)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          // リスト表示
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    ファイル
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    タイプ
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    サイズ
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    アップロード日
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    アクション
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {mediaItems.map((media) => (
                  <tr
                    key={media.id}
                    className={`hover:bg-gray-50 ${selectedMedia === media.id ? "bg-blue-50" : ""}`}
                    onClick={() => handleMediaSelect(media.id)}
                  >
                    <td className="whitespace-nowrap px-6 py-4">
                      <div className="flex items-center">
                        <div className="h-10 w-10 flex-shrink-0">
                          {media.fileType.startsWith("image/") ? (
                            <img
                              src={media.url}
                              alt={media.name}
                              className="h-10 w-10 rounded-md object-cover"
                            />
                          ) : (
                            <div className="flex h-10 w-10 items-center justify-center rounded-md bg-gray-100">
                              {getFileTypeIcon(media.fileType)}
                            </div>
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{media.name}</div>
                        </div>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <div className="text-sm text-gray-500">{media.fileType}</div>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <div className="text-sm text-gray-500">{formatFileSize(media.fileSize)}</div>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <div className="text-sm text-gray-500">{formatDate(media.createdAt)}</div>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <div className="flex space-x-2">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            copyToClipboard(media.url);
                          }}
                          className="rounded bg-gray-100 p-1 text-gray-600 hover:bg-blue-50 hover:text-blue-600"
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
                              d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"
                            />
                          </svg>
                        </button>
                        <Link
                          to={`/admin/media/${media.id}`}
                          onClick={(e) => e.stopPropagation()}
                          className="rounded bg-gray-100 p-1 text-gray-600 hover:bg-blue-50 hover:text-blue-600"
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
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
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