'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { track, EVENTS } from '@/lib/analytics';
import { Rarity } from '@/lib/titles';

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

  // 下载小红书头像（圆形）
  const downloadXiaohongshu = async () => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('无法创建 canvas');

    const size = 400; // 小红书头像尺寸
    canvas.width = size;
    canvas.height = size;

    const img = await loadImage(image);

    // 创建圆形裁剪
    ctx.beginPath();
    ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
    ctx.closePath();
    ctx.clip();

    // 绘制图片（居中裁剪）
    const imgRatio = img.width / img.height;
    let sx = 0, sy = 0, sWidth = img.width, sHeight = img.height;

    if (imgRatio > 1) {
      // 图片较宽，裁剪左右
      sWidth = img.height;
      sx = (img.width - sWidth) / 2;
    } else {
      // 图片较高，裁剪上下
      sHeight = img.width;
      sy = (img.height - sHeight) / 2;
    }

    ctx.drawImage(img, sx, sy, sWidth, sHeight, 0, 0, size, size);

    // 添加边框
    ctx.strokeStyle = RARITY_CONFIG[rarity].color;
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.arc(size / 2, size / 2, size / 2 - 4, 0, Math.PI * 2);
    ctx.stroke();

    return canvas.toDataURL('image/png');
  };

  // 下载微信头像（方形）
  const downloadWechat = async () => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('无法创建 canvas');

    const size = 640; // 微信头像尺寸
    canvas.width = size;
    canvas.height = size;

    const img = await loadImage(image);

    // 绘制图片（居中裁剪为正方形）
    const imgRatio = img.width / img.height;
    let sx = 0, sy = 0, sWidth = img.width, sHeight = img.height;

    if (imgRatio > 1) {
      sWidth = img.height;
      sx = (img.width - sWidth) / 2;
    } else {
      sHeight = img.width;
      sy = (img.height - sHeight) / 2;
    }

    // 圆角矩形裁剪
    const radius = 40;
    ctx.beginPath();
    ctx.roundRect(0, 0, size, size, radius);
    ctx.closePath();
    ctx.clip();

    ctx.drawImage(img, sx, sy, sWidth, sHeight, 0, 0, size, size);

    // 底部渐变遮罩
    const gradient = ctx.createLinearGradient(0, size * 0.6, 0, size);
    gradient.addColorStop(0, 'rgba(0,0,0,0)');
    gradient.addColorStop(1, 'rgba(0,0,0,0.7)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, size, size);

    // 稀有度标签
    const config = RARITY_CONFIG[rarity];
    ctx.fillStyle = config.color;
    ctx.beginPath();
    ctx.roundRect(size / 2 - 40, 20, 80, 30, 15);
    ctx.fill();

    ctx.font = 'bold 16px system-ui, -apple-system, sans-serif';
    ctx.fillStyle = '#FFFFFF';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(rarity, size / 2, 35);

    // 标题
    ctx.font = 'bold 32px system-ui, -apple-system, sans-serif';
    ctx.fillStyle = '#FFFFFF';
    ctx.shadowColor = 'rgba(0,0,0,0.5)';
    ctx.shadowBlur = 5;
    ctx.fillText(title.length > 8 ? title.slice(0, 8) + '...' : title, size / 2, size - 40);

    return canvas.toDataURL('image/png');
  };

  const handleDownload = async (type: DownloadType) => {
    if (saving) return;

    setSaving(true);
    setSavingType(type);
    track(EVENTS.SHARE_IMAGE_DOWNLOAD, { rarity, title, type });

    try {
      let dataUrl: string;
      let filename: string;

      switch (type) {
        case 'card':
          dataUrl = await downloadCard();
          filename = `宠物身份-${rarity}-${title}.png`;
          break;
        case 'xiaohongshu':
          dataUrl = await downloadXiaohongshu();
          filename = `小红书头像-${rarity}-${title}.png`;
          break;
        case 'wechat':
          dataUrl = await downloadWechat();
          filename = `微信头像-${rarity}-${title}.png`;
          break;
      }

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
                <p className="text-xs text-gray-400">圆形 · 400×400</p>
              </div>
              {savingType === 'xiaohongshu' && (
                <svg className="animate-spin h-5 w-5 text-gray-400" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              )}
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
                <p className="text-xs text-gray-400">方形 · 640×640</p>
              </div>
              {savingType === 'wechat' && (
                <svg className="animate-spin h-5 w-5 text-gray-400" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              )}
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
    </div>
  );
}
