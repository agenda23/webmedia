import { json } from "@remix-run/node";
import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { Link, useLoaderData, useSearchParams } from "@remix-run/react";
import { getPosts } from "~/models/post.server";
import { getCategories } from "~/models/category.server";
import { formatDate } from "~/utils/helpers";

export const meta: MetaFunction = () => {
  return [
    { title: "記事一覧 | 飲食店舗 Web メディアサイト" },
    { name: "description", content: "店舗の最新情報、イベントレポート、文化に関する記事一覧です。" },
  ];
};

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const page = parseInt(url.searchParams.get("page") || "1", 10);
  const limit = 9; // 1ページあたりの記事数
  const category = url.searchParams.get("category") || undefined;
  const tag = url.searchParams.get("tag") || undefined;
  const search = url.searchParams.get("q") || undefined;

  const [postsData, categoriesData] = await Promise.all([
    getPosts({ 
      page, 
      limit, 
      category, 
      tag,
      search 
    }),
    getCategories(),
  ]);

  return json({
    posts: postsData.posts,
    totalPosts: postsData.total,
    totalPages: Math.ceil(postsData.total / limit),
    currentPage: page,
    categories: categoriesData,
  });
}

export default function PostsIndex() {
  const { posts, totalPages, currentPage, categories } = useLoaderData<typeof loader>();
  const [searchParams] = useSearchParams();
  
  const currentCategory = searchParams.get("category");
  const currentTag = searchParams.get("tag");
  const currentSearch = searchParams.get("q");

  return (
    <div className="container mx-auto px-4 py-12">
      <header className="mb-16 text-center">
        <h1 className="mb-4 text-4xl font-bold">ブログ記事</h1>
        <p className="mx-auto max-w-2xl text-gray-600">
          店舗の最新情報、イベントレポート、文化に関するコンテンツをお届けします。
        </p>
      </header>

      {/* 検索フォーム */}
      <div className="mb-12">
        <form method="get" action="/posts" className="flex flex-col gap-4 md:flex-row">
          <input
            type="text"
            name="q"
            placeholder="記事を検索..."
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
          <button
            type="submit"
            className="rounded-lg bg-gray-900 px-6 py-2 font-semibold text-white hover:bg-gray-700"
          >
            検索
          </button>
        </form>
      </div>

      {/* フィルター情報の表示 */}
      {(currentCategory || currentTag || currentSearch) && (
        <div className="mb-8 rounded-lg bg-gray-100 p-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-semibold">フィルター:</span>
            {currentCategory && (
              <span className="rounded-full bg-blue-100 px-3 py-1 text-sm text-blue-800">
                カテゴリー: {currentCategory}
                <Link to={`/posts?${new URLSearchParams(
                  Object.fromEntries(
                    [...searchParams.entries()].filter(([key]) => key !== "category")
                  )
                )}`} className="ml-2 text-blue-500 hover:text-blue-700">
                  ×
                </Link>
              </span>
            )}
            {currentTag && (
              <span className="rounded-full bg-green-100 px-3 py-1 text-sm text-green-800">
                タグ: {currentTag}
                <Link to={`/posts?${new URLSearchParams(
                  Object.fromEntries(
                    [...searchParams.entries()].filter(([key]) => key !== "tag")
                  )
                )}`} className="ml-2 text-green-500 hover:text-green-700">
                  ×
                </Link>
              </span>
            )}
            {currentSearch && (
              <span className="rounded-full bg-purple-100 px-3 py-1 text-sm text-purple-800">
                検索: {currentSearch}
                <Link to={`/posts?${new URLSearchParams(
                  Object.fromEntries(
                    [...searchParams.entries()].filter(([key]) => key !== "q")
                  )
                )}`} className="ml-2 text-purple-500 hover:text-purple-700">
                  ×
                </Link>
              </span>
            )}
            <Link to="/posts" className="ml-auto text-sm text-gray-600 hover:text-gray-900">
              すべてクリア
            </Link>
          </div>
        </div>
      )}

      {/* 記事一覧 */}
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
                    {post.categories.map((category) => (
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
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-lg bg-gray-100 p-8 text-center">
          <p className="text-lg text-gray-600">
            該当する記事が見つかりませんでした。検索条件を変更してお試しください。
          </p>
          <Link to="/posts" className="mt-4 inline-block text-blue-600 hover:underline">
            すべての記事を表示
          </Link>
        </div>
      )}

      {/* ページネーション */}
      {totalPages > 1 && (
        <div className="mt-12 flex justify-center">
          <div className="flex space-x-2">
            {currentPage > 1 && (
              <Link
                to={`/posts?${new URLSearchParams({
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
                to={`/posts?${new URLSearchParams({
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
                to={`/posts?${new URLSearchParams({
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
