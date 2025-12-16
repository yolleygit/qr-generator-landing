import { TOTP } from 'otpauth';
import type { TOTPConfig, ValidationResult } from '../types';
import { TOTP_CONSTANTS, ERROR_MESSAGES } from '../types/constants';

/**
 * 检测输入的格式类型
 * @param input 用户输入
 * @returns 格式类型
 */
export function detectSecretFormat(input: string): 'base32' | 'hex' | 'words' | 'mixed' {
  const cleaned = input.replace(/[\s\-_]/g, '').toUpperCase();
  
  // 检查是否为标准Base32（A-Z, 2-7）
  if (/^[A-Z2-7]+=*$/.test(cleaned)) {
    return 'base32';
  }
  
  // 检查是否为十六进制
  if (/^[0-9A-F]+$/i.test(cleaned)) {
    return 'hex';
  }
  
  // 检查是否包含多个单词（空格分隔）
  if (input.includes(' ') && input.split(' ').length > 1) {
    return 'words';
  }
  
  return 'mixed';
}

/**
 * 验证TOTP密钥输入
 * @param secret 要验证的secret字符串
 * @returns 验证结果
 */
export function validateTOTPSecret(secret: string): ValidationResult {
  // 检查空输入
  if (!secret || secret.trim().length === 0) {
    return {
      isValid: false,
      errorMessage: ERROR_MESSAGES.EMPTY_INPUT,
    };
  }

  // 基本长度检查 - 非常宽松
  if (secret.trim().length < 4) {
    return {
      isValid: false,
      errorMessage: '密钥长度至少4位',
    };
  }

  // 检测格式并给出友好提示
  const format = detectSecretFormat(secret);
  let message = '';
  
  switch (format) {
    case 'base32':
      message = '标准Base32格式 ✓';
      break;
    case 'hex':
      message = '十六进制格式，将自动转换';
      break;
    case 'words':
      message = '多单词格式，将自动处理';
      break;
    case 'mixed':
      message = '混合格式，将尝试自动处理';
      break;
  }

  return { 
    isValid: true,
    warningMessage: message
  };
}

/**
 * 将十六进制字符串转换为Base32
 * @param hex 十六进制字符串
 * @returns Base32字符串
 */
function hexToBase32(hex: string): string {
  // 简单的十六进制到Base32转换
  const bytes = [];
  for (let i = 0; i < hex.length; i += 2) {
    bytes.push(parseInt(hex.substr(i, 2), 16));
  }
  
  // 使用简单的Base32编码
  const base32Chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
  let result = '';
  let buffer = 0;
  let bitsLeft = 0;
  
  for (const byte of bytes) {
    buffer = (buffer << 8) | byte;
    bitsLeft += 8;
    
    while (bitsLeft >= 5) {
      result += base32Chars[(buffer >> (bitsLeft - 5)) & 31];
      bitsLeft -= 5;
    }
  }
  
  if (bitsLeft > 0) {
    result += base32Chars[(buffer << (5 - bitsLeft)) & 31];
  }
  
  return result;
}

/**
 * 将多单词转换为Base32
 * @param words 空格分隔的单词
 * @returns Base32字符串
 */
function wordsToBase32(words: string): string {
  // 将单词连接并转换为字节
  const combined = words.replace(/\s+/g, '').toUpperCase();
  
  // 如果已经是有效的Base32，直接返回
  if (/^[A-Z2-7]+=*$/.test(combined)) {
    return combined;
  }
  
  // 否则将字符串转换为字节再编码为Base32
  const encoder = new TextEncoder();
  const bytes = encoder.encode(combined);
  
  const base32Chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
  let result = '';
  let buffer = 0;
  let bitsLeft = 0;
  
  for (const byte of bytes) {
    buffer = (buffer << 8) | byte;
    bitsLeft += 8;
    
    while (bitsLeft >= 5) {
      result += base32Chars[(buffer >> (bitsLeft - 5)) & 31];
      bitsLeft -= 5;
    }
  }
  
  if (bitsLeft > 0) {
    result += base32Chars[(buffer << (5 - bitsLeft)) & 31];
  }
  
  return result;
}

/**
 * 智能清理和格式化密钥
 * @param secret 原始secret字符串
 * @returns 清理后的Base32格式secret
 */
export function cleanTOTPSecret(secret: string): string {
  const format = detectSecretFormat(secret);
  
  switch (format) {
    case 'base32':
      // 标准Base32，只需清理空格和分隔符
      return secret.replace(/[\s\-_]/g, '').toUpperCase();
      
    case 'hex':
      // 十六进制，转换为Base32
      const hexCleaned = secret.replace(/[\s\-_]/g, '').toUpperCase();
      try {
        return hexToBase32(hexCleaned);
      } catch {
        // 如果转换失败，尝试直接使用
        return hexCleaned;
      }
      
    case 'words':
      // 多单词，转换为Base32
      try {
        return wordsToBase32(secret);
      } catch {
        // 如果转换失败，清理后直接使用
        return secret.replace(/[\s\-_]/g, '').toUpperCase();
      }
      
    case 'mixed':
    default:
      // 混合格式，尝试多种方式
      const cleaned = secret.replace(/[\s\-_]/g, '').toUpperCase();
      
      // 先尝试作为Base32
      if (/^[A-Z2-7]+=*$/.test(cleaned)) {
        return cleaned;
      }
      
      // 再尝试作为十六进制
      if (/^[0-9A-F]+$/i.test(cleaned)) {
        try {
          return hexToBase32(cleaned);
        } catch {
          return cleaned;
        }
      }
      
      // 最后直接返回清理后的字符串
      return cleaned;
  }
}

/**
 * 生成TOTP验证码和配置
 * @param secret Base32格式的密钥
 * @param timestamp 当前时间戳（可选，用于测试）
 * @param label 标签（可选）
 * @param issuer 发行者（可选）
 * @returns TOTP配置对象
 */
export function generateTOTP(
  secret: string,
  timestamp?: number,
  label: string = 'User',
  issuer: string = TOTP_CONSTANTS.ISSUER
): TOTPConfig {
  try {
    // 清理secret
    const cleanSecret = cleanTOTPSecret(secret);

    // 创建TOTP实例 - 使用try-catch处理各种格式
    let totp: TOTP;
    try {
      totp = new TOTP({
        issuer: issuer,
        label: label,
        algorithm: TOTP_CONSTANTS.ALGORITHM,
        digits: TOTP_CONSTANTS.CODE_LENGTH,
        period: TOTP_CONSTANTS.PERIOD,
        secret: cleanSecret,
      });
    } catch (error) {
      // 如果标准格式失败，尝试其他方式
      throw new Error('无法解析Secret，请检查格式是否正确');
    }

    // 获取当前时间（秒）
    const currentTime = timestamp ? Math.floor(timestamp / 1000) : Math.floor(Date.now() / 1000);
    
    // 生成当前TOTP码
    const code = totp.generate({ timestamp: currentTime * 1000 });
    
    // 计算剩余时间
    const timeRemaining = TOTP_CONSTANTS.PERIOD - (currentTime % TOTP_CONSTANTS.PERIOD);
    
    // 生成otpauth URI
    const otpauthURL = totp.toString();

    return {
      secret: cleanSecret,
      code,
      timeRemaining,
      otpauthURL,
    };
  } catch (error) {
    console.error('TOTP生成失败:', error);
    throw new Error(error instanceof Error ? error.message : 'TOTP生成失败，请检查Secret格式');
  }
}

/**
 * 验证TOTP码
 * @param secret Base32格式的密钥
 * @param token 要验证的6位数字码
 * @param window 时间窗口（允许的时间偏差，默认为1）
 * @returns 验证是否成功
 */
export function verifyTOTP(
  secret: string,
  token: string,
  window: number = 1
): boolean {
  try {
    const cleanSecret = cleanTOTPSecret(secret);
    
    const totp = new TOTP({
      algorithm: TOTP_CONSTANTS.ALGORITHM,
      digits: TOTP_CONSTANTS.CODE_LENGTH,
      period: TOTP_CONSTANTS.PERIOD,
      secret: cleanSecret,
    });

    // 验证token，允许时间窗口偏差
    const delta = totp.validate({ token, window });
    return delta !== null;
  } catch (error) {
    console.error('TOTP验证失败:', error);
    return false;
  }
}

/**
 * 获取TOTP进度百分比
 * @param timeRemaining 剩余时间（秒）
 * @returns 进度百分比（0-100）
 */
export function getTOTPProgress(timeRemaining: number): number {
  return ((TOTP_CONSTANTS.PERIOD - timeRemaining) / TOTP_CONSTANTS.PERIOD) * 100;
}

/**
 * 格式化TOTP码显示（添加空格分隔）
 * @param code 6位TOTP码
 * @returns 格式化后的显示字符串
 */
export function formatTOTPCode(code: string): string {
  if (code.length !== TOTP_CONSTANTS.CODE_LENGTH) {
    return code;
  }
  return `${code.slice(0, 3)} ${code.slice(3)}`;
}

/**
 * 生成示例TOTP secret（用于演示）
 * @returns 随机生成的Base32 secret
 */
export function generateExampleSecret(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
  let result = '';
  for (let i = 0; i < 32; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * 解析otpauth URI
 * @param uri otpauth://totp/... 格式的URI
 * @returns 解析后的参数对象
 */
export function parseOTPAuthURI(uri: string): {
  secret?: string;
  issuer?: string;
  label?: string;
  algorithm?: string;
  digits?: number;
  period?: number;
} | null {
  try {
    const url = new URL(uri);
    
    if (url.protocol !== 'otpauth:' || url.hostname !== 'totp') {
      return null;
    }

    const params = new URLSearchParams(url.search);
    const pathParts = url.pathname.split('/').filter(Boolean);
    
    return {
      secret: params.get('secret') || undefined,
      issuer: params.get('issuer') || undefined,
      label: pathParts[0] || undefined,
      algorithm: params.get('algorithm') || undefined,
      digits: params.get('digits') ? parseInt(params.get('digits')!) : undefined,
      period: params.get('period') ? parseInt(params.get('period')!) : undefined,
    };
  } catch (error) {
    console.error('解析otpauth URI失败:', error);
    return null;
  }
}