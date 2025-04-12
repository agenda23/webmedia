import { json } from "@remix-run/node";
import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { getPosts } from "~/models/post.server";
import { getEvents } from "~/models/event.server";
import { getSiteSettings } from "~/models/siteSettings.server";
import { formatDate } from "~/utils/helpers";

export const meta: MetaFunction = () => {
  return [
    { title: "飲食店舗 Web メディアサイト" },
    { name: "description", content: "飲食店舗の広報活動と情報発信のためのWebメディア" },
  ];
};

export async function loader({ request }: LoaderFunctionArgs) {
  const [latestPosts, upcomingEvents, siteSettings] = await Promise.all([
    getPosts({ limit: 3 }),
    getEvents({ limit: 3, upcoming: true }),
    getSiteSettings(),
  ]);

  // heroImageはSiteSettingsから取得するか、デフォルト値を使用
  const heroImage = "/images/hero-default.jpg"; // デフォルト値

  return json({
    posts: latestPosts.posts,
    events: upcomingEvents.events,
    heroImage,
  });
}

export default function Index() {
  const { posts, events, heroImage } = useLoaderData<typeof loader>();

  return (
    <div>
      {/* ヒーローセクション */}
      <section className="relative h-[70vh] min-h-[500px] bg-gray-900 text-white">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ 
            backgroundImage: `url(${heroImage})`,
            backgroundPosition: 'center',
            backgroundSize: 'cover',
            filter: 'brightness(0.7)'
          }}
        ></div>
        <div className="relative flex h-full items-center justify-start p-6 md:p-12">
          <div className="max-w-2xl">
            <h1 className="mb-6 text-4xl font-bold md:text-6xl">飲食店舗メディア</h1>
            <p className="mb-8 text-xl">
              飲食店舗の魅力と文化を発信するWebメディア。店舗の最新情報、イベント、コミュニティの活動をお届けします。
            </p>
            <div className="flex flex-wrap gap-4">
              <a
                href="/posts"
                className="rounded-full bg-white px-6 py-3 font-semibold text-gray-900 transition hover:bg-gray-100"
              >
                ブログを読む
              </a>
              <a
                href="/events"
                className="rounded-full border-2 border-white bg-transparent px-6 py-3 font-semibold text-white transition hover:bg-white/10"
              >
                イベント情報
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* 最新記事セクション */}
      <section className="py-16">
        <div className="mb-12 text-center">
          <h2 className="mb-4 text-3xl font-bold">最新記事</h2>
          <p className="mx-auto max-w-2xl text-gray-600">
            店舗の最新情報、イベントレポート、文化に関するコンテンツをお届けします。
          </p>
        </div>

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
                  <a href={`/posts/${post.slug}`} className="hover:text-blue-600">
                    {post.title}
                  </a>
                </h3>
                <p className="mb-4 text-gray-600">{post.excerpt}</p>
                <div className="flex items-center">
                  <span className="mr-2 text-sm text-gray-600">by {post.author.firstName} {post.author.lastName}</span>
                  <div className="flex flex-wrap gap-2">
                    {post.categories.map((category) => (
                      <a
                        key={category.id}
                        href={`/categories/${category.slug}`}
                        className="text-xs text-blue-600 hover:underline"
                      >
                        #{category.name}
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <a
            href="/posts"
            className="inline-block rounded-full border-2 border-gray-900 px-6 py-3 font-semibold text-gray-900 transition hover:bg-gray-900 hover:text-white"
          >
            すべての記事を見る
          </a>
        </div>
      </section>

      {/* イベントセクション */}
      <section className="bg-gray-100 py-16">
        <div className="container mx-auto px-4">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold">近日開催のイベント</h2>
            <p className="mx-auto max-w-2xl text-gray-600">
              店舗で開催される様々なイベント情報をご紹介します。
            </p>
          </div>

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
                    <a href={`/events/${event.slug}`} className="hover:text-blue-600">
                      {event.title}
                    </a>
                  </h3>
                  <p className="mb-4 text-gray-600">{event.description.substring(0, 100)}...</p>
                  {event.location && (
                    <p className="mb-4 text-sm text-gray-500">
                      <span className="mr-1 font-semibold">場所:</span> {event.location}
                    </p>
                  )}
                  <div className="flex flex-wrap gap-2">
                    {event.categories.map((category) => (
                      <a
                        key={category.id}
                        href={`/categories/${category.slug}`}
                        className="text-xs text-blue-600 hover:underline"
                      >
                        #{category.name}
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <a
              href="/events"
              className="inline-block rounded-full border-2 border-gray-900 px-6 py-3 font-semibold text-gray-900 transition hover:bg-gray-900 hover:text-white"
            >
              すべてのイベントを見る
            </a>
          </div>
        </div>
      </section>

      {/* 店舗紹介セクション */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid items-center gap-12 md:grid-cols-2">
            <div>
              <h2 className="mb-6 text-3xl font-bold">店舗紹介</h2>
              <p className="mb-6 text-lg text-gray-600">
                私たちの店舗は、単なる飲食店ではなく、文化の発信拠点として様々な活動を行っています。地域に根ざしたコミュニティづくりや、アート、音楽など、多様な要素を取り入れた空間をご提供しています。
              </p>
              <p className="mb-8 text-lg text-gray-600">
                店内では定期的にイベントやワークショップを開催し、お客様同士の交流の場としても親しまれています。
              </p>
              <a
                href="/about"
                className="inline-block rounded-full border-2 border-gray-900 px-6 py-3 font-semibold text-gray-900 transition hover:bg-gray-900 hover:text-white"
              >
                店舗について詳しく
              </a>
            </div>
            <div className="aspect-w-4 aspect-h-3 overflow-hidden rounded-lg shadow-lg">
              <img
                src="/images/store-image.jpg"
                alt="店舗の外観"
                className="h-full w-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* お問い合わせセクション */}
      <section className="bg-gray-900 py-16 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="mb-6 text-3xl font-bold">お問い合わせ</h2>
          <p className="mx-auto mb-8 max-w-2xl text-gray-300">
            取材依頼、イベント出演依頼、コラボレーション、その他のお問い合わせはこちらからお気軽にどうぞ。
          </p>
          <a
            href="/contact"
            className="inline-block rounded-full bg-white px-8 py-4 font-semibold text-gray-900 transition hover:bg-gray-100"
          >
            お問い合わせフォーム
          </a>
        </div>
      </section>
    </div>
  );
}