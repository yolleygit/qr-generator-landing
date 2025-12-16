import React, { useState } from 'react';

/**
 * 页面底部组件
 */
export const Footer: React.FC = () => {
  const [expandedFAQ, setExpandedFAQ] = useState<number | null>(null);

  const faqs = [
    {
      question: '生成的二维码是否安全？',
      answer: '所有二维码生成都在您的浏览器本地完成，不会上传到服务器。加密模式使用AES-GCM算法确保数据安全。'
    },
    {
      question: 'TOTP二维码如何使用？',
      answer: '输入Base32格式的secret，生成的二维码可以被Google Authenticator、Authy等应用扫描添加。'
    },
    {
      question: '支持哪些二维码格式？',
      answer: '支持PNG和SVG两种格式下载。PNG适合一般使用，SVG是矢量格式可无限缩放。'
    },
    {
      question: '加密二维码如何解密？',
      answer: '扫码获得加密数据后，使用相同密码通过本页面的解密功能或其他支持AES-GCM的工具解密。'
    },
    {
      question: '有字符长度限制吗？',
      answer: '静态二维码限制500字符，加密内容无特殊限制，但内容越长二维码越复杂。'
    }
  ];

  const toggleFAQ = (index: number) => {
    setExpandedFAQ(expandedFAQ === index ? null : index);
  };

  return (
    <footer className="bg-gray-50 border-t border-gray-200 mt-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* FAQ部分 */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">
            常见问题
          </h2>
          <div className="max-w-3xl mx-auto space-y-4">
            {faqs.map((faq, index) => (
              <div key={index} className="bg-white rounded-lg border border-gray-200">
                <button
                  onClick={() => toggleFAQ(index)}
                  className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
                >
                  <span className="font-medium text-gray-900">{faq.question}</span>
                  <svg
                    className={`w-5 h-5 text-gray-500 transition-transform ${
                      expandedFAQ === index ? 'rotate-180' : ''
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {expandedFAQ === index && (
                  <div className="px-6 pb-4">
                    <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* 使用说明 */}
        <div className="mb-12">
          <h3 className="text-lg font-semibold text-gray-900 text-center mb-6">
            使用说明
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {/* 静态二维码说明 */}
            <div className="text-center space-y-3">
              <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h4 className="font-medium text-gray-900">静态二维码</h4>
              <p className="text-sm text-gray-600">
                支持文本、URL、邮箱、WiFi配置等多种格式，自动识别内容类型，实时生成预览。
              </p>
            </div>

            {/* TOTP说明 */}
            <div className="text-center space-y-3">
              <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h4 className="font-medium text-gray-900">动态TOTP</h4>
              <p className="text-sm text-gray-600">
                输入Base32格式secret，生成标准otpauth://格式二维码，兼容各种验证器应用。
              </p>
            </div>

            {/* 加密说明 */}
            <div className="text-center space-y-3">
              <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mx-auto">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h4 className="font-medium text-gray-900">加密二维码</h4>
              <p className="text-sm text-gray-600">
                使用AES-GCM算法加密内容，支持密码强度检测和解密验证功能。
              </p>
            </div>
          </div>
        </div>

        {/* 技术特性 */}
        <div className="mb-12">
          <h3 className="text-lg font-semibold text-gray-900 text-center mb-6">
            技术特性
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto text-center">
            <div className="space-y-2">
              <div className="text-2xl">🔒</div>
              <p className="text-sm text-gray-600">本地处理<br/>数据不上传</p>
            </div>
            <div className="space-y-2">
              <div className="text-2xl">⚡</div>
              <p className="text-sm text-gray-600">实时生成<br/>即时预览</p>
            </div>
            <div className="space-y-2">
              <div className="text-2xl">📱</div>
              <p className="text-sm text-gray-600">响应式设计<br/>移动友好</p>
            </div>
            <div className="space-y-2">
              <div className="text-2xl">🎨</div>
              <p className="text-sm text-gray-600">多种格式<br/>PNG + SVG</p>
            </div>
          </div>
        </div>

        {/* 底部信息 */}
        <div className="border-t border-gray-200 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-center md:text-left">
              <p className="text-sm text-gray-600">
                © 2024 二维码生成器. 基于现代Web技术构建.
              </p>
              <p className="text-xs text-gray-500 mt-1">
                React + TypeScript + TailwindCSS + WebCrypto API
              </p>
            </div>
            
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>安全可靠</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <svg className="w-4 h-4 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>开源免费</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};