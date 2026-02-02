'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { track, EVENTS } from '@/lib/analytics';

interface ShareButtonProps {
  title: string;
  rarity: string;
  resultId: string;
}

export function ShareButton({ title, rarity, resultId }: ShareButtonProps) {
  const [showOptions, setShowOptions] = useState(false);
  const [copying, setCopying] = useState(false);

  const shareUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/result/${resultId}`
    : '';

  const shareText = `我家毛孩子的命运鉴定结果：${rarity} - ${title}！快来测测你家的~`;

  const handleShare = async (platform: string) => {
    track(EVENTS.SHARE_CLICK, { platform, rarity, title });

    switch (platform) {
      case 'copy':
        try {
          await navigator.clipboard.writeText(`${shareText}\n${shareUrl}`);
          setCopying(true);
          setTimeout(() => setCopying(false), 2000);
        } catch (err) {
          console.error('复制失败:', err);
        }
        break;

      case 'weibo':
        window.open(
          `https://service.weibo.com/share/share.php?title=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`,
          '_blank'
        );
        break;

      case 'native':
        if (navigator.share) {
          try {
            await navigator.share({
              title: '宠物命运鉴定',
              text: shareText,
              url: shareUrl,
            });
          } catch (err) {
            if ((err as Error).name !== 'AbortError') {
              console.error('分享失败:', err);
            }
          }
        }
        break;
    }

    setShowOptions(false);
  };

  const handleDownload = () => {
    track(EVENTS.SHARE_IMAGE_DOWNLOAD, { rarity, title });
    // TODO: 实现图片下载功能
    alert('图片下载功能开发中...');
  };

  return (
    <div className="relative">
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => setShowOptions(!showOptions)}
        className="w-full py-4 rounded-full bg-white text-black font-medium text-lg transition-all duration-300 hover:shadow-[0_0_40px_rgba(255,255,255,0.3)]"
      >
        分享结果
      </motion.button>

      {/* 分享选项 */}
      {showOptions && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute bottom-full left-0 right-0 mb-4 p-4 bg-zinc-900 border border-zinc-800 rounded-2xl"
        >
          <div className="grid grid-cols-3 gap-3 mb-4">
            <button
              onClick={() => handleShare('copy')}
              className="flex flex-col items-center gap-2 p-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 transition-colors"
            >
              <span className="text-2xl">{copying ? '✓' : '📋'}</span>
              <span className="text-xs text-zinc-400">
                {copying ? '已复制' : '复制链接'}
              </span>
            </button>

            <button
              onClick={() => handleShare('weibo')}
              className="flex flex-col items-center gap-2 p-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 transition-colors"
            >
              <span className="text-2xl">📢</span>
              <span className="text-xs text-zinc-400">微博</span>
            </button>

            {typeof navigator !== 'undefined' && 'share' in navigator && (
              <button
                onClick={() => handleShare('native')}
                className="flex flex-col items-center gap-2 p-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 transition-colors"
              >
                <span className="text-2xl">📤</span>
                <span className="text-xs text-zinc-400">更多</span>
              </button>
            )}
          </div>

          <button
            onClick={handleDownload}
            className="w-full py-3 rounded-xl border border-zinc-700 text-zinc-400 hover:text-white hover:border-zinc-500 transition-colors text-sm"
          >
            保存图片到相册
          </button>
        </motion.div>
      )}
    </div>
  );
}
