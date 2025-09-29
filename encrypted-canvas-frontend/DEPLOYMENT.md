# Encrypted Canvas - 静态部署指南

## 📦 静态文件已生成

Encrypted Canvas 前端已成功打包为静态文件，可以部署到任何支持静态文件服务的平台。

### 📂 生成的文件

- **构建输出目录**: `out/`
- **压缩包**: `encrypted-canvas-static.tar.gz` (位于项目根目录)
- **文件大小**: ~1.4MB

### 📋 文件结构

```
out/
├── index.html          # 主页面
├── 404.html           # 404错误页面
├── icon.png           # 应用图标
├── zama-logo.svg      # Zama logo
├── _next/             # Next.js 静态资源
│   ├── static/
│   │   ├── chunks/    # JavaScript 代码块
│   │   └── css/       # CSS 样式文件
│   └── oJtAj1XmkKPUtm90Sh7Xx/
│       └── _buildManifest.js
└── 404/
    └── index.html     # 404页面备用
```

## 🚀 部署选项

### 1. Vercel (推荐)

```bash
# 安装 Vercel CLI
npm i -g vercel

# 部署到 Vercel
vercel --prod

# 或者使用静态文件
vercel out/ --prod
```

### 2. Netlify

```bash
# 安装 Netlify CLI
npm install -g netlify-cli

# 部署
netlify deploy --dir=out --prod
```

### 3. GitHub Pages

```bash
# 安装 gh-pages
npm install -g gh-pages

# 部署
npx gh-pages -d out
```

### 4. 传统 Web 服务器

将 `out/` 目录中的所有文件上传到任何支持静态文件的 Web 服务器：

- Apache
- Nginx
- AWS S3 + CloudFront
- Google Cloud Storage
- Azure Static Websites

## ⚙️ 服务器配置

### CORS Headers (重要)

由于应用使用 FHEVM，需要配置特定的 CORS headers：

```nginx
# Nginx 配置示例
server {
    listen 80;
    server_name your-domain.com;
    root /path/to/out;
    index index.html;

    # FHEVM 需要的 headers
    add_header Cross-Origin-Opener-Policy same-origin always;
    add_header Cross-Origin-Embedder-Policy require-corp always;

    # 处理客户端路由
    location / {
        try_files $uri $uri/ /index.html;
    }

    # 缓存静态资源
    location /_next/static {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

```apache
# Apache 配置示例
<VirtualHost *:80>
    ServerName your-domain.com
    DocumentRoot /path/to/out

    # FHEVM 需要的 headers
    Header always set Cross-Origin-Opener-Policy same-origin
    Header always set Cross-Origin-Embedder-Policy require-corp

    # 处理客户端路由
    RewriteEngine On
    RewriteRule ^(?!.*\.).* /index.html [L]

    # 缓存静态资源
    <Location /_next/static>
        ExpiresActive on
        ExpiresDefault "access plus 1 year"
        Header set Cache-Control "public, immutable"
    </Location>
</VirtualHost>
```

## 🌐 网络配置

### MetaMask 支持的网络

应用会自动检测并连接到以下网络：

- **Sepolia 测试网** (Chain ID: 11155111)
  - 合约地址: `0xaCA9F542814EffD1bD6EdB113334cC2530DdDe8e`
- **本地 Hardhat 网络** (Chain ID: 31337)
  - 合约地址: `0x221f5Cb41135773D7bc9923DD31a03b42A888501`

### 环境变量

如果需要在不同环境中使用不同的合约地址，可以修改 `abi/EncryptedCanvasAddresses.ts` 文件。

## 🔧 本地测试

```bash
# 解压静态文件
tar -xzf encrypted-canvas-static.tar.gz
cd out

# 使用本地服务器测试
npx serve .
# 或者
python -m http.server 3000
```

## 📊 性能优化

- **代码分割**: Next.js 自动分割代码，提高加载速度
- **静态资源优化**: 自动压缩和优化图片、CSS、JS
- **缓存策略**: 静态资源设置长期缓存
- **懒加载**: 组件和路由按需加载

## 🔒 安全注意事项

- 确保部署的域名支持 HTTPS
- 配置适当的 CSP (Content Security Policy) headers
- 定期更新依赖包
- 监控应用性能和错误

## 📞 支持

如果在部署过程中遇到问题，请检查：

1. 服务器是否正确配置了 CORS headers
2. 域名是否支持 HTTPS
3. 静态文件是否完整上传
4. 浏览器控制台是否有错误信息

---

**构建时间**: 2024年12月
**Next.js 版本**: 15.5.4
**React 版本**: 19.1.0