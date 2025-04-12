import React, { useState } from "react";
import { Link } from "@remix-run/react";

interface MainNavigationProps {
  siteName: string;
  siteDescription?: string;
}

export default function MainNavigation({
  siteName,
  siteDescription = "",
}: MainNavigationProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen( !isMobileMenuOpen);
  };

  return (
    <header className="bg-white shadow-sm">
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <div>
            <Link to="/" className="text-2xl font-bold text-gray-900">
              {siteName}
            </Link>
            {siteDescription && <p className="text-sm text-gray-600">{siteDescription}</p>}
          </div>
          
          {/* デスクトップメニュー */}
          <nav className="hidden md:flex space-x-6">
            <Link to="/posts" className="text-gray-700 hover:text-gray-900">
              ブログ
            </Link>
            <Link to="/events" className="text-gray-700 hover:text-gray-900">
              イベント
            </Link>
            <Link to="/about" className="text-gray-700 hover:text-gray-900">
              店舗情報
            </Link>
            <Link to="/contact" className="text-gray-700 hover:text-gray-900">
              お問い合わせ
            </Link>
          </nav>
          
          {/* モバイルメニューボタン */}
          <button onClick={toggleMobileMenu} className="md:hidden">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              {isMobileMenuOpen ? (
                <>
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </>
              ) : (
                <>
                  <line x1="3" y1="12" x2="21" y2="12" />
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <line x1="3" y1="18" x2="21" y2="18" />
                </>
              )}
            </svg>
          </button>
        </div>
        
        {/* モバイルメニュー */}
        {isMobileMenuOpen && (
          <div className="md:hidden mt-4 py-2 border-t border-gray-200">
            <nav className="flex flex-col space-y-3">
              <Link
                to="/posts"
                className="text-gray-700 hover:text-gray-900 py-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                ブログ
              </Link>
              <Link
                to="/events"
                className="text-gray-700 hover:text-gray-900 py-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                イベント
              </Link>
              <Link
                to="/about"
                className="text-gray-700 hover:text-gray-900 py-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                店舗情報
              </Link>
              <Link
                to="/contact"
                className="text-gray-700 hover:text-gray-900 py-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                お問い合わせ
              </Link>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
 