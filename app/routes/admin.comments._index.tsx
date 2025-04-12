import { json } from "@remix-run/node";
import type { LoaderFunctionArgs, ActionFunctionArgs, MetaFunction } from "@remix-run/node";
import { Link, useLoaderData, useSearchParams, useSubmit, Form } from "@remix-run/react";
import { requireEditor } from "~/utils/session.server";
import { getComments, updateCommentStatus, deleteComment } from "~/models/comment.server";
import { formatDate } from "~/utils/helpers";

export const meta: MetaFunction = () => {
  return [
    { title: "コメント管理 | 管理画面" },
    { name: "robots", content: "noindex" },
  ];
};

export async function loader({ request }: LoaderFunctionArgs) {
  await requireEditor(request);
  
  const url = new URL(request.url);
  const page = parseInt(url.searchParams.get("page") || "1", 10);
  const limit = 20;
  const status = url.searchParams.get("status") || undefined;
  const search = url.searchParams.get("search") || undefined;
  const postId = url.searchParams.get("postId") || undefined;

  const commentsData = await getComments({
    page,
    limit,
    status,
    search,
    postId,
    includePost: true, // 関連投稿情報も取得
  });

  return json({
    comments: commentsData.comments,
    totalComments: commentsData.total,
    totalPages: Math.ceil(commentsData.total / limit),
    currentPage: page,
  });
}

export async function action({ request }: ActionFunctionArgs) {
  await requireEditor(request);
  
  const formData = await request.formData();
  const action = formData.get("_action") as string;
  const commentId = formData.get("commentId") as string;

  if (!commentId) {
    return json({ error: "コメントIDが指定されていません" }, { status: 400 });
  }

  switch (action) {
    case "approve":
      await updateCommentStatus(commentId, true);
      return json({ success: true, message: "コメントを承認しました" });

    case "unapprove":
      await updateCommentStatus(commentId, false);
      return json({ success: true, message: "コメントの承認を取り消しました" });

    case "delete":
      await deleteComment(commentId);
      return json({ success: true, message: "コメントを削除しました" });

    default:
      return json({ error: "無効なアクションです" }, { status: 400 });
  }
}

export default function AdminComments() {
  const { comments, totalComments, totalPages, currentPage } = useLoaderData<typeof loader>();
  const [searchParams] = useSearchParams();
  const submit = useSubmit();

  const handleStatusChange = (commentId: string, action: string) => {
    const formData = new FormData();
    formData.append("_action", action);
    formData.append("commentId", commentId);
    submit(formData, { method: "post" });
  };

  const handleDelete = (commentId: string) => {
    if (window.confirm("このコメントを削除してもよろしいですか？この操作は元に戻せません。")) {
      const formData = new FormData();
      formData.append("_action", "delete");
      formData.append("commentId", commentId);
      submit(formData, { method: "post" });
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <header className="mb-8">
        <h1 className="mb-4 text-2xl font-bold">コメント管理</h1>
        <p className="text-gray-600">
          全 {totalComments} 件のコメント 
          {searchParams.get("status") === "pending" && "（承認待ち）"} 
          {searchParams.get("status") === "approved" && "（承認済み）"}
        </p>
      </header>

      {/* 検索・フィルターエリア */}
      <div className="mb-8 rounded-lg bg-gray-50 p-4">
        <Form method="get" className="flex flex-col gap-4 md:flex-row">
          <div className="flex-grow">
            <input
              type="text"
              name="search"
              placeholder="コメントを検索..."
              defaultValue={searchParams.get("search") || ""}
              className="w-full rounded-lg border border-gray-300 px-4 py-2"
            />
          </div>

          <div>
            <select
              name="status"
              className="w-full rounded-lg border border-gray-300 px-4 py-2"
              defaultValue={searchParams.get("status") || ""}
            >
              <option value="">全てのステータス</option>
              <option value="pending">承認待ち</option>
              <option value="approved">承認済み</option>
            </select>
          </div>

          <div>
            <button
              type="submit"
              className="w-full rounded-lg bg-blue-600 px-6 py-2 font-semibold text-white hover:bg-blue-700 md:w-auto"
            >
              検索
            </button>
          </div>
        </Form>
      </div>

      {/* コメント一覧テーブル */}
      {comments.length > 0 ? (
        <div className="mb-8 overflow-auto rounded-lg border">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  コメント
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  投稿
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  日時
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  ステータス
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                  操作
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {comments.map((comment) => (
                <tr key={comment.id}>
                  <td className="whitespace-normal px-6 py-4">
                    <div>
                      <p className="font-medium">{comment.name}</p>
                      <p className="text-sm text-gray-500">{comment.email}</p>
                      <p className="mt-2 text-gray-800">{comment.content.length > 100 ? `${comment.content.substring(0, 100)}...` : comment.content}</p>
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    {comment.post ? (
                      <Link to={`/admin/posts/${comment.post.id}`} className="text-blue-600 hover:underline">
                        {comment.post.title}
                      </Link>
                    ) : (
                      "削除された投稿"
                    )}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                    {formatDate(comment.createdAt)}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    {comment.isApproved ? (
                      <span className="inline-flex rounded-full bg-green-100 px-2 py-1 text-xs font-semibold text-green-800">
                        承認済み
                      </span>
                    ) : (
                      <span className="inline-flex rounded-full bg-yellow-100 px-2 py-1 text-xs font-semibold text-yellow-800">
                        承認待ち
                      </span>
                    )}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                    <div className="flex justify-end space-x-2">
                      {comment.isApproved ? (
                        <button
                          onClick={() => handleStatusChange(comment.id, "unapprove")}
                          className="text-yellow-600 hover:text-yellow-800"
                        >
                          非承認
                        </button>
                      ) : (
                        <button
                          onClick={() => handleStatusChange(comment.id, "approve")}
                          className="text-green-600 hover:text-green-800"
                        >
                          承認
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(comment.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        削除
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="my-8 rounded-lg bg-gray-50 p-8 text-center">
          <p className="text-lg text-gray-600">
            {searchParams.get("search") || searchParams.get("status")
              ? "検索条件に一致するコメントがありません。"
              : "コメントがまだありません。"}
          </p>
          {(searchParams.get("search") || searchParams.get("status")) && (
            <Link to="/admin/comments" className="mt-4 inline-block text-blue-600 hover:underline">
              すべてのコメントを表示
            </Link>
          )}
        </div>
      )}

      {/* ページネーション */}
      {totalPages > 1 && (
        <div className="mt-8 flex justify-center">
          <div className="flex space-x-2">
            {currentPage > 1 && (
              <Link
                to={`/admin/comments?${new URLSearchParams({
                  ...Object.fromEntries(searchParams.entries()),
                  page: String(currentPage - 1),
                })}`}
                className="flex h-10 w-10 items-center justify-center rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-100"
              >
                &laquo;
              </Link>
            )}

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <Link
                key={page}
                to={`/admin/comments?${new URLSearchParams({
                  ...Object.fromEntries(searchParams.entries()),
                  page: String(page),
                })}`}
                className={`flex h-10 w-10 items-center justify-center rounded-lg border ${
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
                to={`/admin/comments?${new URLSearchParams({
                  ...Object.fromEntries(searchParams.entries()),
                  page: String(currentPage + 1),
                })}`}
                className="flex h-10 w-10 items-center justify-center rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-100"
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
