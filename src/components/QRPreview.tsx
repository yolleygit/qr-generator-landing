import React, { useState, useCallback } from 'react';
import type { QRResult } from '../types';
import { downloadQRCode } from '../utils/qr-generator';

interface QRPreviewProps {
  /** 二维码生成结果 */
  qrResult: QRResult | null;
  /** 是否正在加载 */
  isLoading?: boolean;
  /** 错误信息 */
  error?: string | null;
  /** 文件名前缀（用于下载） */
  filenamePrefix?: string;
}

/**
 * 二维码预览和下载组件
 */
export const QRPreview: React.FC<QRPreviewProps> = ({
  qrResult,
  isLoading = false,
  error = null,
  filenamePrefix = 'qrcode',
}) => {
  const [downloadSuccess, setDownloadSuccess] = useState<string | null>(null);
  const [downloadError, setDownloadError] = useState<string | null>(null);

  // 下载PNG格式
  const handleDownloadPNG = useCallback(() => {
    if (!qrResult?.dataURL) return;

    try {
      downloadQRCode(qrResult.dataURL, filenamePrefix, 'png');
      setDownloadSuccess('PNG');
      setDownloadError(null);
      setTimeout(() => setDownloadSuccess(null), 2000);
    } catch (err) {
      setDownloadError('PNG下载失败');
      setTimeout(() => setDownloadError(null), 3000);
    }
  }, [qrResult, filenamePrefix]);

  // 下载SVG格式
  const handleDownloadSVG = useCallback(() => {
    if (!qrResult?.svgString) return;

    try {
      downloadQRCode(qrResult.svgString, filenamePrefix, 'svg');
      setDownloadSuccess('SVG');
      setDownloadError(null);
      setTimeout(() => setDownloadSuccess(null), 2000);
    } catch (err) {
      setDownloadError('SVG下载失败');
      setTimeout(() => setDownloadError(null), 3000);
    }
  }, [qrResult, filenamePrefix]);

  // 渲染占位符
  const renderPlaceholder = () => (
    <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 border-2 border-dashed border-gray-300 rounded-lg">
      <svg className="w-16 h-16 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          strokeWidth={1.5} 
          d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 16h4.01M12 8h4.01M16 12h4.01M12 16h.01m0 0h4.01M16 20h4.01M12 20h.01m0 0h4.01M16 8h4.01M12 4h.01M16 4h4.01" 
        />
      </svg>
      <p className="text-sm font-medium">二维码预览</p>
      <p className="text-xs mt-1">输入内容后自动生成</p>
    </div>
  );

  // 渲染加载状态
  const renderLoading = () => (
    <div className="w-full h-full flex flex-col items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mb-4"></div>
      <p className="text-sm text-gray-600">生成中...</p>
    </div>
  );

  // 渲染错误状态
  const renderError = () => (
    <div className="w-full h-full flex flex-col items-center justify-center text-red-500">
      <svg className="w-16 h-16 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          strokeWidth={1.5} 
          d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
        />
      </svg>
      <p className="text-sm font-medium">生成失败</p>
      <p className="text-xs mt-1 text-center px-4">{error}</p>
    </div>
  );

  return (
    <div className="space-y-4">
      {/* 二维码显示区域 */}
      <div className="relative">
        <div className="w-full aspect-square max-w-sm mx-auto bg-white rounded-lg border-2 border-gray-200 p-4">
          {isLoading ? (
            renderLoading()
          ) : error ? (
            renderError()
          ) : qrResult?.success && qrResult.dataURL ? (
            <div className="w-full h-full flex items-center justify-center">
              <img
                src={qrResult.dataURL}
                alt="Generated QR Code"
                className="max-w-full max-h-full object-contain"
                style={{ imageRendering: 'pixelated' }}
              />
            </div>
          ) : (
            renderPlaceholder()
          )}
        </div>

        {/* 二维码信息标签 */}
        {qrResult?.success && (
          <div className="absolute top-2 right-2 bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded-full">
            已生成
          </div>
        )}
      </div>

      {/* 下载按钮区域 */}
      <div className="space-y-3">
        <h4 className="text-sm font-medium text-gray-700">下载选项</h4>
        
        <div className="grid grid-cols-2 gap-3">
          {/* PNG下载按钮 */}
          <button
            onClick={handleDownloadPNG}
            disabled={!qrResult?.success || !qrResult.dataURL || isLoading}
            className={`btn-primary text-sm py-2 px-3 ${
              !qrResult?.success || !qrResult.dataURL || isLoading
                ? 'opacity-50 cursor-not-allowed'
                : ''
            } ${
              downloadSuccess === 'PNG' ? 'bg-green-600 hover:bg-green-700' : ''
            }`}
          >
            <div className="flex items-center justify-center space-x-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span>{downloadSuccess === 'PNG' ? '已下载!' : 'PNG'}</span>
            </div>
          </button>

          {/* SVG下载按钮 */}
          <button
            onClick={handleDownloadSVG}
            disabled={!qrResult?.success || !qrResult.svgString || isLoading}
            className={`btn-secondary text-sm py-2 px-3 ${
              !qrResult?.success || !qrResult.svgString || isLoading
                ? 'opacity-50 cursor-not-allowed'
                : ''
            } ${
              downloadSuccess === 'SVG' ? 'bg-green-100 text-green-700' : ''
            }`}
          >
            <div className="flex items-center justify-center space-x-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span>{downloadSuccess === 'SVG' ? '已下载!' : 'SVG'}</span>
            </div>
          </button>
        </div>

        {/* 下载错误提示 */}
        {downloadError && (
          <div className="flex items-center space-x-2 text-sm text-red-600">
            <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{downloadError}</span>
          </div>
        )}

        {/* 格式说明 */}
        <div className="text-xs text-gray-500 space-y-1">
          <p>• PNG: 适合打印和一般使用，文件较小</p>
          <p>• SVG: 矢量格式，可无限缩放不失真</p>
        </div>
      </div>

      {/* 二维码统计信息 */}
      {qrResult?.success && (
        <div className="pt-3 border-t border-gray-200">
          <div className="text-xs text-gray-500 space-y-1">
            <div className="flex justify-between">
              <span>格式:</span>
              <span>PNG + SVG</span>
            </div>
            <div className="flex justify-between">
              <span>尺寸:</span>
              <span>300×300px</span>
            </div>
            <div className="flex justify-between">
              <span>纠错级别:</span>
              <span>M (中等)</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};