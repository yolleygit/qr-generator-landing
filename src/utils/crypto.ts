import type { EncryptionResult, DecryptionResult, ValidationResult } from '../types';
import { CRYPTO_CONSTANTS, INPUT_LIMITS, ERROR_MESSAGES } from '../types/constants';

/**
 * 验证加密输入
 * @param plaintext 明文内容
 * @param password 密码
 * @returns 验证结果
 */
export function validateEncryptionInput(plaintext: string, password: string): ValidationResult {
  // 检查明文
  if (!plaintext || plaintext.trim().length === 0) {
    return {
      isValid: false,
      errorMessage: '请输入要加密的内容',
    };
  }

  // 检查密码
  if (!password || password.length < INPUT_LIMITS.PASSWORD_MIN_LENGTH) {
    return {
      isValid: false,
      errorMessage: ERROR_MESSAGES.WEAK_PASSWORD,
    };
  }

  return { isValid: true };
}

/**
 * 生成随机字节数组
 * @param length 字节长度
 * @returns 随机字节数组
 */
function generateRandomBytes(length: number): Uint8Array {
  return crypto.getRandomValues(new Uint8Array(length));
}

/**
 * 使用PBKDF2从密码派生密钥
 * @param password 用户密码
 * @param salt 盐值
 * @returns 派生的密钥
 */
async function deriveKey(password: string, salt: Uint8Array): Promise<CryptoKey> {
  // 将密码转换为ArrayBuffer
  const passwordBuffer = new TextEncoder().encode(password);
  
  // 导入密码作为原始密钥材料
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    passwordBuffer,
    'PBKDF2',
    false,
    ['deriveKey']
  );

  // 使用PBKDF2派生AES密钥
  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt as BufferSource,
      iterations: CRYPTO_CONSTANTS.PBKDF2_ITERATIONS,
      hash: 'SHA-256',
    },
    keyMaterial,
    {
      name: CRYPTO_CONSTANTS.ALGORITHM,
      length: CRYPTO_CONSTANTS.KEY_LENGTH,
    },
    false,
    ['encrypt', 'decrypt']
  );
}

/**
 * 加密文本内容
 * @param plaintext 明文内容
 * @param password 用户密码
 * @returns 加密结果
 */
export async function encryptPayload(
  plaintext: string,
  password: string
): Promise<EncryptionResult> {
  try {
    // 验证输入
    const validation = validateEncryptionInput(plaintext, password);
    if (!validation.isValid) {
      return {
        encryptedData: '',
        success: false,
        error: validation.errorMessage,
      };
    }

    // 生成随机盐和IV
    const salt = generateRandomBytes(CRYPTO_CONSTANTS.SALT_LENGTH);
    const iv = generateRandomBytes(CRYPTO_CONSTANTS.IV_LENGTH);

    // 派生密钥
    const key = await deriveKey(password, salt);

    // 加密明文
    const plaintextBuffer = new TextEncoder().encode(plaintext);
    const encryptedBuffer = await crypto.subtle.encrypt(
      {
        name: CRYPTO_CONSTANTS.ALGORITHM,
        iv: iv as BufferSource,
      },
      key,
      plaintextBuffer
    );

    // 组合加密数据：salt + iv + encryptedData
    const combinedBuffer = new Uint8Array(
      salt.length + iv.length + encryptedBuffer.byteLength
    );
    combinedBuffer.set(salt, 0);
    combinedBuffer.set(iv, salt.length);
    combinedBuffer.set(new Uint8Array(encryptedBuffer), salt.length + iv.length);

    // 转换为Base64
    const encryptedData = btoa(String.fromCharCode(...combinedBuffer));

    return {
      encryptedData,
      success: true,
    };
  } catch (error) {
    console.error('加密失败:', error);
    return {
      encryptedData: '',
      success: false,
      error: ERROR_MESSAGES.ENCRYPTION_FAILED,
    };
  }
}

/**
 * 解密文本内容
 * @param encryptedData 加密数据（Base64格式）
 * @param password 用户密码
 * @returns 解密后的明文
 */
export async function decryptPayload(
  encryptedData: string,
  password: string
): Promise<DecryptionResult> {
  try {
    // 验证输入
    if (!encryptedData || !password) {
      return {
        plaintext: '',
        success: false,
        error: '请输入加密数据和密码',
      };
    }

    if (password.length < INPUT_LIMITS.PASSWORD_MIN_LENGTH) {
      return {
        plaintext: '',
        success: false,
        error: ERROR_MESSAGES.WEAK_PASSWORD,
      };
    }

    // 解码Base64
    let combinedBuffer: Uint8Array;
    try {
      const binaryString = atob(encryptedData);
      combinedBuffer = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        combinedBuffer[i] = binaryString.charCodeAt(i);
      }
    } catch (error) {
      return {
        plaintext: '',
        success: false,
        error: ERROR_MESSAGES.INVALID_ENCRYPTED_DATA,
      };
    }

    // 检查数据长度
    const minLength = CRYPTO_CONSTANTS.SALT_LENGTH + CRYPTO_CONSTANTS.IV_LENGTH + 16; // 16是AES-GCM最小密文长度
    if (combinedBuffer.length < minLength) {
      return {
        plaintext: '',
        success: false,
        error: ERROR_MESSAGES.INVALID_ENCRYPTED_DATA,
      };
    }

    // 提取盐、IV和加密数据
    const salt = combinedBuffer.slice(0, CRYPTO_CONSTANTS.SALT_LENGTH);
    const iv = combinedBuffer.slice(
      CRYPTO_CONSTANTS.SALT_LENGTH,
      CRYPTO_CONSTANTS.SALT_LENGTH + CRYPTO_CONSTANTS.IV_LENGTH
    );
    const encrypted = combinedBuffer.slice(
      CRYPTO_CONSTANTS.SALT_LENGTH + CRYPTO_CONSTANTS.IV_LENGTH
    );

    // 派生密钥
    const key = await deriveKey(password, salt);

    // 解密
    const decryptedBuffer = await crypto.subtle.decrypt(
      {
        name: CRYPTO_CONSTANTS.ALGORITHM,
        iv: iv,
      },
      key,
      encrypted
    );

    // 转换为文本
    const plaintext = new TextDecoder().decode(decryptedBuffer);

    return {
      plaintext,
      success: true,
    };
  } catch (error) {
    console.error('解密失败:', error);
    return {
      plaintext: '',
      success: false,
      error: ERROR_MESSAGES.DECRYPTION_FAILED,
    };
  }
}

/**
 * 验证加密数据格式
 * @param encryptedData 加密数据字符串
 * @returns 是否为有效格式
 */
export function isValidEncryptedData(encryptedData: string): boolean {
  try {
    // 检查Base64格式
    const binaryString = atob(encryptedData);
    const buffer = new Uint8Array(binaryString.length);
    
    // 检查长度
    const minLength = CRYPTO_CONSTANTS.SALT_LENGTH + CRYPTO_CONSTANTS.IV_LENGTH + 16;
    return buffer.length >= minLength;
  } catch (error) {
    return false;
  }
}

/**
 * 生成加密数据摘要（用于显示）
 * @param encryptedData 加密数据
 * @param maxLength 最大显示长度
 * @returns 摘要字符串
 */
export function getEncryptedDataSummary(
  encryptedData: string,
  maxLength: number = 50
): string {
  if (encryptedData.length <= maxLength) {
    return encryptedData;
  }
  
  const start = encryptedData.slice(0, Math.floor(maxLength / 2) - 2);
  const end = encryptedData.slice(-Math.floor(maxLength / 2) + 2);
  return `${start}...${end}`;
}

/**
 * 估算加密数据大小
 * @param plaintextLength 明文长度
 * @returns 预估的加密数据大小（字节）
 */
export function estimateEncryptedSize(plaintextLength: number): number {
  // 盐 + IV + 密文 + GCM标签 + Base64编码开销
  const rawSize = CRYPTO_CONSTANTS.SALT_LENGTH + 
                  CRYPTO_CONSTANTS.IV_LENGTH + 
                  plaintextLength + 
                  16; // GCM认证标签
  
  // Base64编码会增加约33%的大小
  return Math.ceil(rawSize * 4 / 3);
}

/**
 * 生成密码强度评估
 * @param password 密码
 * @returns 强度评估结果
 */
export function assessPasswordStrength(password: string): {
  score: number; // 0-4
  feedback: string;
  color: string;
} {
  let score = 0;
  let feedback = '';
  
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[^a-zA-Z0-9]/.test(password)) score++;
  
  switch (score) {
    case 0:
    case 1:
      feedback = '密码太弱';
      return { score, feedback, color: 'text-red-600' };
    case 2:
      feedback = '密码较弱';
      return { score, feedback, color: 'text-orange-600' };
    case 3:
      feedback = '密码中等';
      return { score, feedback, color: 'text-yellow-600' };
    case 4:
      feedback = '密码较强';
      return { score, feedback, color: 'text-blue-600' };
    case 5:
      feedback = '密码很强';
      return { score, feedback, color: 'text-green-600' };
    default:
      feedback = '未知';
      return { score, feedback, color: 'text-gray-600' };
  }
}