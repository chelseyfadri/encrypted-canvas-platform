# FHEVM Blog dApp

A decentralized blog application built with FHEVM (Fully Homomorphic Encryption Virtual Machine) for content privacy.

## Features

- ✅ **Encrypted Blog Content**: Blog content is encrypted using FHEVM technology
- ✅ **Selective Privacy**: Choose between public and private blog posts
- ✅ **Encrypted Likes**: Like counts are encrypted and privacy-preserving
- ✅ **Decentralized**: Built on blockchain with smart contracts
- ✅ **Modern UI**: Clean and responsive React interface

## Architecture

### Smart Contracts (`fhevm-hardhat-template/`)
- **FHECounter.sol**: Basic counter contract for testing
- **FHEBlog.sol**: Main blog contract with FHEVM encryption
  - Blog creation with encrypted content
  - Public/private visibility control
  - Encrypted like system
  - Access control for content decryption

### Frontend (`frontend-blog/`)
- **Welcome Page**: Introduction and feature overview
- **Blog List**: View all public blogs
- **My Blogs**: Manage your own blog posts
- **Create Blog**: Write new encrypted blog posts
- **Real-time Decryption**: FHEVM-powered content decryption

## Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn
- MetaMask wallet

### 1. Start Local Blockchain
```bash
cd fhevm-hardhat-template
npm install
npx hardhat node
```

### 2. Deploy Contracts
```bash
npx hardhat deploy --network localhost
```

### 3. Start Frontend (Mock Mode)
```bash
cd ../frontend-blog
npm install
npm run dev:mock
```

### 4. Open Browser
Navigate to `http://localhost:3000`

## Usage Guide

### 1. Connect Wallet
- Click "Connect to MetaMask" on the welcome page
- Approve the connection in MetaMask

### 2. Create a Blog Post
- Click "Create Blog" in the navigation
- Enter title and content
- Choose privacy setting (Public/Private)
- Click "Publish Blog"

### 3. View Blogs
- **All Blogs**: See all public blog posts
- **My Blogs**: Manage your own posts
- Click "Decrypt" to view encrypted content (if authorized)

### 4. Interact with Posts
- Like/unlike blog posts
- View like counts (encrypted)
- Share blog links

## Technical Details

### FHEVM Integration
- Uses `@zama-fhe/relayer-sdk` for FHEVM operations
- Implements encrypted inputs/outputs
- Handles decryption signatures
- Manages public key storage

### Contract Functions
```solidity
// Create blog with encrypted content
function createBlog(string title, externalEuint256 content, bytes inputProof, bool isPublic)

// Get blog metadata (title, author, etc.)
function getBlog(uint256 blogId) returns (string, address, uint256, bool)

// Get encrypted content (with access control)
function getBlogContent(uint256 blogId) returns (euint256)

// Like/unlike blogs
function likeBlog(uint256 blogId)
function unlikeBlog(uint256 blogId)

// Get encrypted like count
function getLikeCount(uint256 blogId) returns (euint32)
```

### Frontend Architecture
- **React 19** with TypeScript
- **Tailwind CSS** for styling
- **Custom Hooks** for FHEVM integration
- **Context Providers** for wallet management

## Development Tasks

### Available Hardhat Tasks
```bash
# Blog management
npx hardhat task:create-blog --title "My Title" --content "My Content" --public true
npx hardhat task:list-blogs
npx hardhat task:like-blog --blogid 0
npx hardhat task:get-blog-likes --blogid 0

# Contract info
npx hardhat task:blog-address
```

### Frontend Scripts
```bash
npm run dev          # Development mode
npm run dev:mock     # Mock mode (recommended for development)
npm run build        # Production build
npm run genabi       # Generate contract ABIs
```

## Security Considerations

### Privacy Features
- **Content Encryption**: Blog content is encrypted on-chain
- **Access Control**: Private blogs require author permission
- **Encrypted Metadata**: Like counts remain private
- **Zero-Knowledge**: No plaintext data exposure

### Smart Contract Security
- **Input Validation**: All inputs validated before processing
- **Access Control**: Functions check caller permissions
- **Overflow Protection**: Arithmetic operations are safe
- **Event Logging**: All state changes are logged

## Deployment

### Local Development
1. Start Hardhat node
2. Deploy contracts
3. Generate ABIs
4. Start frontend in mock mode

### Testnet Deployment
```bash
# Deploy to Sepolia
npx hardhat deploy --network sepolia

# Update frontend ABI
cd ../frontend-blog && npm run genabi

# Start frontend (connect to real network)
npm run dev
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Implement your changes
4. Add tests if applicable
5. Submit a pull request

## License

BSD-3-Clause-Clear License

## Acknowledgments

- Built with [FHEVM](https://www.zama.ai/fhevm) by Zama
- Frontend template based on [fhevm-react-template](https://github.com/zama-ai/fhevm-react-template)
- Smart contract template from [fhevm-hardhat-template](https://github.com/zama-ai/fhevm-hardhat-template)
