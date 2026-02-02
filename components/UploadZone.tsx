'use client';

import { useCallback, useState } from 'react';
import { motion } from 'framer-motion';

interface UploadZoneProps {
  onImageSelect: (file: File, preview: string) => void;
  preview: string | null;
}

// 压缩图片到指定最大尺寸和质量
async function compressImage(file: File, maxSize: number = 800, quality: number = 0.8): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    img.onload = () => {
      let { width, height } = img;

      // 计算缩放比例
      if (width > height) {
        if (width > maxSize) {
          height = Math.round((height * maxSize) / width);
          width = maxSize;
        }
      } else {
        if (height > maxSize) {
          width = Math.round((width * maxSize) / height);
          height = maxSize;
        }
      }

      canvas.width = width;
      canvas.height = height;

      if (!ctx) {
        reject(new Error('无法创建 canvas context'));
        return;
      }

      // 绘制压缩后的图片
      ctx.drawImage(img, 0, 0, width, height);

      // 转换为 base64
      const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
      console.log(`📷 图片压缩: ${Math.round(file.size / 1024)}KB → ${Math.round(compressedDataUrl.length * 0.75 / 1024)}KB`);
      resolve(compressedDataUrl);
    };

    img.onerror = () => reject(new Error('图片加载失败'));

    // 读取原始图片
    const reader = new FileReader();
    reader.onload = (e) => {
      img.src = e.target?.result as string;
    };
    reader.onerror = () => reject(new Error('文件读取失败'));
    reader.readAsDataURL(file);
  });
}

export function UploadZone({ onImageSelect, preview }: UploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isCompressing, setIsCompressing] = useState(false);

  const handleFile = useCallback(async (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('请上传图片文件');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      alert('图片大小不能超过 10MB');
      return;
    }

    setIsCompressing(true);

    try {
      // 压缩图片到 800px，质量 0.8
      const compressedDataUrl = await compressImage(file, 800, 0.8);
      onImageSelect(file, compressedDataUrl);
    } catch (error) {
      console.error('图片压缩失败:', error);
      // 压缩失败则使用原图
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        onImageSelect(file, result);
      };
      reader.readAsDataURL(file);
    } finally {
      setIsCompressing(false);
    }
  }, [onImageSelect]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file) {
      handleFile(file);
    }
  }, [handleFile]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFile(file);
    }
  }, [handleFile]);

  if (preview) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative w-full aspect-square max-w-md mx-auto rounded-3xl overflow-hidden"
      >
        <img
          src={preview}
          alt="预览"
          className="w-full h-full object-cover"
        />
        <button
          onClick={() => onImageSelect(null as unknown as File, '')}
          className="absolute top-4 right-4 w-10 h-10 bg-black/50 backdrop-blur-xl rounded-full flex items-center justify-center text-white hover:bg-black/70 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </motion.div>
    );
  }

  return (
    <motion.label
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={`
        relative flex flex-col items-center justify-center
        w-full aspect-square max-w-md mx-auto
        rounded-3xl border-2 border-dashed cursor-pointer
        transition-all duration-300
        ${isDragging
          ? 'border-gray-900 bg-gray-50'
          : 'border-gray-200 hover:border-gray-300 bg-gray-50/50'
        }
        ${isCompressing ? 'pointer-events-none' : ''}
      `}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
    >
      <input
        type="file"
        accept="image/*"
        onChange={handleInputChange}
        className="hidden"
        disabled={isCompressing}
      />

      <motion.div
        animate={isDragging ? { scale: 1.1 } : { scale: 1 }}
        className="flex flex-col items-center text-center px-6"
      >
        {isCompressing ? (
          <>
            <div className="w-16 h-16 mb-6 rounded-2xl bg-gray-100 flex items-center justify-center">
              <svg className="w-8 h-8 text-gray-400 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
            <p className="text-lg font-medium text-gray-900 mb-2">
              正在处理图片...
            </p>
          </>
        ) : (
          <>
            <div className="w-16 h-16 mb-6 rounded-2xl bg-gray-100 flex items-center justify-center">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>

            <p className="text-lg font-medium text-gray-900 mb-2">
              上传宠物照片
            </p>
            <p className="text-sm text-gray-500">
              拖拽或点击选择图片
            </p>
            <p className="text-xs text-gray-400 mt-2">
              支持 JPG、PNG，最大 10MB
            </p>
          </>
        )}
      </motion.div>
    </motion.label>
  );
}
