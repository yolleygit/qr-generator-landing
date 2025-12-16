import React, { useState, useCallback, useEffect } from 'react';
import { validateStaticInput, detectContentType } from '../../utils/qr-generator';
import { INPUT_LIMITS } from '../../types/constants';

interface StaticQRPanelProps {
  /** 当前输入值 */
  value: string;
  /** 输入变化回调 */
  onChange: (value: string) => void;
  /** 是否正在加载 */
  isLoading?: boolean;
  /** 错误信息 */
  error?: string | null;
}

/**
 * 静态二维码输入面板组件
 */
export const StaticQRPanel: React.FC<StaticQRPanelProps> = ({
  value,
  onChange,
  isLoading = false,
  error = null,
}) => {
  const [localError, setLocalError] = useState<string | null>(null);
  const [contentType, setContentType] = useState<string>('');
  const [charCount, setCharCount] = useState<number>(0);

  // 处理输入变化
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    onChange(newValue);
    
    // 更新字符计数
    setCharCount(newValue.length);
    
    // 实时验证
    const validation = validateStaticInput(newValue);
    setLocalError(validation.isValid ? null : (validation.errorMessage || null));
    
    // 检测内容类型
    if (newValue.trim()) {
      setContentType(detectContentType(newValue));
    } else {
      setContentType('');
    }
  }, [onChange]);

  // 清空输入
  const handleClear = useCallback(() => {
    onChange('');
    setLocalError(null);
    setContentType('');
    setCharCount(0);
  }, [onChange]);

  // 示例文本
  const handleExampleClick = useCallback((exampleText: string) => {
    onChange(exampleText);
    setCharCount(exampleText.length);
    setContentType(detectContentType(exampleText));
    setLocalError(null);
  }, [onChange]);

  // 更新字符计数（当外部value变化时）
  useEffect(() => {
    setCharCount(value.length);
    if (value.trim()) {
      setContentType(detectContentType(value));
    } else {
      setContentType('');
    }
  }, [value]);

  const displayError = error || localError;
  const isNearLimit = charCount > INPUT_LIMITS.STATIC_MAX_LENGTH * 0.8;
  const isOverLimit = charCount > INPUT_LIMITS.STATIC_MAX_LENGTH;

  return (
    <div className="space-y-4">
      {/* 模式说明 */}
      <div className="space-y-2">
        <h3 className="text-lg font-semibold text-gray-900">静态二维码</h3>
        <p className="text-sm text-gray-600">
          将文本、URL、邮箱等内容直接转换为二维码，支持多种格式识别。
        </p>
      </div>

      {/* 输入区域 */}
      <div className="space-y-3">
        <div className="relative">
          <label htmlFor="static-input" className="block text-sm font-medium text-gray-700 mb-2">
            输入内容
          </label>
          <textarea
            id="static-input"
            value={value}
            onChange={handleInputChange}
            placeholder="输入文本、URL、邮箱等内容..."
            className={`input-field resize-none h-32 ${
              displayError ? 'border-red-300 focus:ring-red-500' : ''
            } ${isOverLimit ? 'border-red-500' : ''}`}
            disabled={isLoading}
            maxLength={INPUT_LIMITS.STATIC_MAX_LENGTH + 50} // 允许稍微超出以显示错误
          />
          
          {/* 清空按钮 */}
          {value && (
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

        {/* 字符计数和内容类型 */}
        <div className="flex justify-between items-center text-sm">
          <div className="flex items-center space-x-2">
            {contentType && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                {contentType}
              </span>
            )}
          </div>
          <div className={`font-medium ${
            isOverLimit ? 'text-red-600' : 
            isNearLimit ? 'text-yellow-600' : 
            'text-gray-500'
          }`}>
            {charCount}/{INPUT_LIMITS.STATIC_MAX_LENGTH}
          </div>
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

        {/* 快速示例 */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            快速示例
          </label>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => handleExampleClick('https://www.example.com')}
              className="btn-secondary text-xs py-1 px-2"
              disabled={isLoading}
            >
              网站链接
            </button>
            <button
              onClick={() => handleExampleClick('contact@example.com')}
              className="btn-secondary text-xs py-1 px-2"
              disabled={isLoading}
            >
              邮箱地址
            </button>
            <button
              onClick={() => handleExampleClick('WIFI:T:WPA;S:MyNetwork;P:password123;H:false;;')}
              className="btn-secondary text-xs py-1 px-2"
              disabled={isLoading}
            >
              WiFi配置
            </button>
            <button
              onClick={() => handleExampleClick('Hello, World! 这是一个测试文本。')}
              className="btn-secondary text-xs py-1 px-2"
              disabled={isLoading}
            >
              普通文本
            </button>
          </div>
        </div>
      </div>

      {/* 加载状态 */}
      {isLoading && (
        <div className="flex items-center justify-center py-4">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600"></div>
          <span className="ml-2 text-sm text-gray-600">生成中...</span>
        </div>
      )}
    </div>
  );
};