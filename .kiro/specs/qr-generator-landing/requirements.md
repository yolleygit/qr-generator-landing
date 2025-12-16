# 二维码生成器 Landing Page 需求文档

## 简介

一个极简、科技感的单页二维码生成器网站，支持三种模式：静态二维码、动态二维码（TOTP）和加密二维码。整个核心功能在一屏内完成，无需滚动，提供优秀的用户体验。

## 术语表

- **QR_Generator_System**: 二维码生成器系统
- **Static_QR**: 静态二维码模式，将文本或URL直接编码为二维码
- **Dynamic_QR**: 动态二维码模式，基于TOTP算法生成每30秒变化的二维码
- **Encrypted_QR**: 加密二维码模式，将文本加密后生成二维码
- **Main_Card**: 主卡片容器，包含所有核心功能的中心区域
- **Tab_Interface**: 标签页界面，用于切换三种二维码模式
- **TOTP**: 基于时间的一次性密码算法
- **WebCrypto_API**: 浏览器原生加密API
- **Landing_Page**: 单页着陆页面

## 需求

### 需求 1

**用户故事:** 作为用户，我想要在一个简洁的单页网站上生成静态二维码，以便快速将文本或URL转换为可扫描的二维码。

#### 验收标准

1. WHEN 用户访问页面 THEN QR_Generator_System SHALL 显示包含静态二维码标签的Main_Card
2. WHEN 用户在静态模式输入文本或URL THEN QR_Generator_System SHALL 实时生成对应的二维码
3. WHEN 用户输入为空 THEN QR_Generator_System SHALL 显示友好的提示信息并阻止生成
4. WHEN 用户输入超过500字符 THEN QR_Generator_System SHALL 显示长度限制提示
5. WHEN 二维码生成成功 THEN QR_Generator_System SHALL 提供PNG和SVG格式的下载选项

### 需求 2

**用户故事:** 作为用户，我想要生成基于TOTP的动态二维码，以便创建类似Google Authenticator的时间敏感验证码。

#### 验收标准

1. WHEN 用户切换到动态TOTP标签 THEN QR_Generator_System SHALL 显示secret输入框和当前TOTP码
2. WHEN 用户输入有效的Base32 secret THEN QR_Generator_System SHALL 生成当前6位TOTP验证码
3. WHEN TOTP码生成后 THEN QR_Generator_System SHALL 每30秒自动刷新验证码和二维码
4. WHEN TOTP倒计时进行中 THEN QR_Generator_System SHALL 显示30到0的进度条倒计时
5. WHEN 用户点击TOTP码 THEN QR_Generator_System SHALL 复制验证码到剪贴板

### 需求 3

**用户故事:** 作为用户，我想要生成加密的二维码，以便安全地分享敏感信息，只有知道密码的人才能解密。

#### 验收标准

1. WHEN 用户切换到加密标签 THEN QR_Generator_System SHALL 显示明文输入框和密码输入框
2. WHEN 用户输入明文和密码 THEN QR_Generator_System SHALL 使用WebCrypto_API的AES-GCM算法加密内容
3. WHEN 加密完成 THEN QR_Generator_System SHALL 生成包含加密payload的二维码
4. WHEN 加密成功 THEN QR_Generator_System SHALL 提供复制加密串的功能
5. WHEN 用户需要验证 THEN QR_Generator_System SHALL 提供解密验证功能输入加密串和密码显示原文

### 需求 4

**用户故事:** 作为用户，我想要在一个无需滚动的页面中完成所有操作，以便获得流畅的用户体验。

#### 验收标准

1. WHEN 页面加载完成 THEN QR_Generator_System SHALL 在一屏内显示所有核心功能
2. WHEN 用户切换Tab_Interface THEN QR_Generator_System SHALL 保持Main_Card高度一致无页面跳动
3. WHEN 内容区域变化 THEN QR_Generator_System SHALL 使用固定高度和动画过渡
4. WHEN 在任何模式下 THEN QR_Generator_System SHALL 禁止出现卡片内滚动条
5. WHEN 用户操作任何功能 THEN QR_Generator_System SHALL 确保无需滚动页面即可完成

### 需求 5

**用户故事:** 作为用户，我想要在不同设备上都能正常使用二维码生成器，以便在桌面和移动设备上都有良好体验。

#### 验收标准

1. WHEN 用户在桌面设备访问 THEN QR_Generator_System SHALL 显示左右布局的Main_Card
2. WHEN 用户在移动设备访问 THEN QR_Generator_System SHALL 自动调整为垂直布局
3. WHEN 屏幕尺寸变化 THEN QR_Generator_System SHALL 保持所有功能的可用性和可见性
4. WHEN 在移动设备上 THEN QR_Generator_System SHALL 确保二维码预览区域大小适中
5. WHEN 响应式布局激活 THEN QR_Generator_System SHALL 保持极简科技感的视觉风格

### 需求 6

**用户故事:** 作为用户，我想要清晰的视觉反馈和错误处理，以便了解系统状态和操作结果。

#### 验收标准

1. WHEN 用户输入无效数据 THEN QR_Generator_System SHALL 显示具体的错误提示信息
2. WHEN 二维码生成中 THEN QR_Generator_System SHALL 显示加载状态指示器
3. WHEN 操作成功完成 THEN QR_Generator_System SHALL 提供成功反馈提示
4. WHEN 加密或解密失败 THEN QR_Generator_System SHALL 显示友好的错误信息
5. WHEN 网络或系统错误发生 THEN QR_Generator_System SHALL 提供恢复建议和重试选项

### 需求 7

**用户故事:** 作为开发者，我想要模块化和可维护的代码结构，以便后续功能扩展和维护。

#### 验收标准

1. WHEN 实现静态二维码功能 THEN QR_Generator_System SHALL 使用独立的generateStaticQR函数
2. WHEN 实现TOTP功能 THEN QR_Generator_System SHALL 使用独立的generateTOTP函数
3. WHEN 实现加密功能 THEN QR_Generator_System SHALL 使用独立的encryptPayload和decryptPayload函数
4. WHEN 编写核心函数 THEN QR_Generator_System SHALL 包含完整的JSDoc注释说明
5. WHEN 使用加密功能 THEN QR_Generator_System SHALL 强制使用WebCrypto_API而非自定义实现