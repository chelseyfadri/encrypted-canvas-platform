"use client";

import { Shield, Lock, Users, FileText, Heart, Plus, Wallet } from "lucide-react";
import { useMetaMask } from "@/hooks/metamask/useMetaMaskProvider";

type PageType = "welcome" | "blogs" | "my-blogs" | "create-blog";

interface WelcomePageProps {
  onNavigate: (page: PageType) => void;
}

export function WelcomePage({ onNavigate }: WelcomePageProps) {
  const { isConnected, connect } = useMetaMask();

  const features = [
    {
      icon: Lock,
      title: "Privacy First",
      description: "Your blog content is encrypted using FHEVM technology, ensuring only authorized readers can access it.",
    },
    {
      icon: Users,
      title: "Selective Sharing",
      description: "Choose whether your blog posts are public or private. Control who can read your content.",
    },
    {
      icon: Heart,
      title: "Encrypted Likes",
      description: "Like count is encrypted and privacy-preserving. Show appreciation without revealing preferences.",
    },
    {
      icon: Shield,
      title: "Secure by Design",
      description: "Built on FHEVM (Fully Homomorphic Encryption Virtual Machine) for mathematical privacy guarantees.",
    },
  ];

  const stats = [
    { label: "Total Blogs", value: "0", icon: FileText },
    { label: "Active Users", value: "0", icon: Users },
    { label: "Encrypted Posts", value: "0", icon: Lock },
  ];

  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <div className="text-center space-y-6">
        <div className="space-y-4">
          <h1 className="text-5xl font-bold text-gray-900 leading-tight">
            Welcome to <span className="text-indigo-600">FHE Blog</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Experience the future of blogging with Fully Homomorphic Encryption.
            Write, share, and interact with complete privacy and security.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          {isConnected ? (
            <>
              <button
                onClick={() => onNavigate("create-blog")}
                className="bg-indigo-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-indigo-700 transition-colors flex items-center gap-2"
              >
                <Plus size={20} />
                Start Writing
              </button>
              <button
                onClick={() => onNavigate("blogs")}
                className="border-2 border-indigo-600 text-indigo-600 px-8 py-3 rounded-lg font-semibold hover:bg-indigo-50 transition-colors"
              >
                Explore Blogs
              </button>
            </>
          ) : (
            <button
              onClick={connect}
              className="bg-orange-500 text-white px-8 py-3 rounded-lg font-semibold hover:bg-orange-600 transition-colors flex items-center gap-2"
            >
              <Wallet size={20} />
              Connect Wallet to Get Started
            </button>
          )}
        </div>
      </div>

      {/* Features Section */}
      <div className="space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Why FHE Blog?</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Traditional blogging platforms compromise your privacy. FHE Blog uses cutting-edge cryptography
            to protect your content while maintaining full functionality.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
            >
              <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
                <feature.icon className="w-6 h-6 text-indigo-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
              <p className="text-gray-600 text-sm leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Stats Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900">Community Stats</h2>
          <p className="text-gray-600 mt-2">Growing together in privacy</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <stat.icon className="w-8 h-8 text-indigo-600" />
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</div>
              <div className="text-gray-600">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* How It Works */}
      <div className="space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">How It Works</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Simple, secure, and private blogging in just a few steps.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="text-center space-y-4">
            <div className="w-12 h-12 bg-indigo-600 text-white rounded-full flex items-center justify-center mx-auto text-xl font-bold">
              1
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Write & Encrypt</h3>
            <p className="text-gray-600 text-sm">
              Create your blog post. Your content is automatically encrypted using FHEVM before being stored on-chain.
            </p>
          </div>

          <div className="text-center space-y-4">
            <div className="w-12 h-12 bg-indigo-600 text-white rounded-full flex items-center justify-center mx-auto text-xl font-bold">
              2
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Choose Privacy</h3>
            <p className="text-gray-600 text-sm">
              Decide if your post is public or private. Public posts can be read by anyone, private posts require permission.
            </p>
          </div>

          <div className="text-center space-y-4">
            <div className="w-12 h-12 bg-indigo-600 text-white rounded-full flex items-center justify-center mx-auto text-xl font-bold">
              3
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Interact Securely</h3>
            <p className="text-gray-600 text-sm">
              Readers can like posts and view content based on your privacy settings, all while maintaining encryption.
            </p>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="text-center bg-indigo-600 text-white rounded-xl p-8">
        <h2 className="text-3xl font-bold mb-4">Ready to Start Blogging?</h2>
        <p className="text-indigo-100 mb-6 max-w-2xl mx-auto">
          Join the privacy-first blogging revolution. Your thoughts, your privacy, your control.
        </p>
        {isConnected ? (
          <button
            onClick={() => onNavigate("create-blog")}
            className="bg-white text-indigo-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
          >
            Create Your First Blog Post
          </button>
        ) : (
          <button
            onClick={connect}
            className="bg-white text-indigo-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors flex items-center gap-2 mx-auto"
          >
            <Wallet size={20} />
            Connect Wallet to Start
          </button>
        )}
      </div>
    </div>
  );
}
