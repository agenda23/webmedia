import { json } from "@remix-run/node";
import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { Link, useLoaderData, useSearchParams } from "@remix-run/react";
import { getCategoryBySlug } from "~/models/category.server";
import { getPosts } from "~/models/post.server";
import { getEvents } from "~/models/event.server";
import { formatDate } from "~/utils/helpers";
import invariant from "tiny-invariant";

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  if (!data || !data.category) {
    return [
      { title: "カテゴリーが見つかりません | 飲食店舗 Web メディアサイト" },
      { name: "description", content: "指定されたカテゴリーは見つかりませんでした。" },
    ];
  }

  return [
    { title: `${data.category.name} | 飲食店舗 Web メディアサイト` },
    { name: "description", content: `${data.category.name}に関連する記事やイベント情報です。` },
  ];
};

export async function loader({ params, request }: LoaderFunctionArgs) {
  const { slug } = params;
  invariant(slug, "Slug is required");

  const url = new URL(request.url);
  const page = parseInt(url.searchParams.get("page") || "1", 10);
  const limit = 6; // 1ページあたりの記事数
  const contentType = url.searchParams.get("type") || "posts"; // 'posts' または 'events'

  const category = await getCategoryBySlug(slug);

  if (!category) {
    throw new Response("カテゴリーが見つかりません", { status: 404 });
  }

  let posts = [];
  let events = [];
  let totalItems = 0;
  
  if (contentType === "posts") {
    const postsData = await getPosts({
      page,
      limit,
      category: slug,
    });
    posts = postsData.posts;
    totalItems = postsData.total;
  } else {
    const eventsData = await getEvents({
      page,
      limit,
      category: slug,
    });
    events = eventsData.events;
    totalItems = eventsData.total;
  }

  return json({
    category,
    posts,
    events,
    contentType,
    totalItems,
    totalPages: Math.ceil(totalItems / limit),
    currentPage: page,
  });
}

export default function CategoryDetail() {
  const { category, posts, events, contentType, totalPages, currentPage } = useLoaderData<typeof loader>();
  const [searchParams, setSearchParams] = useSearchParams();

  const handleContentTypeChange = (type: string) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set("type", type);
    newParams.set("page", "1"); // ページをリセット
    setSearchParams(newParams);
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <header className="mb-16 text-center">
        <h1 className="mb-4 text-4xl font-bold">{category.name}</h1>
        {category.description && (
          <p className="mx-auto max-w-2xl text-gray-600">{category.description}</p>
        )}
      </header>

      {/* タブ切り替え */}
      <div className="mb-12 flex justify-center">
        <div className="inline-flex rounded-full bg-gray-100 p-1">
          <button
            className={`rounded-full px-6 py-2 ${
              contentType === "posts"
                ? "bg-blue-600 text-white"
                : "bg-transparent text-gray-700 hover:bg-gray-200"
            }`}
            onClick={() => handleContentTypeChange("posts")}
          >
            記事
          </button>
          <button
            className={`rounded-full px-6 py-2 ${
              contentType === "events"
                ? "bg-blue-600 text-white"
                : "bg-transparent text-gray-700 hover:bg-gray-200"
            }`}
            onClick={() => handleContentTypeChange("events")}
          >
            イベント
          </button>
        </div>
      </div>

      {/* コンテンツ一覧 */}
      {contentType === "posts" ? (
        <>
          {posts.length > 0 ? (
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {posts.map((post) => (
                <div key={post.id} className="overflow-hidden rounded-lg bg-white shadow transition hover:shadow-md">
                  {post.featuredImage && (
                    <div className="aspect-w-16 aspect-h-9 w-full overflow-hidden">
                      <img
                        src={post.featuredImage}
                        alt={post.title}
                        className="h-48 w-full object-cover object-center"
                      />
                    </div>
                  )}
                  <div className="p-6">
                    <p className="mb-2 text-sm text-gray-500">{formatDate(post.publishedAt || post.createdAt)}</p>
                    <h3 className="mb-2 text-xl font-semibold">
                      <Link to={`/posts/${post.slug}`} className="hover:text-blue-600">
                        {post.title}
                      </Link>
                    </h3>
                    <p className="mb-4 text-gray-600">{post.excerpt}</p>
                    <div className="flex items-center">
                      <span className="mr-2 text-sm text-gray-600">by {post.author.name}</span>
                      <div className="flex flex-wrap gap-2">
                        {post.categories.map((postCategory) => (
                          <Link
                            key={postCategory.id}
                            to={`/categories/${postCategory.slug}`}
                            className={`text-xs text-blue-600 hover:underline ${
                              postCategory.id === category.id ? "font-bold" : ""
                            }`}
                          >
                            #{postCategory.name}
                          </Link>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-lg bg-gray-100 p-8 text-center">
              <p className="text-lg text-gray-600">
                このカテゴリーの記事はまだありません。
              </p>
              <Link to="/posts" className="mt-4 inline-block text-blue-600 hover:underline">
                すべての記事を表示
              </Link>
            </div>
          )}
        </>
      ) : (
        <>
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
                      {event.categories.map((eventCategory) => (
                        <Link
                          key={eventCategory.id}
                          to={`/categories/${eventCategory.slug}`}
                          className={`text-xs text-blue-600 hover:underline ${
                            eventCategory.id === category.id ? "font-bold" : ""
                          }`}
                        >
                          #{eventCategory.name}
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
                このカテゴリーのイベントはまだありません。
              </p>
              <Link to="/events" className="mt-4 inline-block text-blue-600 hover:underline">
                すべてのイベントを表示
              </Link>
            </div>
          )}
        </>
      )}

      {/* ページネーション */}
      {totalPages > 1 && (
        <div className="mt-12 flex justify-center">
          <div className="flex space-x-2">
            {currentPage > 1 && (
              <Link
                to={`/categories/${category.slug}?${new URLSearchParams({
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
                to={`/categories/${category.slug}?${new URLSearchParams({
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
                to={`/categories/${category.slug}?${new URLSearchParams({
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
