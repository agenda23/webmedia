import { useState } from "react";
import { json, redirect } from "@remix-run/node";
import { Form, Link, useActionData, useSearchParams } from "@remix-run/react";
import type { ActionFunctionArgs, LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { createUserSession, getUserId } from "~/utils/session.server";
import { verifyLogin } from "~/models/user.server";
import { getSettingValue } from "~/models/setting.server";

export const meta: MetaFunction = () => {
  return [
    { title: "ログイン | 飲食店舗 Web メディアサイト" },
    { name: "description", content: "ログインして管理機能へアクセスしてください。" },
  ];
};

export async function loader({ request }: LoaderFunctionArgs) {
  const userId = await getUserId(request);
  if (userId) {
    // すでにログイン済みの場合は管理画面にリダイレクト
    return redirect("/admin");
  }

  const siteName = await getSettingValue("site_name", "飲食店舗 Web メディアサイト");
  
  return json({ siteName });
}

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const email = formData.get("email");
  const password = formData.get("password");
  const redirectTo = formData.get("redirectTo");
  const remember = formData.get("remember");

  if (typeof email !== "string" || typeof password !== "string" || !email || !password) {
    return json(
      { errors: { email: "メールアドレスを入力してください", password: "パスワードを入力してください", form: null } },
      { status: 400 }
    );
  }

  // ユーザーの認証
  const user = await verifyLogin(email, password);

  if (!user) {
    return json(
      { errors: { form: "メールアドレスまたはパスワードが正しくありません", email: null, password: null } },
      { status: 400 }
    );
  }

  // ユーザーセッションの作成とリダイレクト
  return createUserSession({
    request,
    userId: user.id,
    remember: remember === "on",
    redirectTo: typeof redirectTo === "string" ? redirectTo : "/admin",
  });
}

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const actionData = useActionData<typeof action>();
  const [searchParams] = useSearchParams();
  const redirectTo = searchParams.get("redirectTo") || "/admin";

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div>
          <h1 className="text-center text-3xl font-bold">
            <Link to="/" className="text-gray-900 hover:text-gray-700">
              飲食店舗 Web メディアサイト
            </Link>
          </h1>
          <h2 className="mt-6 text-center text-2xl font-bold text-gray-900">
            管理画面にログイン
          </h2>
        </div>
        
        <Form method="post" className="mt-8 space-y-6">
          <input type="hidden" name="redirectTo" value={redirectTo} />
          <div className="-space-y-px rounded-md shadow-sm">
            <div>
              <label htmlFor="email" className="sr-only">
                メールアドレス
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className={`relative block w-full rounded-t-md border ${
                  actionData?.errors?.email ? "border-red-500" : "border-gray-300"
                } p-3 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm`}
                placeholder="メールアドレス"
                aria-invalid={actionData?.errors?.email ? true : undefined}
                aria-describedby="email-error"
              />
              {actionData?.errors?.email && (
                <div className="pt-1 text-red-700" id="email-error">
                  {actionData.errors.email}
                </div>
              )}
            </div>
            <div className="relative">
              <label htmlFor="password" className="sr-only">
                パスワード
              </label>
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                required
                className={`relative block w-full rounded-b-md border ${
                  actionData?.errors?.password ? "border-red-500" : "border-gray-300"
                } p-3 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm`}
                placeholder="パスワード"
                aria-invalid={actionData?.errors?.password ? true : undefined}
                aria-describedby="password-error"
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z"
                      clipRule="evenodd"
                    />
                    <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />
                  </svg>
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                    <path
                      fillRule="evenodd"
                      d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
              </button>
              {actionData?.errors?.password && (
                <div className="pt-1 text-red-700" id="password-error">
                  {actionData.errors.password}
                </div>
              )}
            </div>
          </div>

          {actionData?.errors?.form && (
            <div className="rounded-md bg-red-50 p-3 text-sm text-red-600">
              {actionData.errors.form}
            </div>
          )}

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember"
                name="remember"
                type="checkbox"
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label
                htmlFor="remember"
                className="ml-2 block text-sm text-gray-900"
              >
                ログイン状態を保持する
              </label>
            </div>

            <div className="text-sm">
              <Link
                to="/forgot-password"
                className="font-medium text-blue-600 hover:text-blue-500"
              >
                パスワードをお忘れですか？
              </Link>
            </div>
          </div>

          <div>
            <button
              type="submit"
              className="group relative flex w-full justify-center rounded-md border border-transparent bg-blue-600 py-2 px-4 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                <svg
                  className="h-5 w-5 text-blue-500 group-hover:text-blue-400"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </span>
              ログイン
            </button>
          </div>
        </Form>

        <div className="mt-4 text-center text-sm text-gray-600">
          <Link to="/" className="font-medium text-blue-600 hover:text-blue-500">
            サイトトップに戻る
          </Link>
        </div>
      </div>
    </div>
  );
}