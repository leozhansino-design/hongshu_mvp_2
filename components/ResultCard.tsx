'use client';

import { motion } from 'framer-motion';
import { Rarity } from '@/lib/titles';

interface ResultCardProps {
  rarity: Rarity;
  title: string;
  description: string;
  image: string;
}

const RARITY_CONFIG = {
  SSR: {
    gradient: 'from-amber-400 via-orange-500 to-rose-500',
    glowColor: 'rgba(251,191,36,0.6)',
    glow: 'shadow-[0_0_80px_rgba(251,191,36,0.6),0_0_120px_rgba(251,146,60,0.4)]',
    textColor: 'text-amber-300',
    textGlow: 'drop-shadow-[0_0_20px_rgba(251,191,36,0.8)]',
    borderGradient: 'bg-gradient-to-r from-amber-400 via-orange-500 to-rose-500',
    bgOverlay: 'bg-gradient-to-t from-amber-950/90 via-amber-900/60 to-transparent',
    sparkle: true,
  },
  SR: {
    gradient: 'from-violet-500 via-purple-500 to-fuchsia-500',
    glowColor: 'rgba(139,92,246,0.5)',
    glow: 'shadow-[0_0_60px_rgba(139,92,246,0.5),0_0_100px_rgba(192,132,252,0.3)]',
    textColor: 'text-violet-300',
    textGlow: 'drop-shadow-[0_0_15px_rgba(139,92,246,0.8)]',
    borderGradient: 'bg-gradient-to-r from-violet-500 via-purple-500 to-fuchsia-500',
    bgOverlay: 'bg-gradient-to-t from-violet-950/90 via-purple-900/60 to-transparent',
    sparkle: true,
  },
  R: {
    gradient: 'from-cyan-400 via-blue-500 to-indigo-500',
    glowColor: 'rgba(59,130,246,0.4)',
    glow: 'shadow-[0_0_50px_rgba(59,130,246,0.4),0_0_80px_rgba(99,102,241,0.3)]',
    textColor: 'text-blue-300',
    textGlow: 'drop-shadow-[0_0_12px_rgba(59,130,246,0.8)]',
    borderGradient: 'bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-500',
    bgOverlay: 'bg-gradient-to-t from-blue-950/90 via-blue-900/60 to-transparent',
    sparkle: false,
  },
  N: {
    gradient: 'from-zinc-400 via-zinc-500 to-zinc-600',
    glowColor: 'rgba(161,161,170,0.3)',
    glow: 'shadow-[0_0_40px_rgba(161,161,170,0.3)]',
    textColor: 'text-zinc-200',
    textGlow: 'drop-shadow-[0_0_8px_rgba(161,161,170,0.6)]',
    borderGradient: 'bg-gradient-to-r from-zinc-400 via-zinc-500 to-zinc-600',
    bgOverlay: 'bg-gradient-to-t from-zinc-900/90 via-zinc-800/60 to-transparent',
    sparkle: false,
  },
};

export function ResultCard({ rarity, title, description, image }: ResultCardProps) {
  const config = RARITY_CONFIG[rarity];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.6 }}
      className={`relative w-full max-w-xs sm:max-w-sm mx-auto aspect-[3/4] rounded-3xl overflow-hidden ${config.glow}`}
    >
      {/* 渐变边框 */}
      <div className={`absolute inset-0 rounded-3xl ${config.borderGradient} p-[2px]`}>
        <div className="w-full h-full rounded-3xl bg-black" />
      </div>

      {/* 背景图 */}
      <div className="absolute inset-[2px] rounded-3xl overflow-hidden">
        <img
          src={image}
          alt={title}
          className="w-full h-full object-cover"
        />

        {/* 多层渐变遮罩 - 更强烈的效果 */}
        <div className={`absolute inset-0 ${config.bgOverlay}`} />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

        {/* 顶部光晕效果 */}
        <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-white/10 to-transparent" />

        {/* 侧边光效 */}
        <div className="absolute top-0 bottom-0 left-0 w-16 bg-gradient-to-r from-white/5 to-transparent" />
        <div className="absolute top-0 bottom-0 right-0 w-16 bg-gradient-to-l from-white/5 to-transparent" />
      </div>

      {/* 闪光粒子效果 - 高稀有度专属 */}
      {config.sparkle && (
        <>
          <motion.div
            className="absolute top-10 left-8 w-2 h-2 bg-white rounded-full"
            animate={{
              opacity: [0, 1, 0],
              scale: [0.5, 1.2, 0.5],
            }}
            transition={{ duration: 2, repeat: Infinity, delay: 0 }}
          />
          <motion.div
            className="absolute top-20 right-10 w-1.5 h-1.5 bg-white rounded-full"
            animate={{
              opacity: [0, 1, 0],
              scale: [0.5, 1.2, 0.5],
            }}
            transition={{ duration: 2.5, repeat: Infinity, delay: 0.5 }}
          />
          <motion.div
            className="absolute top-32 left-12 w-1 h-1 bg-white rounded-full"
            animate={{
              opacity: [0, 1, 0],
              scale: [0.5, 1.2, 0.5],
            }}
            transition={{ duration: 1.8, repeat: Infinity, delay: 1 }}
          />
          <motion.div
            className="absolute top-16 right-16 w-1.5 h-1.5 bg-white rounded-full"
            animate={{
              opacity: [0, 1, 0],
              scale: [0.5, 1.2, 0.5],
            }}
            transition={{ duration: 2.2, repeat: Infinity, delay: 1.5 }}
          />
        </>
      )}

      {/* 底部信息区域 */}
      <div className="absolute bottom-0 left-0 right-0 p-6 z-10">
        {/* 毛玻璃背景 */}
        <div className="absolute inset-0 backdrop-blur-md bg-black/30 rounded-t-2xl" />

        {/* 内容 */}
        <div className="relative">
          {/* 装饰线 */}
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className={`h-0.5 w-16 mx-auto mb-4 rounded-full ${config.borderGradient}`}
          />

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className={`text-2xl sm:text-3xl font-bold ${config.textColor} ${config.textGlow} mb-3 text-center`}
          >
            {title}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="text-white/80 text-sm sm:text-base text-center leading-relaxed"
          >
            "{description}"
          </motion.p>

          {/* 底部小装饰 */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mt-4 flex justify-center"
          >
            <div className="text-white/40 text-xs tracking-widest">宠物真实身份 · 仅供娱乐</div>
          </motion.div>
        </div>
      </div>

      {/* 扫光动画 - 高稀有度专属 */}
      {(rarity === 'SSR' || rarity === 'SR') && (
        <motion.div
          className="absolute inset-0 pointer-events-none"
          initial={{ x: '-100%' }}
          animate={{ x: '200%' }}
          transition={{ duration: 3, repeat: Infinity, repeatDelay: 2, ease: 'easeInOut' }}
        >
          <div className="w-1/3 h-full bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12" />
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
  );
}
