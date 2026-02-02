'use client';

import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';
import { Rarity } from '@/lib/titles';

interface GachaCardProps {
  isRevealing: boolean;
  rarity: Rarity;
  resultImage: string;
  title: string;
  description: string;
  onFlipComplete?: () => void;
}

// 稀有度颜色配置
const RARITY_CONFIG = {
  SSR: {
    gradient: 'from-amber-400 via-orange-500 to-rose-500',
    glow: 'shadow-[0_0_80px_rgba(251,191,36,0.5)]',
    textColor: 'text-amber-400',
    bgGlow: 'rgba(251,191,36,0.3)',
    percent: '5%',
  },
  SR: {
    gradient: 'from-violet-500 via-purple-500 to-fuchsia-500',
    glow: 'shadow-[0_0_60px_rgba(139,92,246,0.4)]',
    textColor: 'text-violet-400',
    bgGlow: 'rgba(139,92,246,0.25)',
    percent: '15%',
  },
  R: {
    gradient: 'from-cyan-400 via-blue-500 to-indigo-500',
    glow: 'shadow-[0_0_40px_rgba(59,130,246,0.3)]',
    textColor: 'text-blue-400',
    bgGlow: 'rgba(59,130,246,0.2)',
    percent: '30%',
  },
  N: {
    gradient: 'from-zinc-400 via-zinc-500 to-zinc-600',
    glow: 'shadow-[0_0_30px_rgba(161,161,170,0.2)]',
    textColor: 'text-zinc-400',
    bgGlow: 'rgba(161,161,170,0.1)',
    percent: '50%',
  },
};

export function GachaCard({
  isRevealing,
  rarity,
  resultImage,
  title,
  description,
  onFlipComplete,
}: GachaCardProps) {
  const config = RARITY_CONFIG[rarity];

  const handleAnimationComplete = () => {
    if (!isRevealing) return;

    // SSR 撒金色纸屑 + 震动
    if (rarity === 'SSR') {
      confetti({
        particleCount: 150,
        spread: 70,
        colors: ['#FFD700', '#FFA500', '#FF6B00'],
        origin: { y: 0.6 },
      });
      // 手机震动
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate([100, 50, 100]);
      }
    }

    // SR 撒紫色纸屑
    if (rarity === 'SR') {
      confetti({
        particleCount: 80,
        spread: 50,
        colors: ['#9B59B6', '#8E44AD', '#E91E63'],
        origin: { y: 0.6 },
      });
    }

    onFlipComplete?.();
  };

  return (
    <div className="w-full max-w-sm mx-auto" style={{ perspective: '1000px' }}>
      <motion.div
        animate={
          isRevealing
            ? { rotateY: 180, scale: [1, 1.1, 1.05] }
            : { x: [0, -2, 2, -2, 2, 0] }
        }
        transition={
          isRevealing
            ? { duration: 0.8, ease: 'easeInOut' }
            : { repeat: Infinity, duration: 0.15 }
        }
        onAnimationComplete={handleAnimationComplete}
        style={{ transformStyle: 'preserve-3d' }}
        className="relative w-full aspect-[9/16] cursor-pointer"
      >
        {/* 卡牌背面 */}
        <div
          className="absolute inset-0 rounded-3xl flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200 shadow-lg"
          style={{ backfaceVisibility: 'hidden' }}
        >
          <div className="text-center">
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="text-6xl mb-4"
            >
              ✨
            </motion.div>
            <p className="text-gray-900 text-lg font-medium">身份揭晓中...</p>
            <p className="text-gray-500 text-sm mt-2">点击卡牌翻转</p>
          </div>
        </div>

        {/* 卡牌正面 */}
        <div
          className={`absolute inset-0 rounded-3xl overflow-hidden ${config.glow}`}
          style={{
            transform: 'rotateY(180deg)',
            backfaceVisibility: 'hidden',
          }}
        >
          {/* 背景图 */}
          <div className="absolute inset-0">
            <img
              src={resultImage}
              className="w-full h-full object-cover"
              alt="身份卡牌"
            />
            {/* 渐变遮罩 */}
            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
          </div>

          {/* 稀有度标签 */}
          <div className="absolute top-4 left-1/2 -translate-x-1/2">
            <div
              className={`px-4 py-1.5 rounded-full bg-gradient-to-r ${config.gradient} text-white text-sm font-bold tracking-wide flex items-center gap-1.5`}
            >
              <span>{rarity}</span>
              <span className="text-xs font-normal opacity-80">{config.percent}</span>
            </div>
          </div>

          {/* 底部信息 */}
          <div className="absolute bottom-0 left-0 right-0 p-6">
            <h2
              className={`text-2xl font-bold ${config.textColor} mb-2 text-center drop-shadow-lg`}
            >
              {title}
            </h2>
            <p className="text-white/90 text-sm text-center leading-relaxed">
              {description}
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
