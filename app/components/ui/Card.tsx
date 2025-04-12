import React from "react";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  shadow?: "none" | "sm" | "md" | "lg";
  hover?: boolean;
}

export default function Card({
  children,
  className = "",
  shadow = "md",
  hover = true,
}: CardProps) {
  // シャドウスタイル
  const shadowStyles = {
    none: "",
    sm: "shadow-sm",
    md: "shadow",
    lg: "shadow-lg",
  };
  
  // ホバースタイル
  const hoverStyle = hover ? "transition hover:shadow-md" : "";
  
  return (
    <div
      className={`overflow-hidden rounded-lg bg-white ${shadowStyles[shadow]} ${hoverStyle} ${className}`}
    >
      {children}
    </div>
  );
}

// サブコンポーネント
Card.Header = function CardHeader({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={`border-b border-gray-200 p-4 ${className}`}>{children}</div>;
};

Card.Body = function CardBody({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={`p-6 ${className}`}>{children}</div>;
};

Card.Footer = function CardFooter({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={`border-t border-gray-200 p-4 ${className}`}>{children}</div>;
};
 