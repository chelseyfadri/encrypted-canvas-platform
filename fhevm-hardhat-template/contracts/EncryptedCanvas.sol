// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {FHE, euint32, euint256, externalEuint32, externalEuint256} from "@fhevm/solidity/lib/FHE.sol";
import {SepoliaConfig} from "@fhevm/solidity/config/ZamaConfig.sol";

/// @title Encrypted Canvas - Premium Creative Platform
/// @author encrypted-canvas-platform
/// @notice A sophisticated digital canvas platform with FHEVM encryption for creative content privacy
contract EncryptedCanvas is SepoliaConfig {
    struct CreativeWork {
        string title;           // 明文存储标题
        euint256 content;       // 加密存储内容
        address creator;        // 明文存储创作者地址
        uint256 mintedAt;       // 创作时间戳
        euint32 appreciationCount; // 加密的欣赏数
        bool isExhibited;       // 是否公开展示（控制解密权限）
        string[] tags;          // 创意标签
        bool isPremium;         // 是否为高级作品
    }

    // 存储所有创意作品
    CreativeWork[] private _creations;

    // 记录用户对作品的欣赏状态 (creationId => user => appreciated)
    mapping(uint256 => mapping(address => bool)) private _appreciations;

    // 记录用户创建的作品ID列表
    mapping(address => uint256[]) private _creatorWorks;

    // 高级创作者徽章
    mapping(address => bool) private _premiumCreators;

    event CreationMinted(uint256 indexed creationId, address indexed creator, string title);
    event CreationAppreciated(uint256 indexed creationId, address indexed appreciator);
    event AppreciationWithdrawn(uint256 indexed creationId, address indexed appreciator);
    event PremiumBadgeGranted(address indexed creator);

    /// @notice 铸造新的创意作品
    /// @param title 作品标题（明文）
    /// @param content 作品内容（加密输入）
    /// @param inputProof 输入证明
    /// @param isExhibited 是否公开展示
    /// @param tags 创意标签
    function mintCreation(
        string memory title,
        externalEuint256 content,
        bytes calldata inputProof,
        bool isExhibited,
        string[] memory tags
    ) external {
        require(bytes(title).length > 0, "Title cannot be empty");
        require(tags.length <= 5, "Maximum 5 tags allowed");

        // 验证并转换加密内容
        euint256 encryptedContent = FHE.fromExternal(content, inputProof);

        // 初始化欣赏数为0
        euint32 initialAppreciationCount = FHE.asEuint32(0);

        // 判断是否为高级创作者的作品
        bool isPremiumWork = _premiumCreators[msg.sender];

        // 铸造作品
        uint256 creationId = _creations.length;
        _creations.push(CreativeWork({
            title: title,
            content: encryptedContent,
            creator: msg.sender,
            mintedAt: block.timestamp,
            appreciationCount: initialAppreciationCount,
            isExhibited: isExhibited,
            tags: tags,
            isPremium: isPremiumWork
        }));

        // 记录创作者的作品
        _creatorWorks[msg.sender].push(creationId);

        // 设置权限：创作者可以查看和修改内容
        FHE.allowThis(encryptedContent);
        FHE.allowThis(initialAppreciationCount);
        FHE.allow(encryptedContent, msg.sender);
        FHE.allow(initialAppreciationCount, msg.sender);

        // 如果公开展示，允许任何人查看内容
        if (isExhibited) {
            FHE.makePubliclyDecryptable(encryptedContent);
            FHE.makePubliclyDecryptable(initialAppreciationCount);
        }

        emit CreationMinted(creationId, msg.sender, title);
    }

    /// @notice 获取创意作品基本信息（不包含加密内容）
    /// @param creationId 作品ID
    function getCreation(uint256 creationId) external view returns (
        string memory title,
        address creator,
        uint256 mintedAt,
        bool isExhibited,
        string[] memory tags,
        bool isPremium
    ) {
        require(creationId < _creations.length, "Creation does not exist");
        CreativeWork storage creation = _creations[creationId];
        return (creation.title, creation.creator, creation.mintedAt, creation.isExhibited, creation.tags, creation.isPremium);
    }

    /// @notice 获取创意作品加密内容
    /// @param creationId 作品ID
    function getCreationContent(uint256 creationId) external view returns (euint256) {
        require(creationId < _creations.length, "Creation does not exist");
        CreativeWork storage creation = _creations[creationId];

        // 检查权限：只有创作者或公开展示作品可以查看
        require(
            creation.creator == msg.sender || creation.isExhibited,
            "No permission to view this creation"
        );

        return creation.content;
    }

    /// @notice 欣赏创意作品
    /// @param creationId 作品ID
    function appreciateCreation(uint256 creationId) external {
        require(creationId < _creations.length, "Creation does not exist");
        require(!_appreciations[creationId][msg.sender], "Already appreciated this creation");

        CreativeWork storage creation = _creations[creationId];

        // 增加欣赏数
        creation.appreciationCount = FHE.add(creation.appreciationCount, FHE.asEuint32(1));

        // 记录欣赏状态
        _appreciations[creationId][msg.sender] = true;

        // 重新授权
        FHE.allowThis(creation.appreciationCount);
        FHE.allow(creation.appreciationCount, msg.sender);
        if (creation.isExhibited) {
            FHE.makePubliclyDecryptable(creation.appreciationCount);
        }

        emit CreationAppreciated(creationId, msg.sender);
    }

    /// @notice 撤销对创意作品的欣赏
    /// @param creationId 作品ID
    function withdrawAppreciation(uint256 creationId) external {
        require(creationId < _creations.length, "Creation does not exist");
        require(_appreciations[creationId][msg.sender], "Not appreciated this creation yet");

        CreativeWork storage creation = _creations[creationId];

        // 减少欣赏数
        creation.appreciationCount = FHE.sub(creation.appreciationCount, FHE.asEuint32(1));

        // 移除欣赏状态
        _appreciations[creationId][msg.sender] = false;

        // 重新授权
        FHE.allowThis(creation.appreciationCount);
        FHE.allow(creation.appreciationCount, msg.sender);
        if (creation.isExhibited) {
            FHE.makePubliclyDecryptable(creation.appreciationCount);
        }

        emit AppreciationWithdrawn(creationId, msg.sender);
    }

    /// @notice 获取作品欣赏数
    /// @param creationId 作品ID
    function getAppreciationCount(uint256 creationId) external view returns (euint32) {
        require(creationId < _creations.length, "Creation does not exist");
        return _creations[creationId].appreciationCount;
    }

    /// @notice 检查用户是否已欣赏作品
    /// @param creationId 作品ID
    /// @param user 用户地址
    function hasAppreciated(uint256 creationId, address user) external view returns (bool) {
        require(creationId < _creations.length, "Creation does not exist");
        return _appreciations[creationId][user];
    }

    /// @notice 获取创作者的所有作品ID
    /// @param creator 创作者地址
    function getCreatorWorks(address creator) external view returns (uint256[] memory) {
        return _creatorWorks[creator];
    }

    /// @notice 获取作品总数
    function getTotalCreations() external view returns (uint256) {
        return _creations.length;
    }

    /// @notice 授予创作者高级徽章
    /// @param creator 创作者地址
    function grantPremiumBadge(address creator) external {
        // 简化的权限控制，实际应用中应该有更复杂的逻辑
        require(msg.sender == address(this), "Unauthorized to grant badges");
        _premiumCreators[creator] = true;
        emit PremiumBadgeGranted(creator);
    }

    /// @notice 检查创作者是否有高级徽章
    /// @param creator 创作者地址
    function isPremiumCreator(address creator) external view returns (bool) {
        return _premiumCreators[creator];
    }
}
