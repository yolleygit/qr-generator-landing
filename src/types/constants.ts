import type { QRConfig, TabConfig } from './index';
import { QRMode } from './index';

/**
 * 默认二维码配置
 */
export const DEFAULT_QR_CONFIG: QRConfig = {
  width: 300,
  margin: 2,
  errorCorrectionLevel: 'M',
  type: 'image/png',
  quality: 0.92,
  color: {
    dark: '#000000',
    light: '#FFFFFF',
  },
};

/**
 * 标签页配置
 */
export const TAB_CONFIGS: TabConfig[] = [
  {
    id: QRMode.STATIC,
    title: '静态',
    description: '将文本或URL直接转换为二维码',
  },
  {
    id: QRMode.DYNAMIC,
    title: '动态(TOTP)',
    description: '生成基于时间的一次性密码二维码',
  },
  {
    id: QRMode.ENCRYPTED,
    title: '加密',
    description: '生成加密后的安全二维码',
  },
];

/**
 * 输入限制常量
 */
export const INPUT_LIMITS = {
  /** 静态文本最大长度 */
  STATIC_MAX_LENGTH: 500,
  /** 密码最小长度 */
  PASSWORD_MIN_LENGTH: 8,
  /** TOTP Secret最小长度 */
  TOTP_SECRET_MIN_LENGTH: 16,
} as const;

/**
 * TOTP相关常量
 */
export const TOTP_CONSTANTS = {
  /** TOTP周期（秒） */
  PERIOD: 30,
  /** TOTP码长度 */
  CODE_LENGTH: 6,
  /** 算法 */
  ALGORITHM: 'SHA1',
  /** 发行者名称 */
  ISSUER: 'QR Generator',
} as const;

/**
 * 加密相关常量
 */
export const CRYPTO_CONSTANTS = {
  /** AES-GCM算法名称 */
  ALGORITHM: 'AES-GCM',
  /** 密钥长度（位） */
  KEY_LENGTH: 256,
  /** IV长度（字节） */
  IV_LENGTH: 12,
  /** PBKDF2迭代次数 */
  PBKDF2_ITERATIONS: 100000,
  /** 盐长度（字节） */
  SALT_LENGTH: 16,
} as const;

/**
 * UI相关常量
 */
export const UI_CONSTANTS = {
  /** 输入防抖延迟（毫秒） */
  DEBOUNCE_DELAY: 300,
  /** 动画持续时间（毫秒） */
  ANIMATION_DURATION: 300,
  /** 成功提示显示时间（毫秒） */
  SUCCESS_TOAST_DURATION: 3000,
  /** 错误提示显示时间（毫秒） */
  ERROR_TOAST_DURATION: 5000,
} as const;

/**
 * 错误消息常量
 */
export const ERROR_MESSAGES = {
  EMPTY_INPUT: '请输入内容',
  INPUT_TOO_LONG: `内容长度不能超过${INPUT_LIMITS.STATIC_MAX_LENGTH}字符`,
  INVALID_BASE32: '请输入有效的Base32格式secret',
  WEAK_PASSWORD: `密码长度至少${INPUT_LIMITS.PASSWORD_MIN_LENGTH}位`,
  QR_GENERATION_FAILED: '二维码生成失败，请重试',
  ENCRYPTION_FAILED: '加密失败，请检查输入',
  DECRYPTION_FAILED: '解密失败，请检查密码',
  CLIPBOARD_FAILED: '复制失败，请手动选择',
  INVALID_ENCRYPTED_DATA: '无效的加密数据格式',
  NETWORK_ERROR: '网络错误，请检查连接',
} as const;

/**
 * 成功消息常量
 */
export const SUCCESS_MESSAGES = {
  QR_GENERATED: '二维码生成成功',
  COPIED_TO_CLIPBOARD: '已复制到剪贴板',
  ENCRYPTED_SUCCESSFULLY: '加密成功',
  DECRYPTED_SUCCESSFULLY: '解密成功',
  DOWNLOADED_SUCCESSFULLY: '下载成功',
} as const;