# 二维码生成器 Landing Page 设计文档

## 概述

本设计文档描述了一个现代化、极简风格的单页二维码生成器应用。该应用支持三种二维码生成模式：静态、动态TOTP和加密模式。整个应用采用React + TypeScript构建，使用TailwindCSS实现响应式设计，确保在桌面和移动设备上都有优秀的用户体验。

## 架构

### 整体架构
```
┌─────────────────────────────────────┐
│           Landing Page              │
├─────────────────────────────────────┤
│  Header (标题 + 卖点)                │
├─────────────────────────────────────┤
│           Main Card                 │
│  ┌─────────────────────────────────┐ │
│  │  Tab Interface                  │ │
│  │  ├─静态 ├─动态TOTP ├─加密        │ │
│  ├─────────────────────────────────┤ │
│  │  Content Area (固定高度)         │ │
│  │  ┌─────────────┬─────────────┐   │ │
│  │  │ Input Panel │ QR Preview  │   │ │
│  │  │             │ + Download  │   │ │
│  │  └─────────────┴─────────────┘   │ │
│  └─────────────────────────────────┘ │
├─────────────────────────────────────┤
│  Footer (说明/FAQ)                   │
└─────────────────────────────────────┘
```

### 技术栈
- **前端框架**: React 18 + TypeScript
- **构建工具**: Vite
- **样式**: TailwindCSS
- **二维码生成**: qrcode 库
- **TOTP实现**: otpauth 库
- **加密**: WebCrypto API (AES-GCM + PBKDF2)

## 组件和接口

### 核心组件结构

```typescript
// 主应用组件
App.tsx
├── Header 组件
├── MainCard 组件
│   ├── TabInterface 组件
│   ├── StaticQRPanel 组件
│   ├── DynamicQRPanel 组件
│   ├── EncryptedQRPanel 组件
│   └── QRPreview 组件
└── Footer 组件
```

### 主要接口定义

```typescript
// 二维码模式枚举
enum QRMode {
  STATIC = 'static',
  DYNAMIC = 'dynamic', 
  ENCRYPTED = 'encrypted'
}

// 二维码生成结果
interface QRResult {
  dataURL: string;
  svgString: string;
  success: boolean;
  error?: string;
}

// TOTP配置
interface TOTPConfig {
  secret: string;
  code: string;
  timeRemaining: number;
  otpauthURL: string;
}

// 加密结果
interface EncryptionResult {
  encryptedData: string;
  success: boolean;
  error?: string;
}
```

## 数据模型

### 应用状态管理

```typescript
// 主应用状态
interface AppState {
  currentMode: QRMode;
  staticInput: string;
  totpSecret: string;
  totpConfig: TOTPConfig | null;
  encryptInput: string;
  encryptPassword: string;
  encryptedPayload: string;
  qrResult: QRResult | null;
  isLoading: boolean;
  error: string | null;
}

// 二维码配置
interface QRConfig {
  width: number;
  margin: number;
  errorCorrectionLevel: 'L' | 'M' | 'Q' | 'H';
  type: 'image/png' | 'image/jpeg';
  quality: number;
  color: {
    dark: string;
    light: string;
  };
}
```

## 正确性属性

*属性是一个特征或行为，应该在系统的所有有效执行中保持为真——本质上是关于系统应该做什么的正式陈述。属性作为人类可读规范和机器可验证正确性保证之间的桥梁。*
基于预工作分析，以下是经过优化的正确性属性：

**属性 1: 静态二维码生成完整性**
*对于任何*有效的文本或URL输入，系统应该生成对应的二维码并提供PNG和SVG下载选项
**验证需求: 1.2, 1.5**

**属性 2: TOTP生成和时间同步**
*对于任何*有效的Base32 secret，系统应该生成正确的6位TOTP码，每30秒自动刷新，并显示准确的倒计时
**验证需求: 2.2, 2.3, 2.4**

**属性 3: 加密解密往返一致性**
*对于任何*明文和密码组合，加密后再解密应该得到原始明文内容
**验证需求: 3.2, 3.3, 3.5**

**属性 4: 响应式布局适配**
*对于任何*屏幕尺寸变化，系统应该保持所有功能的可用性和可见性
**验证需求: 5.3**

**属性 5: 无滚动布局约束**
*对于任何*模式和操作，系统应该确保卡片内无滚动条且页面无需滚动即可完成操作
**验证需求: 4.4, 4.5**

**属性 6: 错误处理和用户反馈**
*对于任何*无效输入或操作失败，系统应该显示具体的错误信息；对于成功操作，应该提供明确的反馈
**验证需求: 6.1, 6.3**

## 错误处理

### 输入验证错误
- **空输入**: 显示"请输入内容"提示
- **长度超限**: 显示"内容长度不能超过500字符"
- **无效Base32**: 显示"请输入有效的Base32格式secret"
- **弱密码**: 显示"密码长度至少8位"

### 系统错误处理
- **二维码生成失败**: 显示"二维码生成失败，请重试"
- **加密失败**: 显示"加密失败，请检查输入"
- **解密失败**: 显示"解密失败，请检查密码"
- **剪贴板操作失败**: 显示"复制失败，请手动选择"

### 错误恢复机制
- 自动清除错误状态
- 提供重试按钮
- 保留用户输入内容
- 友好的错误提示文案

## 测试策略

### 双重测试方法

本项目采用单元测试和基于属性的测试相结合的方法：

**单元测试覆盖：**
- 特定示例验证（如已知secret的TOTP生成）
- 边界条件测试（空输入、长度限制）
- 组件集成测试（UI交互、状态管理）
- 错误条件验证（无效输入、系统错误）

**基于属性的测试覆盖：**
- 使用 **Jest** 作为测试框架
- 使用 **fast-check** 作为属性测试库
- 每个属性测试运行最少100次迭代
- 验证通用正确性属性（往返一致性、输入输出关系）

**测试库配置：**
- **单元测试**: Jest + React Testing Library
- **属性测试**: fast-check 库
- **最小迭代次数**: 100次随机测试
- **标签格式**: `**Feature: qr-generator-landing, Property {number}: {property_text}**`

每个正确性属性必须由单个属性测试实现，并使用指定格式的注释标签。

### 核心功能测试重点

**静态二维码测试：**
- 文本到二维码的转换正确性
- 不同长度输入的处理
- 特殊字符和Unicode支持
- 下载功能的完整性

**TOTP测试：**
- RFC 6238标准兼容性
- 时间同步准确性
- Secret格式验证
- 30秒周期刷新机制

**加密测试：**
- AES-GCM加密强度
- PBKDF2密钥派生
- 往返加密解密一致性
- 错误密码处理

**UI/UX测试：**
- 响应式布局验证
- 无滚动约束检查
- 错误状态显示
- 加载状态指示

## 实现细节

### 核心函数设计

```typescript
/**
 * 生成静态二维码
 * @param text 要编码的文本内容
 * @param options 二维码配置选项
 * @returns 包含dataURL和SVG的二维码结果
 */
async function generateStaticQR(text: string, options?: QRConfig): Promise<QRResult>

/**
 * 生成TOTP验证码
 * @param secret Base32格式的密钥
 * @param timestamp 当前时间戳（可选，用于测试）
 * @returns TOTP配置对象
 */
function generateTOTP(secret: string, timestamp?: number): TOTPConfig

/**
 * 加密文本内容
 * @param plaintext 明文内容
 * @param password 用户密码
 * @returns 加密结果
 */
async function encryptPayload(plaintext: string, password: string): Promise<EncryptionResult>

/**
 * 解密文本内容
 * @param encryptedData 加密数据
 * @param password 用户密码
 * @returns 解密后的明文
 */
async function decryptPayload(encryptedData: string, password: string): Promise<string>
```

### 技术实现要点

**二维码生成：**
- 使用qrcode库的toDataURL和toString方法
- 支持PNG和SVG两种格式输出
- 配置适当的错误纠正级别（M级）
- 优化二维码尺寸和边距

**TOTP实现：**
- 使用otpauth库生成标准otpauth:// URI
- 实现30秒倒计时和自动刷新
- 支持复制到剪贴板功能
- 兼容Google Authenticator格式

**加密实现：**
- 强制使用WebCrypto API
- AES-GCM模式提供认证加密
- PBKDF2进行密钥派生（100,000轮迭代）
- Base64编码加密输出

**状态管理：**
- 使用React Hooks管理组件状态
- 实现防抖输入处理
- 优化重渲染性能
- 错误边界处理

### 性能优化

**渲染优化：**
- 使用React.memo优化组件重渲染
- 实现输入防抖（300ms）
- 二维码生成异步处理
- 图片懒加载

**内存管理：**
- 及时清理定时器
- 避免内存泄漏
- 优化大文件处理
- 合理的缓存策略

**用户体验：**
- 加载状态指示
- 平滑的动画过渡
- 即时的错误反馈
- 响应式交互设计