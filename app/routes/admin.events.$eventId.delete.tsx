import { redirect } from "@remix-run/node";
import type { ActionFunctionArgs } from "@remix-run/node";
import { deleteEvent } from "~/models/event.server";
import { requireEditor } from "~/utils/session.server";

export async function action({ params, request }: ActionFunctionArgs) {
  const user = await requireEditor(request);
  
  const eventId = params.eventId;
  
  if (!eventId) {
    throw new Response("Event ID is required", { status: 400 });
  }
  
  try {
    await deleteEvent(eventId);
    return redirect("/admin/events");
  } catch (error) {
    // エラーハンドリング
    console.error("Error deleting event:", error);
    throw new Response("イベントの削除中にエラーが発生しました", { status: 500 });
  }
}

// 必要な場合はここにローダー関数を追加

export default function DeleteEvent() {
  // このコンポーネントは通常表示されない
  // action 関数がリダイレクトを返すため
  return <div>削除中...</div>;
}
