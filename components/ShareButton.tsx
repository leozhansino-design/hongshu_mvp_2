'use client';

import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
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

export function ShareButton({ title, rarity, image, description }: ShareButtonProps) {
  const [saving, setSaving] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleSaveImage = async () => {
    if (saving) return;

    setSaving(true);
    track(EVENTS.SHARE_IMAGE_DOWNLOAD, { rarity, title });

    try {
      // 创建 canvas
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('无法创建 canvas');

      // 设置尺寸 (9:16 比例，适合手机)
      const width = 720;
      const height = 1280;
      canvas.width = width;
      canvas.height = height;

      // 加载图片
      const img = new Image();
      img.crossOrigin = 'anonymous';

      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () => reject(new Error('图片加载失败'));
        img.src = image;
      });

      // 绘制背景图
      ctx.drawImage(img, 0, 0, width, height);

      // 绘制底部渐变遮罩
      const gradient = ctx.createLinearGradient(0, height * 0.5, 0, height);
      gradient.addColorStop(0, 'rgba(0,0,0,0)');
      gradient.addColorStop(0.5, 'rgba(0,0,0,0.5)');
      gradient.addColorStop(1, 'rgba(0,0,0,0.9)');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);

      // 绘制稀有度标签
      const config = RARITY_CONFIG[rarity];
      const labelText = `${rarity} ${config.percent}`;
      ctx.font = 'bold 28px system-ui, -apple-system, sans-serif';
      const labelWidth = ctx.measureText(labelText).width + 40;
      const labelX = (width - labelWidth) / 2;
      const labelY = 60;

      // 标签背景
      ctx.fillStyle = config.color;
      ctx.beginPath();
      ctx.roundRect(labelX, labelY, labelWidth, 50, 25);
      ctx.fill();

      // 标签文字
      ctx.fillStyle = '#FFFFFF';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(labelText, width / 2, labelY + 25);

      // 绘制标题
      ctx.font = 'bold 48px system-ui, -apple-system, sans-serif';
      ctx.fillStyle = config.color;
      ctx.textAlign = 'center';
      ctx.shadowColor = 'rgba(0,0,0,0.5)';
      ctx.shadowBlur = 10;
      ctx.fillText(title, width / 2, height - 180);

      // 绘制描述
      ctx.font = '24px system-ui, -apple-system, sans-serif';
      ctx.fillStyle = 'rgba(255,255,255,0.9)';
      ctx.shadowBlur = 5;

      // 描述文字换行
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

      // 绘制水印
      ctx.font = '18px system-ui, -apple-system, sans-serif';
      ctx.fillStyle = 'rgba(255,255,255,0.5)';
      ctx.shadowBlur = 0;
      ctx.fillText('宠物真实身份 · 仅供娱乐', width / 2, height - 30);

      // 下载图片
      const dataUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `宠物身份-${rarity}-${title}.png`;
      link.href = dataUrl;
      link.click();

    } catch (err) {
      console.error('保存图片失败:', err);
      alert('保存失败，请长按图片保存');
    } finally {
      setSaving(false);
    }
  };

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={handleSaveImage}
      disabled={saving}
      className="w-full py-4 rounded-full bg-gray-900 text-white font-medium text-lg transition-all duration-300 hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
    >
      {saving ? (
        <>
          <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <span>正在生成...</span>
        </>
      ) : (
        <>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          <span>保存图片</span>
        </>
      )}
    </motion.button>
  );
}
