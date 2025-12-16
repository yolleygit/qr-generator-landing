/**
 * 二维码生成模式
 */
export const QRMode = {
  STATIC: 'static',
  DYNAMIC: 'dynamic',
  ENCRYPTED: 'encrypted'
} as const;

export type QRMode = typeof QRMode[keyof typeof QRMode];

/**
 * 二维码生成结果接口
 */
export interface QRResult {
  /** 二维码的Data URL格式 (PNG) */
  dataURL: string;
  /** 二维码的SVG字符串格式 */
  svgString: string;
  /** 生成是否成功 */
  success: boolean;
  /** 错误信息（如果生成失败） */
  error?: string;
}

/**
 * TOTP配置接口
 */
export interface TOTPConfig {
  /** Base32格式的密钥 */
  secret: string;
  /** 当前6位TOTP验证码 */
  code: string;
  /** 剩余时间（秒） */
  timeRemaining: number;
  /** 标准otpauth:// URI格式 */
  otpauthURL: string;
}

/**
 * 加密结果接口
 */
export interface EncryptionResult {
  /** 加密后的数据（Base64编码） */
  encryptedData: string;
  /** 加密是否成功 */
  success: boolean;
  /** 错误信息（如果加密失败） */
  error?: string;
}

/**
 * 主应用状态接口
 */
export interface AppState {
  /** 当前选中的二维码模式 */
  currentMode: QRMode;
  /** 静态模式的输入文本 */
  staticInput: string;
  /** TOTP模式的secret输入 */
  totpSecret: string;
  /** TOTP配置对象 */
  totpConfig: TOTPConfig | null;
  /** 加密模式的明文输入 */
  encryptInput: string;
  /** 加密模式的密码输入 */
  encryptPassword: string;
  /** 加密后的payload */
  encryptedPayload: string;
  /** 当前二维码生成结果 */
  qrResult: QRResult | null;
  /** 是否正在加载 */
  isLoading: boolean;
  /** 错误信息 */
  error: string | null;
}

/**
 * 二维码配置选项接口
 */
export interface QRConfig {
  /** 二维码宽度（像素） */
  width: number;
  /** 边距大小 */
  margin: number;
  /** 错误纠正级别 */
  errorCorrectionLevel: 'L' | 'M' | 'Q' | 'H';
  /** 图片类型 */
  type: 'image/png' | 'image/jpeg';
  /** 图片质量 (0-1) */
  quality: number;
  /** 颜色配置 */
  color: {
    /** 前景色（二维码颜色） */
    dark: string;
    /** 背景色 */
    light: string;
  };
}

/**
 * 解密验证接口
 */
export interface DecryptionInput {
  /** 要解密的加密数据 */
  encryptedData: string;
  /** 解密密码 */
  password: string;
}

/**
 * 解密结果接口
 */
export interface DecryptionResult {
  /** 解密后的明文 */
  plaintext: string;
  /** 解密是否成功 */
  success: boolean;
  /** 错误信息（如果解密失败） */
  error?: string;
}

/**
 * 标签页配置接口
 */
export interface TabConfig {
  /** 标签页ID */
  id: QRMode;
  /** 显示标题 */
  title: string;
  /** 描述文本 */
  description: string;
  /** 图标（可选） */
  icon?: string;
}

/**
 * 下载选项接口
 */
export interface DownloadOptions {
  /** 文件名（不含扩展名） */
  filename: string;
  /** 文件格式 */
  format: 'png' | 'svg';
  /** 二维码数据 */
  data: string;
}

/**
 * 错误类型
 */
export const ErrorType = {
  VALIDATION_ERROR: 'validation_error',
  GENERATION_ERROR: 'generation_error',
  ENCRYPTION_ERROR: 'encryption_error',
  DECRYPTION_ERROR: 'decryption_error',
  CLIPBOARD_ERROR: 'clipboard_error',
  NETWORK_ERROR: 'network_error'
} as const;

export type ErrorType = typeof ErrorType[keyof typeof ErrorType];

/**
 * 应用错误接口
 */
export interface AppError {
  /** 错误类型 */
  type: ErrorType;
  /** 错误消息 */
  message: string;
  /** 详细错误信息 */
  details?: string;
  /** 错误发生时间 */
  timestamp: Date;
}

/**
 * 输入验证结果接口
 */
export interface ValidationResult {
  /** 验证是否通过 */
  isValid: boolean;
  /** 错误消息（如果验证失败） */
  errorMessage?: string;
  /** 警告消息（可选） */
  warningMessage?: string;
}