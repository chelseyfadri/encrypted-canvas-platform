// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {FHE, euint32, euint256, externalEuint32, externalEuint256} from "@fhevm/solidity/lib/FHE.sol";
import {SepoliaConfig} from "@fhevm/solidity/config/ZamaConfig.sol";

/// @title A simple FHE counter contract
/// @author fhevm-hardhat-template
/// @notice A very basic example contract showing how to work with encrypted data using FHEVM.
contract FHECounter is SepoliaConfig {
    euint32 private _count;

    /// @notice Returns the current count
    /// @return The current encrypted count
    function getCount() external view returns (euint32) {
        return _count;
    }

    /// @notice Increments the counter by a specified encrypted value.
    /// @param inputEuint32 the encrypted input value
    /// @param inputProof the input proof
    /// @dev This example omits overflow/underflow checks for simplicity and readability.
    /// In a production contract, proper range checks should be implemented.
    function increment(externalEuint32 inputEuint32, bytes calldata inputProof) external {
        euint32 encryptedEuint32 = FHE.fromExternal(inputEuint32, inputProof);

        _count = FHE.add(_count, encryptedEuint32);

        FHE.allowThis(_count);
        FHE.allow(_count, msg.sender);
    }

    /// @notice Decrements the counter by a specified encrypted value.
    /// @param inputEuint32 the encrypted input value
    /// @param inputProof the input proof
    /// @dev This example omits overflow/underflow checks for simplicity and readability.
    /// In a production contract, proper range checks should be implemented.
    function decrement(externalEuint32 inputEuint32, bytes calldata inputProof) external {
        euint32 encryptedEuint32 = FHE.fromExternal(inputEuint32, inputProof);

        _count = FHE.sub(_count, encryptedEuint32);

        FHE.allowThis(_count);
        FHE.allow(_count, msg.sender);
    }
}

/// @title FHE Blog Contract
/// @author fhevm-blog-template
/// @notice A blog dApp with FHEVM encryption for content privacy
contract FHEBlog is SepoliaConfig {
    struct BlogPost {
        string title;           // 明文存储标题
        euint256 content;       // 加密存储内容
        address author;         // 明文存储作者地址
        uint256 createdAt;      // 创建时间戳
        euint32 likeCount;      // 加密的点赞数
        bool isPublic;          // 是否公开（控制解密权限）
    }

    // 存储所有blog
    BlogPost[] private _blogs;

    // 记录用户对blog的点赞状态 (blogId => user => liked)
    mapping(uint256 => mapping(address => bool)) private _likes;

    // 记录用户创建的blog ID列表
    mapping(address => uint256[]) private _userBlogs;

    event BlogCreated(uint256 indexed blogId, address indexed author, string title);
    event BlogLiked(uint256 indexed blogId, address indexed liker);
    event BlogUnliked(uint256 indexed blogId, address indexed unliker);

    /// @notice 创建新博客
    /// @param title 博客标题（明文）
    /// @param content 博客内容（加密输入）
    /// @param inputProof 输入证明
    /// @param isPublic 是否公开
    function createBlog(
        string memory title,
        externalEuint256 content,
        bytes calldata inputProof,
        bool isPublic
    ) external {
        require(bytes(title).length > 0, "Title cannot be empty");

        // 验证并转换加密内容
        euint256 encryptedContent = FHE.fromExternal(content, inputProof);

        // 初始化点赞数为0
        euint32 initialLikeCount = FHE.asEuint32(0);

        // 创建blog
        uint256 blogId = _blogs.length;
        _blogs.push(BlogPost({
            title: title,
            content: encryptedContent,
            author: msg.sender,
            createdAt: block.timestamp,
            likeCount: initialLikeCount,
            isPublic: isPublic
        }));

        // 记录用户的blog
        _userBlogs[msg.sender].push(blogId);

        // 设置权限：作者可以查看和修改内容
        FHE.allowThis(encryptedContent);
        FHE.allowThis(initialLikeCount);
        FHE.allow(encryptedContent, msg.sender);
        FHE.allow(initialLikeCount, msg.sender);

        // 如果公开，允许任何人查看内容
        if (isPublic) {
            FHE.makePubliclyDecryptable(encryptedContent);
            FHE.makePubliclyDecryptable(initialLikeCount);
        }

        emit BlogCreated(blogId, msg.sender, title);
    }

    /// @notice 获取博客基本信息（不包含加密内容）
    /// @param blogId 博客ID
    function getBlog(uint256 blogId) external view returns (
        string memory title,
        address author,
        uint256 createdAt,
        bool isPublic
    ) {
        require(blogId < _blogs.length, "Blog does not exist");
        BlogPost storage blog = _blogs[blogId];
        return (blog.title, blog.author, blog.createdAt, blog.isPublic);
    }

    /// @notice 获取博客加密内容
    /// @param blogId 博客ID
    function getBlogContent(uint256 blogId) external view returns (euint256) {
        require(blogId < _blogs.length, "Blog does not exist");
        BlogPost storage blog = _blogs[blogId];

        // 检查权限：只有作者或公开博客可以查看
        require(
            blog.author == msg.sender || blog.isPublic,
            "No permission to view this blog"
        );

        return blog.content;
    }

    /// @notice 点赞博客
    /// @param blogId 博客ID
    function likeBlog(uint256 blogId) external {
        require(blogId < _blogs.length, "Blog does not exist");
        require(!_likes[blogId][msg.sender], "Already liked this blog");

        BlogPost storage blog = _blogs[blogId];

        // 增加点赞数
        blog.likeCount = FHE.add(blog.likeCount, FHE.asEuint32(1));

        // 记录点赞状态
        _likes[blogId][msg.sender] = true;

        // 重新授权
        FHE.allowThis(blog.likeCount);
        FHE.allow(blog.likeCount, msg.sender);
        if (blog.isPublic) {
            FHE.makePubliclyDecryptable(blog.likeCount);
        }

        emit BlogLiked(blogId, msg.sender);
    }

    /// @notice 取消点赞博客
    /// @param blogId 博客ID
    function unlikeBlog(uint256 blogId) external {
        require(blogId < _blogs.length, "Blog does not exist");
        require(_likes[blogId][msg.sender], "Not liked this blog yet");

        BlogPost storage blog = _blogs[blogId];

        // 减少点赞数
        blog.likeCount = FHE.sub(blog.likeCount, FHE.asEuint32(1));

        // 移除点赞状态
        _likes[blogId][msg.sender] = false;

        // 重新授权
        FHE.allowThis(blog.likeCount);
        FHE.allow(blog.likeCount, msg.sender);
        if (blog.isPublic) {
            FHE.makePubliclyDecryptable(blog.likeCount);
        }

        emit BlogUnliked(blogId, msg.sender);
    }

    /// @notice 获取博客点赞数
    /// @param blogId 博客ID
    function getLikeCount(uint256 blogId) external view returns (euint32) {
        require(blogId < _blogs.length, "Blog does not exist");
        return _blogs[blogId].likeCount;
    }

    /// @notice 检查用户是否已点赞
    /// @param blogId 博客ID
    /// @param user 用户地址
    function hasLiked(uint256 blogId, address user) external view returns (bool) {
        require(blogId < _blogs.length, "Blog does not exist");
        return _likes[blogId][user];
    }

    /// @notice 获取用户的所有博客ID
    /// @param user 用户地址
    function getUserBlogs(address user) external view returns (uint256[] memory) {
        return _userBlogs[user];
    }

    /// @notice 获取博客总数
    function getTotalBlogs() external view returns (uint256) {
        return _blogs.length;
    }
}
