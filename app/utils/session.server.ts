import { createCookieSessionStorage, redirect } from "@remix-run/node";
import { getUserById } from "~/models/user.server";

// セッションストレージの作成
const sessionStorage = createCookieSessionStorage({
  cookie: {
    name: "__session",
    httpOnly: true,
    path: "/",
    sameSite: "lax",
    secrets: [process.env.SESSION_SECRET || "s3cr3t"],
    secure: process.env.NODE_ENV === "production",
  },
});

// セッションからユーザーIDを取得
export async function getUserId(request: Request) {
  const session = await getSession(request);
  const userId = session.get("userId");
  return userId;
}

// ユーザーがログインしているか確認
export async function requireUserId(
  request: Request,
  redirectTo: string = new URL(request.url).pathname
) {
  const userId = await getUserId(request);
  if (!userId) {
    const searchParams = new URLSearchParams([["redirectTo", redirectTo]]);
    throw redirect(`/login?${searchParams}`);
  }
  return userId;
}

// 管理者権限が必要なページ用の確認
export async function requireAdmin(request: Request) {
  const userId = await requireUserId(request);
  const user = await getUserById(userId);

  if (!user || (user.role !== "ADMIN" && user.role !== "admin")) {
    throw redirect("/unauthorized");
  }

  return user;
}

// 編集者以上の権限が必要なページ用の確認
export async function requireEditor(request: Request) {
  const userId = await requireUserId(request);
  const user = await getUserById(userId);

  if (!user || (
    (user.role !== "ADMIN" && user.role !== "admin") && 
    (user.role !== "EDITOR" && user.role !== "editor")
  )) {
    throw redirect("/unauthorized");
  }

  return user;
}

// リクエストからユーザー情報を取得
export async function getUser(request: Request) {
  const userId = await getUserId(request);
  if (userId === undefined) return null;

  const user = await getUserById(userId);
  if (user) return user;

  throw await logout(request);
}

// セッションの取得
export async function getSession(request: Request) {
  const cookie = request.headers.get("Cookie");
  return sessionStorage.getSession(cookie);
}

// ログイン処理
export async function createUserSession({
  request,
  userId,
  remember,
  redirectTo,
}: {
  request: Request;
  userId: string;
  remember: boolean;
  redirectTo: string;
}) {
  const session = await getSession(request);
  session.set("userId", userId);
  return redirect(redirectTo, {
    headers: {
      "Set-Cookie": await sessionStorage.commitSession(session, {
        maxAge: remember
          ? 60 * 60 * 24 * 7 // 7 days
          : undefined,
      }),
    },
  });
}

// ログアウト処理
export async function logout(request: Request) {
  const session = await getSession(request);
  return redirect("/", {
    headers: {
      "Set-Cookie": await sessionStorage.destroySession(session),
    },
  });
}
