import React from 'react';
import { QRMode } from '../types';
import { TAB_CONFIGS } from '../types/constants';

interface TabInterfaceProps {
  /** 当前选中的模式 */
  currentMode: QRMode;
  /** 模式切换回调 */
  onModeChange: (mode: QRMode) => void;
  /** 是否禁用（加载状态） */
  disabled?: boolean;
}

/**
 * 标签页界面组件
 */
export const TabInterface: React.FC<TabInterfaceProps> = ({
  currentMode,
  onModeChange,
  disabled = false,
}) => {
  return (
    <div className="w-full">
      {/* 标签页导航 */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
        {TAB_CONFIGS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onModeChange(tab.id)}
            disabled={disabled}
            className={`
              flex-1 px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2
              ${currentMode === tab.id
                ? 'bg-white text-primary-700 shadow-sm border border-gray-200'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }
              ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
            `}
          >
            <div className="flex flex-col items-center space-y-1">
              {/* 标签图标 */}
              <div className="flex items-center justify-center">
                {tab.id === QRMode.STATIC && (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                )}
                {tab.id === QRMode.DYNAMIC && (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                )}
                {tab.id === QRMode.ENCRYPTED && (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                )}
              </div>
              
              {/* 标签标题 */}
              <span className="hidden sm:inline">{tab.title}</span>
              
              {/* 移动端简化标题 */}
              <span className="sm:hidden text-xs">
                {tab.id === QRMode.STATIC && '静态'}
                {tab.id === QRMode.DYNAMIC && 'TOTP'}
                {tab.id === QRMode.ENCRYPTED && '加密'}
              </span>
            </div>
          </button>
        ))}
      </div>

      {/* 当前标签页描述 */}
      <div className="mt-4 px-1">
        {TAB_CONFIGS.map((tab) => (
          currentMode === tab.id && (
            <div
              key={tab.id}
              className="animate-fade-in"
            >
              <p className="text-sm text-gray-600 text-center sm:text-left">
                {tab.description}
              </p>
            </div>
          )
        ))}
      </div>

      {/* 模式指示器（移动端） */}
      <div className="sm:hidden mt-3 flex justify-center">
        <div className="flex space-x-2">
          {TAB_CONFIGS.map((tab) => (
            <div
              key={tab.id}
              className={`w-2 h-2 rounded-full transition-colors duration-200 ${
                currentMode === tab.id ? 'bg-primary-600' : 'bg-gray-300'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};