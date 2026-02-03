'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Rarity } from '@/lib/titles';

interface ResultCardProps {
  rarity: Rarity;
  title: string;
  description: string;
  image: string;
}

// 稀有度中文名称
const RARITY_NAMES = {
  SSR: '传说',
  SR: '史诗',
  R: '稀有',
  N: '普通',
};

const RARITY_CONFIG = {
  SSR: {
    gradient: 'from-amber-400 via-orange-500 to-rose-500',
    glowColor: 'rgba(251,191,36,0.6)',
    glow: 'shadow-[0_0_80px_rgba(251,191,36,0.6),0_0_120px_rgba(251,146,60,0.4)]',
    textColor: 'text-amber-300',
    textGlow: 'drop-shadow-[0_0_20px_rgba(251,191,36,0.8)]',
    borderGradient: 'bg-gradient-to-r from-amber-400 via-orange-500 to-rose-500',
    badgeBg: 'bg-gradient-to-r from-amber-400 via-orange-500 to-rose-500',
    sparkle: true,
  },
  SR: {
    gradient: 'from-violet-500 via-purple-500 to-fuchsia-500',
    glowColor: 'rgba(139,92,246,0.5)',
    glow: 'shadow-[0_0_60px_rgba(139,92,246,0.5),0_0_100px_rgba(192,132,252,0.3)]',
    textColor: 'text-violet-300',
    textGlow: 'drop-shadow-[0_0_15px_rgba(139,92,246,0.8)]',
    borderGradient: 'bg-gradient-to-r from-violet-500 via-purple-500 to-fuchsia-500',
    badgeBg: 'bg-gradient-to-r from-violet-500 via-purple-500 to-fuchsia-500',
    sparkle: true,
  },
  R: {
    gradient: 'from-cyan-400 via-blue-500 to-indigo-500',
    glowColor: 'rgba(59,130,246,0.4)',
    glow: 'shadow-[0_0_50px_rgba(59,130,246,0.4),0_0_80px_rgba(99,102,241,0.3)]',
    textColor: 'text-blue-300',
    textGlow: 'drop-shadow-[0_0_12px_rgba(59,130,246,0.8)]',
    borderGradient: 'bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-500',
    badgeBg: 'bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-500',
    sparkle: false,
  },
  N: {
    gradient: 'from-zinc-400 via-zinc-500 to-zinc-600',
    glowColor: 'rgba(161,161,170,0.3)',
    glow: 'shadow-[0_0_40px_rgba(161,161,170,0.3)]',
    textColor: 'text-zinc-200',
    textGlow: 'drop-shadow-[0_0_8px_rgba(161,161,170,0.6)]',
    borderGradient: 'bg-gradient-to-r from-zinc-400 via-zinc-500 to-zinc-600',
    badgeBg: 'bg-gradient-to-r from-zinc-400 via-zinc-500 to-zinc-600',
    sparkle: false,
  },
};

export function ResultCard({ rarity, title, description, image }: ResultCardProps) {
  const config = RARITY_CONFIG[rarity];
  const rarityName = RARITY_NAMES[rarity];
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  return (
    <div className="relative pt-5 w-full max-w-md sm:max-w-lg mx-auto">
      {/* 稀有度标签 - 在卡片边框上方，显示中文 */}
      <motion.div
        initial={{ opacity: 0, scale: 0, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
        className="absolute top-0 left-1/2 -translate-x-1/2 z-20"
      >
        <div className={`px-5 py-2 rounded-full ${config.badgeBg} text-white font-bold tracking-wide shadow-lg`}>
          <span className="text-sm">{rarityName}</span>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6 }}
        className={`relative w-full rounded-3xl overflow-hidden ${config.glow}`}
      >
        {/* 渐变边框 */}
        <div className={`${config.borderGradient} p-[3px] rounded-3xl`}>
          <div className="bg-gray-900 rounded-3xl overflow-hidden">
            {/* 图片容器 */}
            <div className="relative aspect-[3/4]">
              {/* 加载中/错误状态 */}
              {!imageLoaded && !imageError && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
                  <div className="animate-spin w-8 h-8 border-4 border-white/20 border-t-white rounded-full" />
                </div>
              )}

              {imageError && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
                  <p className="text-white/60 text-sm">图片加载失败</p>
                </div>
              )}

              {/* 背景图 - 保持原图清晰度 */}
              <img
                src={image}
                alt={title}
                className={`result-card-image w-full h-full object-cover transition-opacity duration-300 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
                onLoad={() => setImageLoaded(true)}
                onError={() => setImageError(true)}
                crossOrigin="anonymous"
                loading="eager"
                decoding="sync"
              />

              {/* 底部信息区域 */}
              <div className="absolute bottom-0 left-0 right-0 p-4">
                {/* 毛玻璃背景 */}
                <div className="absolute inset-0 backdrop-blur-md bg-black/60" />

                {/* 内容 */}
                <div className="relative text-center">
                  <motion.h1
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className={`text-xl sm:text-2xl font-bold ${config.textColor} ${config.textGlow} mb-1`}
                  >
                    {title}
                  </motion.h1>
                  <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="text-white/80 text-xs sm:text-sm leading-relaxed"
                  >
                    "{description}"
                  </motion.p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 闪光粒子效果 - 高稀有度专属 */}
        {config.sparkle && (
          <>
            <motion.div
              className="absolute top-16 left-8 w-2 h-2 bg-white rounded-full pointer-events-none"
              animate={{ opacity: [0, 1, 0], scale: [0.5, 1.2, 0.5] }}
              transition={{ duration: 2, repeat: Infinity, delay: 0 }}
            />
            <motion.div
              className="absolute top-24 right-10 w-1.5 h-1.5 bg-white rounded-full pointer-events-none"
              animate={{ opacity: [0, 1, 0], scale: [0.5, 1.2, 0.5] }}
              transition={{ duration: 2.5, repeat: Infinity, delay: 0.5 }}
            />
            <motion.div
              className="absolute top-36 left-12 w-1 h-1 bg-white rounded-full pointer-events-none"
              animate={{ opacity: [0, 1, 0], scale: [0.5, 1.2, 0.5] }}
              transition={{ duration: 1.8, repeat: Infinity, delay: 1 }}
            />
          </>
        )}

        {/* 扫光动画 - 高稀有度专属 */}
        {(rarity === 'SSR' || rarity === 'SR') && (
          <motion.div
            className="absolute inset-0 pointer-events-none overflow-hidden rounded-3xl"
            initial={{ x: '-100%' }}
            animate={{ x: '200%' }}
            transition={{ duration: 3, repeat: Infinity, repeatDelay: 2, ease: 'easeInOut' }}
          >
            <div className="w-1/3 h-full bg-gradient-to-r from-transparent via-white/15 to-transparent skew-x-12" />
          </motion.div>
        )}

        {/* 呼吸光效 */}
        <motion.div
          className="absolute inset-0 pointer-events-none rounded-3xl"
          animate={{
            boxShadow: [
              `0 0 60px ${config.glowColor}`,
              `0 0 100px ${config.glowColor}`,
              `0 0 60px ${config.glowColor}`,
            ]
          }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        />
      </motion.div>
    </div>
  );
}
