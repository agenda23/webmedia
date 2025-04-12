import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import type { LoaderFunctionArgs } from "@remix-run/node";
import { getPosts } from "~/models/post.server";
import { getEvents } from "~/models/event.server";
import { getAllUsers } from "~/models/user.server";
import { formatDate } from "~/utils/helpers";

export const handle = {
  title: "ダッシュボード",
};

export async function loader({ request }: LoaderFunctionArgs) {
  const [postsData, eventsData, users] = await Promise.all([
    getPosts({ limit: 5 }),
    getEvents({ limit: 5 }),
    getAllUsers(),
  ]);

  return json({
    recentPosts: postsData.posts,
    totalPosts: postsData.totalCount,
    upcomingEvents: eventsData.events,
    totalEvents: eventsData.totalCount,
    users,
  });
}

export default function AdminDashboard() {
  const { recentPosts, totalPosts, upcomingEvents, totalEvents, users } = useLoaderData<typeof loader>();

  return (
    <div>
      {/* 統計カード */}
      <div className="mb-8 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg bg-white p-6 shadow-sm">
          <div className="flex items-center">
            <div className="mr-4 rounded-full bg-blue-100 p-3">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-blue-500"
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
            </div>
            <div>
              <p className="text-sm text-gray-500">記事数</p>
              <p className="text-2xl font-bold text-gray-800">{totalPosts}</p>
            </div>
          </div>
        </div>

        <div className="rounded-lg bg-white p-6 shadow-sm">
          <div className="flex items-center">
            <div className="mr-4 rounded-full bg-green-100 p-3">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-green-500"
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
            </div>
            <div>
              <p className="text-sm text-gray-500">イベント数</p>
              <p className="text-2xl font-bold text-gray-800">{totalEvents}</p>
            </div>
          </div>
        </div>

        <div className="rounded-lg bg-white p-6 shadow-sm">
          <div className="flex items-center">
            <div className="mr-4 rounded-full bg-purple-100 p-3">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-purple-500"
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
            </div>
            <div>
              <p className="text-sm text-gray-500">ユーザー数</p>
              <p className="text-2xl font-bold text-gray-800">{users.length}</p>
            </div>
          </div>
        </div>

        <div className="rounded-lg bg-white p-6 shadow-sm">
          <div className="flex items-center">
            <div className="mr-4 rounded-full bg-yellow-100 p-3">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-yellow-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                />
              </svg>
            </div>
            <div>
              <p className="text-sm text-gray-500">今月のPV</p>
              <p className="text-2xl font-bold text-gray-800">1,234</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* 最近の記事 */}
        <div className="rounded-lg bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-800">最近の記事</h3>
            <a
              href="/admin/posts"
              className="text-sm font-medium text-blue-600 hover:text-blue-800"
            >
              すべて表示
            </a>
          </div>
          <div className="space-y-4">
            {recentPosts.map((post) => (
              <div key={post.id} className="border-b border-gray-100 pb-3">
                <div className="flex items-start">
                  <div className="mr-4 mt-1 flex-shrink-0">
                    {post.featuredImage ? (
                      <img
                        src={post.featuredImage}
                        alt={post.title}
                        className="h-10 w-10 rounded object-cover"
                      />
                    ) : (
                      <div className="flex h-10 w-10 items-center justify-center rounded bg-gray-100 text-gray-500">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-6 w-6"
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
                  </div>
                  <div>
                    <a
                      href={`/admin/posts/${post.id}`}
                      className="font-medium text-gray-900 hover:text-blue-600"
                    >
                      {post.title}
                    </a>
                    <div className="mt-1 flex text-xs text-gray-500">
                      <span className="mr-2">
                        {formatDate(post.publishedAt || post.createdAt)}
                      </span>
                      <span>by {post.author.name || post.author.email}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 近日のイベント */}
        <div className="rounded-lg bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-800">近日のイベント</h3>
            <a
              href="/admin/events"
              className="text-sm font-medium text-blue-600 hover:text-blue-800"
            >
              すべて表示
            </a>
          </div>
          <div className="space-y-4">
            {upcomingEvents.map((event) => (
              <div key={event.id} className="border-b border-gray-100 pb-3">
                <div className="flex items-start">
                  <div className="mr-4 mt-1 flex-shrink-0">
                    {event.featuredImage ? (
                      <img
                        src={event.featuredImage}
                        alt={event.title}
                        className="h-10 w-10 rounded object-cover"
                      />
                    ) : (
                      <div className="flex h-10 w-10 items-center justify-center rounded bg-gray-100 text-gray-500">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-6 w-6"
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
                      </div>
                    )}
                  </div>
                  <div>
                    <a
                      href={`/admin/events/${event.id}`}
                      className="font-medium text-gray-900 hover:text-blue-600"
                    >
                      {event.title}
                    </a>
                    <div className="mt-1 text-xs text-gray-500">
                      <div>
                        <span className="font-medium text-blue-600">
                          {formatDate(event.startDate)}
                        </span>
                        {event.endDate && ` 〜 ${formatDate(event.endDate)}`}
                      </div>
                      {event.location && <div className="mt-1">{event.location}</div>}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* クイックアクセス */}
      <div className="mt-6 rounded-lg bg-white p-6 shadow-sm">
        <h3 className="mb-4 text-lg font-semibold text-gray-800">クイックアクション</h3>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <a
            href="/admin/posts/new"
            className="flex items-center rounded-lg border border-gray-200 p-4 hover:bg-gray-50"
          >
            <div className="mr-4 rounded-full bg-blue-100 p-2 text-blue-500">
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
                  d="M12 4v16m8-8H4"
                />
              </svg>
            </div>
            <div>
              <span className="font-medium text-gray-900">新規記事作成</span>
            </div>
          </a>

          <a
            href="/admin/events/new"
            className="flex items-center rounded-lg border border-gray-200 p-4 hover:bg-gray-50"
          >
            <div className="mr-4 rounded-full bg-green-100 p-2 text-green-500">
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
                  d="M12 4v16m8-8H4"
                />
              </svg>
            </div>
            <div>
              <span className="font-medium text-gray-900">新規イベント作成</span>
            </div>
          </a>

          <a
            href="/admin/media/upload"
            className="flex items-center rounded-lg border border-gray-200 p-4 hover:bg-gray-50"
          >
            <div className="mr-4 rounded-full bg-purple-100 p-2 text-purple-500">
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
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                />
              </svg>
            </div>
            <div>
              <span className="font-medium text-gray-900">メディアアップロード</span>
            </div>
          </a>

          <a
            href="/admin/settings"
            className="flex items-center rounded-lg border border-gray-200 p-4 hover:bg-gray-50"
          >
            <div className="mr-4 rounded-full bg-gray-100 p-2 text-gray-500">
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
                  d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
            </div>
            <div>
              <span className="font-medium text-gray-900">サイト設定</span>
            </div>
          </a>
        </div>
      </div>
    </div>
  );
}