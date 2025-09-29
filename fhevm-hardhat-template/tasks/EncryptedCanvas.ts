import { FhevmType } from "@fhevm/hardhat-plugin";
import { task } from "hardhat/config";
import type { TaskArguments } from "hardhat/types";

/**
 * Tutorial: Deploy and Interact with Encrypted Canvas Locally (--network localhost)
 * =================================================================================
 *
 * 1. From a separate terminal window:
 *
 *   npx hardhat node
 *
 * 2. Deploy the EncryptedCanvas contract
 *
 *   npx hardhat --network localhost deploy
 *
 * 3. Interact with the EncryptedCanvas contract
 *
 *   npx hardhat --network localhost task:canvas-address
 *   npx hardhat --network localhost task:mint-creation --title "My First Creation" --content "Hello Creative World!" --exhibited true --tags "art,digital"
 *   npx hardhat --network localhost task:list-creations
 *   npx hardhat --network localhost task:decrypt-creation-content --creationid 0
 *   npx hardhat --network localhost task:appreciate-creation --creationid 0
 *   npx hardhat --network localhost task:get-creation-appreciations --creationid 0
 *
 */

/**
 * Example:
 *   - npx hardhat --network localhost task:canvas-address
 *   - npx hardhat --network sepolia task:canvas-address
 */
task("task:canvas-address", "Prints the EncryptedCanvas address").setAction(async function (_taskArguments: TaskArguments, hre) {
  const { deployments } = hre;

  const encryptedCanvas = await deployments.get("EncryptedCanvas");

  console.log("EncryptedCanvas address is " + encryptedCanvas.address);
});

/**
 * Example:
 *   - npx hardhat --network localhost task:mint-creation --title "My Creation" --content "Content" --exhibited true --tags "art,digital"
 *   - npx hardhat --network sepolia task:mint-creation --title "My Creation" --content "Content" --exhibited false --tags "poetry,modern"
 */
task("task:mint-creation", "Creates a new creative work")
  .addOptionalParam("address", "Optionally specify the EncryptedCanvas contract address")
  .addParam("title", "The creation title")
  .addParam("content", "The creation content")
  .addParam("exhibited", "Whether the creation is publicly exhibited (true/false)")
  .addParam("tags", "Comma-separated tags for the creation")
  .setAction(async function (taskArguments: TaskArguments, hre) {
    const { ethers, deployments, fhevm } = hre;

    const title = taskArguments.title;
    const content = taskArguments.content;
    const isExhibited = taskArguments.exhibited === "true";
    const tags = taskArguments.tags.split(',').map((tag: string) => tag.trim());

    await fhevm.initializeCLIApi();

    const EncryptedCanvasDeployment = taskArguments.address
      ? { address: taskArguments.address }
      : await deployments.get("EncryptedCanvas");
    console.log(`EncryptedCanvas: ${EncryptedCanvasDeployment.address}`);

    const signers = await ethers.getSigners();
    const encryptedCanvasContract = await ethers.getContractAt("EncryptedCanvas", EncryptedCanvasDeployment.address);

    // Convert content string to uint256 (for simplicity, we'll use the string length as encrypted value)
    const contentValue = BigInt(content.length);

    // Encrypt the content
    const encryptedContent = await fhevm
      .createEncryptedInput(EncryptedCanvasDeployment.address, signers[0].address)
      .add256(contentValue)
      .encrypt();

    const tx = await encryptedCanvasContract
      .connect(signers[0])
      .mintCreation(title, encryptedContent.handles[0], encryptedContent.inputProof, isExhibited, tags);
    console.log(`Wait for tx:${tx.hash}...`);

    const receipt = await tx.wait();
    console.log(`tx:${tx.hash} status=${receipt?.status}`);

    console.log(`Creation "${title}" minted successfully with tags: ${tags.join(', ')}!`);
  });

/**
 * Example:
 *   - npx hardhat --network localhost task:list-creations
 *   - npx hardhat --network sepolia task:list-creations
 */
task("task:list-creations", "Lists all creative works")
  .addOptionalParam("address", "Optionally specify the EncryptedCanvas contract address")
  .setAction(async function (taskArguments: TaskArguments, hre) {
    const { ethers, deployments } = hre;

    const EncryptedCanvasDeployment = taskArguments.address
      ? { address: taskArguments.address }
      : await deployments.get("EncryptedCanvas");
    console.log(`EncryptedCanvas: ${EncryptedCanvasDeployment.address}`);

    const encryptedCanvasContract = await ethers.getContractAt("EncryptedCanvas", EncryptedCanvasDeployment.address);

    const totalCreations = await encryptedCanvasContract.getTotalCreations();
    console.log(`Total creations: ${totalCreations}`);

    for (let i = 0; i < totalCreations; i++) {
      try {
        const [title, creator, mintedAt, isExhibited, tags, isPremium] = await encryptedCanvasContract.getCreation(i);
        const mintedDate = new Date(Number(mintedAt) * 1000).toISOString();
        const premiumBadge = isPremium ? ' [PREMIUM]' : '';
        console.log(`Creation ${i}: "${title}" by ${creator} at ${mintedDate} (${isExhibited ? 'Exhibited' : 'Private'}) tags: [${tags.join(', ')}]${premiumBadge}`);
      } catch (error) {
        console.log(`Creation ${i}: Error reading creation data`);
      }
    }
  });

/**
 * Example:
 *   - npx hardhat --network localhost task:decrypt-creation-content --creationid 0
 *   - npx hardhat --network sepolia task:decrypt-creation-content --creationid 0
 */
task("task:decrypt-creation-content", "Decrypts creation content")
  .addOptionalParam("address", "Optionally specify the EncryptedCanvas contract address")
  .addParam("creationid", "The creation ID to decrypt")
  .setAction(async function (taskArguments: TaskArguments, hre) {
    const { ethers, deployments, fhevm } = hre;

    const creationId = parseInt(taskArguments.creationid);
    if (!Number.isInteger(creationId)) {
      throw new Error(`Argument --creationid is not an integer`);
    }

    await fhevm.initializeCLIApi();

    const EncryptedCanvasDeployment = taskArguments.address
      ? { address: taskArguments.address }
      : await deployments.get("EncryptedCanvas");
    console.log(`EncryptedCanvas: ${EncryptedCanvasDeployment.address}`);

    const signers = await ethers.getSigners();
    const encryptedCanvasContract = await ethers.getContractAt("EncryptedCanvas", EncryptedCanvasDeployment.address);

    try {
      const encryptedContent = await encryptedCanvasContract.getCreationContent(creationId);

      // For euint256, we get back the decrypted number
      const decryptedValue = await fhevm.userDecryptEuint(
        FhevmType.euint256,
        encryptedContent,
        EncryptedCanvasDeployment.address,
        signers[0],
      );

      // Unpack the BigInt back to bytes
      let num = BigInt(decryptedValue);
      const bytes: number[] = [];

      if (num === BigInt(0)) {
        console.log(`Creation ${creationId} content: "(empty content)"`);
        return;
      }

      while (num > 0) {
        bytes.unshift(Number(num % BigInt(256)));
        num = num / BigInt(256);
      }

      // Convert bytes back to string
      const uint8Array = new Uint8Array(bytes);
      const decodedString = new TextDecoder().decode(uint8Array);

      console.log(`Creation ${creationId} content: "${decodedString}"`);
    } catch (error) {
      console.log(`Failed to decrypt creation ${creationId} content:`, error.message);
    }
  });

/**
 * Example:
 *   - npx hardhat --network localhost task:appreciate-creation --creationid 0
 *   - npx hardhat --network sepolia task:appreciate-creation --creationid 0
 */
task("task:appreciate-creation", "Appreciates a creative work")
  .addOptionalParam("address", "Optionally specify the EncryptedCanvas contract address")
  .addParam("creationid", "The creation ID to appreciate")
  .setAction(async function (taskArguments: TaskArguments, hre) {
    const { ethers, deployments } = hre;

    const creationId = parseInt(taskArguments.creationid);
    if (!Number.isInteger(creationId)) {
      throw new Error(`Argument --creationid is not an integer`);
    }

    const EncryptedCanvasDeployment = taskArguments.address
      ? { address: taskArguments.address }
      : await deployments.get("EncryptedCanvas");
    console.log(`EncryptedCanvas: ${EncryptedCanvasDeployment.address}`);

    const signers = await ethers.getSigners();
    const encryptedCanvasContract = await ethers.getContractAt("EncryptedCanvas", EncryptedCanvasDeployment.address);

    const tx = await encryptedCanvasContract
      .connect(signers[0])
      .appreciateCreation(creationId);
    console.log(`Wait for tx:${tx.hash}...`);

    const receipt = await tx.wait();
    console.log(`tx:${tx.hash} status=${receipt?.status}`);

    console.log(`Creation ${creationId} appreciated successfully!`);
  });

/**
 * Example:
 *   - npx hardhat --network localhost task:get-creation-appreciations --creationid 0
 *   - npx hardhat --network sepolia task:get-creation-appreciations --creationid 0
 */
task("task:get-creation-appreciations", "Gets creation appreciation count")
  .addOptionalParam("address", "Optionally specify the EncryptedCanvas contract address")
  .addParam("creationid", "The creation ID to get appreciations for")
  .setAction(async function (taskArguments: TaskArguments, hre) {
    const { ethers, deployments, fhevm } = hre;

    const creationId = parseInt(taskArguments.creationid);
    if (!Number.isInteger(creationId)) {
      throw new Error(`Argument --creationid is not an integer`);
    }

    await fhevm.initializeCLIApi();

    const EncryptedCanvasDeployment = taskArguments.address
      ? { address: taskArguments.address }
      : await deployments.get("EncryptedCanvas");
    console.log(`EncryptedCanvas: ${EncryptedCanvasDeployment.address}`);

    const signers = await ethers.getSigners();
    const encryptedCanvasContract = await ethers.getContractAt("EncryptedCanvas", EncryptedCanvasDeployment.address);

    try {
      const encryptedAppreciations = await encryptedCanvasContract.getAppreciationCount(creationId);

      const clearAppreciations = await fhevm.userDecryptEuint(
        FhevmType.euint32,
        encryptedAppreciations,
        EncryptedCanvasDeployment.address,
        signers[0],
      );

      const hasAppreciated = await encryptedCanvasContract.hasAppreciated(creationId, signers[0].address);

      console.log(`Creation ${creationId} has ${clearAppreciations} appreciations`);
      console.log(`You have ${hasAppreciated ? '' : 'not '}appreciated this creation`);
    } catch (error) {
      console.log(`Failed to get creation ${creationId} appreciations:`, error.message);
    }
  });
