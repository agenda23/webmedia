import { json, redirect } from "@remix-run/node";
import type { ActionFunctionArgs, MetaFunction } from "@remix-run/node";
import { Form, useActionData } from "@remix-run/react";
import { useState } from "react";
import { sendContactEmail } from "~/models/contact.server";

export const meta: MetaFunction = () => {
  return [
    { title: "お問い合わせ | 飲食店舗 Web メディアサイト" },
    { name: "description", content: "取材依頼、イベント出演依頼、コラボレーション、その他のお問い合わせはこちらからどうぞ。" },
  ];
};

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const subject = formData.get("subject") as string;
  const message = formData.get("message") as string;
  const inquiryType = formData.get("inquiryType") as string;

  const errors: Record<string, string> = {};
  if (!name || name.trim() === "") {
    errors.name = "お名前を入力してください";
  }
  if (!email || email.trim() === "") {
    errors.email = "メールアドレスを入力してください";
  } else if (!/^\S+@\S+\.\S+$/.test(email)) {
    errors.email = "有効なメールアドレスを入力してください";
  }
  if (!subject || subject.trim() === "") {
    errors.subject = "件名を入力してください";
  }
  if (!message || message.trim() === "") {
    errors.message = "メッセージを入力してください";
  }
  if (!inquiryType || inquiryType === "default") {
    errors.inquiryType = "お問い合わせの種類を選択してください";
  }

  if (Object.keys(errors).length > 0) {
    return json({ 
      errors, 
      values: { name, email, subject, message, inquiryType },
      success: false 
    });
  }

  // メール送信処理
  await sendContactEmail({
    name,
    email,
    subject,
    message,
    inquiryType,
  });

  return json({
    success: true,
    errors: {},
    values: { name, email, subject, message, inquiryType },
  });
}

export default function Contact() {
  const actionData = useActionData<typeof action>();
  const [submitted, setSubmitted] = useState(false);

  // フォーム送信後に成功メッセージを表示する
  if (actionData?.success && !submitted) {
    setSubmitted(true);
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <header className="mb-16 text-center">
        <h1 className="mb-4 text-4xl font-bold">お問い合わせ</h1>
        <p className="mx-auto max-w-2xl text-gray-600">
          取材依頼、イベント出演依頼、コラボレーション、その他のお問い合わせはこちらからどうぞ。
        </p>
      </header>

      <div className="mx-auto max-w-3xl">
        {submitted ? (
          // 送信成功メッセージ
          <div className="rounded-lg bg-green-50 p-8 text-center">
            <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
              <svg
                className="h-8 w-8 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M5 13l4 4L19 7"
                ></path>
              </svg>
            </div>
            <h2 className="mb-4 text-2xl font-bold text-green-800">
              お問い合わせを受け付けました
            </h2>
            <p className="mb-6 text-green-700">
              お問い合わせいただきありがとうございます。内容を確認し、担当者よりご連絡いたします。
            </p>
            <button
              onClick={() => setSubmitted(false)}
              className="rounded-lg border border-green-600 bg-white px-6 py-2 font-semibold text-green-600 transition hover:bg-green-50"
            >
              新しいお問い合わせを作成
            </button>
          </div>
        ) : (
          // お問い合わせフォーム
          <Form method="post" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <div>
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

              <div>
                <label htmlFor="email" className="mb-2 block text-sm font-medium text-gray-700">
                  メールアドレス *
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
            </div>

            <div>
              <label htmlFor="inquiryType" className="mb-2 block text-sm font-medium text-gray-700">
                お問い合わせの種類 *
              </label>
              <select
                id="inquiryType"
                name="inquiryType"
                className={`w-full rounded-lg border ${
                  actionData?.errors?.inquiryType ? "border-red-500" : "border-gray-300"
                } p-3`}
                defaultValue={actionData?.values?.inquiryType || "default"}
              >
                <option value="default" disabled>お問い合わせの種類を選択してください</option>
                <option value="general">一般的なお問い合わせ</option>
                <option value="press">取材・メディア関連</option>
                <option value="event">イベント出演依頼</option>
                <option value="collaboration">コラボレーション提案</option>
                <option value="reservation">予約に関するお問い合わせ</option>
                <option value="other">その他</option>
              </select>
              {actionData?.errors?.inquiryType && (
                <p className="mt-1 text-sm text-red-500">{actionData.errors.inquiryType}</p>
              )}
            </div>

            <div>
              <label htmlFor="subject" className="mb-2 block text-sm font-medium text-gray-700">
                件名 *
              </label>
              <input
                type="text"
                id="subject"
                name="subject"
                className={`w-full rounded-lg border ${
                  actionData?.errors?.subject ? "border-red-500" : "border-gray-300"
                } p-3`}
                defaultValue={actionData?.values?.subject || ""}
              />
              {actionData?.errors?.subject && (
                <p className="mt-1 text-sm text-red-500">{actionData.errors.subject}</p>
              )}
            </div>

            <div>
              <label htmlFor="message" className="mb-2 block text-sm font-medium text-gray-700">
                メッセージ *
              </label>
              <textarea
                id="message"
                name="message"
                rows={8}
                className={`w-full rounded-lg border ${
                  actionData?.errors?.message ? "border-red-500" : "border-gray-300"
                } p-3`}
                defaultValue={actionData?.values?.message || ""}
              ></textarea>
              {actionData?.errors?.message && (
                <p className="mt-1 text-sm text-red-500">{actionData.errors.message}</p>
              )}
            </div>

            <div className="mb-6 text-sm text-gray-600">
              <p>
                * は必須項目です。頂いた情報は、お問い合わせ対応のみに使用し、適切に管理いたします。
              </p>
            </div>

            <button
              type="submit"
              className="w-full rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700 md:w-auto"
            >
              送信する
            </button>
          </Form>
        )}

        {/* 店舗情報とお問い合わせ情報 */}
        <div className="mt-16 rounded-lg bg-gray-50 p-8">
          <h2 className="mb-6 text-2xl font-bold">直接のお問い合わせ</h2>
          <div className="grid gap-8 md:grid-cols-2">
            <div>
              <h3 className="mb-4 text-lg font-semibold">営業時間・お電話</h3>
              <p className="mb-2">
                <span className="font-semibold">電話番号:</span> 03-XXXX-XXXX
              </p>
              <p className="mb-2">
                <span className="font-semibold">受付時間:</span> 平日 10:00〜18:00
              </p>
              <p className="mb-4">
                <span className="font-semibold">定休日:</span> 水曜日
              </p>
              <p className="text-sm text-gray-600">
                ※イベント開催日は営業時間が変更になる場合があります。
              </p>
            </div>
            <div>
              <h3 className="mb-4 text-lg font-semibold">メール</h3>
              <p className="mb-2">
                <span className="font-semibold">一般的なお問い合わせ:</span>
                <br />
                info@example.com
              </p>
              <p className="mb-2">
                <span className="font-semibold">取材・メディア関連:</span>
                <br />
                press@example.com
              </p>
              <p className="mb-2">
                <span className="font-semibold">イベント関連:</span>
                <br />
                event@example.com
              </p>
            </div>
          </div>
        </div>

        {/* SNSリンク */}
        <div className="mt-12 text-center">
          <h3 className="mb-4 text-lg font-semibold">SNSでもお気軽にお問い合わせください</h3>
          <div className="flex justify-center space-x-4">
            <a
              href="https://twitter.com/example"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#1DA1F2] text-white hover:bg-opacity-90"
              aria-label="Twitter"
            >
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84"></path>
              </svg>
            </a>
            <a
              href="https://www.instagram.com/example"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-r from-purple-500 via-pink-500 to-yellow-500 text-white hover:bg-opacity-90"
              aria-label="Instagram"
            >
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z"></path>
              </svg>
            </a>
            <a
              href="https://www.facebook.com/example"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#4267B2] text-white hover:bg-opacity-90"
              aria-label="Facebook"
            >
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"></path>
              </svg>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
