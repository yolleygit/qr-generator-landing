import React from 'react';
import { QRMode, type QRResult, type TOTPConfig } from '../types';
import { TabInterface } from './TabInterface';
import { StaticQRPanel } from './panels/StaticQRPanel';
import { DynamicQRPanel } from './panels/DynamicQRPanel';
import { EncryptedQRPanel } from './panels/EncryptedQRPanel';
import { QRPreview } from './QRPreview';

interface MainCardProps {
  /** 当前选中的模式 */
  currentMode: QRMode;
  /** 模式切换回调 */
  onModeChange: (mode: QRMode) => void;
  
  /** 静态模式相关 */
  staticInput: string;
  onStaticInputChange: (value: string) => void;
  
  /** TOTP模式相关 */
  totpSecret: string;
  totpConfig: TOTPConfig | null;
  onTotpSecretChange: (secret: string) => void;
  onTotpConfigChange: (config: TOTPConfig | null) => void;
  
  /** 加密模式相关 */
  encryptInput: string;
  encryptPassword: string;
  encryptedPayload: string;
  onEncryptInputChange: (value: string) => void;
  onEncryptPasswordChange: (value: string) => void;
  onEncryptedPayloadChange: (value: string) => void;
  
  /** 二维码结果 */
  qrResult: QRResult | null;
  
  /** 状态 */
  isLoading: boolean;
  error: string | null;
}

/**
 * 主卡片容器组件
 */
export const MainCard: React.FC<MainCardProps> = ({
  currentMode,
  onModeChange,
  staticInput,
  onStaticInputChange,
  totpSecret,

  onTotpSecretChange,
  onTotpConfigChange,
  encryptInput,
  encryptPassword,
  encryptedPayload,
  onEncryptInputChange,
  onEncryptPasswordChange,
  onEncryptedPayloadChange,
  qrResult,
  isLoading,
  error,
}) => {
  // 根据当前模式生成文件名前缀
  const getFilenamePrefix = (): string => {
    const timestamp = new Date().toISOString().slice(0, 10);
    switch (currentMode) {
      case QRMode.STATIC:
        return `qr-static-${timestamp}`;
      case QRMode.DYNAMIC:
        return `qr-totp-${timestamp}`;
      case QRMode.ENCRYPTED:
        return `qr-encrypted-${timestamp}`;
      default:
        return `qr-code-${timestamp}`;
    }
  };

  // 渲染当前模式的输入面板
  const renderCurrentPanel = () => {
    switch (currentMode) {
      case QRMode.STATIC:
        return (
          <StaticQRPanel
            value={staticInput}
            onChange={onStaticInputChange}
            isLoading={isLoading}
            error={error}
          />
        );
      
      case QRMode.DYNAMIC:
        return (
          <DynamicQRPanel
            secret={totpSecret}
            onSecretChange={onTotpSecretChange}
            onTOTPChange={onTotpConfigChange}
            isLoading={isLoading}
            error={error}
          />
        );
      
      case QRMode.ENCRYPTED:
        return (
          <EncryptedQRPanel
            plaintext={encryptInput}
            password={encryptPassword}
            encryptedPayload={encryptedPayload}
            onPlaintextChange={onEncryptInputChange}
            onPasswordChange={onEncryptPasswordChange}
            onEncryptedPayloadChange={onEncryptedPayloadChange}
            isLoading={isLoading}
            error={error}
          />
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto">
      <div className="card p-6 sm:p-8">
        {/* 标签页界面 */}
        <div className="mb-8">
          <TabInterface
            currentMode={currentMode}
            onModeChange={onModeChange}
            disabled={isLoading}
          />
        </div>

        {/* 主内容区域 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 min-h-[500px]">
          {/* 左侧：输入面板 */}
          <div className="space-y-6">
            <div className="h-full">
              {renderCurrentPanel()}
            </div>
          </div>

          {/* 右侧：二维码预览 */}
          <div className="space-y-6">
            <div className="lg:sticky lg:top-6">
              <QRPreview
                qrResult={qrResult}
                isLoading={isLoading}
                error={error}
                filenamePrefix={getFilenamePrefix()}
              />
            </div>
          </div>
        </div>

        {/* 全局错误提示 */}
        {error && (
          <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center space-x-3">
              <svg className="w-5 h-5 text-red-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <h4 className="text-sm font-medium text-red-800">操作失败</h4>
                <p className="text-sm text-red-700 mt-1">{error}</p>
              </div>
            </div>
          </div>
        )}


      </div>
    </div>
  );
};