'use client';

import { useCallback, useState } from 'react';
import { motion } from 'framer-motion';

interface UploadZoneProps {
  onImageSelect: (file: File, preview: string) => void;
  preview: string | null;
}

export function UploadZone({ onImageSelect, preview }: UploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false);

  const handleFile = useCallback((file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('请上传图片文件');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      alert('图片大小不能超过 10MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      onImageSelect(file, result);
    };
    reader.readAsDataURL(file);
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
          ? 'border-white bg-white/10'
          : 'border-zinc-700 hover:border-zinc-500 bg-zinc-900/50'
        }
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
      />

      <motion.div
        animate={isDragging ? { scale: 1.1 } : { scale: 1 }}
        className="flex flex-col items-center text-center px-6"
      >
        <div className="w-16 h-16 mb-6 rounded-2xl bg-zinc-800 flex items-center justify-center">
          <svg className="w-8 h-8 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>

        <p className="text-lg font-medium text-white mb-2">
          上传宠物照片
        </p>
        <p className="text-sm text-zinc-500">
          拖拽或点击选择图片
        </p>
        <p className="text-xs text-zinc-600 mt-2">
          支持 JPG、PNG，最大 10MB
        </p>
      </motion.div>
    </motion.label>
  );
}
