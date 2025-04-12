import React, { useRef, useState } from "react";

type MediaUploadProps = {
  name: string;
  defaultValue?: string | null;
  accept?: string;
  multiple?: boolean;
  maxSize?: number; // バイト単位
};

export function MediaUpload({ 
  name, 
  defaultValue, 
  accept, 
  multiple = false,
  maxSize = 5 * 1024 * 1024 // デフォルトは5MB
}: MediaUploadProps) {
  const [preview, setPreview] = useState<string | null>(defaultValue || null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // ファイル選択ハンドラー
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    
    if (!files || files.length === 0) {
      return;
    }
    
    const file = files[0];
    
    // ファイルサイズチェック
    if (file.size > maxSize) {
      setError(`ファイルサイズが大きすぎます。${formatFileSize(maxSize)}以下にしてください。`);
      return;
    }
    
    setError(null);
    
    // プレビュー表示
    const reader = new FileReader();
    reader.onload = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
    
    // 実際の実装では、ここでファイルをサーバーにアップロードし、
    // 返されたURLをフォームの値として設定する必要があります。
    // この例では単純化のためにフロントエンドのみの処理としています。
  };
  
  // ファイルサイズのフォーマット
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };
  
  // ファイル選択ダイアログを開く
  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };
  
  // プレビュークリア
  const handleClearClick = () => {
    setPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };
  
  return (
    <div>
      {/* 隠しファイル入力 */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept={accept}
        multiple={multiple}
        className="hidden"
      />
      
      {/* 現在の値（非表示フィールド） */}
      <input type="hidden" name={name} value={preview || ""} />
      
      {/* UI表示部分 */}
      <div className="mt-1 flex items-center">
        {preview ? (
          <div className="relative">
            {preview.startsWith("data:image/") || preview.match(/\.(jpeg|jpg|gif|png)$/i) ? (
              <div className="relative">
                <img
                  src={preview}
                  alt="Preview"
                  className="h-32 w-auto object-cover rounded-md"
                />
                <button
                  type="button"
                  onClick={handleClearClick}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-sm hover:bg-red-600"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ) : (
              <div className="flex items-center">
                <div className="bg-gray-100 text-gray-500 rounded-md p-2 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span className="text-sm truncate max-w-xs">{preview.split('/').pop()}</span>
                </div>
                <button
                  type="button"
                  onClick={handleClearClick}
                  className="ml-2 text-red-500 hover:text-red-600"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            )}
          </div>
        ) : (
          <button
            type="button"
            onClick={handleButtonClick}
            className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            ファイルを選択
          </button>
        )}
      </div>
      
      {/* エラーメッセージ */}
      {error && (
        <p className="mt-1 text-sm text-red-500">{error}</p>
      )}
    </div>
  );
}