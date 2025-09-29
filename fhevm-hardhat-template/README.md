# Encrypted Canvas - FHEVM Smart Contracts

A premium Hardhat-based template for developing Fully Homomorphic Encryption (FHE) enabled Solidity smart contracts for the Encrypted Canvas creative platform using the FHEVM protocol by Zama.

## 🎨 About Encrypted Canvas Contracts

This repository contains the core smart contracts powering the Encrypted Canvas platform:

- **PrivacyLedger**: Encrypted value accumulation and tracking contract
- **EncryptedCanvas**: Main creative platform contract for minting, exhibiting, and appreciating digital creations

## 🚀 Quick Start

For detailed instructions see:
[FHEVM Hardhat Quick Start Tutorial](https://docs.zama.ai/protocol/solidity-guides/getting-started/quick-start-tutorial)

### Prerequisites

- **Node.js**: Version 20 or higher
- **npm or yarn/pnpm**: Package manager

### Installation

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Set up environment variables**

   ```bash
   npx hardhat vars set MNEMONIC

   # Set your Infura API key for network access
   npx hardhat vars set INFURA_API_KEY

   # Optional: Set Etherscan API key for contract verification
   npx hardhat vars set ETHERSCAN_API_KEY
   ```

3. **Compile and test**

   ```bash
   npm run compile
   npm run test
   ```

4. **Deploy to local network**

   ```bash
   # Start a local FHEVM-ready node
   npx hardhat node
   # Deploy to local network
   npx hardhat deploy --network localhost
   ```

5. **Deploy to Sepolia Testnet**

   ```bash
   # Deploy to Sepolia
   npx hardhat deploy --network sepolia
   # Verify contract on Etherscan
   npx hardhat verify --network sepolia <CONTRACT_ADDRESS>
   ```

6. **Test on Sepolia Testnet**

   ```bash
   # Once deployed, you can run a simple test on Sepolia.
   npx hardhat test --network sepolia
   ```

## 📁 Project Structure

```
fhevm-hardhat-template/
├── contracts/              # Smart contract source files
│   └── EncryptedCanvas.sol # Main creative platform contracts
├── deploy/                 # Deployment scripts
├── tasks/                  # Hardhat custom tasks
│   ├── EncryptedCanvas.ts  # Canvas platform tasks
│   └── PrivacyLedger.ts    # Ledger management tasks
├── test/                   # Test files
├── hardhat.config.ts       # Hardhat configuration
└── package.json            # Dependencies and scripts
```

## 🎯 Contract Features

### PrivacyLedger Contract
- **Encrypted Accumulation**: Secure value accumulation with FHEVM encryption
- **Privacy-Preserving Operations**: Add and subtract values without revealing amounts
- **Audit Trail**: Immutable transaction history on blockchain

### EncryptedCanvas Contract
- **Digital Creation Minting**: Mint encrypted digital artworks and creations
- **Selective Exhibition**: Choose between public display and private collection
- **Encrypted Appreciation**: Privacy-preserving like/appreciation system
- **Premium Creator Badges**: Exclusive status system for elite creators
- **Creative Tagging**: Organize works with custom tags and categories
- **NFT Integration Ready**: Built-in support for NFT minting and provenance

## 🛠️ Available Tasks

### Privacy Ledger Tasks
- `task:ledger-address` - Get PrivacyLedger contract address
- `task:decrypt-accumulated` - Decrypt accumulated value
- `task:accumulate` - Add encrypted value to ledger
- `task:diminish` - Subtract encrypted value from ledger

### Canvas Platform Tasks
- `task:canvas-address` - Get EncryptedCanvas contract address
- `task:mint-creation` - Create new encrypted artwork
- `task:list-creations` - Display all minted creations
- `task:decrypt-creation-content` - Access encrypted creation content
- `task:appreciate-creation` - Show appreciation for a creation
- `task:get-creation-appreciations` - View appreciation statistics

## 📜 Available Scripts

| Script             | Description                    |
| ------------------ | ------------------------------ |
| `npm run compile`  | Compile all contracts          |
| `npm run test`     | Run all tests                  |
| `npm run coverage` | Generate coverage report       |
| `npm run lint`     | Run linting checks             |
| `npm run clean`    | Clean build artifacts          |

## 🎨 Usage Examples

```bash
# Start local FHEVM node
npx hardhat node

# Deploy contracts
npx hardhat deploy --network localhost

# Mint a new creation
npx hardhat --network localhost task:mint-creation --title "Digital Masterpiece" --content "Encrypted content" --exhibited true --tags "art,digital,abstract"

# View all creations
npx hardhat --network localhost task:list-creations

# Show appreciation
npx hardhat --network localhost task:appreciate-creation --creationid 0
```

## 📚 Documentation

- [FHEVM Documentation](https://docs.zama.ai/fhevm)
- [FHEVM Hardhat Setup Guide](https://docs.zama.ai/protocol/solidity-guides/getting-started/setup)
- [FHEVM Testing Guide](https://docs.zama.ai/protocol/solidity-guides/development-guide/hardhat/write_test)
- [FHEVM Hardhat Plugin](https://docs.zama.ai/protocol/solidity-guides/development-guide/hardhat)
- [Encrypted Canvas Platform Docs](./../README.md)

## 📄 License

This project is licensed under the BSD-3-Clause-Clear License. See the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **GitHub Issues**: [Report bugs or request features](https://github.com/zama-ai/fhevm/issues)
- **Documentation**: [FHEVM Docs](https://docs.zama.ai)
- **Community**: [Zama Discord](https://discord.gg/zama)

---

**Built with 🎨 by the Encrypted Canvas team**
