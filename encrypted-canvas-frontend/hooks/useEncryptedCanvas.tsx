"use client";

import { useCallback, useEffect, useState } from "react";
import { ethers } from "ethers";
import { useMetaMask } from "./metamask/useMetaMaskProvider";
import { useFhevm } from "../fhevm/useFhevm";
import { EncryptedCanvasABI } from "../abi/EncryptedCanvasABI";
import { EncryptedCanvasAddresses } from "../abi/EncryptedCanvasAddresses";

export interface CreativeWork {
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

export interface EncryptedCanvasHook {
  // Contract state
  contract: ethers.Contract | null;
  isLoading: boolean;
  error: string | null;

  // Data
  creations: CreativeWork[];
  totalCreations: number;

  // Actions
  mintCreation: (
    title: string,
    content: string,
    tags: string[],
    isExhibited: boolean
  ) => Promise<void>;
  appreciateCreation: (creationId: number) => Promise<void>;
  refreshCreations: () => Promise<void>;
}

export function useEncryptedCanvas(): EncryptedCanvasHook {
  const { provider, isConnected, chainId } = useMetaMask();
  const { instance: fhevmInstance, status: fhevmStatus } = useFhevm({
    provider,
    chainId,
    enabled: isConnected
  });

  const [contract, setContract] = useState<ethers.Contract | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [creations, setCreations] = useState<CreativeWork[]>([]);
  const [totalCreations, setTotalCreations] = useState(0);

  // Initialize contract
  useEffect(() => {
    if (!provider || !isConnected || !chainId) {
      setContract(null);
      return;
    }

    const initializeContract = async () => {
      try {
        const address = EncryptedCanvasAddresses[chainId.toString() as keyof typeof EncryptedCanvasAddresses]?.address;
        if (!address || address === "0x0000000000000000000000000000000000000000") {
          setError("Contract not deployed on this network");
          return;
        }

        const browserProvider = new ethers.BrowserProvider(provider);
        const signer = await browserProvider.getSigner();
        const contractInstance = new ethers.Contract(address, EncryptedCanvasABI.abi, signer);
        setContract(contractInstance);
        setError(null);
      } catch (err) {
        console.error("Failed to initialize contract:", err);
        setError("Failed to initialize contract");
      }
    };

    initializeContract();
  }, [provider, isConnected, chainId]);

  // Load creations from contract
  const loadCreations = useCallback(async () => {
    try {
      setIsLoading(true);

      // Use mock data for now until contract issues are resolved
      const mockCreations: CreativeWork[] = [
        {
          id: "0",
          title: "Digital Dreams",
          description: "An abstract exploration of consciousness through geometric patterns and quantum encryption.",
          tags: ["abstract", "digital", "consciousness"],
          appreciations: 23,
          views: 156,
          isPremium: true,
          isExhibited: true,
          createdAt: "2 days ago",
          color: "from-blue-400 to-purple-600",
          creator: "0x1234...5678"
        },
        {
          id: "1",
          title: "Encrypted Poetry",
          description: "Verses of digital poetry, encrypted with meaning only revealed to those who truly understand.",
          tags: ["poetry", "literature", "philosophy"],
          appreciations: 18,
          views: 89,
          isPremium: false,
          isExhibited: true,
          createdAt: "1 week ago",
          color: "from-green-400 to-teal-600",
          creator: "0xabcd...efgh"
        }
      ];

      setCreations(mockCreations);
      setTotalCreations(2);
      setError(null);
    } catch (err) {
      console.error("Failed to load creations:", err);
      setError("Failed to load creations");
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Refresh creations
  const refreshCreations = useCallback(async () => {
    await loadCreations();
  }, [loadCreations]);

  // Mint new creation
  const mintCreation = useCallback(async (
    title: string,
    content: string,
    tags: string[],
    isExhibited: boolean
  ) => {
    if (fhevmStatus !== "ready") {
      throw new Error(`FHEVM instance not ready. Current status: ${fhevmStatus}`);
    }
    if (!fhevmInstance) {
      throw new Error("FHEVM instance not available");
    }
    if (!contract) {
      throw new Error("Contract not available");
    }
    if (!provider) {
      throw new Error("Provider not available");
    }

    try {
      setIsLoading(true);
      setError(null);

      const browserProvider = new ethers.BrowserProvider(provider);
      const signer = await browserProvider.getSigner();

      // Create encrypted input for content
      const input = fhevmInstance.createEncryptedInput(
        await contract.getAddress(),
        signer.address
      );

      // Convert content string to a compact numeric representation
      // Support up to ~50 characters by packing bytes
      const contentBytes = new TextEncoder().encode(content);
      if (contentBytes.length > 50) {
        throw new Error("Content too long (max ~50 characters)");
      }

      // Pack bytes into a BigInt
      let packedValue = BigInt(0);
      for (let i = 0; i < contentBytes.length; i++) {
        packedValue = packedValue * BigInt(256) + BigInt(contentBytes[i]);
      }

      // Add as uint256
      input.add256(packedValue);

      // Encrypt the input
      const encrypted = await input.encrypt();

      // Call contract method
      const tx = await contract.mintCreation(
        title,
        encrypted.handles[0],
        encrypted.inputProof,
        isExhibited,
        tags
      );

      await tx.wait();

      // Refresh creations after minting
      await refreshCreations();

    } catch (err) {
      console.error("Failed to mint creation:", err);
      setError(err instanceof Error ? err.message : "Failed to mint creation");
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [contract, provider, fhevmInstance, fhevmStatus, refreshCreations]);

  // Appreciate creation
  const appreciateCreation = useCallback(async (creationId: number) => {
    if (!contract || !provider) {
      throw new Error("Contract not initialized or no provider");
    }

    try {
      setIsLoading(true);
      setError(null);

      const tx = await contract.appreciateCreation(creationId);
      await tx.wait();

      // Refresh creations after appreciation
      await refreshCreations();

    } catch (err) {
      console.error("Failed to appreciate creation:", err);
      setError(err instanceof Error ? err.message : "Failed to appreciate creation");
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [contract, provider, refreshCreations]);

  // Load creations when contract is ready
  useEffect(() => {
    if (contract) {
      loadCreations();
    }
  }, [contract, loadCreations]);

  return {
    contract,
    isLoading,
    error,
    creations,
    totalCreations,
    mintCreation,
    appreciateCreation,
    refreshCreations
  };
}
