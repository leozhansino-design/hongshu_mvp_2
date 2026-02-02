'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { trackPageView } from '@/lib/analytics';
import { getUnlockProgress } from '@/lib/collection';

// 示例卡牌数据
const EXAMPLE_CARDS = [
  {
    rarity: 'SSR',
    title: '量子神喵',
    gradient: 'from-amber-400 via-orange-500 to-rose-500',
    shadow: 'shadow-lg shadow-orange-200/50',
  },
  {
    rarity: 'SR',
    title: '优雅贵族',
    gradient: 'from-violet-500 via-purple-500 to-fuchsia-500',
    shadow: 'shadow-lg shadow-purple-200/50',
  },
  {
    rarity: 'R',
    title: '打工达人',
    gradient: 'from-cyan-400 via-blue-500 to-indigo-500',
    shadow: 'shadow-lg shadow-blue-200/50',
  },
  {
    rarity: 'N',
    title: '快乐小傻瓜',
    gradient: 'from-gray-400 via-gray-500 to-gray-600',
    shadow: 'shadow-lg shadow-gray-200/50',
  },
];

export default function HomePage() {
  const [progress, setProgress] = useState({ unlocked: 0, total: 100, percent: 0 });

  useEffect(() => {
    trackPageView('home');
    setProgress(getUnlockProgress());
  }, []);

  return (
    <main className="min-h-screen flex flex-col bg-white">
      {/* 收藏入口 - 右上角 */}
      <div className="fixed top-4 right-4 z-50">
        <Link href="/collection">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-lg border border-gray-100"
          >
            <svg className="w-5 h-5 text-amber-500" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
            </svg>
            <span className="text-sm font-medium text-gray-700">{progress.unlocked}</span>
            <span className="text-xs text-gray-400">/ {progress.total}</span>
          </motion.div>
        </Link>
      </div>

      {/* Hero Section */}
      <section className="flex-1 flex flex-col items-center justify-center px-6 py-16 md:py-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
          className="text-center max-w-4xl mx-auto"
        >
          {/* 主标题 */}
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight text-gray-900 mb-4">
            宠物真实身份
          </h1>

          {/* 副标题 */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-xl md:text-2xl lg:text-3xl font-medium bg-gradient-to-r from-orange-500 via-pink-500 to-purple-500 bg-clip-text text-transparent mb-6"
          >
            AI 揭秘它的隐藏人格
          </motion.p>

          {/* 描述文字 */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-base md:text-lg text-gray-500 max-w-xl mx-auto mb-10 leading-relaxed"
          >
            上传一张照片，回答五个问题
            <br />
            AI 将生成你家毛孩子的专属身份卡牌
          </motion.p>

          {/* CTA 按钮 */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            <Link href="/upload">
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                className="px-10 py-4 bg-gradient-to-r from-orange-500 to-pink-500 text-white font-semibold text-lg rounded-full shadow-lg shadow-orange-200/50 hover:shadow-xl hover:shadow-orange-300/50 transition-all duration-300"
              >
                开始揭秘
                <span className="inline-block ml-2">→</span>
              </motion.button>
            </Link>
          </motion.div>
        </motion.div>

        {/* 卡牌展示 */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="mt-16 md:mt-20 w-full max-w-4xl mx-auto px-4"
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-5">
            {EXAMPLE_CARDS.map((card, index) => (
              <motion.div
                key={card.rarity}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 1 + index * 0.1 }}
                whileHover={{ y: -6 }}
                className={`aspect-[3/4] rounded-2xl bg-gradient-to-br ${card.gradient} ${card.shadow} p-[2px] cursor-pointer transition-all duration-300`}
              >
                <div className="w-full h-full rounded-2xl bg-white/90 backdrop-blur flex flex-col items-center justify-center p-4">
                  <span className={`text-xs font-bold tracking-widest mb-2 bg-gradient-to-r ${card.gradient} bg-clip-text text-transparent`}>
                    {card.rarity}
                  </span>
                  <span className="text-sm md:text-base font-semibold text-gray-800">
                    {card.title}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* 底部信息 */}
      <motion.footer
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 1.2 }}
        className="py-10 text-center border-t border-gray-100"
      >
        <div className="max-w-4xl mx-auto px-6">
          {/* 概率说明 */}
          <div className="flex justify-center items-center gap-5 md:gap-8 text-sm text-gray-400 mb-4">
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-gradient-to-r from-amber-400 to-orange-500" />
              SSR 5%
            </span>
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-gradient-to-r from-violet-500 to-purple-500" />
              SR 15%
            </span>
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-gradient-to-r from-cyan-400 to-blue-500" />
              R 30%
            </span>
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-gray-400" />
              N 50%
            </span>
          </div>

          <p className="text-gray-400 text-sm">
            纯属娱乐 · 问答可影响概率
          </p>
        </div>
      </motion.footer>
    </main>
  );
}
