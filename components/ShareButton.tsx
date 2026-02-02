'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { track, EVENTS } from '@/lib/analytics';
import { Rarity } from '@/lib/titles';
import { ImageCropper } from './ImageCropper';

interface ShareButtonProps {
  title: string;
  rarity: Rarity;
  image: string;
  description: string;
}

const RARITY_CONFIG = {
  SSR: { color: '#F59E0B', percent: '5%' },
  SR: { color: '#8B5CF6', percent: '15%' },
  R: { color: '#3B82F6', percent: '30%' },
  N: { color: '#71717A', percent: '50%' },
};

type DownloadType = 'card' | 'xiaohongshu' | 'wechat';

export function ShareButton({ title, rarity, image, description }: ShareButtonProps) {
  const [saving, setSaving] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const [savingType, setSavingType] = useState<DownloadType | null>(null);
  const [showCropper, setShowCropper] = useState(false);
  const [cropperConfig, setCropperConfig] = useState<{
    shape: 'circle' | 'square';
    size: number;
    type: DownloadType;
  } | null>(null);

  const loadImage = (src: string): Promise<HTMLImageElement> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error('图片加载失败'));
      img.src = src;
    });
  };

  // 下载完整卡片
  const downloadCard = async () => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('无法创建 canvas');

    const width = 720;
    const height = 1280;
    canvas.width = width;
    canvas.height = height;

    const img = await loadImage(image);
    ctx.drawImage(img, 0, 0, width, height);

    // 渐变遮罩
    const gradient = ctx.createLinearGradient(0, height * 0.5, 0, height);
    gradient.addColorStop(0, 'rgba(0,0,0,0)');
    gradient.addColorStop(0.5, 'rgba(0,0,0,0.5)');
    gradient.addColorStop(1, 'rgba(0,0,0,0.9)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    // 稀有度标签
    const config = RARITY_CONFIG[rarity];
    const labelText = `${rarity} ${config.percent}`;
    ctx.font = 'bold 28px system-ui, -apple-system, sans-serif';
    const labelWidth = ctx.measureText(labelText).width + 40;
    const labelX = (width - labelWidth) / 2;
    const labelY = 60;

    ctx.fillStyle = config.color;
    ctx.beginPath();
    ctx.roundRect(labelX, labelY, labelWidth, 50, 25);
    ctx.fill();

    ctx.fillStyle = '#FFFFFF';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(labelText, width / 2, labelY + 25);

    // 标题
    ctx.font = 'bold 48px system-ui, -apple-system, sans-serif';
    ctx.fillStyle = config.color;
    ctx.shadowColor = 'rgba(0,0,0,0.5)';
    ctx.shadowBlur = 10;
    ctx.fillText(title, width / 2, height - 180);

    // 描述
    ctx.font = '24px system-ui, -apple-system, sans-serif';
    ctx.fillStyle = 'rgba(255,255,255,0.9)';
    ctx.shadowBlur = 5;

    const maxWidth = width - 80;
    const words = description.split('');
    let line = '';
    let y = height - 120;

    for (const char of words) {
      const testLine = line + char;
      const metrics = ctx.measureText(testLine);
      if (metrics.width > maxWidth && line !== '') {
        ctx.fillText(line, width / 2, y);
        line = char;
        y += 36;
      } else {
        line = testLine;
      }
    }
    ctx.fillText(line, width / 2, y);

    // 水印
    ctx.font = '18px system-ui, -apple-system, sans-serif';
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.shadowBlur = 0;
    ctx.fillText('宠物真实身份 · 仅供娱乐', width / 2, height - 30);

    return canvas.toDataURL('image/png');
  };

  // 打开裁剪器
  const openCropper = (type: 'xiaohongshu' | 'wechat') => {
    const config = type === 'xiaohongshu'
      ? { shape: 'circle' as const, size: 400, type }
      : { shape: 'square' as const, size: 640, type };

    setCropperConfig(config);
    setShowCropper(true);
    setShowOptions(false);
  };

  // 处理裁剪完成
  const handleCropConfirm = (croppedImage: string) => {
    if (!cropperConfig) return;

    const filename = cropperConfig.type === 'xiaohongshu'
      ? `小红书头像-${rarity}-${title}.png`
      : `微信头像-${rarity}-${title}.png`;

    const link = document.createElement('a');
    link.download = filename;
    link.href = croppedImage;
    link.click();

    track(EVENTS.SHARE_IMAGE_DOWNLOAD, { rarity, title, type: cropperConfig.type });

    setShowCropper(false);
    setCropperConfig(null);
  };

  const handleDownload = async (type: DownloadType) => {
    if (saving) return;

    // 头像类型打开裁剪器
    if (type === 'xiaohongshu' || type === 'wechat') {
      openCropper(type);
      return;
    }

    // 完整卡片直接下载
    setSaving(true);
    setSavingType(type);
    track(EVENTS.SHARE_IMAGE_DOWNLOAD, { rarity, title, type });

    try {
      const dataUrl = await downloadCard();
      const filename = `宠物身份-${rarity}-${title}.png`;

      const link = document.createElement('a');
      link.download = filename;
      link.href = dataUrl;
      link.click();

      setShowOptions(false);
    } catch (err) {
      console.error('保存图片失败:', err);
      alert('保存失败，请重试');
    } finally {
      setSaving(false);
      setSavingType(null);
    }
  };

  return (
    <div className="relative">
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => setShowOptions(!showOptions)}
        disabled={saving}
        className="w-full py-4 rounded-full bg-gray-900 text-white font-medium text-lg transition-all duration-300 hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
        </svg>
        <span>保存图片</span>
      </motion.button>

      {/* 下载选项 */}
      <AnimatePresence>
        {showOptions && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute bottom-full left-0 right-0 mb-3 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden"
          >
            {/* 完整卡片 */}
            <button
              onClick={() => handleDownload('card')}
              disabled={saving}
              className="w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-orange-400 to-pink-500 flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="flex-1 text-left">
                <p className="text-sm font-medium text-gray-900">完整卡片</p>
                <p className="text-xs text-gray-400">适合分享到朋友圈</p>
              </div>
              {savingType === 'card' && (
                <svg className="animate-spin h-5 w-5 text-gray-400" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              )}
            </button>

            <div className="h-px bg-gray-100" />

            {/* 小红书头像 */}
            <button
              onClick={() => handleDownload('xiaohongshu')}
              disabled={saving}
              className="w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-red-400 to-red-600 flex items-center justify-center">
                <span className="text-white text-lg">📕</span>
              </div>
              <div className="flex-1 text-left">
                <p className="text-sm font-medium text-gray-900">小红书头像</p>
                <p className="text-xs text-gray-400">圆形 · 可调整位置</p>
              </div>
              <svg className="w-4 h-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>

            <div className="h-px bg-gray-100" />

            {/* 微信头像 */}
            <button
              onClick={() => handleDownload('wechat')}
              disabled={saving}
              className="w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center">
                <span className="text-white text-lg">💬</span>
              </div>
              <div className="flex-1 text-left">
                <p className="text-sm font-medium text-gray-900">微信头像</p>
                <p className="text-xs text-gray-400">方形 · 可调整位置</p>
              </div>
              <svg className="w-4 h-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 点击外部关闭 */}
      {showOptions && (
        <div
          className="fixed inset-0 z-[-1]"
          onClick={() => setShowOptions(false)}
        />
      )}

      {/* 裁剪器 */}
      <AnimatePresence>
        {showCropper && cropperConfig && (
          <ImageCropper
            image={image}
            shape={cropperConfig.shape}
            size={cropperConfig.size}
            title={title}
            rarity={rarity}
            rarityColor={RARITY_CONFIG[rarity].color}
            onConfirm={handleCropConfirm}
            onCancel={() => {
              setShowCropper(false);
              setCropperConfig(null);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
