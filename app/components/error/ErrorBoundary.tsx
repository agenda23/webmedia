import React from "react";
import { isRouteErrorResponse, useRouteError } from "@remix-run/react";

export default function ErrorBoundary() {
  const error = useRouteError();
  
  if (isRouteErrorResponse(error)) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gray-100 p-4 text-center">
        <div className="mb-4 rounded-full bg-red-100 p-3">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-8 w-8 text-red-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <h1 className="mb-4 text-3xl font-bold text-gray-900">
          {error.status} - {error.statusText}
        </h1>
        <p className="mb-8 text-lg text-gray-600">
          {error.data?.message || "申し訳ありませんが、エラーが発生しました。"}
        </p>
        <a
          href="/"
          className="rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white transition-colors hover:bg-blue-700"
        >
          ホームに戻る
        </a>
      </div>
    );
  }

  // 通常のJSエラーの場合
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-100 p-4 text-center">
      <div className="mb-4 rounded-full bg-red-100 p-3">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-8 w-8 text-red-500"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      </div>
      <h1 className="mb-4 text-3xl font-bold text-gray-900">エラーが発生しました</h1>
      <p className="mb-8 text-lg text-gray-600">
        予期しないエラーが発生しました。後でもう一度お試しください。
      </p>
      <a
        href="/"
        className="rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white transition-colors hover:bg-blue-700"
      >
        ホームに戻る
      </a>
    </div>
  );
}
 