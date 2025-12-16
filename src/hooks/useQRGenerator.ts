import { useState, useCallback, useEffect } from 'react';
import { QRMode, type AppState, type TOTPConfig } from '../types';
import { generateStaticQR } from '../utils/qr-generator';
import { UI_CONSTANTS } from '../types/constants';

/**
 * 二维码生成器主要状态管理Hook
 */
export function useQRGenerator() {
  // 主要状态
  const [state, setState] = useState<AppState>({
    currentMode: QRMode.STATIC,
    staticInput: '',
    totpSecret: '',
    totpConfig: null,
    encryptInput: '',
    encryptPassword: '',
    encryptedPayload: '',
    qrResult: null,
    isLoading: false,
    error: null,
  });

  // 防抖定时器
  const [debounceTimer, setDebounceTimer] = useState<NodeJS.Timeout | null>(null);

  // 更新状态的通用方法
  const updateState = useCallback((updates: Partial<AppState>) => {
    setState(prev => ({ ...prev, ...updates }));
  }, []);

  // 清除错误
  const clearError = useCallback(() => {
    updateState({ error: null });
  }, [updateState]);

  // 设置错误
  const setError = useCallback((error: string) => {
    updateState({ error, isLoading: false });
  }, [updateState]);

  // 生成二维码的核心方法
  const generateQR = useCallback(async (content: string) => {
    if (!content.trim()) {
      updateState({ qrResult: null });
      return;
    }

    updateState({ isLoading: true, error: null });

    try {
      const result = await generateStaticQR(content);
      updateState({ 
        qrResult: result, 
        isLoading: false,
        error: result.success ? null : result.error || '生成失败'
      });
    } catch (error) {
      console.error('二维码生成失败:', error);
      setError('二维码生成失败，请重试');
    }
  }, [updateState, setError]);

  // 防抖生成二维码
  const debouncedGenerateQR = useCallback((content: string) => {
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }

    const timer = setTimeout(() => {
      generateQR(content);
    }, UI_CONSTANTS.DEBOUNCE_DELAY);

    setDebounceTimer(timer);
  }, [debounceTimer, generateQR]);

  // 模式切换
  const handleModeChange = useCallback((mode: QRMode) => {
    updateState({ 
      currentMode: mode, 
      error: null,
      qrResult: null 
    });
  }, [updateState]);

  // 静态模式输入处理
  const handleStaticInputChange = useCallback((value: string) => {
    updateState({ staticInput: value });
    debouncedGenerateQR(value);
  }, [updateState, debouncedGenerateQR]);

  // TOTP模式处理
  const handleTotpSecretChange = useCallback((secret: string) => {
    updateState({ totpSecret: secret });
  }, [updateState]);

  const handleTotpConfigChange = useCallback((config: TOTPConfig | null) => {
    updateState({ totpConfig: config });
    
    // 如果有TOTP配置，生成对应的二维码
    if (config && config.otpauthURL) {
      debouncedGenerateQR(config.otpauthURL);
    } else {
      updateState({ qrResult: null });
    }
  }, [updateState, debouncedGenerateQR]);

  // 加密模式处理
  const handleEncryptInputChange = useCallback((value: string) => {
    updateState({ encryptInput: value });
  }, [updateState]);

  const handleEncryptPasswordChange = useCallback((value: string) => {
    updateState({ encryptPassword: value });
  }, [updateState]);

  const handleEncryptedPayloadChange = useCallback((value: string) => {
    updateState({ encryptedPayload: value });
    
    // 如果有加密payload，生成对应的二维码
    if (value.trim()) {
      debouncedGenerateQR(value);
    } else {
      updateState({ qrResult: null });
    }
  }, [updateState, debouncedGenerateQR]);

  // 清理定时器
  useEffect(() => {
    return () => {
      if (debounceTimer) {
        clearTimeout(debounceTimer);
      }
    };
  }, [debounceTimer]);

  // 根据当前模式自动生成二维码
  useEffect(() => {
    let content = '';
    
    switch (state.currentMode) {
      case QRMode.STATIC:
        content = state.staticInput;
        break;
      case QRMode.DYNAMIC:
        content = state.totpConfig?.otpauthURL || '';
        break;
      case QRMode.ENCRYPTED:
        content = state.encryptedPayload;
        break;
    }

    if (content.trim()) {
      debouncedGenerateQR(content);
    } else {
      updateState({ qrResult: null });
    }
  }, [state.currentMode, state.totpConfig?.otpauthURL, state.staticInput, state.encryptedPayload, debouncedGenerateQR, updateState]); // 监听所有相关状态变化

  return {
    // 状态
    ...state,
    
    // 方法
    handleModeChange,
    handleStaticInputChange,
    handleTotpSecretChange,
    handleTotpConfigChange,
    handleEncryptInputChange,
    handleEncryptPasswordChange,
    handleEncryptedPayloadChange,
    clearError,
    setError,
  };
}