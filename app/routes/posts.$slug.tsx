import { json, redirect } from "@remix-run/node";
import type { LoaderFunctionArgs, MetaFunction, ActionFunctionArgs } from "@remix-run/node";
import { Link, useLoaderData, useActionData, Form } from "@remix-run/react";
import { getPostBySlug, getRelatedPosts } from "~/models/post.server";
import { getComments, createComment } from "~/models/comment.server";
import { formatDate } from "~/utils/helpers";
import invariant from "tiny-invariant";

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  if (!data || !data.post) {
    return [
      { title: "記事が見つかりません | 飲食店舗 Web メディアサイト" },
      { name: "description", content: "指定された記事は見つかりませんでした。" },
    ];
  }

  return [
    { title: `${data.post.title} | 飲食店舗 Web メディアサイト` },
    { name: "description", content: data.post.excerpt || `${data.post.title}に関する記事です。` },
    { property: "og:title", content: data.post.title },
    { property: "og:description", content: data.post.excerpt || `${data.post.title}に関する記事です。` },
    { property: "og:type", content: "article" },
    { property: "og:image", content: data.post.featuredImage || "/images/default-og-image.jpg" },
  ];
};

export async function loader({ params }: LoaderFunctionArgs) {
  const { slug } = params;
  invariant(slug, "Slug is required");

  const post = await getPostBySlug(slug);

  if (!post) {
    throw new Response("記事が見つかりません", { status: 404 });
  }

  const [comments, relatedPosts] = await Promise.all([
    getComments({ postId: post.id }),
    getRelatedPosts({ postId: post.id, categoryIds: post.categories.map(cat => cat.id), limit: 3 }),
  ]);

  return json({
    post,
    comments,
    relatedPosts,
  });
}

export async function action({ request, params }: ActionFunctionArgs) {
  const { slug } = params;
  invariant(slug, "Slug is required");

  const post = await getPostBySlug(slug);
  if (!post) {
    throw new Response("記事が見つかりません", { status: 404 });
  }

  const formData = await request.formData();
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const content = formData.get("content") as string;

  const errors: Record<string, string> = {};
  if (!name || name.trim() === "") {
    errors.name = "お名前を入力してください";
  }
  if (!email || email.trim() === "") {
    errors.email = "メールアドレスを入力してください";
  } else if (!/^\S+@\S+\.\S+$/.test(email)) {
    errors.email = "有効なメールアドレスを入力してください";
  }
  if (!content || content.trim() === "") {
    errors.content = "コメント内容を入力してください";
  }

  if (Object.keys(errors).length > 0) {
    return json({ errors, values: { name, email, content } });
  }

  // コメント作成処理
  await createComment({
    postId: post.id,
    name,
    email,
    content,
  });

  // コメント投稿後、同じページにリダイレクト（フォームをリセットするため）
  return redirect(`/posts/${slug}#comments`);
}

export default function PostDetail() {
  const { post, comments, relatedPosts } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-8">
        <Link to="/posts" className="text-blue-600 hover:underline">
          &larr; 記事一覧に戻る
        </Link>
      </div>

      <article className="mx-auto max-w-4xl">
        {/* 記事ヘッダー */}
        <header className="mb-12">
          <div className="mb-6 flex flex-wrap gap-2">
            {post.categories.map((category) => (
              <Link
                key={category.id}
                to={`/categories/${category.slug}`}
                className="rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-700 hover:bg-gray-200"
              >
                {category.name}
              </Link>
            ))}
          </div>
          <h1 className="mb-4 text-4xl font-bold lg:text-5xl">{post.title}</h1>
          
          <div className="mb-8 flex items-center gap-6">
            <div className="flex items-center">
              <div className="mr-3 h-10 w-10 overflow-hidden rounded-full bg-gray-200">
                {post.author.profileImage ? (
                  <img 
                    src={post.author.profileImage} 
                    alt={post.author.name} 
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-gray-500">
                    {post.author.name.charAt(0)}
                  </div>
                )}
              </div>
              <div>
                <p className="font-medium">{post.author.name}</p>
                <p className="text-sm text-gray-500">{formatDate(post.publishedAt || post.createdAt)}</p>
              </div>
            </div>
          </div>

          {post.featuredImage && (
            <div className="mb-8 overflow-hidden rounded-xl">
              <img
                src={post.featuredImage}
                alt={post.title}
                className="h-auto w-full object-cover"
              />
            </div>
          )}
        </header>

        {/* 記事本文 */}
        <div className="prose prose-lg mx-auto max-w-none">
          <div dangerouslySetInnerHTML={{ __html: post.content }} />
        </div>

        {/* タグ */}
        {post.tags && post.tags.length > 0 && (
          <div className="my-12 border-t border-b border-gray-200 py-6">
            <div className="flex flex-wrap gap-2">
              {post.tags.map((tag) => (
                <Link
                  key={tag.id}
                  to={`/posts?tag=${tag.slug}`}
                  className="rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-700 hover:bg-gray-200"
                >
                  #{tag.name}
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* SNS共有ボタン */}
        <div className="my-8 flex justify-center space-x-4">
          <a
            href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(
              typeof window !== "undefined" ? window.location.href : ""
            )}&text=${encodeURIComponent(post.title)}`}
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

      {/* コメントセクション */}
      <section id="comments" className="mx-auto mt-16 max-w-4xl">
        <h2 className="mb-8 text-2xl font-bold">コメント {comments.length > 0 ? `(${comments.length})` : ""}</h2>

        {comments.length > 0 ? (
          <div className="mb-12 space-y-6">
            {comments.map((comment) => (
              <div key={comment.id} className="rounded-lg border border-gray-200 p-6">
                <div className="mb-4 flex justify-between">
                  <div>
                    <h3 className="font-semibold">{comment.name}</h3>
                    <p className="text-sm text-gray-500">{formatDate(comment.createdAt)}</p>
                  </div>
                  {comment.isApproved === false && (
                    <span className="rounded-full bg-yellow-100 px-3 py-1 text-xs text-yellow-800">
                      承認待ち
                    </span>
                  )}
                </div>
                <p className="text-gray-700">{comment.content}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="mb-8 text-gray-600">まだコメントはありません。最初のコメントを残しましょう！</p>
        )}

        {/* コメントフォーム */}
        <div className="rounded-lg bg-gray-50 p-6">
          <h3 className="mb-4 text-xl font-semibold">コメントを投稿</h3>
          <Form method="post" action={`/posts/${post.slug}`}>
            <div className="mb-4">
              <label htmlFor="name" className="mb-2 block text-sm font-medium text-gray-700">
                お名前 *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                className={`w-full rounded-lg border ${
                  actionData?.errors?.name ? "border-red-500" : "border-gray-300"
                } p-3`}
                defaultValue={actionData?.values?.name || ""}
              />
              {actionData?.errors?.name && (
                <p className="mt-1 text-sm text-red-500">{actionData.errors.name}</p>
              )}
            </div>

            <div className="mb-4">
              <label htmlFor="email" className="mb-2 block text-sm font-medium text-gray-700">
                メールアドレス * (公開されません)
              </label>
              <input
                type="email"
                id="email"
                name="email"
                className={`w-full rounded-lg border ${
                  actionData?.errors?.email ? "border-red-500" : "border-gray-300"
                } p-3`}
                defaultValue={actionData?.values?.email || ""}
              />
              {actionData?.errors?.email && (
                <p className="mt-1 text-sm text-red-500">{actionData.errors.email}</p>
              )}
            </div>

            <div className="mb-4">
              <label htmlFor="content" className="mb-2 block text-sm font-medium text-gray-700">
                コメント *
              </label>
              <textarea
                id="content"
                name="content"
                rows={5}
                className={`w-full rounded-lg border ${
                  actionData?.errors?.content ? "border-red-500" : "border-gray-300"
                } p-3`}
                defaultValue={actionData?.values?.content || ""}
              ></textarea>
              {actionData?.errors?.content && (
                <p className="mt-1 text-sm text-red-500">{actionData.errors.content}</p>
              )}
            </div>

            <div className="mb-4 text-sm text-gray-600">
              <p>
                コメントは承認後に表示されます。メールアドレスは公開されません。
              </p>
            </div>

            <button
              type="submit"
              className="rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700"
            >
              コメントを投稿
            </button>
          </Form>
        </div>
      </section>

      {/* 関連記事 */}
      {relatedPosts.length > 0 && (
        <section className="mx-auto mt-16 max-w-4xl">
          <h2 className="mb-8 text-2xl font-bold">関連記事</h2>
          <div className="grid gap-8 md:grid-cols-3">
            {relatedPosts.map((relatedPost) => (
              <div key={relatedPost.id} className="overflow-hidden rounded-lg bg-white shadow transition hover:shadow-md">
                {relatedPost.featuredImage && (
                  <div className="aspect-w-16 aspect-h-9 w-full overflow-hidden">
                    <img
                      src={relatedPost.featuredImage}
                      alt={relatedPost.title}
                      className="h-48 w-full object-cover object-center"
                    />
                  </div>
                )}
                <div className="p-4">
                  <p className="mb-2 text-sm text-gray-500">
                    {formatDate(relatedPost.publishedAt || relatedPost.createdAt)}
                  </p>
                  <h3 className="mb-2 text-lg font-semibold">
                    <Link to={`/posts/${relatedPost.slug}`} className="hover:text-blue-600">
                      {relatedPost.title}
                    </Link>
                  </h3>
                  <p className="text-sm text-gray-600">{relatedPost.excerpt?.substring(0, 80)}...</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
