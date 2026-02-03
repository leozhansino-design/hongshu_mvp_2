'use client';

import { useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { getAllTitles, TitleData } from '@/lib/titles';

export default function PromotePage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [petImage, setPetImage] = useState<string | null>(null);
  const [petType, setPetType] = useState<'cat' | 'dog'>('cat');
  const [selectedTitle, setSelectedTitle] = useState<TitleData | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 获取所有头衔
  const allTitles = getAllTitles();

  // 按稀有度分组
  const groupedTitles = {
    SSR: allTitles.filter(t => t.rarity === 'SSR'),
    SR: allTitles.filter(t => t.rarity === 'SR'),
    R: allTitles.filter(t => t.rarity === 'R'),
    N: allTitles.filter(t => t.rarity === 'N'),
  };

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('请选择图片文件');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        // 压缩图片
        const canvas = document.createElement('canvas');
        const maxSize = 800;
        let width = img.width;
        let height = img.height;

        if (width > maxSize || height > maxSize) {
          if (width > height) {
            height = (height / width) * maxSize;
            width = maxSize;
          } else {
            width = (width / height) * maxSize;
            height = maxSize;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        setPetImage(canvas.toDataURL('image/jpeg', 0.8));
        setError(null);
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  }, []);

  const handleGenerate = async () => {
    if (!petImage || !selectedTitle) {
      setError('请上传图片并选择头衔');
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      // 直接调用生成 API，指定头衔
      const response = await fetch('/api/promote/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          petImage,
          petType,
          titleId: selectedTitle.id,
        }),
      });

      const data = await response.json();

      if (data.success) {
        sessionStorage.setItem('currentJobId', data.data.jobId);
        sessionStorage.setItem('petImage', petImage);
        sessionStorage.setItem('petType', petType);
        router.push(`/result/${data.data.jobId}`);
      } else {
        setError(data.error || '生成失败');
      }
    } catch (err) {
      setError('网络错误，请重试');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white p-6">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-2">宣传素材生成</h1>
        <p className="text-gray-400 text-center mb-8">选择头衔，生成宣传图片</p>

        {/* 上传图片 */}
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">1. 上传宠物照片</label>
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-gray-600 rounded-xl p-8 text-center cursor-pointer hover:border-gray-400 transition-colors"
          >
            {petImage ? (
              <img src={petImage} alt="Pet" className="w-32 h-32 object-cover rounded-xl mx-auto" />
            ) : (
              <div className="text-gray-400">
                <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p>点击上传图片</p>
              </div>
            )}
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />
        </div>

        {/* 选择宠物类型 */}
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">2. 选择宠物类型</label>
          <div className="flex gap-4">
            <button
              onClick={() => setPetType('cat')}
              className={`flex-1 py-3 rounded-xl font-medium transition-all ${
                petType === 'cat'
                  ? 'bg-amber-500 text-white'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              🐱 猫咪
            </button>
            <button
              onClick={() => setPetType('dog')}
              className={`flex-1 py-3 rounded-xl font-medium transition-all ${
                petType === 'dog'
                  ? 'bg-amber-500 text-white'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              🐶 狗狗
            </button>
          </div>
        </div>

        {/* 选择头衔 */}
        <div className="mb-8">
          <label className="block text-sm font-medium mb-2">3. 选择头衔 ({allTitles.length}个)</label>
          <select
            value={selectedTitle?.id || ''}
            onChange={(e) => {
              const title = allTitles.find(t => t.id === Number(e.target.value));
              setSelectedTitle(title || null);
            }}
            className="w-full bg-gray-800 border border-gray-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-amber-500"
          >
            <option value="">-- 请选择头衔 --</option>
            <optgroup label="🌟 传说 (SSR)">
              {groupedTitles.SSR.map(t => (
                <option key={t.id} value={t.id}>{t.title}</option>
              ))}
            </optgroup>
            <optgroup label="💜 史诗 (SR)">
              {groupedTitles.SR.map(t => (
                <option key={t.id} value={t.id}>{t.title}</option>
              ))}
            </optgroup>
            <optgroup label="💙 稀有 (R)">
              {groupedTitles.R.map(t => (
                <option key={t.id} value={t.id}>{t.title}</option>
              ))}
            </optgroup>
            <optgroup label="⚪ 普通 (N)">
              {groupedTitles.N.map(t => (
                <option key={t.id} value={t.id}>{t.title}</option>
              ))}
            </optgroup>
          </select>

          {selectedTitle && (
            <div className="mt-3 p-4 bg-gray-800 rounded-xl">
              <div className="flex items-center gap-2 mb-2">
                <span className={`px-2 py-1 rounded text-xs font-bold ${
                  selectedTitle.rarity === 'SSR' ? 'bg-amber-500' :
                  selectedTitle.rarity === 'SR' ? 'bg-violet-500' :
                  selectedTitle.rarity === 'R' ? 'bg-blue-500' : 'bg-gray-500'
                }`}>
                  {selectedTitle.rarity}
                </span>
                <span className="font-bold">{selectedTitle.title}</span>
              </div>
              <p className="text-gray-400 text-sm">{selectedTitle.description}</p>
            </div>
          )}
        </div>

        {/* 错误提示 */}
        {error && (
          <div className="mb-4 p-4 bg-red-500/20 border border-red-500/50 rounded-xl text-red-400 text-center">
            {error}
          </div>
        )}

        {/* 生成按钮 */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleGenerate}
          disabled={!petImage || !selectedTitle || isGenerating}
          className="w-full py-4 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold text-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isGenerating ? '生成中...' : '开始生成'}
        </motion.button>

        <p className="text-center text-gray-500 text-xs mt-4">
          仅供内部宣传使用
        </p>
      </div>
    </main>
  );
}
