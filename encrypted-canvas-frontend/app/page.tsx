"use client";

import { useState } from "react";
import { Wallet, Crown } from "lucide-react";
import { useMetaMask } from "@/hooks/metamask/useMetaMaskProvider";
import { CanvasStudio } from "@/components/CanvasStudio";
import { GalleryView } from "@/components/GalleryView";
import { MyCreations } from "@/components/MyCreations";
import { MintCreation } from "@/components/MintCreation";

type PageType = "studio" | "gallery" | "my-creations" | "mint-creation";

interface Creation {
  id: string;
  title: string;
  description: string;
  tags: string[];
  appreciations: number;
  views: number;
  isPremium: boolean;
  isExhibited: boolean;
  createdAt: string;
  color: string;
  creator: string;
}

export default function Home() {
  const [currentPage, setCurrentPage] = useState<PageType>("studio");
  const [userCreations, setUserCreations] = useState<Creation[]>([
    {
      id: "1",
      title: "Digital Dreams",
      description: "An abstract exploration of consciousness through geometric patterns and quantum encryption.",
      tags: ["abstract", "digital", "consciousness"],
      appreciations: 42,
      views: 156,
      isPremium: true,
      isExhibited: true,
      createdAt: "2 days ago",
      color: "from-blue-400 to-purple-600",
      creator: "0xA1B2...C3D4"
    },
    {
      id: "2",
      title: "Encrypted Poetry",
      description: "Verses of digital poetry, encrypted with meaning only revealed to those who truly understand.",
      tags: ["poetry", "literature", "philosophy"],
      appreciations: 28,
      views: 89,
      isPremium: false,
      isExhibited: true,
      createdAt: "1 week ago",
      color: "from-green-400 to-teal-600",
      creator: "0xE5F6...G7H8"
    },
    {
      id: "3",
      title: "Quantum Harmony",
      description: "A musical composition that exists in superposition until observed by appreciative minds.",
      tags: ["music", "quantum", "harmony"],
      appreciations: 67,
      views: 234,
      isPremium: true,
      isExhibited: false,
      createdAt: "3 days ago",
      color: "from-pink-400 to-red-600",
      creator: "0xI9J0...K1L2"
    }
  ]);
  const { isConnected, accounts, chainId, connect } = useMetaMask();

  const handleCreationMinted = (newCreation: Creation) => {
    setUserCreations(prev => [newCreation, ...prev]);
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const renderPage = () => {
    switch (currentPage) {
      case "studio":
        return <CanvasStudio onNavigate={setCurrentPage} />;
      case "gallery":
        return <GalleryView onNavigate={setCurrentPage} />;
      case "my-creations":
        return <MyCreations onNavigate={setCurrentPage} userCreations={userCreations} />;
      case "mint-creation":
        return <MintCreation onNavigate={setCurrentPage} onCreationMinted={handleCreationMinted} />;
      default:
        return <CanvasStudio onNavigate={setCurrentPage} />;
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-red-50">
      {/* Navigation Header */}
      <nav className="bg-white/80 backdrop-blur-lg shadow-xl border-b border-purple-200/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <button
                onClick={() => setCurrentPage("studio")}
                className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent hover:from-purple-700 hover:to-pink-700 transition-all duration-300 flex items-center gap-2"
              >
                <Crown className="w-6 h-6 text-purple-600" />
                Encrypted Canvas
              </button>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setCurrentPage("gallery")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                  currentPage === "gallery"
                    ? "bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 shadow-md"
                    : "text-gray-600 hover:text-purple-600 hover:bg-purple-50"
                }`}
              >
                Gallery
              </button>
              <button
                onClick={() => setCurrentPage("my-creations")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                  currentPage === "my-creations"
                    ? "bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 shadow-md"
                    : "text-gray-600 hover:text-purple-600 hover:bg-purple-50"
                }`}
              >
                My Creations
              </button>
              <button
                onClick={() => setCurrentPage("mint-creation")}
                className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-2 rounded-lg text-sm font-medium hover:from-purple-700 hover:to-pink-700 transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                Mint Creation
              </button>

              {/* Wallet Connection */}
              {isConnected ? (
                <div className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-emerald-50 to-green-50 border border-emerald-200 rounded-lg shadow-sm">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium text-emerald-700">
                    {accounts?.[0] ? formatAddress(accounts[0]) : "Connected"}
                  </span>
                  {chainId && (
                    <span className="text-xs text-emerald-600 bg-emerald-100 px-2 py-1 rounded-full font-medium">
                      {chainId === 31337 ? "Local" : `Chain ${chainId}`}
                    </span>
                  )}
                </div>
              ) : (
                <button
                  onClick={connect}
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg text-sm font-medium hover:from-orange-600 hover:to-red-600 transition-all duration-300 shadow-lg hover:shadow-xl"
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
