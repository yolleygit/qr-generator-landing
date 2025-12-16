#!/bin/bash

# 🚀 推送到GitHub仓库的脚本
# 请先在GitHub上创建名为 qr-generator-landing 的仓库

echo "🔗 连接到GitHub远程仓库..."

# 替换 YOUR_USERNAME 为你的GitHub用户名
read -p "请输入你的GitHub用户名: " username

# 添加远程仓库
git remote add origin https://github.com/$username/qr-generator-landing.git

echo "📤 推送代码到GitHub..."

# 设置主分支并推送
git branch -M main
git push -u origin main

echo "✅ 推送完成！"
echo "🌐 仓库地址: https://github.com/$username/qr-generator-landing"

# 显示部署建议
echo ""
echo "🚀 下一步 - 部署到Vercel:"
echo "1. 访问 https://vercel.com"
echo "2. 使用GitHub账号登录"
echo "3. 点击 'New Project'"
echo "4. 选择 qr-generator-landing 仓库"
echo "5. 点击 'Deploy'"