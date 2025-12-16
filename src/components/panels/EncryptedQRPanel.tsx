import React, { useState, useCallback, useEffect } from 'react';
import { 
  encryptPayload, 
  decryptPayload, 
  validateEncryptionInput,
  assessPasswordStrength,
  getEncryptedDataSummary
} from '../../utils/crypto';
import { readQRFromImage, isSupportedImageFile, isTextFile } from '../../utils/qr-reader';
import { copyToClipboard } from '../../utils/qr-generator';
import type { EncryptionResult, DecryptionResult } from '../../types';
import { ERROR_MESSAGES } from '../../types/constants';

interface EncryptedQRPanelProps {
  /** 明文输入值 */
  plaintext: string;
  /** 密码输入值 */
  password: string;
  /** 加密后的payload */
  encryptedPayload: string;
  /** 明文变化回调 */
  onPlaintextChange: (value: string) => void;
  /** 密码变化回调 */
  onPasswordChange: (value: string) => void;
  /** 加密payload变化回调 */
  onEncryptedPayloadChange: (value: string) => void;
  /** 是否正在加载 */
  isLoading?: boolean;
  /** 错误信息 */
  error?: string | null;
}

/**
 * 加密二维码输入面板组件
 */
export const EncryptedQRPanel: React.FC<EncryptedQRPanelProps> = ({
  plaintext,
  password,
  encryptedPayload,
  onPlaintextChange,
  onPasswordChange,
  onEncryptedPayloadChange,
  isLoading = false,
  error = null,
}) => {
  const [localError, setLocalError] = useState<string | null>(null);
  const [, setEncryptionResult] = useState<EncryptionResult | null>(null);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [copySuccess, setCopySuccess] = useState<string | null>(null);
  const [isEncrypting, setIsEncrypting] = useState<boolean>(false);
  
  // 解密验证相关状态
  const [decryptInput, setDecryptInput] = useState<string>('');
  const [decryptPassword, setDecryptPassword] = useState<string>('');
  const [decryptResult, setDecryptResult] = useState<DecryptionResult | null>(null);
  const [showDecryptSection, setShowDecryptSection] = useState<boolean>(false);
  const [isProcessingFile, setIsProcessingFile] = useState<boolean>(false);

  // 处理加密
  const handleEncrypt = useCallback(async () => {
    if (!plaintext.trim() || !password) return;

    setIsEncrypting(true);
    setLocalError(null);

    try {
      const result = await encryptPayload(plaintext, password);
      setEncryptionResult(result);
      
      if (result.success) {
        onEncryptedPayloadChange(result.encryptedData);
      } else {
        setLocalError(result.error || ERROR_MESSAGES.ENCRYPTION_FAILED);
      }
    } catch (err) {
      setLocalError(ERROR_MESSAGES.ENCRYPTION_FAILED);
    } finally {
      setIsEncrypting(false);
    }
  }, [plaintext, password, onEncryptedPayloadChange]);

  // 处理解密验证
  const handleDecrypt = useCallback(async () => {
    if (!decryptInput.trim() || !decryptPassword) return;

    try {
      const result = await decryptPayload(decryptInput, decryptPassword);
      setDecryptResult(result);
    } catch (err) {
      setDecryptResult({
        plaintext: '',
        success: false,
        error: ERROR_MESSAGES.DECRYPTION_FAILED,
      });
    }
  }, [decryptInput, decryptPassword]);

  // 复制加密串
  const handleCopyEncrypted = useCallback(async () => {
    if (!encryptedPayload) return;
    
    const success = await copyToClipboard(encryptedPayload);
    if (success) {
      setCopySuccess('encrypted');
      setTimeout(() => setCopySuccess(null), 2000);
    } else {
      setLocalError(ERROR_MESSAGES.CLIPBOARD_FAILED);
    }
  }, [encryptedPayload]);

  // 复制解密结果
  const handleCopyDecrypted = useCallback(async () => {
    if (!decryptResult?.plaintext) return;
    
    const success = await copyToClipboard(decryptResult.plaintext);
    if (success) {
      setCopySuccess('decrypted');
      setTimeout(() => setCopySuccess(null), 2000);
    } else {
      setLocalError(ERROR_MESSAGES.CLIPBOARD_FAILED);
    }
  }, [decryptResult]);

  // 清空所有输入
  const handleClearAll = useCallback(() => {
    onPlaintextChange('');
    onPasswordChange('');
    onEncryptedPayloadChange('');
    setEncryptionResult(null);
    setLocalError(null);
    setDecryptInput('');
    setDecryptPassword('');
    setDecryptResult(null);
  }, [onPlaintextChange, onPasswordChange, onEncryptedPayloadChange]);

  // 自动加密（当输入变化时）
  useEffect(() => {
    if (plaintext.trim() && password) {
      const validation = validateEncryptionInput(plaintext, password);
      if (validation.isValid) {
        const timeoutId = setTimeout(() => {
          handleEncrypt();
        }, 500); // 防抖
        
        return () => clearTimeout(timeoutId);
      }
    }
  }, [plaintext, password, handleEncrypt]);

  const displayError = error || localError;
  const passwordStrength = password ? assessPasswordStrength(password) : null;

  return (
    <div className="space-y-6">
      {/* 模式说明 */}
      <div className="space-y-2">
        <h3 className="text-lg font-semibold text-gray-900">加密二维码</h3>
        <p className="text-sm text-gray-600">
          使用AES-GCM加密算法保护您的敏感信息，只有知道密码的人才能解密。
        </p>
      </div>

      {/* 加密输入区域 */}
      <div className="space-y-4">
        {/* 明文输入 */}
        <div>
          <label htmlFor="encrypt-plaintext" className="block text-sm font-medium text-gray-700 mb-2">
            要加密的内容
          </label>
          <textarea
            id="encrypt-plaintext"
            value={plaintext}
            onChange={(e) => onPlaintextChange(e.target.value)}
            placeholder="输入要加密的敏感信息..."
            className={`input-field resize-none h-24 ${
              displayError ? 'border-red-300 focus:ring-red-500' : ''
            }`}
            disabled={isLoading || isEncrypting}
          />
        </div>

        {/* 密码输入 */}
        <div>
          <label htmlFor="encrypt-password" className="block text-sm font-medium text-gray-700 mb-2">
            加密密码
          </label>
          <div className="relative">
            <input
              id="encrypt-password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => onPasswordChange(e.target.value)}
              placeholder="输入强密码..."
              className={`input-field pr-10 ${
                displayError ? 'border-red-300 focus:ring-red-500' : ''
              }`}
              disabled={isLoading || isEncrypting}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
            >
              {showPassword ? (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              )}
            </button>
          </div>
          
          {/* 密码强度指示 */}
          {passwordStrength && (
            <div className="mt-2 flex items-center space-x-2">
              <div className="flex-1 bg-gray-200 rounded-full h-1">
                <div
                  className={`h-1 rounded-full transition-all duration-300 ${
                    passwordStrength.score <= 1 ? 'bg-red-500' :
                    passwordStrength.score === 2 ? 'bg-orange-500' :
                    passwordStrength.score === 3 ? 'bg-yellow-500' :
                    passwordStrength.score === 4 ? 'bg-blue-500' :
                    'bg-green-500'
                  }`}
                  style={{ width: `${(passwordStrength.score / 5) * 100}%` }}
                />
              </div>
              <span className={`text-xs ${passwordStrength.color}`}>
                {passwordStrength.feedback}
              </span>
            </div>
          )}
        </div>

        {/* 错误信息 */}
        {displayError && (
          <div className="flex items-center space-x-2 text-sm text-red-600">
            <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{displayError}</span>
          </div>
        )}

        {/* 操作按钮 */}
        <div className="flex space-x-3">
          <button
            onClick={handleEncrypt}
            className="btn-primary min-w-[100px] flex items-center justify-center"
            disabled={!plaintext.trim() || !password || isLoading || isEncrypting}
          >
            {isEncrypting ? (
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>加密中</span>
              </div>
            ) : (
              '立即加密'
            )}
          </button>
          <button
            onClick={handleClearAll}
            className="btn-secondary"
            disabled={isLoading || isEncrypting}
          >
            清空所有
          </button>
        </div>
      </div>

      {/* 加密结果显示区域 - 固定高度避免跳动 */}
      <div className="min-h-[200px]">
        {encryptedPayload ? (
          <div className="space-y-3 p-4 bg-green-50 rounded-lg border border-green-200 animate-fade-in">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium text-green-800">加密成功</h4>
              <button
                onClick={handleCopyEncrypted}
                className={`btn-secondary text-xs transition-colors ${
                  copySuccess === 'encrypted' ? 'bg-green-100 text-green-700' : ''
                }`}
              >
                {copySuccess === 'encrypted' ? '已复制!' : '复制加密串'}
              </button>
            </div>
            
            {/* 加密串显示 - 独立区域避免跳动 */}
            <div className="bg-white p-3 rounded border font-mono text-xs break-all transition-all duration-300">
              {getEncryptedDataSummary(encryptedPayload, 100)}
            </div>
            
            {/* 安全提示 - 固定显示 */}
            <div className="bg-blue-50 border border-blue-200 rounded p-3">
              <div className="flex items-start space-x-2">
                <svg className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div className="text-xs text-blue-800">
                  <p className="font-medium mb-1">🔒 安全说明</p>
                  <p>• 每次加密都会生成不同的二维码（包含随机盐值）</p>
                  <p>• 相同内容的多次加密结果不同，这是正常的安全特性</p>
                  <p>• 扫码端使用相同密码都能正确解密</p>
                </div>
              </div>
            </div>
            
            <p className="text-xs text-green-700">
              加密数据已生成，扫码端需要相同密码才能解密。
            </p>
          </div>
        ) : (
          <div className="flex items-center justify-center h-32 text-gray-400">
            <div className="text-center">
              <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <p className="text-sm">输入内容和密码后自动加密</p>
            </div>
          </div>
        )}
      </div>

      {/* 解密验证区域 */}
      <div className="border-t pt-4">
        <button
          onClick={() => setShowDecryptSection(!showDecryptSection)}
          className="flex items-center space-x-2 text-sm font-medium text-gray-700 hover:text-gray-900"
        >
          <svg 
            className={`w-4 h-4 transition-transform ${showDecryptSection ? 'rotate-90' : ''}`} 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          <span>解密验证</span>
        </button>

        {showDecryptSection && (
          <div className="mt-4 space-y-4 p-4 bg-gray-50 rounded-lg">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                加密数据
              </label>
              
              {/* 输入方式选择 */}
              <div className="flex space-x-2 mb-3">
                <button
                  onClick={() => document.getElementById('decrypt-file-input')?.click()}
                  className="btn-secondary text-sm flex items-center space-x-2 min-w-[100px] justify-center"
                  disabled={isProcessingFile}
                >
                  {isProcessingFile ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600"></div>
                      <span>处理中</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                      <span>上传文件</span>
                    </>
                  )}
                </button>
                <button
                  onClick={() => setDecryptInput('')}
                  className="btn-secondary text-sm"
                  disabled={!decryptInput || isProcessingFile}
                >
                  清空
                </button>
              </div>

              {/* 隐藏的文件输入 */}
              <input
                id="decrypt-file-input"
                type="file"
                accept=".txt,.json,.qr,.png,.jpg,.jpeg,.gif,.bmp,.webp"
                className="hidden"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  
                  setIsProcessingFile(true);
                  
                  try {
                    if (isSupportedImageFile(file)) {
                      // 处理图片文件，尝试读取二维码
                      const qrContent = await readQRFromImage(file);
                      if (qrContent) {
                        setDecryptInput(qrContent);
                      } else {
                        setLocalError('无法从图片中识别二维码，请确保图片清晰且包含有效的二维码');
                      }
                    } else if (isTextFile(file)) {
                      // 处理文本文件
                      const reader = new FileReader();
                      reader.onload = (event) => {
                        const content = event.target?.result as string;
                        setDecryptInput(content.trim());
                      };
                      reader.readAsText(file);
                    } else {
                      setLocalError('不支持的文件格式，请选择图片文件或文本文件');
                    }
                  } catch (error) {
                    setLocalError('文件处理失败，请重试');
                  } finally {
                    setIsProcessingFile(false);
                    // 清空文件输入
                    e.target.value = '';
                  }
                }}
              />
              
              <textarea
                value={decryptInput}
                onChange={(e) => setDecryptInput(e.target.value)}
                placeholder="粘贴要解密的加密数据，或点击上传文件..."
                className="input-field resize-none h-20 font-mono text-xs"
              />
              
              {/* 文件格式提示 */}
              <p className="text-xs text-gray-500 mt-1">
                支持图片文件（PNG、JPG、GIF等）自动识别二维码，或文本文件（.txt、.json、.qr）
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                解密密码
              </label>
              <input
                type="password"
                value={decryptPassword}
                onChange={(e) => setDecryptPassword(e.target.value)}
                placeholder="输入解密密码..."
                className="input-field"
              />
            </div>

            <button
              onClick={handleDecrypt}
              className="btn-primary min-w-[100px]"
              disabled={!decryptInput.trim() || !decryptPassword}
            >
              解密验证
            </button>

            {/* 解密结果 - 固定高度避免跳动 */}
            <div className="min-h-[120px]">
              {decryptResult && (
                <div className={`p-3 rounded-lg transition-all duration-300 ${
                  decryptResult.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
                }`}>
                  {decryptResult.success ? (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-green-800">解密成功</span>
                        <button
                          onClick={handleCopyDecrypted}
                          className={`btn-secondary text-xs transition-colors ${
                            copySuccess === 'decrypted' ? 'bg-green-100 text-green-700' : ''
                          }`}
                        >
                          {copySuccess === 'decrypted' ? '已复制!' : '复制结果'}
                        </button>
                      </div>
                      <div className="bg-white p-3 rounded border text-sm break-words">
                        {decryptResult.plaintext}
                      </div>
                    </div>
                  ) : (
                    <div className="text-sm text-red-700">
                      解密失败: {decryptResult.error}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* 加载状态 */}
      {(isLoading || isEncrypting) && (
        <div className="flex items-center justify-center py-4">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600"></div>
          <span className="ml-2 text-sm text-gray-600">
            {isEncrypting ? '加密中...' : '生成中...'}
          </span>
        </div>
      )}

      {/* 安全提示 */}
      <div className="text-xs text-gray-500 space-y-1">
        <p>• 使用AES-GCM算法和PBKDF2密钥派生确保安全性</p>
        <p>• 密码强度直接影响加密安全性，建议使用复杂密码</p>
        <p>• 加密数据包含随机盐值，相同内容每次加密结果都不同</p>
      </div>
    </div>
  );
};