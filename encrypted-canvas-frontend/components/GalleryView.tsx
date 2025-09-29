"use client";

import { Eye, Heart, Crown, Palette, Sparkles, Clock, User, Loader2 } from "lucide-react";
import { useEncryptedCanvas } from "../hooks/useEncryptedCanvas";

export function GalleryView({ onNavigate }: { onNavigate: (page: "studio" | "gallery" | "my-creations" | "mint-creation") => void }) {
  const { creations, isLoading, error, appreciateCreation } = useEncryptedCanvas();

  const handleAppreciate = async (creationId: string) => {
    try {
      await appreciateCreation(parseInt(creationId));
    } catch (err) {
      console.error("Failed to appreciate creation:", err);
    }
  };

  return (
    <div className="space-y-12">
      {/* Gallery Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-3 mb-4">
          <Palette className="w-8 h-8 text-purple-600" />
          <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Creative Gallery
          </h1>
          <Palette className="w-8 h-8 text-pink-600" />
        </div>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
          Discover extraordinary encrypted masterpieces from our elite community of digital artists.
          Each creation holds secrets revealed only to those who truly appreciate the art.
        </p>
        <div className="flex items-center justify-center gap-4 mt-6">
          <div className="flex items-center gap-2 bg-gradient-to-r from-purple-50 to-pink-50 px-4 py-2 rounded-full">
            <Crown className="w-4 h-4 text-purple-600" />
            <span className="text-sm font-medium text-purple-700">{creations.filter(c => c.isPremium).length} Premium Works</span>
          </div>
          <div className="flex items-center gap-2 bg-gradient-to-r from-blue-50 to-purple-50 px-4 py-2 rounded-full">
            <Sparkles className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-medium text-blue-700">{creations.reduce((sum, c) => sum + c.appreciations, 0)} Total Appreciations</span>
          </div>
        </div>

        {/* Loading and Error States */}
        {isLoading && (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
            <span className="ml-2 text-gray-600">Loading creations...</span>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-center">
            <p className="text-red-700">{error}</p>
            <p className="text-sm text-red-600 mt-1">Please check your wallet connection and try again.</p>
          </div>
        )}
      </div>

      {/* Gallery Grid */}
      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-8">
        {creations.map((creation) => (
          <div
            key={creation.id}
            className="group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border border-gray-100 overflow-hidden"
          >
            {/* Creation Preview */}
            <div className={`h-48 bg-gradient-to-br ${creation.color} relative overflow-hidden`}>
              <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                <Eye className="w-8 h-8 text-white" />
              </div>
              {creation.isPremium && (
                <div className="absolute top-3 right-3 bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                  <Crown className="w-3 h-3" />
                  PREMIUM
                </div>
              )}
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
                {creation.tags.slice(0, 3).map((tag, index) => (
                  <span
                    key={index}
                    className="bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 px-3 py-1 rounded-full text-xs font-medium"
                  >
                    #{tag}
                  </span>
                ))}
                {creation.tags.length > 3 && (
                  <span className="text-gray-400 text-xs font-medium">
                    +{creation.tags.length - 3} more
                  </span>
                )}
              </div>

              {/* Creator and Stats */}
              <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-600 font-mono">{creation.creator}</span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1">
                    <Heart className="w-4 h-4 text-red-500" />
                    <span className="text-sm font-medium text-gray-700">{creation.appreciations}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-500">{creation.createdAt}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                <button className="flex-1 bg-gray-100 text-gray-700 py-2 px-3 rounded-lg font-medium hover:bg-gray-200 transition-all duration-300 flex items-center justify-center gap-2 text-sm">
                  <Eye className="w-4 h-4" />
                  View
                </button>
                <button
                  onClick={() => handleAppreciate(creation.id)}
                  disabled={isLoading}
                  className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white py-2 px-3 rounded-lg font-medium hover:from-purple-700 hover:to-pink-700 transition-all duration-300 flex items-center justify-center gap-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Heart className="w-4 h-4" />
                  Appreciate
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Call to Action */}
      <div className="text-center bg-gradient-to-r from-purple-50 via-pink-50 to-red-50 rounded-2xl p-12 border border-purple-100">
        <Sparkles className="w-16 h-16 text-purple-600 mx-auto mb-6" />
        <h3 className="text-2xl font-bold text-gray-900 mb-4">Ready to Join the Gallery?</h3>
        <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
          Transform your creative vision into an encrypted masterpiece. Join our elite community of digital artists and collectors.
        </p>
        <button
          onClick={() => onNavigate("mint-creation")}
          className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-4 rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 transition-all duration-300 shadow-lg hover:shadow-xl flex items-center gap-3 mx-auto"
        >
          <Sparkles className="w-5 h-5" />
          Mint Your Masterpiece
        </button>
      </div>
    </div>
  );
}