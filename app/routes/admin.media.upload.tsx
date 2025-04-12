import { useState } from "react";
import { json, redirect } from "@remix-run/node";
import { Form, useActionData, useNavigation } from "@remix-run/react";
import type { ActionFunctionArgs } from "@remix-run/node";
import { requireEditor } from "~/utils/session.server";
import { uploadMedia } from "~/models/media.server";

export const handle = {
  title: "メディアアップロード",
};

// バックエンドでのファイル処理例（実際にはサーバーへのアップロード処理が必要）
export async function action({ request }: ActionFunctionArgs) {
  await requireEditor(request);

  try {
    const formData = await request.formData();
    
    // ファイル情報を取得
    const files = formData.getAll("files") as File[];
    
    if (files.length === 0 || !(files[0] instanceof File) || files[0].size === 0) {
      return json({
        success: false,
        error: "ファイルが選択されていないか、無効なファイルです。",
      });
    }

    // ファイルサイズの制限
    const maxSize = 15 * 1024 * 1024; // 15MB
    for (const file of files) {
      if (file.size > maxSize) {
        return json({
          success: false,
          error: `ファイルサイズが大きすぎます。15MB以下のファイルをアップロードしてください。(${file.name})`,
        });
      }
    }

    // 各ファイルをアップロード
    const results = await Promise.all(
      files.map(async (file) => {
        const result = await uploadMedia(file);
        return {
          name: file.name,
          success: true,
          id: result.id,
          url: result.url,
        };
      })
    );

    return json({
      success: true,
      uploadResults: results,
    });
  } catch (error) {
    console.error("アップロードエラー:", error);
    return json({
      success: false,
      error: "ファイルのアップロード中にエラーが発生しました。",
    });
  }
}

export default function MediaUpload() {
  const actionData = useActionData<{
    success?: boolean;
    error?: string;
    uploadResults?: { name: string; success: boolean; id: string; url: string }[];
  }>();
  const navigation = useNavigation();
  const isUploading = navigation.state === "submitting";

  const [dragActive, setDragActive] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  // ドラッグイベントハンドラー
  function handleDrag(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }

  // ドロップイベントハンドラー
  function handleDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const newFiles = Array.from(e.dataTransfer.files);
      setSelectedFiles((prev) => [...prev, ...newFiles]);
    }
  }

  // ファイル選択イベントハンドラー
  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);
      setSelectedFiles((prev) => [...prev, ...newFiles]);
      
      // input要素の値をリセット（同じファイルを連続して選択できるようにする）
      e.target.value = '';
    }
  }

  // 選択されたファイルを削除
  function removeFile(index: number) {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  }

  // フォーム送信前に選択されたファイルをリセット
  function handleSubmit() {
    // フォームの送信は自動的に行われるため、特に処理は不要
  }

  // アップロード成功後にファイル選択をリセット
  function handleReset() {
    setSelectedFiles([]);
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">メディアアップロード</h1>
        <a
          href="/admin/media"
          className="rounded-md bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200"
        >
          メディア一覧へ戻る
        </a>
      </div>

      {/* アップロードフォーム */}
      <div className="rounded-lg bg-white p-6 shadow-sm">
        <Form
          method="post"
          encType="multipart/form-data"
          onSubmit={handleSubmit}
          className="space-y-6"
        >
          {/* ドラッグ&ドロップエリア */}
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center ${
              dragActive
                ? "border-blue-500 bg-blue-50"
                : "border-gray-300 hover:border-blue-400"
            }`}
            onDragEnter={handleDrag}
            onDragOver={handleDrag}
            onDragLeave={handleDrag}
            onDrop={handleDrop}
          >
            <div className="mx-auto flex flex-col items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="mb-4 h-12 w-12 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                />
              </svg>
              <p className="mb-2 text-sm font-medium text-gray-700">
                ファイルをドラッグ＆ドロップするか、
                <label className="cursor-pointer text-blue-600 hover:underline">
                  <span>ファイルを選択</span>
                  <input
                    type="file"
                    name="files"
                    multiple
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>
              </p>
              <p className="text-xs text-gray-500">
                PNG, JPG, GIF, SVG, PDF, DOC など (最大 15MB)
              </p>
            </div>
          </div>

          {/* 選択されたファイル一覧 */}
          {selectedFiles.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-gray-700">選択されたファイル: {selectedFiles.length}個</h3>
              <div className="max-h-60 overflow-y-auto rounded border border-gray-200">
                <ul className="divide-y divide-gray-200">
                  {selectedFiles.map((file, index) => (
                    <li key={index} className="flex items-center justify-between px-4 py-2">
                      <div className="flex items-center">
                        <div className="mr-3 flex h-10 w-10 items-center justify-center rounded-md bg-gray-100">
                          {file.type.startsWith("image/") ? (
                            <img
                              src={URL.createObjectURL(file)}
                              alt={file.name}
                              className="h-10 w-10 rounded-md object-cover"
                            />
                          ) : (
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-6 w-6 text-gray-400"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                              />
                            </svg>
                          )}
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900 truncate max-w-xs" title={file.name}>
                            {file.name}
                          </div>
                          <div className="text-xs text-gray-500">
                            {(file.size / 1024).toFixed(2)} KB
                          </div>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeFile(index)}
                        className="text-gray-400 hover:text-gray-500"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* エラーメッセージ */}
          {actionData?.error && (
            <div className="rounded-md bg-red-50 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg
                    className="h-5 w-5 text-red-400"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">{actionData.error}</h3>
                </div>
              </div>
            </div>
          )}

          {/* アップロード成功メッセージ */}
          {actionData?.success && (
            <div className="rounded-md bg-green-50 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg
                    className="h-5 w-5 text-green-400"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-green-800">
                    {actionData.uploadResults?.length}個のファイルが正常にアップロードされました
                  </h3>
                  <div className="mt-2">
                    <button
                      type="button"
                      onClick={handleReset}
                      className="text-sm font-medium text-green-600 hover:text-green-500"
                    >
                      新しいファイルをアップロード
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* アップロードボタン */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isUploading || selectedFiles.length === 0}
              className={`rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                isUploading || selectedFiles.length === 0 ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              {isUploading ? "アップロード中..." : "アップロード"}
            </button>
          </div>
        </Form>
      </div>
    </div>
  );
}