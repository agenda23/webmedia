import { json } from "@remix-run/node";
import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import { getEventBySlug, getRelatedEvents } from "~/models/event.server";
import { formatDate } from "~/utils/helpers";
import invariant from "tiny-invariant";

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  if (!data || !data.event) {
    return [
      { title: "イベントが見つかりません | 飲食店舗 Web メディアサイト" },
      { name: "description", content: "指定されたイベントは見つかりませんでした。" },
    ];
  }

  return [
    { title: `${data.event.title} | 飲食店舗 Web メディアサイト` },
    { name: "description", content: data.event.description?.substring(0, 160) || `${data.event.title}のイベント情報です。` },
    { property: "og:title", content: data.event.title },
    { property: "og:description", content: data.event.description?.substring(0, 160) || `${data.event.title}のイベント情報です。` },
    { property: "og:type", content: "event" },
    { property: "og:image", content: data.event.featuredImage || "/images/default-og-image.jpg" },
  ];
};

export async function loader({ params }: LoaderFunctionArgs) {
  const { slug } = params;
  invariant(slug, "Slug is required");

  const event = await getEventBySlug(slug);

  if (!event) {
    throw new Response("イベントが見つかりません", { status: 404 });
  }

  const relatedEvents = await getRelatedEvents({
    eventId: event.id,
    categoryIds: event.categories.map(cat => cat.id),
    limit: 3
  });

  return json({
    event,
    relatedEvents,
  });
}

export default function EventDetail() {
  const { event, relatedEvents } = useLoaderData<typeof loader>();

  // 開催日の表示フォーマット
  const eventDateDisplay = event.startDate === event.endDate || !event.endDate
    ? formatDate(event.startDate)
    : `${formatDate(event.startDate)} 〜 ${formatDate(event.endDate)}`;

  // 開催時間の表示フォーマット
  const eventTimeDisplay = event.startTime && event.endTime
    ? `${event.startTime} 〜 ${event.endTime}`
    : event.startTime || "";

  // カレンダーに追加するためのURLを作成
  const createGoogleCalendarUrl = () => {
    const startDate = new Date(event.startDate);
    const endDate = event.endDate ? new Date(event.endDate) : new Date(startDate);
    endDate.setDate(endDate.getDate() + 1);

    const startDateStr = startDate.toISOString().replace(/-|:|\.\d+/g, "");
    const endDateStr = endDate.toISOString().replace(/-|:|\.\d+/g, "");

    return `https://www.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(event.title)}&dates=${startDateStr}/${endDateStr}&details=${encodeURIComponent(event.description || "")}&location=${encodeURIComponent(event.location || "")}`;
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-8">
        <Link to="/events" className="text-blue-600 hover:underline">
          &larr; イベント一覧に戻る
        </Link>
      </div>

      <article className="mx-auto max-w-4xl">
        {/* イベントヘッダー */}
        <header className="mb-12">
          <div className="mb-6 flex flex-wrap gap-2">
            {event.categories.map((category) => (
              <Link
                key={category.id}
                to={`/categories/${category.slug}`}
                className="rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-700 hover:bg-gray-200"
              >
                {category.name}
              </Link>
            ))}
          </div>
          <h1 className="mb-4 text-4xl font-bold lg:text-5xl">{event.title}</h1>

          {event.featuredImage && (
            <div className="mb-8 overflow-hidden rounded-xl">
              <img
                src={event.featuredImage}
                alt={event.title}
                className="h-auto w-full object-cover"
              />
            </div>
          )}
        </header>

        {/* イベント詳細情報 */}
        <div className="mb-12 rounded-lg bg-gray-50 p-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <h2 className="mb-4 text-xl font-semibold">イベント情報</h2>
              <div className="space-y-3">
                <div>
                  <span className="font-semibold">日付:</span> {eventDateDisplay}
                </div>
                {eventTimeDisplay && (
                  <div>
                    <span className="font-semibold">時間:</span> {eventTimeDisplay}
                  </div>
                )}
                {event.location && (
                  <div>
                    <span className="font-semibold">場所:</span> {event.location}
                  </div>
                )}
                {event.price && (
                  <div>
                    <span className="font-semibold">料金:</span> {event.price}
                  </div>
                )}
                {event.capacity && (
                  <div>
                    <span className="font-semibold">定員:</span> {event.capacity}
                  </div>
                )}
              </div>
            </div>
            <div className="flex flex-col justify-center space-y-4">
              {event.reservationUrl && (
                <a
                  href={event.reservationUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-lg bg-blue-600 px-6 py-3 text-center font-semibold text-white transition hover:bg-blue-700"
                >
                  予約する
                </a>
              )}
              <a
                href={createGoogleCalendarUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-lg border border-gray-300 bg-white px-6 py-3 text-center font-semibold text-gray-700 transition hover:bg-gray-50"
              >
                カレンダーに追加
              </a>
            </div>
          </div>
        </div>

        {/* イベント説明 */}
        <div className="mb-12">
          <h2 className="mb-6 text-2xl font-bold">イベント内容</h2>
          <div className="prose prose-lg mx-auto max-w-none">
            <div dangerouslySetInnerHTML={{ __html: event.content || event.description || "" }} />
          </div>
        </div>

        {/* 注意事項など */}
        {event.notes && (
          <div className="mb-12">
            <h2 className="mb-4 text-2xl font-bold">注意事項</h2>
            <div className="rounded-lg bg-yellow-50 p-6 text-gray-700">
              <div dangerouslySetInnerHTML={{ __html: event.notes }} />
            </div>
          </div>
        )}

        {/* SNS共有ボタン */}
        <div className="my-8 flex justify-center space-x-4">
          <a
            href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(
              typeof window !== "undefined" ? window.location.href : ""
            )}&text=${encodeURIComponent(event.title)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full bg-[#1DA1F2] px-4 py-2 text-white hover:bg-opacity-90"
          >
            Twitter で共有
          </a>
          <a
            href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
              typeof window !== "undefined" ? window.location.href : ""
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full bg-[#4267B2] px-4 py-2 text-white hover:bg-opacity-90"
          >
            Facebook で共有
          </a>
        </div>
      </article>

      {/* 関連イベント */}
      {relatedEvents.length > 0 && (
        <section className="mx-auto mt-16 max-w-4xl">
          <h2 className="mb-8 text-2xl font-bold">関連イベント</h2>
          <div className="grid gap-8 md:grid-cols-3">
            {relatedEvents.map((relatedEvent) => (
              <div key={relatedEvent.id} className="overflow-hidden rounded-lg bg-white shadow transition hover:shadow-md">
                {relatedEvent.featuredImage && (
                  <div className="aspect-w-16 aspect-h-9 w-full overflow-hidden">
                    <img
                      src={relatedEvent.featuredImage}
                      alt={relatedEvent.title}
                      className="h-48 w-full object-cover object-center"
                    />
                  </div>
                )}
                <div className="p-4">
                  <p className="mb-2 text-sm font-semibold text-blue-600">
                    {formatDate(relatedEvent.startDate)}
                    {relatedEvent.endDate && ` 〜 ${formatDate(relatedEvent.endDate)}`}
                  </p>
                  <h3 className="mb-2 text-lg font-semibold">
                    <Link to={`/events/${relatedEvent.slug}`} className="hover:text-blue-600">
                      {relatedEvent.title}
                    </Link>
                  </h3>
                  <p className="text-sm text-gray-600">{relatedEvent.description?.substring(0, 80)}...</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
