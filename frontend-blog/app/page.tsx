"use client";

import { useState } from "react";
import { Wallet } from "lucide-react";
import { useMetaMask } from "@/hooks/metamask/useMetaMaskProvider";
import { WelcomePage } from "@/components/WelcomePage";
import { BlogListPage } from "@/components/BlogListPage";
import { MyBlogsPage } from "@/components/MyBlogsPage";
import { CreateBlogPage } from "@/components/CreateBlogPage";

type PageType = "welcome" | "blogs" | "my-blogs" | "create-blog";

export default function Home() {
  const [currentPage, setCurrentPage] = useState<PageType>("welcome");
  const { isConnected, accounts, chainId, connect } = useMetaMask();

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const renderPage = () => {
    switch (currentPage) {
      case "welcome":
        return <WelcomePage onNavigate={setCurrentPage} />;
      case "blogs":
        return <BlogListPage onNavigate={setCurrentPage} />;
      case "my-blogs":
        return <MyBlogsPage onNavigate={setCurrentPage} />;
      case "create-blog":
        return <CreateBlogPage onNavigate={setCurrentPage} />;
      default:
        return <WelcomePage onNavigate={setCurrentPage} />;
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Navigation Header */}
      <nav className="bg-white shadow-lg border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <button
                onClick={() => setCurrentPage("welcome")}
                className="text-xl font-bold text-indigo-600 hover:text-indigo-800 transition-colors"
              >
                FHE Blog
              </button>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setCurrentPage("blogs")}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  currentPage === "blogs"
                    ? "bg-indigo-100 text-indigo-700"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                }`}
              >
                All Blogs
              </button>
              <button
                onClick={() => setCurrentPage("my-blogs")}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  currentPage === "my-blogs"
                    ? "bg-indigo-100 text-indigo-700"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                }`}
              >
                My Blogs
              </button>
              <button
                onClick={() => setCurrentPage("create-blog")}
                className="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-700 transition-colors"
              >
                Create Blog
              </button>

              {/* Wallet Connection */}
              {isConnected ? (
                <div className="flex items-center space-x-2 px-3 py-2 bg-green-50 border border-green-200 rounded-lg">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm font-medium text-green-700">
                    {accounts?.[0] ? formatAddress(accounts[0]) : "Connected"}
                  </span>
                  {chainId && (
                    <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded">
                      {chainId === 31337 ? "Local" : `Chain ${chainId}`}
                    </span>
                  )}
                </div>
              ) : (
                <button
                  onClick={connect}
                  className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg text-sm font-medium hover:bg-orange-600 transition-colors"
                >
                  <Wallet className="w-4 h-4" />
                  Connect Wallet
                </button>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Page Content */}
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {renderPage()}
      </div>
    </main>
  );
}
