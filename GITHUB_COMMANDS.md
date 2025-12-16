# 🚀 GitHub推送命令

## 方法1: 使用脚本 (推荐)
```bash
./PUSH_TO_GITHUB.sh
```

## 方法2: 手动执行命令

### 步骤1: 添加远程仓库
```bash
# 替换 YOUR_USERNAME 为你的GitHub用户名
git remote add origin https://github.com/YOUR_USERNAME/qr-generator-landing.git
```

### 步骤2: 推送代码
```bash
git branch -M main
git push -u origin main
```

### 步骤3: 验证推送
```bash
git remote -v
```

## 🔍 推送后验证

推送成功后，你应该能在GitHub仓库页面看到：
- ✅ 35个文件
- ✅ 3个提交记录
- ✅ 完整的README.md显示
- ✅ 项目描述和标签

## 🚀 部署选项

### Vercel (推荐)
1. 访问 [vercel.com](https://vercel.com)
2. GitHub登录 → New Project
3. 选择 `qr-generator-landing` 仓库
4. 框架自动检测为 Vite
5. 点击 Deploy

### Netlify
1. 访问 [netlify.com](https://netlify.com)
2. New site from Git → GitHub
3. 选择仓库
4. 构建设置：
   - Build command: `npm run build`
   - Publish directory: `dist`
5. Deploy site

## 📊 项目信息
- **仓库名**: qr-generator-landing
- **主分支**: main
- **文件数**: 35个
- **技术栈**: React 18 + TypeScript + Vite + TailwindCSS