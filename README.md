# 🔗 QR Generator Landing Page

> 极简二维码生成器 - 支持静态/动态TOTP/加密三种模式

一个现代化的单页二维码生成器，提供三种不同的生成模式，满足各种使用场景。

## ✨ 功能特性

### 🔹 静态二维码
- 文本/URL 直接转换为二维码
- 实时生成，支持长文本
- PNG/SVG 双格式下载

### 🔹 动态二维码 (TOTP)
- 基于时间的一次性密码
- 兼容 Google Authenticator 等应用
- 支持多种密钥格式：
  - Base32 标准格式
  - 十六进制格式
  - 多单词格式 (空格分隔)
  - otpauth:// URI 格式
- 智能格式检测和自动转换
- 30秒自动刷新，实时倒计时

### 🔹 加密二维码
- AES-GCM 加密算法保护
- PBKDF2 密钥派生 (100k 迭代)
- 随机盐值确保安全性
- 文件上传解密支持：
  - 图片文件自动识别二维码
  - 文本文件直接读取
- 解密验证功能

## 🛠 技术栈

- **前端框架**: React 18 + TypeScript
- **构建工具**: Vite
- **样式方案**: TailwindCSS
- **核心库**: 
  - `qrcode` - 二维码生成
  - `otpauth` - TOTP 实现
  - `jsqr` - 二维码识别
- **加密**: WebCrypto API (浏览器原生)
- **测试**: Jest + React Testing Library + fast-check

## 🚀 快速开始

### 安装依赖
```bash
npm install
```

### 开发模式
```bash
npm run dev
```

### 构建生产版本
```bash
npm run build
```

### 预览构建结果
```bash
npm run preview
```

### 运行测试
```bash
npm test
```

## 📱 响应式设计

- 桌面优先设计，完美适配移动端
- 固定高度主卡片，避免内容跳动
- 左右布局 (桌面) / 垂直堆叠 (移动)
- 无需滚动即可完成核心操作

## 🔒 安全特性

- 使用浏览器原生 WebCrypto API
- AES-GCM 认证加密
- PBKDF2 密钥派生 (100,000 迭代)
- 随机盐值防止彩虹表攻击
- 前端加密，数据不上传服务器

## 📄 许可证

MIT License