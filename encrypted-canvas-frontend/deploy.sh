#!/bin/bash

# FHE Blog dApp 部署脚本
# 用法: ./deploy.sh [platform]
# 平台: vercel, netlify, github (默认: vercel)

set -e

PLATFORM=${1:-vercel}

echo "🚀 部署 FHE Blog dApp 到 $PLATFORM"

# 检查构建文件是否存在
if [ ! -d "out" ]; then
    echo "❌ 未找到构建文件，请先运行: npm run build"
    exit 1
fi

case $PLATFORM in
    "vercel")
        echo "📦 部署到 Vercel..."
        if ! command -v vercel &> /dev/null; then
            echo "❌ 未安装 Vercel CLI，请运行: npm i -g vercel"
            exit 1
        fi
        vercel --prod --yes
        ;;

    "netlify")
        echo "📦 部署到 Netlify..."
        if ! command -v netlify &> /dev/null; then
            echo "❌ 未安装 Netlify CLI，请运行: npm install -g netlify-cli"
            exit 1
        fi
        netlify deploy --dir=out --prod
        ;;

    "github")
        echo "📦 部署到 GitHub Pages..."
        if ! command -v gh-pages &> /dev/null; then
            echo "❌ 未安装 gh-pages，请运行: npm install -g gh-pages"
            exit 1
        fi
        npx gh-pages -d out
        ;;

    *)
        echo "❌ 不支持的平台: $PLATFORM"
        echo "支持的平台: vercel, netlify, github"
        exit 1
        ;;
esac

echo "✅ 部署完成!"
echo "🌐 你的 FHE Blog dApp 现在可以在 $PLATFORM 上访问了"
