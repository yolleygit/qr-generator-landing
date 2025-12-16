import QRCode from 'qrcode';
import type { QRResult, QRConfig, ValidationResult } from '../types';
import { DEFAULT_QR_CONFIG, INPUT_LIMITS, ERROR_MESSAGES } from '../types/constants';

/**
 * 验证输入文本
 * @param text 要验证的文本
 * @returns 验证结果
 */
export function validateStaticInput(text: string): ValidationResult {
  // 检查空输入
  if (!text || text.trim().length === 0) {
    return {
      isValid: false,
      errorMessage: ERROR_MESSAGES.EMPTY_INPUT,
    };
  }

  // 检查长度限制
  if (text.length > INPUT_LIMITS.STATIC_MAX_LENGTH) {
    return {
      isValid: false,
      errorMessage: ERROR_MESSAGES.INPUT_TOO_LONG,
    };
  }

  // 长度警告（接近限制时）
  if (text.length > INPUT_LIMITS.STATIC_MAX_LENGTH * 0.8) {
    return {
      isValid: true,
      warningMessage: `内容长度: ${text.length}/${INPUT_LIMITS.STATIC_MAX_LENGTH}`,
    };
  }

  return { isValid: true };
}

/**
 * 生成静态二维码
 * @param text 要编码的文本内容
 * @param options 二维码配置选项（可选）
 * @returns 包含dataURL和SVG的二维码结果
 */
export async function generateStaticQR(
  text: string,
  options?: Partial<QRConfig>
): Promise<QRResult> {
  try {
    // 验证输入
    const validation = validateStaticInput(text);
    if (!validation.isValid) {
      return {
        dataURL: '',
        svgString: '',
        success: false,
        error: validation.errorMessage,
      };
    }

    // 合并配置选项
    const config: QRConfig = { ...DEFAULT_QR_CONFIG, ...options };

    // 生成PNG格式的二维码（Data URL）
    const dataURL = await QRCode.toDataURL(text, {
      width: config.width,
      margin: config.margin,
      errorCorrectionLevel: config.errorCorrectionLevel,
      color: config.color,
    });

    // 生成SVG格式的二维码
    const svgString = await QRCode.toString(text, {
      type: 'svg',
      width: config.width,
      margin: config.margin,
      errorCorrectionLevel: config.errorCorrectionLevel,
      color: config.color,
    });

    return {
      dataURL,
      svgString,
      success: true,
    };
  } catch (error) {
    console.error('二维码生成失败:', error);
    return {
      dataURL: '',
      svgString: '',
      success: false,
      error: ERROR_MESSAGES.QR_GENERATION_FAILED,
    };
  }
}

/**
 * 下载二维码文件
 * @param data 二维码数据（dataURL或SVG字符串）
 * @param filename 文件名（不含扩展名）
 * @param format 文件格式
 */
export function downloadQRCode(
  data: string,
  filename: string = 'qrcode',
  format: 'png' | 'svg' = 'png'
): void {
  try {
    let downloadData: string;
    let mimeType: string;
    let extension: string;

    if (format === 'svg') {
      // SVG格式
      downloadData = data;
      mimeType = 'image/svg+xml';
      extension = 'svg';
    } else {
      // PNG格式（Data URL）
      downloadData = data;
      mimeType = 'image/png';
      extension = 'png';
    }

    // 创建下载链接
    const link = document.createElement('a');
    
    if (format === 'svg') {
      // SVG需要转换为Blob
      const blob = new Blob([downloadData], { type: mimeType });
      link.href = URL.createObjectURL(blob);
    } else {
      // PNG直接使用Data URL
      link.href = downloadData;
    }
    
    link.download = `${filename}.${extension}`;
    
    // 触发下载
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // 清理URL对象（如果是Blob）
    if (format === 'svg') {
      URL.revokeObjectURL(link.href);
    }
  } catch (error) {
    console.error('下载失败:', error);
    throw new Error('下载失败，请重试');
  }
}

/**
 * 复制文本到剪贴板
 * @param text 要复制的文本
 * @returns 是否复制成功
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      // 使用现代Clipboard API
      await navigator.clipboard.writeText(text);
      return true;
    } else {
      // 降级方案：使用传统方法
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      
      const success = document.execCommand('copy');
      document.body.removeChild(textArea);
      return success;
    }
  } catch (error) {
    console.error('复制到剪贴板失败:', error);
    return false;
  }
}

/**
 * 检测输入内容类型
 * @param text 输入文本
 * @returns 内容类型描述
 */
export function detectContentType(text: string): string {
  const trimmedText = text.trim();
  
  // URL检测
  try {
    new URL(trimmedText);
    return 'URL';
  } catch {
    // 不是有效URL
  }
  
  // 邮箱检测
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (emailRegex.test(trimmedText)) {
    return '邮箱';
  }
  
  // 电话号码检测
  const phoneRegex = /^[\+]?[1-9][\d]{3,14}$/;
  if (phoneRegex.test(trimmedText.replace(/[\s\-\(\)]/g, ''))) {
    return '电话号码';
  }
  
  // WiFi配置检测
  if (trimmedText.startsWith('WIFI:')) {
    return 'WiFi配置';
  }
  
  // 默认为普通文本
  return '文本';
}