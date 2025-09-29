# FHEVM Blog dApp

A decentralized blog application built with FHEVM (Fully Homomorphic Encryption Virtual Machine) for content privacy.

## Features

- ✅ **Encrypted Blog Content**: Blog content is encrypted using FHEVM technology
- ✅ **Selective Privacy**: Choose between public and private blog posts  
- ✅ **Encrypted Likes**: Like counts are encrypted and privacy-preserving
- ✅ **Decentralized**: Built on blockchain with smart contracts
- ✅ **Modern UI**: Clean and responsive React interface

## Quick Start

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
cd ../frontend-blog && npm install
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
cd ../frontend-blog
npm run dev:mock
```

### 5. Open Browser
Navigate to `http://localhost:3000`

## Deployment

The frontend is built as static files and can be deployed to Vercel, Netlify, or any static hosting service.

```bash
cd frontend-blog
npm run build
# Deploy the 'out/' directory
```

## Architecture

- **Smart Contracts**: Solidity contracts using FHEVM for encrypted operations
- **Frontend**: Next.js 15 with TypeScript and Tailwind CSS
- **Encryption**: FHEVM relayer SDK for homomorphic encryption
- **Blockchain**: Ethereum Sepolia testnet deployment

## License

BSD-3-Clause-Clear License
