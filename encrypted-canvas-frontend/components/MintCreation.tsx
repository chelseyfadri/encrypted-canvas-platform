"use client";

import { useState } from "react";
import { Tag, Eye, EyeOff, Sparkles, CheckCircle, AlertCircle } from "lucide-react";
import { useEncryptedCanvas } from "../hooks/useEncryptedCanvas";

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

interface MintCreationProps {
  onNavigate: (page: "studio" | "gallery" | "my-creations" | "mint-creation") => void;
  onCreationMinted?: (creation: Creation) => void;
}

export function MintCreation({ onNavigate, onCreationMinted }: MintCreationProps) {
  const { mintCreation, isLoading: contractLoading } = useEncryptedCanvas();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tags, setTags] = useState("");
  const [isExhibited, setIsExhibited] = useState(true);
  const [isMinting, setIsMinting] = useState(false);
  const [mintStatus, setMintStatus] = useState<"idle" | "minting" | "success" | "error">("idle");
  const [errors, setErrors] = useState<string[]>([]);

  const validateForm = () => {
    const newErrors: string[] = [];

    if (!title.trim()) {
      newErrors.push("Title is required");
    } else if (title.length < 3) {
      newErrors.push("Title must be at least 3 characters");
    } else if (title.length > 100) {
      newErrors.push("Title must be less than 100 characters");
    }

    if (!content.trim()) {
      newErrors.push("Content is required");
    } else if (content.length < 10) {
      newErrors.push("Content must be at least 10 characters");
    } else if (content.length > 10000) {
      newErrors.push("Content must be less than 10,000 characters");
    }

    const tagArray = tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
    if (tagArray.length > 5) {
      newErrors.push("Maximum 5 tags allowed");
    }
    if (tagArray.some(tag => tag.length > 20)) {
      newErrors.push("Each tag must be less than 20 characters");
    }

    setErrors(newErrors);
    return newErrors.length === 0;
  };

  const handleMint = async () => {
    if (!validateForm()) return;

    setIsMinting(true);
    setMintStatus("minting");
    setErrors([]);

    try {
      const tagArray = tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);

      // Call the actual contract method
      await mintCreation(
        title.trim(),
        content.trim(),
        tagArray,
        isExhibited
      );

      // Create the new creation object for UI update
      const newCreation: Creation = {
        id: Date.now().toString(), // This would be the actual ID from the contract
        title: title.trim(),
        description: content.trim(),
        tags: tagArray,
        appreciations: 0,
        views: 0,
        isPremium: false, // In a real app, this would be determined by creator status
        isExhibited: isExhibited,
        createdAt: "Just now",
        color: getRandomColor(),
        creator: "0xCurrentUser..." // In a real app, this would come from wallet
      };

      // Notify parent component
      if (onCreationMinted) {
        onCreationMinted(newCreation);
      }

      setMintStatus("success");

      // Redirect after showing success message
      setTimeout(() => {
        onNavigate("my-creations");
      }, 2000);

    } catch (error) {
      console.error("Minting failed:", error);
      setMintStatus("error");
      setIsMinting(false);
      setErrors([error instanceof Error ? error.message : "Failed to mint creation. Please try again."]);
    }
  };

  const getRandomColor = () => {
    const colors = [
      "from-blue-400 to-purple-600",
      "from-green-400 to-teal-600",
      "from-pink-400 to-red-600",
      "from-yellow-400 to-orange-600",
      "from-indigo-400 to-purple-700",
      "from-cyan-400 to-blue-600"
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  const resetForm = () => {
    setTitle("");
    setContent("");
    setTags("");
    setIsExhibited(true);
    setErrors([]);
    setMintStatus("idle");
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Mint Your Creation</h1>
        <p className="text-gray-600">Transform your ideas into encrypted digital masterpieces</p>
      </div>

      {/* Status Messages */}
      {errors.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="text-sm font-semibold text-red-800 mb-2">Please fix the following errors:</h3>
              <ul className="text-sm text-red-700 space-y-1">
                {errors.map((error, index) => (
                  <li key={index}>• {error}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {mintStatus === "success" && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-green-500" />
            <div>
              <h3 className="text-sm font-semibold text-green-800">Creation Minted Successfully!</h3>
              <p className="text-sm text-green-700">Your masterpiece has been encrypted and stored on the blockchain.</p>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-lg p-8 space-y-6">
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            Creation Title *
            <span className="text-xs text-gray-500 ml-2">({title.length}/100 characters)</span>
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter your masterpiece title"
            maxLength={100}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors ${
              errors.some(e => e.includes("Title")) ? "border-red-300 bg-red-50" : "border-gray-300"
            }`}
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            Content *
            <span className="text-xs text-gray-500 ml-2">({content.length}/10,000 characters)</span>
          </label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Pour your creativity here... Let your imagination flow freely. This content will be encrypted and stored on the blockchain forever."
            rows={8}
            maxLength={10000}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-vertical transition-colors ${
              errors.some(e => e.includes("Content")) ? "border-red-300 bg-red-50" : "border-gray-300"
            }`}
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            Tags (comma-separated)
            <span className="text-xs text-gray-500 ml-2">(max 5 tags)</span>
          </label>
          <div className="relative">
            <Tag className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="art, digital, abstract, poetry, quantum..."
              className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors ${
                errors.some(e => e.includes("tag")) ? "border-red-300 bg-red-50" : "border-gray-300"
              }`}
            />
          </div>
          {tags && (
            <div className="mt-2 flex flex-wrap gap-2">
              {tags.split(',').map((tag, index) => {
                const trimmedTag = tag.trim();
                return trimmedTag ? (
                  <span
                    key={index}
                    className="bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 px-3 py-1 rounded-full text-xs font-medium"
                  >
                    #{trimmedTag}
                  </span>
                ) : null;
              })}
            </div>
          )}
        </div>

        <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-lg border border-purple-200">
          <label className="flex items-center space-x-3 cursor-pointer">
            <input
              type="checkbox"
              checked={isExhibited}
              onChange={(e) => setIsExhibited(e.target.checked)}
              className="w-5 h-5 text-purple-600 bg-gray-100 border-gray-300 rounded focus:ring-purple-500"
            />
            <div className="flex-1">
              <span className="text-sm font-medium text-gray-900 flex items-center gap-2">
                {isExhibited ? <Eye className="w-4 h-4 text-green-600" /> : <EyeOff className="w-4 h-4 text-gray-500" />}
                Exhibit publicly
              </span>
              <p className="text-xs text-gray-600 mt-1">
                {isExhibited
                  ? "Your creation will be visible in the public gallery and discoverable by other users."
                  : "Your creation will remain private and only accessible through direct links."
                }
              </p>
            </div>
          </label>
        </div>

        {/* Mint Status */}
        {mintStatus === "minting" && (
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-lg border border-purple-200">
            <div className="flex items-center gap-4">
              <div className="w-8 h-8 border-2 border-purple-600 border-t-transparent rounded-full animate-spin" />
              <div>
                <h3 className="text-sm font-semibold text-purple-900">Minting Your Creation...</h3>
                <p className="text-sm text-purple-700">Encrypting content and storing on blockchain</p>
              </div>
            </div>
            <div className="mt-4 bg-purple-200 rounded-full h-2">
              <div className="bg-gradient-to-r from-purple-600 to-pink-600 h-2 rounded-full animate-pulse" style={{ width: '100%' }} />
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={resetForm}
            disabled={isMinting}
            className="flex-1 bg-gray-100 text-gray-700 py-3 px-6 rounded-lg font-semibold hover:bg-gray-200 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Reset Form
          </button>
          <button
            onClick={handleMint}
            disabled={!title.trim() || !content.trim() || mintStatus === "minting" || mintStatus === "success" || contractLoading}
            className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {mintStatus === "success" ? (
              <>
                <CheckCircle className="w-5 h-5" />
                Minted!
              </>
            ) : isMinting ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Minting...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                Mint Creation
              </>
            )}
          </button>
        </div>

        {/* Help Text */}
        <div className="text-center text-xs text-gray-500 border-t border-gray-100 pt-4">
          <p>💡 <strong>Pro tip:</strong> Choose meaningful tags to help others discover your work in the gallery.</p>
          <p className="mt-1">🔒 Your content will be encrypted using FHEVM technology for maximum privacy.</p>
        </div>
      </div>
    </div>
  );
}