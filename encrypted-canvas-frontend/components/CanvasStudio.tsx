"use client";

import { Shield, Lock, Palette, Heart, Wallet, Sparkles, Crown } from "lucide-react";
import { useMetaMask } from "@/hooks/metamask/useMetaMaskProvider";

interface CanvasStudioProps {
  onNavigate: (page: "studio" | "gallery" | "my-creations" | "mint-creation") => void;
}

export function CanvasStudio({ onNavigate }: CanvasStudioProps) {
  const { isConnected, connect } = useMetaMask();

  const features = [
    {
      icon: Lock,
      title: "Quantum Privacy",
      description: "Your creative works are encrypted using FHEVM technology, ensuring only authorized viewers can access your masterpieces.",
    },
    {
      icon: Palette,
      title: "Selective Exhibition",
      description: "Choose whether your creations are publicly exhibited or remain in your private collection. Control your artistic exposure.",
    },
    {
      icon: Heart,
      title: "Encrypted Appreciation",
      description: "Appreciation count is encrypted and privacy-preserving. Receive recognition without compromising your creative integrity.",
    },
    {
      icon: Crown,
      title: "Premium Creator Status",
      description: "Unlock exclusive features and badges as you establish yourself in our elite creative community.",
    },
    {
      icon: Sparkles,
      title: "NFT Minting Ready",
      description: "Transform your digital creations into unique NFTs with built-in privacy protection and provenance tracking.",
    },
    {
      icon: Shield,
      title: "Cryptographic Excellence",
      description: "Powered by FHEVM (Fully Homomorphic Encryption Virtual Machine) for unparalleled security in the creative space.",
    },
  ];

  const stats = [
    { label: "Masterpieces Created", value: "0", icon: Palette },
    { label: "Elite Creators", value: "0", icon: Crown },
    { label: "Encrypted Works", value: "0", icon: Lock },
    { label: "Premium Collections", value: "0", icon: Sparkles },
  ];

  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <div className="text-center space-y-6">
        <div className="space-y-4">
          <h1 className="text-5xl font-bold text-gray-900 leading-tight">
            Welcome to <span className="text-purple-600">Encrypted Canvas</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            The premier destination for creative minds seeking absolute privacy.
            Craft, exhibit, and monetize your digital masterpieces with quantum-grade encryption.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          {isConnected ? (
            <>
              <button
                onClick={() => onNavigate("mint-creation")}
                className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition-all duration-300 flex items-center gap-2 shadow-lg"
              >
                <Sparkles size={20} />
                Mint Your First Creation
              </button>
              <button
                onClick={() => onNavigate("gallery")}
                className="border-2 border-purple-600 text-purple-600 px-8 py-3 rounded-lg font-semibold hover:bg-purple-50 transition-colors"
              >
                Explore Masterpieces
              </button>
            </>
          ) : (
            <button
              onClick={connect}
              className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-8 py-3 rounded-lg font-semibold hover:from-orange-600 hover:to-red-600 transition-all duration-300 flex items-center gap-2 shadow-lg"
            >
              <Wallet size={20} />
              Connect Wallet to Begin Creating
            </button>
          )}
        </div>
      </div>

      {/* Features Section */}
      <div className="space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Encrypted Canvas?</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Traditional creative platforms compromise your artistic integrity. Encrypted Canvas uses quantum cryptography
            to protect your masterpieces while enabling true creative freedom.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-white p-6 rounded-xl shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
            >
              <div className="w-12 h-12 bg-gradient-to-r from-purple-100 to-pink-100 rounded-lg flex items-center justify-center mb-4">
                <feature.icon className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
              <p className="text-gray-600 text-sm leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Stats Section */}
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl shadow-lg border border-purple-200 p-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900">Creative Community</h2>
          <p className="text-gray-600 mt-2">Where privacy meets artistic excellence</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-100 to-pink-100 rounded-full flex items-center justify-center mx-auto mb-4 shadow-md">
                <stat.icon className="w-8 h-8 text-purple-600" />
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</div>
              <div className="text-gray-600 text-sm">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* How It Works */}
      <div className="space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">The Creative Process</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Transform your ideas into encrypted masterpieces in just three elegant steps.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="text-center space-y-4">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full flex items-center justify-center mx-auto text-xl font-bold shadow-lg">
              1
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Create & Encrypt</h3>
            <p className="text-gray-600 text-sm">
              Craft your digital masterpiece. Your creation is automatically encrypted using FHEVM before being minted on-chain.
            </p>
          </div>

          <div className="text-center space-y-4">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full flex items-center justify-center mx-auto text-xl font-bold shadow-lg">
              2
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Curate Exhibition</h3>
            <p className="text-gray-600 text-sm">
              Decide your exhibition strategy. Public exhibitions allow global appreciation, private collections remain exclusive.
            </p>
          </div>

          <div className="text-center space-y-4">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full flex items-center justify-center mx-auto text-xl font-bold shadow-lg">
              3
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Receive Recognition</h3>
            <p className="text-gray-600 text-sm">
              Collectors can appreciate your work and view content based on your exhibition settings, all with quantum privacy.
            </p>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="text-center bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 text-white rounded-xl p-8 shadow-2xl">
        <h2 className="text-3xl font-bold mb-4">Ready to Create Masterpieces?</h2>
        <p className="text-purple-100 mb-6 max-w-2xl mx-auto">
          Join the elite circle of privacy-preserving creators. Your art, your privacy, your legacy.
        </p>
        {isConnected ? (
          <button
            onClick={() => onNavigate("mint-creation")}
            className="bg-white text-purple-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-all duration-300 shadow-lg hover:shadow-xl"
          >
            Begin Your Creative Journey
          </button>
        ) : (
          <button
            onClick={connect}
            className="bg-white text-purple-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-all duration-300 flex items-center gap-2 mx-auto shadow-lg hover:shadow-xl"
          >
            <Wallet size={20} />
            Connect Wallet to Create
          </button>
        )}
      </div>
    </div>
  );
}
