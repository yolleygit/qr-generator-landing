import jsQR from 'jsqr';

/**
 * 从图片文件中读取二维码内容
 * @param file 图片文件
 * @returns 二维码内容，如果读取失败返回null
 */
export async function readQRFromImage(file: File): Promise<string | null> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    
    reader.onload = (event) => {
      const img = new Image();
      
      img.onload = () => {
        // 创建canvas来处理图片
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        if (!ctx) {
          resolve(null);
          return;
        }
        
        // 设置canvas尺寸
        canvas.width = img.width;
        canvas.height = img.height;
        
        // 绘制图片到canvas
        ctx.drawImage(img, 0, 0);
        
        // 获取图片数据
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        
        // 使用jsQR解析二维码
        const code = jsQR(imageData.data, imageData.width, imageData.height);
        
        if (code) {
          resolve(code.data);
        } else {
          resolve(null);
        }
      };
      
      img.onerror = () => resolve(null);
      img.src = event.target?.result as string;
    };
    
    reader.onerror = () => resolve(null);
    reader.readAsDataURL(file);
  });
}

/**
 * 检查文件是否为支持的图片格式
 * @param file 文件对象
 * @returns 是否为支持的图片格式
 */
export function isSupportedImageFile(file: File): boolean {
  const supportedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/bmp', 'image/webp'];
  return supportedTypes.includes(file.type.toLowerCase());
}

/**
 * 检查文件是否为文本格式
 * @param file 文件对象
 * @returns 是否为文本格式
 */
export function isTextFile(file: File): boolean {
  const textTypes = ['text/plain', 'application/json'];
  const textExtensions = ['.txt', '.json', '.qr'];
  
  return textTypes.includes(file.type) || 
         textExtensions.some(ext => file.name.toLowerCase().endsWith(ext));
}