import { FhevmType } from "@fhevm/hardhat-plugin";
import { task } from "hardhat/config";
import type { TaskArguments } from "hardhat/types";

/**
 * Tutorial: Deploy and Interact with FHEBlog Locally (--network localhost)
 * ===================================================================
 *
 * 1. From a separate terminal window:
 *
 *   npx hardhat node
 *
 * 2. Deploy the FHEBlog contract
 *
 *   npx hardhat --network localhost deploy
 *
 * 3. Interact with the FHEBlog contract
 *
 *   npx hardhat --network localhost task:blog-address
 *   npx hardhat --network localhost task:create-blog --title "My First Blog" --content "Hello World!" --public true
 *   npx hardhat --network localhost task:list-blogs
 *   npx hardhat --network localhost task:decrypt-blog-content --blogid 0
 *   npx hardhat --network localhost task:like-blog --blogid 0
 *   npx hardhat --network localhost task:get-blog-likes --blogid 0
 *
 */

/**
 * Example:
 *   - npx hardhat --network localhost task:blog-address
 *   - npx hardhat --network sepolia task:blog-address
 */
task("task:blog-address", "Prints the FHEBlog address").setAction(async function (_taskArguments: TaskArguments, hre) {
  const { deployments } = hre;

  const fheBlog = await deployments.get("FHEBlog");

  console.log("FHEBlog address is " + fheBlog.address);
});

/**
 * Example:
 *   - npx hardhat --network localhost task:create-blog --title "My Blog" --content "Content" --public true
 *   - npx hardhat --network sepolia task:create-blog --title "My Blog" --content "Content" --public false
 */
task("task:create-blog", "Creates a new blog post")
  .addOptionalParam("address", "Optionally specify the FHEBlog contract address")
  .addParam("title", "The blog title")
  .addParam("content", "The blog content")
  .addParam("public", "Whether the blog is public (true/false)")
  .setAction(async function (taskArguments: TaskArguments, hre) {
    const { ethers, deployments, fhevm } = hre;

    const title = taskArguments.title;
    const content = taskArguments.content;
    const isPublic = taskArguments.public === "true";

    await fhevm.initializeCLIApi();

    const FHEBlogDeployment = taskArguments.address
      ? { address: taskArguments.address }
      : await deployments.get("FHEBlog");
    console.log(`FHEBlog: ${FHEBlogDeployment.address}`);

    const signers = await ethers.getSigners();
    const fheBlogContract = await ethers.getContractAt("FHEBlog", FHEBlogDeployment.address);

    // Convert content string to uint256 (for simplicity, we'll use the string length as encrypted value)
    const contentValue = BigInt(content.length);

    // Encrypt the content
    const encryptedContent = await fhevm
      .createEncryptedInput(FHEBlogDeployment.address, signers[0].address)
      .add256(contentValue)
      .encrypt();

    const tx = await fheBlogContract
      .connect(signers[0])
      .createBlog(title, encryptedContent.handles[0], encryptedContent.inputProof, isPublic);
    console.log(`Wait for tx:${tx.hash}...`);

    const receipt = await tx.wait();
    console.log(`tx:${tx.hash} status=${receipt?.status}`);

    console.log(`Blog "${title}" created successfully!`);
  });

/**
 * Example:
 *   - npx hardhat --network localhost task:list-blogs
 *   - npx hardhat --network sepolia task:list-blogs
 */
task("task:list-blogs", "Lists all blog posts")
  .addOptionalParam("address", "Optionally specify the FHEBlog contract address")
  .setAction(async function (taskArguments: TaskArguments, hre) {
    const { ethers, deployments } = hre;

    const FHEBlogDeployment = taskArguments.address
      ? { address: taskArguments.address }
      : await deployments.get("FHEBlog");
    console.log(`FHEBlog: ${FHEBlogDeployment.address}`);

    const fheBlogContract = await ethers.getContractAt("FHEBlog", FHEBlogDeployment.address);

    const totalBlogs = await fheBlogContract.getTotalBlogs();
    console.log(`Total blogs: ${totalBlogs}`);

    for (let i = 0; i < totalBlogs; i++) {
      try {
        const [title, author, createdAt, isPublic] = await fheBlogContract.getBlog(i);
        const createdDate = new Date(Number(createdAt) * 1000).toISOString();
        console.log(`Blog ${i}: "${title}" by ${author} at ${createdDate} (${isPublic ? 'Public' : 'Private'})`);
      } catch (error) {
        console.log(`Blog ${i}: Error reading blog data`);
      }
    }
  });

/**
 * Example:
 *   - npx hardhat --network localhost task:decrypt-blog-content --blogid 0
 *   - npx hardhat --network sepolia task:decrypt-blog-content --blogid 0
 */
task("task:decrypt-blog-content", "Decrypts blog content")
  .addOptionalParam("address", "Optionally specify the FHEBlog contract address")
  .addParam("blogid", "The blog ID to decrypt")
  .setAction(async function (taskArguments: TaskArguments, hre) {
    const { ethers, deployments, fhevm } = hre;

    const blogId = parseInt(taskArguments.blogid);
    if (!Number.isInteger(blogId)) {
      throw new Error(`Argument --blogid is not an integer`);
    }

    await fhevm.initializeCLIApi();

    const FHEBlogDeployment = taskArguments.address
      ? { address: taskArguments.address }
      : await deployments.get("FHEBlog");
    console.log(`FHEBlog: ${FHEBlogDeployment.address}`);

    const signers = await ethers.getSigners();
    const fheBlogContract = await ethers.getContractAt("FHEBlog", FHEBlogDeployment.address);

    try {
      const encryptedContent = await fheBlogContract.getBlogContent(blogId);

      // For euint256, we get back the decrypted number
      const decryptedValue = await fhevm.userDecryptEuint(
        FhevmType.euint256,
        encryptedContent,
        FHEBlogDeployment.address,
        signers[0],
      );

      // Unpack the BigInt back to bytes
      let num = BigInt(decryptedValue);
      const bytes: number[] = [];

      if (num === BigInt(0)) {
        console.log(`Blog ${blogId} content: "(empty content)"`);
        return;
      }

      while (num > 0) {
        bytes.unshift(Number(num % BigInt(256)));
        num = num / BigInt(256);
      }

      // Convert bytes back to string
      const uint8Array = new Uint8Array(bytes);
      const decodedString = new TextDecoder().decode(uint8Array);

      console.log(`Blog ${blogId} content: "${decodedString}"`);
    } catch (error) {
      console.log(`Failed to decrypt blog ${blogId} content:`, error.message);
    }
  });

/**
 * Example:
 *   - npx hardhat --network localhost task:like-blog --blogid 0
 *   - npx hardhat --network sepolia task:like-blog --blogid 0
 */
task("task:like-blog", "Likes a blog post")
  .addOptionalParam("address", "Optionally specify the FHEBlog contract address")
  .addParam("blogid", "The blog ID to like")
  .setAction(async function (taskArguments: TaskArguments, hre) {
    const { ethers, deployments } = hre;

    const blogId = parseInt(taskArguments.blogid);
    if (!Number.isInteger(blogId)) {
      throw new Error(`Argument --blogid is not an integer`);
    }

    const FHEBlogDeployment = taskArguments.address
      ? { address: taskArguments.address }
      : await deployments.get("FHEBlog");
    console.log(`FHEBlog: ${FHEBlogDeployment.address}`);

    const signers = await ethers.getSigners();
    const fheBlogContract = await ethers.getContractAt("FHEBlog", FHEBlogDeployment.address);

    const tx = await fheBlogContract
      .connect(signers[0])
      .likeBlog(blogId);
    console.log(`Wait for tx:${tx.hash}...`);

    const receipt = await tx.wait();
    console.log(`tx:${tx.hash} status=${receipt?.status}`);

    console.log(`Blog ${blogId} liked successfully!`);
  });

/**
 * Example:
 *   - npx hardhat --network localhost task:get-blog-likes --blogid 0
 *   - npx hardhat --network sepolia task:get-blog-likes --blogid 0
 */
task("task:get-blog-likes", "Gets blog like count")
  .addOptionalParam("address", "Optionally specify the FHEBlog contract address")
  .addParam("blogid", "The blog ID to get likes for")
  .setAction(async function (taskArguments: TaskArguments, hre) {
    const { ethers, deployments, fhevm } = hre;

    const blogId = parseInt(taskArguments.blogid);
    if (!Number.isInteger(blogId)) {
      throw new Error(`Argument --blogid is not an integer`);
    }

    await fhevm.initializeCLIApi();

    const FHEBlogDeployment = taskArguments.address
      ? { address: taskArguments.address }
      : await deployments.get("FHEBlog");
    console.log(`FHEBlog: ${FHEBlogDeployment.address}`);

    const signers = await ethers.getSigners();
    const fheBlogContract = await ethers.getContractAt("FHEBlog", FHEBlogDeployment.address);

    try {
      const encryptedLikes = await fheBlogContract.getLikeCount(blogId);

      const clearLikes = await fhevm.userDecryptEuint(
        FhevmType.euint32,
        encryptedLikes,
        FHEBlogDeployment.address,
        signers[0],
      );

      const hasLiked = await fheBlogContract.hasLiked(blogId, signers[0].address);

      console.log(`Blog ${blogId} has ${clearLikes} likes`);
      console.log(`You have ${hasLiked ? '' : 'not '}liked this blog`);
    } catch (error) {
      console.log(`Failed to get blog ${blogId} likes:`, error.message);
    }
  });
