import { json } from "@remix-run/node";
import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import { getStoreInfo } from "~/models/store.server";

export const meta: MetaFunction = () => {
  return [
    { title: "店舗について | 飲食店舗 Web メディアサイト" },
    { name: "description", content: "私たちの店舗は、単なる飲食店ではなく、文化の発信拠点として様々な活動を行っています。" },
  ];
};

export async function loader({ request }: LoaderFunctionArgs) {
  const storeInfo = await getStoreInfo();
  
  return json({
    storeInfo,
  });
}

export default function About() {
  const { storeInfo } = useLoaderData<typeof loader>();

  return (
    <div className="container mx-auto px-4 py-12">
      <header className="mb-16 text-center">
        <h1 className="mb-4 text-4xl font-bold">店舗紹介</h1>
        <p className="mx-auto max-w-2xl text-gray-600">
          私たちの店舗は、単なる飲食店ではなく、文化の発信拠点として様々な活動を行っています。
        </p>
      </header>

      {/* メインビジュアル */}
      {storeInfo.featuredImage && (
        <div className="mb-16 overflow-hidden rounded-xl">
          <img
            src={storeInfo.featuredImage}
            alt={storeInfo.name}
            className="h-auto w-full object-cover"
          />
        </div>
      )}

      {/* 店舗コンセプト */}
      <section className="mb-16">
        <h2 className="mb-8 text-3xl font-bold">コンセプト</h2>
        <div className="prose prose-lg mx-auto max-w-none">
          <div dangerouslySetInnerHTML={{ __html: storeInfo.concept || "" }} />
        </div>
      </section>

      {/* 店舗情報 */}
      <section className="mb-16 rounded-lg bg-gray-50 p-8">
        <h2 className="mb-6 text-2xl font-bold">店舗情報</h2>
        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <dl className="space-y-4">
              <div>
                <dt className="font-semibold">店舗名</dt>
                <dd>{storeInfo.name}</dd>
              </div>
              <div>
                <dt className="font-semibold">住所</dt>
                <dd>
                  {storeInfo.address ? 
                    `〒${storeInfo.address.zipCode} ${storeInfo.address.prefecture}${storeInfo.address.city}${storeInfo.address.street}${storeInfo.address.building || ''}` : 
                    '住所情報なし'
                  }
                </dd>
              </div>
              <div>
                <dt className="font-semibold">電話番号</dt>
                <dd>{storeInfo.phone || "電話番号情報なし"}</dd>
              </div>
              <div>
                <dt className="font-semibold">営業時間</dt>
                <dd>
                  {Array.isArray(storeInfo.businessHours) ? (
                    <ul className="list-disc pl-5 space-y-1">
                      {storeInfo.businessHours.map((hours, index) => (
                        <li key={index}>
                          {hours.day}：{hours.isOpen ? 
                            `${hours.openTime || ''}～${hours.closeTime || ''}` : 
                            '休業日'}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    '営業時間情報なし'
                  )}
                </dd>
              </div>
              <div>
                <dt className="font-semibold">定休日</dt>
                <dd>
                  {Array.isArray(storeInfo.businessHours) ? 
                    storeInfo.businessHours
                      .filter(hours => !hours.isOpen)
                      .map(hours => hours.day)
                      .join('、') || '年中無休' 
                    : '定休日情報なし'
                  }
                </dd>
              </div>
              {storeInfo.accessInfo && (
                <div>
                  <dt className="font-semibold">アクセス</dt>
                  <dd>{storeInfo.accessInfo}</dd>
                </div>
              )}
            </dl>
          </div>
          <div>
            {storeInfo.mapEmbed && (
              <div className="h-full w-full min-h-[300px] rounded-lg overflow-hidden">
                <div dangerouslySetInnerHTML={{ __html: storeInfo.mapEmbed }} />
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 店舗ギャラリー */}
      {storeInfo.gallery && storeInfo.gallery.length > 0 && (
        <section className="mb-16">
          <h2 className="mb-8 text-2xl font-bold">店舗ギャラリー</h2>
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {storeInfo.gallery.map((image, index) => (
              <div key={index} className="aspect-w-1 aspect-h-1 overflow-hidden rounded-lg">
                <img
                  src={image.url}
                  alt={image.alt || `店舗画像 ${index + 1}`}
                  className="h-full w-full object-cover"
                />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* スタッフ紹介 */}
      {storeInfo.staff && storeInfo.staff.length > 0 && (
        <section className="mb-16">
          <h2 className="mb-8 text-2xl font-bold">スタッフ紹介</h2>
          <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {storeInfo.staff.map((staff) => (
              <div key={staff.id} className="overflow-hidden rounded-lg bg-white p-6 shadow">
                {staff.profileImage && (
                  <div className="mb-4 overflow-hidden rounded-full">
                    <img
                      src={staff.profileImage}
                      alt={staff.name}
                      className="h-40 w-40 object-cover mx-auto"
                    />
                  </div>
                )}
                <h3 className="mb-2 text-xl font-semibold text-center">{staff.name}</h3>
                {staff.position && (
                  <p className="mb-4 text-center text-gray-600">{staff.position}</p>
                )}
                {staff.bio && <p className="text-gray-700">{staff.bio}</p>}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 備考・詳細情報 */}
      {storeInfo.additionalInfo && (
        <section className="mb-16">
          <h2 className="mb-6 text-2xl font-bold">その他の情報</h2>
          <div className="prose prose-lg mx-auto">
            <div dangerouslySetInnerHTML={{ __html: storeInfo.additionalInfo }} />
          </div>
        </section>
      )}
      
      {/* コールトゥアクション */}
      <div className="flex flex-col items-center justify-center space-y-4 rounded-lg bg-gray-900 p-8 text-center text-white md:flex-row md:space-x-6 md:space-y-0">
        <p className="text-lg font-medium">
          お問い合わせやご予約はこちらから
        </p>
        <div className="flex space-x-4">
          <Link
            to="/contact"
            className="rounded-full bg-white px-6 py-2 font-semibold text-gray-900 transition hover:bg-gray-100"
          >
            お問い合わせ
          </Link>
          {storeInfo.reservationUrl && (
            <a
              href={storeInfo.reservationUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full border-2 border-white bg-transparent px-6 py-2 font-semibold text-white transition hover:bg-white/10"
            >
              ご予約
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
