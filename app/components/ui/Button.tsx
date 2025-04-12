import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  fullWidth?: boolean;
  children: React.ReactNode;
  className?: string;
}

// デフォルトエクスポートと名前付きエクスポートの両方を提供
export function Button({
  variant = "primary",
  size = "md",
  fullWidth = false,
  children,
  className = "",
  ...props
}: ButtonProps) {
  // ベーススタイル
  const baseStyle = "rounded-full font-semibold transition focus:outline-none focus:ring-2 focus:ring-offset-2";
  
  // バリアントスタイル
  const variantStyles = {
    primary: "bg-gray-900 text-white hover:bg-gray-800 focus:ring-gray-500",
    secondary: "bg-white text-gray-900 hover:bg-gray-100 focus:ring-gray-300",
    outline: "border-2 border-gray-900 bg-transparent text-gray-900 hover:bg-gray-900 hover:text-white focus:ring-gray-500",
    ghost: "bg-transparent text-gray-700 hover:bg-gray-100 hover:text-gray-900 focus:ring-gray-300",
  };
  
  // サイズスタイル
  const sizeStyles = {
    sm: "px-4 py-2 text-sm",
    md: "px-6 py-3",
    lg: "px-8 py-4 text-lg",
  };
  
  // 幅スタイル
  const widthStyle = fullWidth ? "w-full" : "";
  
  return (
    <button
      className={`${baseStyle} ${variantStyles[variant]} ${sizeStyles[size]} ${widthStyle} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

// 後方互換性のためのデフォルトエクスポート
export default Button;
