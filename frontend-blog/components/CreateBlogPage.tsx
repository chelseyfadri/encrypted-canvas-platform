"use client";

import { useState } from "react";
import { ArrowLeft, Save, Eye, Lock, Globe, AlertCircle } from "lucide-react";
import { useFHEBlog } from "@/hooks/useFHEBlog";
import { useMetaMaskEthersSigner } from "@/hooks/metamask/useMetaMaskEthersSigner";

type PageType = "welcome" | "blogs" | "my-blogs" | "create-blog";

interface CreateBlogPageProps {
  onNavigate: (page: PageType) => void;
}

export function CreateBlogPage({ onNavigate }: CreateBlogPageProps) {
  const { accounts, isConnected } = useMetaMaskEthersSigner();
  const { createBlog, isCreating, isLoading, error } = useFHEBlog();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isPublic, setIsPublic] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [preview, setPreview] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isConnected || !accounts?.[0]) {
      alert("Please connect your wallet first");
      return;
    }

    if (!title.trim() || !content.trim()) {
      alert("Please fill in both title and content");
      return;
    }

    // Check content byte length (50 bytes max)
    const contentBytes = new TextEncoder().encode(content);
    if (contentBytes.length > 50) {
      alert("Content is too long. Maximum 50 bytes (approximately 50 characters).");
      return;
    }

    if (!createBlog) {
      alert("Contract not available. Please make sure you're connected to the right network.");
      return;
    }

    setIsSubmitting(true);

    try {
      await createBlog(title.trim(), content.trim(), isPublic);

      // Reset form
      setTitle("");
      setContent("");
      setIsPublic(true);

      // Navigate to my blogs
      onNavigate("my-blogs");

      alert("Blog created successfully!");
    } catch (error) {
      console.error("Error creating blog:", error);
      alert("Failed to create blog. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const wordCount = content.trim().split(/\s+/).filter(word => word.length > 0).length;
  const charCount = content.length;

  if (!isConnected) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => onNavigate("welcome")}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
        </div>
        <div className="text-center py-12">
          <Lock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Wallet Connection Required</h3>
          <p className="text-gray-600 mb-4">Please connect your wallet to create blog posts</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => onNavigate("welcome")}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Create New Blog</h1>
            <p className="text-gray-600 mt-1">Share your thoughts with FHEVM encryption</p>
          </div>
        </div>
      </div>

      {/* FHEVM Status */}
      {isLoading && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
            <div>
              <h4 className="text-sm font-medium text-blue-900 mb-1">Initializing FHEVM</h4>
              <p className="text-sm text-blue-700">Setting up Fully Homomorphic Encryption...</p>
            </div>
          </div>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
            <div>
              <h4 className="text-sm font-medium text-red-900 mb-1">Error</h4>
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Title */}
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
            Blog Title *
          </label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            placeholder="Enter an engaging title for your blog post..."
            maxLength={100}
            required
          />
          <div className="text-sm text-gray-500 mt-1">
            {title.length}/100 characters
          </div>
          {new TextEncoder().encode(content).length > 50 && (
            <div className="text-xs text-red-600 mt-1">
              Content too long! Maximum 50 bytes (approximately 50 characters)
            </div>
          )}
        </div>

        {/* Privacy Settings */}
        <div className="bg-gray-50 rounded-lg p-4">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Privacy Settings
          </label>
          <div className="flex gap-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="privacy"
                checked={isPublic}
                onChange={() => setIsPublic(true)}
                className="text-indigo-600 focus:ring-indigo-500"
              />
              <Globe className="w-4 h-4 text-green-600" />
              <span className="text-sm font-medium">Public</span>
              <span className="text-xs text-gray-500 ml-1">Anyone can read</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="privacy"
                checked={!isPublic}
                onChange={() => setIsPublic(false)}
                className="text-indigo-600 focus:ring-indigo-500"
              />
              <Lock className="w-4 h-4 text-orange-600" />
              <span className="text-sm font-medium">Private</span>
              <span className="text-xs text-gray-500 ml-1">Only you can read</span>
            </label>
          </div>
        </div>

        {/* Content */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <label htmlFor="content" className="block text-sm font-medium text-gray-700">
              Blog Content *
            </label>
            <button
              type="button"
              onClick={() => setPreview(!preview)}
              className="flex items-center gap-2 text-sm text-indigo-600 hover:text-indigo-800"
            >
              <Eye className="w-4 h-4" />
              {preview ? "Edit" : "Preview"}
            </button>
          </div>

          {!preview ? (
            <textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={12}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-vertical"
              placeholder="Write your blog post here... Your content will be encrypted using FHEVM."
              required
            />
          ) : (
            <div className="w-full min-h-[300px] px-4 py-3 border border-gray-300 rounded-lg bg-gray-50">
              <div className="prose prose-sm max-w-none">
                {content.split('\n').map((paragraph, index) => (
                  <p key={index} className="mb-4 last:mb-0">
                    {paragraph || '\u00A0'}
                  </p>
                ))}
              </div>
            </div>
          )}

          <div className="flex justify-between text-sm text-gray-500 mt-2">
            <span>{wordCount} words</span>
            <span>{charCount} characters</span>
          </div>
        </div>

        {/* Encryption Notice */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <h4 className="text-sm font-medium text-blue-900 mb-1">FHEVM Encryption</h4>
              <p className="text-sm text-blue-700">
                Your blog content is encrypted using Fully Homomorphic Encryption.
                Maximum content length is 50 bytes (approximately 50 characters).
                {isPublic ? " Public blogs can be decrypted by anyone." : " Private blogs can only be decrypted by you."}
              </p>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end gap-4 pt-6 border-t border-gray-200">
          <button
            type="button"
            onClick={() => onNavigate("welcome")}
            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting || isCreating || isLoading || !title.trim() || !content.trim() || !isConnected}
            className="flex items-center gap-2 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {(isSubmitting || isCreating) ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Creating...
              </>
            ) : isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Waiting for FHEVM...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Publish Blog
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
