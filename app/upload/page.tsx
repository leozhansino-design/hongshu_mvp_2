'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { UploadZone } from '@/components/UploadZone';
import { track, EVENTS, trackPageView } from '@/lib/analytics';

type PetType = 'cat_female' | 'cat_male' | 'dog_female' | 'dog_male';

const PET_OPTIONS: { type: PetType; emoji: string; label: string }[] = [
  { type: 'cat_female', emoji: '🐱', label: '猫妹妹' },
  { type: 'cat_male', emoji: '🐱', label: '猫弟弟' },
  { type: 'dog_female', emoji: '🐕', label: '狗妹妹' },
  { type: 'dog_male', emoji: '🐕', label: '狗弟弟' },
];

export default function UploadPage() {
  const router = useRouter();
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [petType, setPetType] = useState<PetType | null>(null);

  useEffect(() => {
    trackPageView('upload');
  }, []);

  const handleImageSelect = (file: File, preview: string) => {
    if (!file || !preview) {
      setImageFile(null);
      setImagePreview(null);
      return;
    }
    setImageFile(file);
    setImagePreview(preview);
    track(EVENTS.UPLOAD_SUCCESS, { fileSize: file.size, fileType: file.type });
  };

  const handleContinue = () => {
    if (!imagePreview || !petType) return;

    // 将图片信息存储到 sessionStorage
    sessionStorage.setItem('petImage', imagePreview);
    sessionStorage.setItem('petType', petType);

    router.push('/questions');
  };

  const canContinue = imagePreview && petType;

  return (
    <main className="min-h-screen flex flex-col px-6 py-8 bg-white">
      {/* 顶部导航 */}
      <nav className="flex items-center justify-between mb-12">
        <Link href="/" className="text-gray-400 hover:text-gray-600 transition-colors">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <span className="text-gray-400 text-sm">步骤 1/3</span>
        <div className="w-6" />
      </nav>

      {/* 主内容 */}
      <div className="flex-1 flex flex-col max-w-lg mx-auto w-full">
        {/* 标题 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <h1 className="text-3xl md:text-4xl font-semibold text-gray-900 mb-3">
            上传照片
          </h1>
          <p className="text-gray-500">
            选择一张你家毛孩子的照片
          </p>
        </motion.div>

        {/* 上传区域 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-10"
        >
          <UploadZone
            onImageSelect={handleImageSelect}
            preview={imagePreview}
          />
        </motion.div>

        {/* 宠物类型选择 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-10"
        >
          <p className="text-center text-gray-500 mb-4">选择宠物类型</p>
          <div className="grid grid-cols-2 gap-3">
            {PET_OPTIONS.map((option) => (
              <button
                key={option.type}
                onClick={() => setPetType(option.type)}
                className={`
                  flex items-center justify-center gap-2 px-4 py-4 rounded-2xl border-2 transition-all duration-300
                  ${petType === option.type
                    ? 'border-gray-900 bg-gray-900 text-white'
                    : 'border-gray-200 text-gray-500 hover:border-gray-300'
                  }
                `}
              >
                <span className="text-2xl">{option.emoji}</span>
                <span className="font-medium">{option.label}</span>
              </button>
            ))}
          </div>
        </motion.div>

        {/* 继续按钮 */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-auto"
        >
          <button
            type="button"
            onClick={handleContinue}
            onTouchEnd={(e) => {
              if (canContinue) {
                e.preventDefault();
                handleContinue();
              }
            }}
            disabled={!canContinue}
            className={`
              w-full py-4 rounded-full font-medium text-lg transition-all duration-300 select-none
              ${canContinue
                ? 'bg-gray-900 text-white hover:bg-gray-800 active:bg-gray-700'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              }
            `}
          >
            继续
          </button>
        </motion.div>
      </div>
    </main>
  );
}
