#!/bin/bash

# Encrypted Canvas 静态部署脚本
# 用于自动化构建和部署过程

set -e

echo "🚀 Encrypted Canvas 静态部署脚本"
echo "=================================="

# 检查 Node.js 和 npm
if ! command -v node &> /dev/null; then
    echo "❌ Node.js 未安装，请先安装 Node.js"
    exit 1
fi

if ! command -v npm &> /dev/null; then
    echo "❌ npm 未安装，请先安装 npm"
    exit 1
fi

echo "📦 检查依赖..."
npm install

echo "🔄 生成 ABI 文件..."
npm run genabi

echo "🏗️  构建应用..."
npm run build

echo "📁 检查构建输出..."
if [ ! -d "out" ]; then
    echo "❌ 构建失败，out 目录不存在"
    exit 1
fi

echo "📊 构建文件大小:"
du -sh out/

echo "🗜️  创建部署包..."
cd ..
tar -czf encrypted-canvas-static.tar.gz -C encrypted-canvas-frontend/out .

echo "✅ 部署包创建完成: encrypted-canvas-static.tar.gz"
echo ""
echo "📋 下一步操作:"
echo "1. 将 encrypted-canvas-static.tar.gz 上传到你的服务器"
echo "2. 解压文件: tar -xzf encrypted-canvas-static.tar.gz"
echo "3. 配置 Web 服务器 (参考 DEPLOYMENT.md)"
echo "4. 确保配置了正确的 CORS headers"
echo ""
echo "🌐 支持的部署平台:"
echo "- Vercel: vercel out/ --prod"
echo "- Netlify: netlify deploy --dir=out --prod"
echo "- GitHub Pages: npx gh-pages -d out"
echo ""
echo "📖 详细说明请查看 encrypted-canvas-frontend/DEPLOYMENT.md"
