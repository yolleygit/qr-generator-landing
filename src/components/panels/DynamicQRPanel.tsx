import React, { useState, useCallback, useEffect, useRef } from 'react';
import { 
  validateTOTPSecret, 
  generateTOTP, 
  formatTOTPCode, 
  getTOTPProgress,
  generateExampleSecret,
  parseOTPAuthURI,
  detectSecretFormat
} from '../../utils/totp';
import { copyToClipboard } from '../../utils/qr-generator';
import type { TOTPConfig } from '../../types';
import { TOTP_CONSTANTS, ERROR_MESSAGES } from '../../types/constants';

interface DynamicQRPanelProps {
  /** 当前secret值 */
  secret: string;
  /** Secret变化回调 */
  onSecretChange: (secret: string) => void;
  /** TOTP配置变化回调 */
  onTOTPChange: (config: TOTPConfig | null) => void;
  /** 是否正在加载 */
  isLoading?: boolean;
  /** 错误信息 */
  error?: string | null;
}

/**
 * 动态TOTP二维码输入面板组件
 */
export const DynamicQRPanel: React.FC<DynamicQRPanelProps> = ({
  secret,
  onSecretChange,
  onTOTPChange,
  isLoading = false,
  error = null,
}) => {
  const [localError, setLocalError] = useState<string | null>(null);
  const [totpConfig, setTotpConfig] = useState<TOTPConfig | null>(null);
  const [copySuccess, setCopySuccess] = useState<boolean>(false);
  const [detectedFormat, setDetectedFormat] = useState<string>('');
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // 生成TOTP配置
  const generateTOTPConfig = useCallback(() => {
    if (!secret.trim()) {
      setTotpConfig(null);
      onTOTPChange(null);
      return;
    }

    try {
      let config: TOTPConfig;
      
      // 智能检测输入类型
      if (secret.trim().startsWith('otpauth://')) {
        // 解析otpauth URI
        const parsed = parseOTPAuthURI(secret.trim());
        if (parsed && parsed.secret) {
          config = generateTOTP(
            parsed.secret,
            undefined,
            parsed.label || 'User',
            parsed.issuer || 'QR Generator'
          );
        } else {
          throw new Error('无效的otpauth URI格式');
        }
      } else {
        // 直接使用secret生成
        config = generateTOTP(secret);
      }
      
      setTotpConfig(config);
      onTOTPChange(config);
      setLocalError(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'TOTP生成失败';
      setLocalError(errorMessage);
      setTotpConfig(null);
      onTOTPChange(null);
    }
  }, [secret, onTOTPChange]);

  // 处理输入变化
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    onSecretChange(newValue);
    
    // 自动检测输入格式
    if (newValue.trim().startsWith('otpauth://')) {
      setDetectedFormat('otpauth URI');
    } else if (newValue.trim()) {
      // 检测格式
      const format = detectSecretFormat(newValue);
      const formatNames = {
        'base32': 'Base32 标准格式',
        'hex': '十六进制格式',
        'words': '多单词格式',
        'mixed': '混合格式'
      };
      setDetectedFormat(formatNames[format]);
      
      const validation = validateTOTPSecret(newValue);
      setLocalError(validation.isValid ? null : (validation.errorMessage || null));
    } else {
      setLocalError(null);
      setDetectedFormat('');
    }
  }, [onSecretChange]);

  // 复制TOTP码到剪贴板
  const handleCopyCode = useCallback(async () => {
    if (!totpConfig) return;
    
    const success = await copyToClipboard(totpConfig.code);
    if (success) {
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } else {
      setLocalError(ERROR_MESSAGES.CLIPBOARD_FAILED);
    }
  }, [totpConfig]);

  // 使用示例secret
  const handleUseExample = useCallback(() => {
    const exampleSecret = generateExampleSecret();
    onSecretChange(exampleSecret);
    setLocalError(null);
  }, [onSecretChange]);

  // 清空输入
  const handleClear = useCallback(() => {
    onSecretChange('');
    setTotpConfig(null);
    onTOTPChange(null);
    setLocalError(null);
  }, [onSecretChange, onTOTPChange]);

  // 设置定时器更新TOTP
  useEffect(() => {
    if (totpConfig) {
      // 清除之前的定时器
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }

      // 设置新的定时器
      intervalRef.current = setInterval(() => {
        generateTOTPConfig();
      }, 1000); // 每秒更新一次

      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
      };
    }
  }, [totpConfig, generateTOTPConfig]);

  // 初始生成TOTP配置
  useEffect(() => {
    generateTOTPConfig();
  }, [generateTOTPConfig]);

  // 组件卸载时清理定时器
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const displayError = error || localError;
  const progress = totpConfig ? getTOTPProgress(totpConfig.timeRemaining) : 0;

  return (
    <div className="space-y-4">
      {/* 模式说明 */}
      <div className="space-y-2">
        <h3 className="text-lg font-semibold text-gray-900">动态二维码 (TOTP)</h3>
        <p className="text-sm text-gray-600">
          生成基于时间的一次性密码二维码，兼容Google Authenticator等应用。
        </p>
      </div>

      {/* 输入区域 */}
      <div className="space-y-3">
        {/* 错误信息 */}
        {displayError && (
          <div className="flex items-center space-x-2 text-sm text-red-600">
            <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{displayError}</span>
          </div>
        )}

        {/* 统一输入区域 */}
        <div className="relative">
          <label htmlFor="totp-secret" className="block text-sm font-medium text-gray-700 mb-2">
            密钥输入
          </label>
          <textarea
            id="totp-secret"
            value={secret}
            onChange={handleInputChange}
            placeholder="支持多种格式：Base32、十六进制、多单词、otpauth URI..."
            className={`input-field font-mono text-sm h-20 resize-none ${
              displayError ? 'border-red-300 focus:ring-red-500' : ''
            }`}
            disabled={isLoading}
          />
          {/* 清空按钮 */}
          {secret && (
            <button
              onClick={handleClear}
              className="absolute top-8 right-2 p-1 text-gray-400 hover:text-gray-600 transition-colors"
              disabled={isLoading}
              title="清空内容"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        {/* 格式检测显示 */}
        {detectedFormat && (
          <div className="flex items-center space-x-2 text-sm">
            <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-green-700">检测到: {detectedFormat}</span>
          </div>
        )}

        {/* 示例按钮 */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            快速示例
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={handleUseExample}
              className="btn-secondary text-xs py-1"
              disabled={isLoading}
            >
              Base32 Secret
            </button>
            <button
              onClick={() => onSecretChange('48656c6c6f20576f726c64')}
              className="btn-secondary text-xs py-1"
              disabled={isLoading}
            >
              十六进制
            </button>
            <button
              onClick={() => onSecretChange('Hello World Secret')}
              className="btn-secondary text-xs py-1"
              disabled={isLoading}
            >
              多单词
            </button>
            <button
              onClick={() => {
                const exampleURI = 'otpauth://totp/Example:user@example.com?secret=JBSWY3DPEHPK3PXP&issuer=Example';
                onSecretChange(exampleURI);
              }}
              className="btn-secondary text-xs py-1"
              disabled={isLoading}
            >
              otpauth URI
            </button>
          </div>
        </div>
      </div>

      {/* TOTP显示区域 */}
      {totpConfig && (
        <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
          {/* 当前TOTP码 */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              当前验证码
            </label>
            <div className="flex items-center space-x-3">
              <div 
                className="font-mono text-2xl font-bold text-gray-900 bg-white px-4 py-2 rounded-lg border cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={handleCopyCode}
                title="点击复制"
              >
                {formatTOTPCode(totpConfig.code)}
              </div>
              <button
                onClick={handleCopyCode}
                className={`btn-secondary text-sm ${
                  copySuccess ? 'bg-green-100 text-green-700' : ''
                }`}
                disabled={isLoading}
              >
                {copySuccess ? '已复制!' : '复制'}
              </button>
            </div>
          </div>

          {/* 倒计时进度条 */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-600">剩余时间</span>
              <span className="font-medium text-gray-900">
                {totpConfig.timeRemaining}秒
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all duration-1000 ${
                  totpConfig.timeRemaining <= 5 ? 'bg-red-500' : 
                  totpConfig.timeRemaining <= 10 ? 'bg-yellow-500' : 
                  'bg-green-500'
                }`}
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* TOTP信息 */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600">周期:</span>
              <span className="ml-1 font-medium">{TOTP_CONSTANTS.PERIOD}秒</span>
            </div>
            <div>
              <span className="text-gray-600">位数:</span>
              <span className="ml-1 font-medium">{TOTP_CONSTANTS.CODE_LENGTH}位</span>
            </div>
          </div>
        </div>
      )}

      {/* 加载状态 */}
      {isLoading && (
        <div className="flex items-center justify-center py-4">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600"></div>
          <span className="ml-2 text-sm text-gray-600">生成中...</span>
        </div>
      )}

      {/* 使用说明 */}
      <div className="text-xs text-gray-500 space-y-1">
        <p>• 支持多种格式：Base32、十六进制、多单词、otpauth URI</p>
        <p>• 智能格式检测，自动转换和处理各种输入</p>
        <p>• 支持空格分隔的多单词密钥（如：Hello World Secret）</p>
        <p>• 验证码每30秒自动更新，兼容所有主流验证器应用</p>
      </div>
    </div>
  );
};