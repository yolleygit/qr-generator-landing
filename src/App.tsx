
import { Header } from './components/Header';
import { MainCard } from './components/MainCard';
import { Footer } from './components/Footer';
import { useQRGenerator } from './hooks/useQRGenerator';

/**
 * 二维码生成器主应用组件
 */
function App() {
  const {
    // 状态
    currentMode,
    staticInput,
    totpSecret,
    totpConfig,
    encryptInput,
    encryptPassword,
    encryptedPayload,
    qrResult,
    isLoading,
    error,
    
    // 方法
    handleModeChange,
    handleStaticInputChange,
    handleTotpSecretChange,
    handleTotpConfigChange,
    handleEncryptInputChange,
    handleEncryptPasswordChange,
    handleEncryptedPayloadChange,
  } = useQRGenerator();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 页面头部 */}
      <Header />

      {/* 主要内容区域 */}
      <main className="px-4 sm:px-6 lg:px-8 pb-16">
        <MainCard
          currentMode={currentMode}
          onModeChange={handleModeChange}
          staticInput={staticInput}
          onStaticInputChange={handleStaticInputChange}
          totpSecret={totpSecret}
          totpConfig={totpConfig}
          onTotpSecretChange={handleTotpSecretChange}
          onTotpConfigChange={handleTotpConfigChange}
          encryptInput={encryptInput}
          encryptPassword={encryptPassword}
          encryptedPayload={encryptedPayload}
          onEncryptInputChange={handleEncryptInputChange}
          onEncryptPasswordChange={handleEncryptPasswordChange}
          onEncryptedPayloadChange={handleEncryptedPayloadChange}
          qrResult={qrResult}
          isLoading={isLoading}
          error={error}
        />
      </main>

      {/* 页面底部 */}
      <Footer />
    </div>
  );
}

export default App;
