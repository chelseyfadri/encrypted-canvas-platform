# Encrypted Canvas - Premium Creative Platform

A revolutionary decentralized creative platform built with FHEVM (Fully Homomorphic Encryption Virtual Machine) for unparalleled artistic privacy and security.

## ✨ Features

- 🎨 **Encrypted Masterpieces**: Digital creations are encrypted using quantum-grade FHEVM technology
- 👑 **Selective Exhibition**: Choose between public exhibitions and private collections
- 💎 **Encrypted Appreciation**: Appreciation counts are encrypted and privacy-preserving
- 🏆 **Premium Creator Status**: Unlock exclusive features and elite badges
- 🏷️ **Creative Tagging**: Organize works with custom tags and categories
- 🌟 **NFT Ready**: Transform creations into unique NFTs with built-in provenance
- 🔒 **Decentralized**: Built on blockchain with immutable smart contracts
- 🎭 **Luxury UI**: Elegant, modern interface with gradient themes and smooth animations

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn
- MetaMask wallet

### 1. Install Dependencies
```bash
# Install root dependencies
npm install

# Install hardhat dependencies
cd fhevm-hardhat-template && npm install

# Install frontend dependencies
cd ../encrypted-canvas-frontend && npm install
```

### 2. Start Local Blockchain
```bash
cd fhevm-hardhat-template
npx hardhat node
```

### 3. Deploy Contracts
```bash
npx hardhat deploy --network localhost
```

### 4. Start Frontend
```bash
cd ../encrypted-canvas-frontend
npm run dev:mock
```

### 5. Open Browser
Navigate to `http://localhost:3000`

## 🎨 The Creative Experience

### For Creators
- **Mint Creations**: Transform ideas into encrypted digital masterpieces
- **Private Collections**: Keep works exclusive or exhibit them publicly
- **Earn Recognition**: Receive encrypted appreciation from the community
- **Premium Status**: Unlock advanced features and special badges

### For Collectors
- **Explore Gallery**: Discover encrypted artworks in our curated gallery
- **Appreciate Works**: Show support with privacy-preserving appreciation
- **Collect NFTs**: Own unique digital assets with verified provenance
- **Support Artists**: Help creators through encrypted patronage

## 🛠️ Architecture

- **Smart Contracts**: Solidity contracts using FHEVM for encrypted operations
- **Privacy Ledger**: Encrypted value tracking and accumulation
- **Frontend**: Next.js 15 with TypeScript and premium Tailwind CSS
- **Encryption**: FHEVM relayer SDK for homomorphic encryption
- **Blockchain**: Ethereum Sepolia testnet deployment
- **UI Theme**: Luxury gradient design with purple/pink/red palette

## 📊 Contract Methods

### Privacy Ledger
- `getAccumulatedValue()` - Retrieve encrypted accumulated value
- `accumulateValue()` - Add encrypted value to accumulation
- `diminishValue()` - Subtract encrypted value from accumulation

### Encrypted Canvas
- `mintCreation()` - Create new encrypted artwork
- `getCreation()` - View creation metadata
- `getCreationContent()` - Access encrypted content (permission-based)
- `appreciateCreation()` - Show encrypted appreciation
- `withdrawAppreciation()` - Remove appreciation
- `getCreatorWorks()` - List creator's portfolio
- `grantPremiumBadge()` - Award premium creator status

## 🎯 Use Cases

- **Digital Artists**: Protect intellectual property while showcasing work
- **Writers**: Publish encrypted literature with selective access
- **Musicians**: Share compositions with privacy controls
- **Photographers**: Exhibit encrypted portfolios
- **NFT Creators**: Mint privacy-preserving digital collectibles
- **Content Creators**: Build exclusive communities with encrypted content

## 🚀 Deployment

The frontend is built as static files and can be deployed to Vercel, Netlify, or any static hosting service.

```bash
cd encrypted-canvas-frontend
npm run build
# Deploy the 'out/' directory
```

## 📜 License

BSD-3-Clause-Clear License

## 🌟 Vision

Encrypted Canvas represents the future of creative expression in the digital age - where privacy meets artistry, and innovation meets elegance. Join the elite circle of creators who demand both beauty and security.
