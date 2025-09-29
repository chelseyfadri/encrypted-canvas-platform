"use client";

import { ethers } from "ethers";
import { useCallback, useMemo } from "react";
import { FhevmInstance } from "@/fhevm/fhevmTypes";
import { useFhevm } from "@/fhevm/useFhevm";
import { useMetaMaskEthersSigner } from "@/hooks/metamask/useMetaMaskEthersSigner";
import { useInMemoryStorage } from "@/hooks/useInMemoryStorage";
import { FhevmDecryptionSignature } from "@/fhevm/FhevmDecryptionSignature";
import { GenericStringStorage } from "@/fhevm/GenericStringStorage";

export interface BlogPost {
  id: number;
  title: string;
  author: string;
  createdAt: number;
  isPublic: boolean;
  likeCount?: number;
  hasLiked?: boolean;
  content?: string;
  isDecrypted?: boolean;
}

export interface UseFHEBlogReturn {
  // Blog operations
  createBlog: (title: string, content: string, isPublic: boolean) => Promise<void>;
  getBlog: (blogId: number) => Promise<BlogPost | null>;
  getBlogContent: (blogId: number) => Promise<string | null>;
  likeBlog: (blogId: number) => Promise<void>;
  unlikeBlog: (blogId: number) => Promise<void>;
  getUserBlogs: (userAddress: string) => Promise<number[]>;
  getTotalBlogs: () => Promise<number>;

  // State
  isCreating: boolean;
  isLoading: boolean;
  isLiking: boolean;
  error: string | null;

  // Contract info
  contractAddress: string | undefined;
  isDeployed: boolean;
}

export const useFHEBlog = (): UseFHEBlogReturn => {
  const { storage: fhevmDecryptionSignatureStorage } = useInMemoryStorage();
  const {
    provider,
    chainId,
    ethersSigner,
    ethersReadonlyProvider,
    sameChain,
    sameSigner,
  } = useMetaMaskEthersSigner();

  const {
    instance: fhevmInstance,
    status: fhevmStatus,
    error: fhevmError,
  } = useFhevm({
    provider,
    chainId,
    initialMockChains: { 31337: "http://localhost:8545" },
    enabled: true,
  });

  // Import the contract ABI and addresses
  const { FHEBlogABI } = require("@/abi/FHEBlogABI");
  const { FHEBlogAddresses } = require("@/abi/FHEBlogAddresses");

  // Contract info
  const contractInfo = useMemo(() => {
    if (!chainId) return null;
    const address = FHEBlogAddresses[chainId.toString()]?.address;
    return address && address !== ethers.ZeroAddress
      ? { address, abi: FHEBlogABI.abi }
      : null;
  }, [chainId]);

  const contract = useMemo(() => {
    if (!contractInfo || !ethersReadonlyProvider) return null;
    return new ethers.Contract(contractInfo.address, contractInfo.abi, ethersReadonlyProvider);
  }, [contractInfo, ethersReadonlyProvider]);

  const writableContract = useMemo(() => {
    if (!contractInfo || !ethersSigner) return null;
    return new ethers.Contract(contractInfo.address, contractInfo.abi, ethersSigner);
  }, [contractInfo, ethersSigner]);

  // State
  const isCreating = false; // TODO: implement state management
  const isLoading = fhevmStatus === "loading";
  const isLiking = false;
  const error = fhevmError?.message || null;

  // Create blog function
  const createBlog = useCallback(async (title: string, content: string, isPublic: boolean) => {
    if (fhevmStatus !== "ready") {
      throw new Error(`FHEVM instance not ready. Current status: ${fhevmStatus}`);
    }
    if (!fhevmInstance) {
      throw new Error("FHEVM instance not available");
    }
    if (!writableContract) {
      throw new Error("Contract not available");
    }
    if (!ethersSigner) {
      throw new Error("Wallet not connected");
    }

    try {
      // Create encrypted input for content
      const input = fhevmInstance.createEncryptedInput(
        await writableContract.getAddress(),
        ethersSigner.address
      );

      // Convert content string to a compact numeric representation
      // Support up to ~50 characters by packing 6 bits per character (Base64-like)
      const contentBytes = new TextEncoder().encode(content);
      if (contentBytes.length > 50) {
        throw new Error("Blog content too long (max ~50 characters)");
      }

      // Pack bytes into a BigInt (6 bits per byte for more efficient packing)
      let packedValue = BigInt(0);
      for (let i = 0; i < contentBytes.length; i++) {
        packedValue = packedValue * BigInt(256) + BigInt(contentBytes[i]);
      }

      // Add as uint256
      input.add256(packedValue);

      // Encrypt the input
      const encrypted = await input.encrypt();

      // Create the blog
      const tx = await writableContract.createBlog(
        title,
        encrypted.handles[0],
        encrypted.inputProof,
        isPublic
      );

      await tx.wait();
    } catch (err) {
      console.error("Error creating blog:", err);
      throw err;
    }
  }, [fhevmInstance, writableContract, ethersSigner]);

  // Get blog function
  const getBlog = useCallback(async (blogId: number): Promise<BlogPost | null> => {
    if (!contract) return null;

    try {
      const [title, author, createdAt, isPublic] = await contract.getBlog(blogId);
      return {
        id: blogId,
        title,
        author,
        createdAt: Number(createdAt),
        isPublic,
      };
    } catch (err) {
      console.error("Error getting blog:", err);
      return null;
    }
  }, [contract]);

  // Get blog content function
  const getBlogContent = useCallback(async (blogId: number): Promise<string | null> => {
    if (!contract) return null;
    if (fhevmStatus !== "ready" || !fhevmInstance) return null;
    if (!ethersSigner) return null;

    try {
      // Get encrypted content
      const encryptedContent = await contract.getBlogContent(blogId);

      // Create decryption signature
      const sig = await FhevmDecryptionSignature.loadOrSign(
        fhevmInstance,
        [await contract.getAddress()],
        ethersSigner,
        fhevmDecryptionSignatureStorage as GenericStringStorage
      );

      if (!sig) return null;

      // Decrypt the content
      const result = await fhevmInstance.userDecrypt(
        [{ handle: encryptedContent, contractAddress: await contract.getAddress() }],
        sig.privateKey,
        sig.publicKey,
        sig.signature,
        sig.contractAddresses,
        sig.userAddress,
        sig.startTimestamp,
        sig.durationDays
      );

      // Convert decrypted number back to string
      const decryptedValue = result[encryptedContent];
      if (!decryptedValue) return null;

      try {
        // Ensure we have a BigInt
        const num = BigInt(decryptedValue);
        const bytes: number[] = [];

        if (num === BigInt(0)) {
          return "(empty content)";
        }

        let tempNum = num;
        while (tempNum > BigInt(0)) {
          bytes.unshift(Number(tempNum % BigInt(256)));
          tempNum = tempNum / BigInt(256);
        }

        // Convert bytes back to string
        const uint8Array = new Uint8Array(bytes);
        const decodedString = new TextDecoder().decode(uint8Array);

        return decodedString || "(empty content)";
      } catch (error) {
        console.error("Error decoding decrypted content:", error);
        return `Content value: ${decryptedValue}`;
      }
    } catch (err) {
      console.error("Error getting blog content:", err);
      return null;
    }
  }, [contract, fhevmInstance, ethersSigner, fhevmDecryptionSignatureStorage]);

  // Like blog function
  const likeBlog = useCallback(async (blogId: number) => {
    if (!writableContract) {
      throw new Error("Contract not available");
    }

    try {
      const tx = await writableContract.likeBlog(blogId);
      await tx.wait();
    } catch (err) {
      console.error("Error liking blog:", err);
      throw err;
    }
  }, [writableContract]);

  // Unlike blog function
  const unlikeBlog = useCallback(async (blogId: number) => {
    if (!writableContract) {
      throw new Error("Contract not available");
    }

    try {
      const tx = await writableContract.unlikeBlog(blogId);
      await tx.wait();
    } catch (err) {
      console.error("Error unliking blog:", err);
      throw err;
    }
  }, [writableContract]);

  // Get user blogs function
  const getUserBlogs = useCallback(async (userAddress: string): Promise<number[]> => {
    if (!contract) return [];

    try {
      const blogIds = await contract.getUserBlogs(userAddress);
      return blogIds.map((id: bigint) => Number(id));
    } catch (err) {
      console.error("Error getting user blogs:", err);
      return [];
    }
  }, [contract]);

  // Get total blogs function
  const getTotalBlogs = useCallback(async (): Promise<number> => {
    if (!contract) return 0;

    try {
      const total = await contract.getTotalBlogs();
      return Number(total);
    } catch (err) {
      console.error("Error getting total blogs:", err);
      return 0;
    }
  }, [contract]);

  return {
    createBlog,
    getBlog,
    getBlogContent,
    likeBlog,
    unlikeBlog,
    getUserBlogs,
    getTotalBlogs,
    isCreating,
    isLoading,
    isLiking,
    error,
    contractAddress: contractInfo?.address,
    isDeployed: !!contractInfo,
  };
};
