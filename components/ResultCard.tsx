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
    glow: 'shadow-[0_0_100px_rgba(251,191,36,0.4)]',
    textColor: 'text-amber-400',
    borderColor: 'border-amber-500/50',
  },
  SR: {
    gradient: 'from-violet-500 via-purple-500 to-fuchsia-500',
    glow: 'shadow-[0_0_80px_rgba(139,92,246,0.35)]',
    textColor: 'text-violet-400',
    borderColor: 'border-violet-500/50',
  },
  R: {
    gradient: 'from-cyan-400 via-blue-500 to-indigo-500',
    glow: 'shadow-[0_0_60px_rgba(59,130,246,0.3)]',
    textColor: 'text-blue-400',
    borderColor: 'border-blue-500/50',
  },
  N: {
    gradient: 'from-zinc-400 via-zinc-500 to-zinc-600',
    glow: 'shadow-[0_0_40px_rgba(161,161,170,0.2)]',
    textColor: 'text-zinc-400',
    borderColor: 'border-zinc-600/50',
  },
};

export function ResultCard({ rarity, title, description, image }: ResultCardProps) {
  const config = RARITY_CONFIG[rarity];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.6 }}
      className={`relative w-full max-w-sm mx-auto aspect-[9/16] rounded-3xl overflow-hidden ${config.glow} border ${config.borderColor}`}
    >
      {/* 背景图 */}
      <div className="absolute inset-0">
        <img
          src={image}
          alt={title}
          className="w-full h-full object-cover"
        />
        {/* 渐变遮罩 */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />
      </div>

      {/* 稀有度标签 */}
      <div className="absolute top-6 left-1/2 -translate-x-1/2">
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, type: 'spring' }}
          className={`px-5 py-2 rounded-full bg-gradient-to-r ${config.gradient} text-white font-bold tracking-wide`}
        >
          {rarity}
        </motion.div>
      </div>

      {/* 底部信息 */}
      <div className="absolute bottom-0 left-0 right-0 p-6">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className={`text-2xl md:text-3xl font-bold ${config.textColor} mb-3 text-center drop-shadow-lg`}
        >
          {title}
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="text-white/90 text-sm md:text-base text-center leading-relaxed"
        >
          {description}
        </motion.p>
      </div>
    </motion.div>
  );
}
