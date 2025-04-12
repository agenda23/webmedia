import { json } from "@remix-run/node";
import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { Link, useLoaderData, useSearchParams } from "@remix-run/react";
import { getEvents } from "~/models/event.server";
import { getCategories } from "~/models/category.server";
import { formatDate } from "~/utils/helpers";

export const meta: MetaFunction = () => {
  return [
    { title: "イベント情報 | 飲食店舗 Web メディアサイト" },
    { name: "description", content: "店舗で開催される様々なイベント情報をご紹介します。" },
  ];
};

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const page = parseInt(url.searchParams.get("page") || "1", 10);
  const limit = 9; // 1ページあたりのイベント数
  const category = url.searchParams.get("category") || undefined;
  const upcoming = url.searchParams.get("upcoming") !== "false"; // デフォルトは今後のイベント
  const search = url.searchParams.get("q") || undefined;

  const [eventsData, categoriesData] = await Promise.all([
    getEvents({ 
      page, 
      limit, 
      category, 
      upcoming,
      search 
    }),
    getCategories(),
  ]);

  return json({
    events: eventsData.events,
    totalEvents: eventsData.total,
    totalPages: Math.ceil(eventsData.total / limit),
    currentPage: page,
    categories: categoriesData,
    isUpcoming: upcoming,
  });
}

export default function EventsIndex() {
  const { events, totalPages, currentPage, categories, isUpcoming } = useLoaderData<typeof loader>();
  const [searchParams, setSearchParams] = useSearchParams();

  const currentCategory = searchParams.get("category");
  const currentSearch = searchParams.get("q");

  const handleUpcomingToggle = (showUpcoming: boolean) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set("upcoming", showUpcoming ? "true" : "false");
    newParams.set("page", "1"); // ページをリセット
    setSearchParams(newParams);
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <header className="mb-16 text-center">
        <h1 className="mb-4 text-4xl font-bold">イベント情報</h1>
        <p className="mx-auto max-w-2xl text-gray-600">
          店舗で開催される様々なイベント情報をご紹介します。
        </p>
      </header>

      {/* 検索・フィルターエリア */}
      <div className="mb-12">
        <form method="get" action="/events" className="mb-6 flex flex-col gap-4 md:flex-row">
          <input
            type="text"
            name="q"
            placeholder="イベントを検索..."
            defaultValue={currentSearch || ""}
            className="flex-grow rounded-lg border border-gray-300 px-4 py-2"
          />
          <select
            name="category"
            className="rounded-lg border border-gray-300 px-4 py-2"
            defaultValue={currentCategory || ""}
          >
            <option value="">全てのカテゴリー</option>
            {categories.map((category) => (
              <option key={category.id} value={category.slug}>
                {category.name}
              </option>
            ))}
          </select>
          <input type="hidden" name="upcoming" value={isUpcoming ? "true" : "false"} />
          <button
            type="submit"
            className="rounded-lg bg-gray-900 px-6 py-2 font-semibold text-white hover:bg-gray-700"
          >
            検索
          </button>
        </form>

        {/* 過去/今後のイベント切り替え */}
        <div className="flex justify-center">
          <div className="mb-8 inline-flex rounded-full bg-gray-100 p-1">
            <button
              className={`rounded-full px-6 py-2 ${
                isUpcoming
                  ? "bg-blue-600 text-white"
                  : "bg-transparent text-gray-700 hover:bg-gray-200"
              }`}
              onClick={() => handleUpcomingToggle(true)}
            >
              今後のイベント
            </button>
            <button
              className={`rounded-full px-6 py-2 ${
                !isUpcoming
                  ? "bg-blue-600 text-white"
                  : "bg-transparent text-gray-700 hover:bg-gray-200"
              }`}
              onClick={() => handleUpcomingToggle(false)}
            >
              過去のイベント
            </button>
          </div>
        </div>
      </div>

      {/* フィルター情報の表示 */}
      {(currentCategory || currentSearch) && (
        <div className="mb-8 rounded-lg bg-gray-100 p-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-semibold">フィルター:</span>
            {currentCategory && (
              <span className="rounded-full bg-blue-100 px-3 py-1 text-sm text-blue-800">
                カテゴリー: {currentCategory}
                <Link to={`/events?${new URLSearchParams(
                  Object.fromEntries(
                    [...searchParams.entries()].filter(([key]) => key !== "category")
                  )
                )}`} className="ml-2 text-blue-500 hover:text-blue-700">
                  ×
                </Link>
              </span>
            )}
            {currentSearch && (
              <span className="rounded-full bg-purple-100 px-3 py-1 text-sm text-purple-800">
                検索: {currentSearch}
                <Link to={`/events?${new URLSearchParams(
                  Object.fromEntries(
                    [...searchParams.entries()].filter(([key]) => key !== "q")
                  )
                )}`} className="ml-2 text-purple-500 hover:text-purple-700">
                  ×
                </Link>
              </span>
            )}
            <Link to={`/events?upcoming=${isUpcoming ? "true" : "false"}`} className="ml-auto text-sm text-gray-600 hover:text-gray-900">
              フィルターをクリア
            </Link>
          </div>
        </div>
      )}

      {/* イベント一覧 */}
      {events.length > 0 ? (
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {events.map((event) => (
            <div key={event.id} className="overflow-hidden rounded-lg bg-white shadow transition hover:shadow-md">
              {event.featuredImage && (
                <div className="aspect-w-16 aspect-h-9 w-full overflow-hidden">
                  <img
                    src={event.featuredImage}
                    alt={event.title}
                    className="h-48 w-full object-cover object-center"
                  />
                </div>
              )}
              <div className="p-6">
                <p className="mb-2 text-sm font-semibold text-blue-600">
                  {formatDate(event.startDate)}
                  {event.endDate && ` 〜 ${formatDate(event.endDate)}`}
                </p>
                <h3 className="mb-2 text-xl font-semibold">
                  <Link to={`/events/${event.slug}`} className="hover:text-blue-600">
                    {event.title}
                  </Link>
                </h3>
                <p className="mb-4 text-gray-600">{event.description.substring(0, 100)}...</p>
                {event.location && (
                  <p className="mb-4 text-sm text-gray-500">
                    <span className="mr-1 font-semibold">場所:</span> {event.location}
                  </p>
                )}
                <div className="flex flex-wrap gap-2">
                  {event.categories.map((category) => (
                    <Link
                      key={category.id}
                      to={`/categories/${category.slug}`}
                      className="text-xs text-blue-600 hover:underline"
                    >
                      #{category.name}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-lg bg-gray-100 p-8 text-center">
          <p className="text-lg text-gray-600">
            該当するイベントが見つかりませんでした。検索条件を変更してお試しください。
          </p>
          <Link to="/events" className="mt-4 inline-block text-blue-600 hover:underline">
            すべてのイベントを表示
          </Link>
        </div>
      )}

      {/* ページネーション */}
      {totalPages > 1 && (
        <div className="mt-12 flex justify-center">
          <div className="flex space-x-2">
            {currentPage > 1 && (
              <Link
                to={`/events?${new URLSearchParams({
                  ...Object.fromEntries(searchParams.entries()),
                  page: String(currentPage - 1),
                })}`}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-300 text-gray-600 hover:bg-gray-100"
              >
                &laquo;
              </Link>
            )}

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <Link
                key={page}
                to={`/events?${new URLSearchParams({
                  ...Object.fromEntries(searchParams.entries()),
                  page: String(page),
                })}`}
                className={`flex h-10 w-10 items-center justify-center rounded-full border ${
                  currentPage === page
                    ? "border-blue-600 bg-blue-600 text-white"
                    : "border-gray-300 text-gray-600 hover:bg-gray-100"
                }`}
              >
                {page}
              </Link>
            ))}

            {currentPage < totalPages && (
              <Link
                to={`/events?${new URLSearchParams({
                  ...Object.fromEntries(searchParams.entries()),
                  page: String(currentPage + 1),
                })}`}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-300 text-gray-600 hover:bg-gray-100"
              >
                &raquo;
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
