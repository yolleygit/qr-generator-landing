# 🌐 Cloudflare Pages 部署指南

## 🚀 自动部署 (推荐)

### 方法1: 通过Cloudflare Dashboard

1. **登录Cloudflare**
   - 访问 [dash.cloudflare.com](https://dash.cloudflare.com)
   - 登录你的Cloudflare账号

2. **创建Pages项目**
   - 点击左侧 "Pages"
   - 点击 "Create a project"
   - 选择 "Connect to Git"

3. **连接GitHub仓库**
   - 选择 "GitHub" 并授权
   - 选择 `qr-generator-landing` 仓库
   - 点击 "Begin setup"

4. **配置构建设置**
   ```
   Project name: qr-generator-landing
   Production branch: main
   Build command: npm run build
   Build output directory: dist
   Root directory: / (留空)
   ```

5. **环境变量** (可选)
   ```
   NODE_ENV = production
   ```

6. **部署**
   - 点击 "Save and Deploy"
   - 等待构建完成 (~2-3分钟)

### 方法2: 使用Wrangler CLI

```bash
# 安装Wrangler CLI
npm install -g wrangler

# 登录Cloudflare
wrangler login

# 构建项目
npm run build

# 部署到Cloudflare Pages
wrangler pages deploy dist --project-name=qr-generator-landing
```

## 📋 部署配置文件

项目已包含以下Cloudflare Pages配置：

- **`wrangler.toml`** - Wrangler配置
- **`_headers`** - HTTP头部设置
- **`_redirects`** - 路由重定向规则

## 🔧 构建验证

部署前请确保本地构建成功：

```bash
# 安装依赖
npm install

# 构建项目
npm run build

# 预览构建结果
npm run preview
```

## 🌍 自定义域名 (可选)

部署成功后，你可以：

1. 在Cloudflare Pages项目中点击 "Custom domains"
2. 添加你的域名
3. 配置DNS记录指向Cloudflare

## 📊 部署信息

- **框架**: Vite (自动检测)
- **Node版本**: 18+ (推荐)
- **构建时间**: ~2-3分钟
- **构建输出**: `dist/` 目录
- **部署URL**: `https://qr-generator-landing.pages.dev`

## 🔍 故障排除

### 构建失败
```bash
# 检查Node版本
node --version  # 需要 >= 16

# 清理并重新安装
rm -rf node_modules package-lock.json
npm install
npm run build
```

### 部署失败
- 检查构建命令是否正确: `npm run build`
- 检查输出目录是否正确: `dist`
- 确保所有依赖都在 `package.json` 中

## ✅ 部署成功标志

部署成功后，你应该能看到：
- ✅ 三个QR模式正常工作
- ✅ 响应式设计在移动端正常
- ✅ 文件上传功能正常
- ✅ 二维码下载功能正常
- ✅ HTTPS安全连接

---

**🎉 恭喜！你的二维码生成器已成功部署到Cloudflare Pages！**