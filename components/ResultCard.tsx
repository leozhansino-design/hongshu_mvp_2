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
    glow: 'shadow-[0_0_60px_rgba(251,191,36,0.5)]',
    textColor: 'text-amber-400',
    borderColor: 'border-amber-400/30',
    bgColor: 'bg-amber-500/20',
    percent: '5%',
    ring: 'ring-amber-400/50',
  },
  SR: {
    gradient: 'from-violet-500 via-purple-500 to-fuchsia-500',
    glow: 'shadow-[0_0_50px_rgba(139,92,246,0.4)]',
    textColor: 'text-violet-400',
    borderColor: 'border-violet-400/30',
    bgColor: 'bg-violet-500/20',
    percent: '15%',
    ring: 'ring-violet-400/50',
  },
  R: {
    gradient: 'from-cyan-400 via-blue-500 to-indigo-500',
    glow: 'shadow-[0_0_40px_rgba(59,130,246,0.35)]',
    textColor: 'text-blue-400',
    borderColor: 'border-blue-400/30',
    bgColor: 'bg-blue-500/20',
    percent: '30%',
    ring: 'ring-blue-400/50',
  },
  N: {
    gradient: 'from-zinc-400 via-zinc-500 to-zinc-600',
    glow: 'shadow-[0_0_30px_rgba(161,161,170,0.25)]',
    textColor: 'text-zinc-300',
    borderColor: 'border-zinc-500/30',
    bgColor: 'bg-zinc-500/20',
    percent: '50%',
    ring: 'ring-zinc-400/50',
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
      {/* 外边框发光效果 */}
      <div className={`absolute inset-0 rounded-3xl ring-2 ${config.ring}`} />

      {/* 背景图 */}
      <div className="absolute inset-0">
        <img
          src={image}
          alt={title}
          className="w-full h-full object-cover"
        />
        {/* 渐变遮罩 - 从底部到中间 */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
        {/* 顶部轻微遮罩 */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-transparent" />
      </div>

      {/* 稀有度标签 */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10">
        <motion.div
          initial={{ opacity: 0, scale: 0, y: -20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
          className={`px-5 py-2 rounded-full bg-gradient-to-r ${config.gradient} text-white font-bold tracking-wide flex items-center gap-2 shadow-lg`}
        >
          <span className="text-sm">{rarity}</span>
          <span className="text-xs font-normal opacity-90">{config.percent}</span>
        </motion.div>
      </div>

      {/* 底部信息区域 */}
      <div className="absolute bottom-0 left-0 right-0 p-5 z-10">
        {/* 毛玻璃背景 */}
        <div className={`absolute inset-0 ${config.bgColor} backdrop-blur-sm rounded-t-2xl`} />

        {/* 内容 */}
        <div className="relative">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className={`text-xl sm:text-2xl font-bold ${config.textColor} mb-2 text-center drop-shadow-lg`}
          >
            {title}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="text-white/90 text-xs sm:text-sm text-center leading-relaxed"
          >
            {description}
          </motion.p>
        </div>
      </div>

      {/* 装饰性光效 */}
      {(rarity === 'SSR' || rarity === 'SR') && (
        <motion.div
          className="absolute inset-0 pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 0.3, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        >
          <div className={`absolute inset-0 bg-gradient-to-tr ${config.gradient} opacity-20`} />
        </motion.div>
      )}
    </motion.div>
  );
}
