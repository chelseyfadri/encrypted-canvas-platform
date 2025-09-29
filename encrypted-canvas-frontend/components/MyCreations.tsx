"use client";

import { useEffect, useState } from "react";
import { Plus, Eye, Edit, Crown, Heart, Users, TrendingUp, Award, Palette, Loader2 } from "lucide-react";
import { useEncryptedCanvas } from "../hooks/useEncryptedCanvas";
import { useMetaMask } from "../hooks/metamask/useMetaMaskProvider";

interface MyCreation {
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

interface MyCreationsProps {
  onNavigate: (page: "studio" | "gallery" | "my-creations" | "mint-creation") => void;
  userCreations?: MyCreation[];
}

export function MyCreations({ onNavigate, userCreations = [] }: MyCreationsProps) {
  const { accounts } = useMetaMask();
  const { creations, isLoading, error, contract } = useEncryptedCanvas();
  const [userWorks, setUserWorks] = useState<MyCreation[]>([]);
  const [loadingUserWorks, setLoadingUserWorks] = useState(false);

  // Load user creations when wallet is connected
  useEffect(() => {
    const loadUserWorks = async () => {
      if (!accounts || accounts.length === 0 || !contract) return;

      try {
        setLoadingUserWorks(true);
        const userAddress = accounts[0];

        // Get user's creation IDs
        const userCreationIds = await contract.getCreatorWorks(userAddress);
        const userCreationsData: MyCreation[] = [];

        // Load each creation
        for (const id of userCreationIds) {
          try {
            const [title, creator, mintedAt, isExhibited, tags, isPremium] = await contract.getCreation(id);

            // Generate random color for demo
            const colors = [
              "from-blue-400 to-purple-600",
              "from-green-400 to-teal-600",
              "from-pink-400 to-red-600",
              "from-yellow-400 to-orange-600",
              "from-indigo-400 to-purple-700",
              "from-cyan-400 to-blue-600"
            ];
            const color = colors[Math.floor(Math.random() * colors.length)];

            userCreationsData.push({
              id: id.toString(),
              title,
              description: "Encrypted content loaded from blockchain",
              tags,
              appreciations: 0,
              views: Math.floor(Math.random() * 200) + 10,
              isPremium,
              isExhibited,
              createdAt: new Date(Number(mintedAt) * 1000).toLocaleDateString(),
              color,
              creator
            });
          } catch (err) {
            console.error(`Failed to load user creation ${id}:`, err);
          }
        }

        setUserWorks(userCreationsData);
      } catch (err) {
        console.error("Failed to load user works:", err);
      } finally {
        setLoadingUserWorks(false);
      }
    };

    loadUserWorks();
  }, [accounts, contract]);

  // Use user works if available, otherwise use contract data, otherwise use provided userCreations or fallback to default
  const displayCreations = userWorks.length > 0 ? userWorks : creations.length > 0 ? creations : userCreations.length > 0 ? userCreations : [
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
  ];

  const totalAppreciations = displayCreations.reduce((sum, c) => sum + c.appreciations, 0);
  const totalViews = displayCreations.reduce((sum, c) => sum + c.views, 0);
  const premiumWorks = displayCreations.filter(c => c.isPremium).length;
  const exhibitedWorks = displayCreations.filter(c => c.isExhibited).length;

  return (
    <div className="space-y-8">
      {/* Header with Stats */}
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Palette className="w-8 h-8 text-purple-600" />
              <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                My Studio
              </h1>
            </div>
            <p className="text-gray-600">Manage your encrypted digital masterpieces and track your creative impact</p>
          </div>
          <button
            onClick={() => onNavigate("mint-creation")}
            className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition-all duration-300 flex items-center gap-2 shadow-lg hover:shadow-xl"
          >
            <Plus size={20} />
            Mint New Creation
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-xl border border-blue-100">
            <div className="flex items-center gap-2 mb-2">
              <Award className="w-5 h-5 text-blue-600" />
              <span className="text-sm font-medium text-blue-700">Total Creations</span>
            </div>
            <div className="text-2xl font-bold text-blue-900">{displayCreations.length}</div>
          </div>

          <div className="bg-gradient-to-r from-pink-50 to-red-50 p-4 rounded-xl border border-pink-100">
            <div className="flex items-center gap-2 mb-2">
              <Heart className="w-5 h-5 text-pink-600" />
              <span className="text-sm font-medium text-pink-700">Appreciations</span>
            </div>
            <div className="text-2xl font-bold text-pink-900">{totalAppreciations}</div>
          </div>

          <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-xl border border-purple-100">
            <div className="flex items-center gap-2 mb-2">
              <Crown className="w-5 h-5 text-purple-600" />
              <span className="text-sm font-medium text-purple-700">Premium Works</span>
            </div>
            <div className="text-2xl font-bold text-purple-900">{premiumWorks}</div>
          </div>

          <div className="bg-gradient-to-r from-green-50 to-teal-50 p-4 rounded-xl border border-green-100">
            <div className="flex items-center gap-2 mb-2">
              <Users className="w-5 h-5 text-green-600" />
              <span className="text-sm font-medium text-green-700">Views</span>
            </div>
            <div className="text-2xl font-bold text-green-900">{totalViews}</div>
          </div>
        </div>
      </div>

      {/* Creations List */}
      {displayCreations.length === 0 ? (
        <div className="text-center py-20 bg-gradient-to-r from-purple-50 via-pink-50 to-red-50 rounded-2xl border border-purple-100">
          <div className="w-32 h-32 bg-gradient-to-r from-purple-100 to-pink-100 rounded-full flex items-center justify-center mx-auto mb-8">
            <Palette className="w-16 h-16 text-purple-600" />
          </div>
          <h3 className="text-3xl font-bold text-gray-900 mb-4">Your Canvas Awaits</h3>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">
            Start your creative journey by minting your first encrypted masterpiece.
            Transform your ideas into digital art that lives forever on the blockchain.
          </p>
          <button
            onClick={() => onNavigate("mint-creation")}
            className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-4 rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 transition-all duration-300 shadow-lg hover:shadow-xl flex items-center gap-3 mx-auto"
          >
            <Plus className="w-6 h-6" />
            Begin Your Creative Journey
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">Your Creations</h2>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span>{exhibitedWorks} exhibited</span>
              <span>•</span>
              <span>{displayCreations.length - exhibitedWorks} private</span>
            </div>
          </div>

          {(isLoading || loadingUserWorks) && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
              <span className="ml-2 text-gray-600">Loading your creations...</span>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-center">
              <p className="text-red-700">{error}</p>
              <p className="text-sm text-red-600 mt-1">Please check your wallet connection.</p>
            </div>
          )}

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayCreations.map((creation) => (
              <div
                key={creation.id}
                className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-1 border border-gray-100 overflow-hidden"
              >
                {/* Creation Preview */}
                <div className={`h-40 bg-gradient-to-br ${creation.color} relative overflow-hidden`}>
                  <div className="absolute inset-0 bg-black/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <Eye className="w-6 h-6 text-white" />
                  </div>
                  <div className="absolute top-3 left-3 flex gap-2">
                    {creation.isPremium && (
                      <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                        <Crown className="w-3 h-3" />
                        PREMIUM
                      </div>
                    )}
                    {creation.isExhibited && (
                      <div className="bg-gradient-to-r from-green-400 to-emerald-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                        EXHIBITED
                      </div>
                    )}
                  </div>
                </div>

                {/* Creation Info */}
                <div className="p-6 space-y-4">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-purple-600 transition-colors">
                      {creation.title}
                    </h3>
                    <p className="text-gray-600 text-sm leading-relaxed line-clamp-2">
                      {creation.description}
                    </p>
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-2">
                    {creation.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 px-3 py-1 rounded-full text-xs font-medium"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>

                  {/* Stats */}
                  <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1">
                        <Heart className="w-4 h-4 text-red-500" />
                        <span className="text-sm font-medium text-gray-700">{creation.appreciations}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Eye className="w-4 h-4 text-gray-500" />
                        <span className="text-sm font-medium text-gray-700">{creation.views}</span>
                      </div>
                    </div>
                    <span className="text-sm text-gray-500">{creation.createdAt}</span>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-2">
                    <button className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white py-2 px-4 rounded-lg font-medium hover:from-purple-700 hover:to-pink-700 transition-all duration-300 flex items-center justify-center gap-2 text-sm">
                      <Eye className="w-4 h-4" />
                      View
                    </button>
                    <button className="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-lg font-medium hover:bg-gray-200 transition-all duration-300 flex items-center justify-center gap-2 text-sm">
                      <Edit className="w-4 h-4" />
                      Edit
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Inspiration Section */}
      <div className="bg-gradient-to-r from-purple-50 via-pink-50 to-red-50 rounded-2xl p-8 border border-purple-100">
        <div className="text-center">
          <TrendingUp className="w-12 h-12 text-purple-600 mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-gray-900 mb-4">Creative Analytics</h3>
          <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
            Track your creative impact and discover what resonates with the community.
            Use insights to refine your artistic vision.
          </p>
          <div className="grid md:grid-cols-3 gap-4 max-w-2xl mx-auto">
            <div className="bg-white/70 p-4 rounded-xl">
              <div className="text-2xl font-bold text-purple-600">{Math.round(totalAppreciations / Math.max(displayCreations.length, 1))}</div>
              <div className="text-sm text-gray-600">Avg Appreciations</div>
            </div>
            <div className="bg-white/70 p-4 rounded-xl">
              <div className="text-2xl font-bold text-pink-600">{Math.round(totalViews / Math.max(displayCreations.length, 1))}</div>
              <div className="text-sm text-gray-600">Avg Views</div>
            </div>
            <div className="bg-white/70 p-4 rounded-xl">
              <div className="text-2xl font-bold text-red-600">{exhibitedWorks}</div>
              <div className="text-sm text-gray-600">Public Works</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}