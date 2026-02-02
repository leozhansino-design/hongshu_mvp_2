'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { trackPageView } from '@/lib/analytics';

// 示例卡牌数据
const EXAMPLE_CARDS = [
  {
    rarity: 'SSR',
    title: '量子神猫',
    gradient: 'from-amber-400 via-orange-500 to-rose-500',
    glow: 'shadow-[0_0_60px_rgba(251,191,36,0.3)]',
  },
  {
    rarity: 'SR',
    title: '黑帮教父',
    gradient: 'from-violet-500 via-purple-500 to-fuchsia-500',
    glow: 'shadow-[0_0_50px_rgba(139,92,246,0.25)]',
  },
  {
    rarity: 'R',
    title: '996架构师',
    gradient: 'from-cyan-400 via-blue-500 to-indigo-500',
    glow: 'shadow-[0_0_40px_rgba(59,130,246,0.2)]',
  },
  {
    rarity: 'N',
    title: '摆烂艺术家',
    gradient: 'from-zinc-400 via-zinc-500 to-zinc-600',
    glow: 'shadow-[0_0_30px_rgba(161,161,170,0.15)]',
  },
];

export default function HomePage() {
  useEffect(() => {
    trackPageView('home');
  }, []);

  return (
    <main className="min-h-screen flex flex-col">
      {/* Hero Section */}
      <section className="flex-1 flex flex-col items-center justify-center px-6 py-20 md:py-32">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.25, 0.1, 0.25, 1] }}
          className="text-center max-w-4xl mx-auto"
        >
          {/* 主标题 */}
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-semibold tracking-tight text-white mb-4">
            宠物命运鉴定
          </h1>

          {/* 副标题 */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.3 }}
            className="text-2xl md:text-3xl lg:text-4xl font-medium bg-gradient-to-r from-amber-200 via-yellow-300 to-orange-200 bg-clip-text text-transparent mb-6"
          >
            揭晓它的前世身份
          </motion.p>

          {/* 描述文字 */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.5 }}
            className="text-lg md:text-xl text-zinc-400 max-w-2xl mx-auto mb-12 leading-relaxed"
          >
            上传一张照片，回答五个问题
            <br className="hidden md:block" />
            AI 将为你的毛孩子生成专属命运卡牌
          </motion.p>

          {/* CTA 按钮 */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.7 }}
          >
            <Link href="/upload">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="group relative px-10 py-4 bg-white text-black font-medium text-lg rounded-full transition-all duration-300 hover:shadow-[0_0_40px_rgba(255,255,255,0.3)]"
              >
                开始鉴定
                <span className="inline-block ml-2 transition-transform duration-300 group-hover:translate-x-1">→</span>
              </motion.button>
            </Link>
          </motion.div>
        </motion.div>

        {/* 卡牌展示 */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 1 }}
          className="mt-20 md:mt-28 w-full max-w-5xl mx-auto px-4"
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {EXAMPLE_CARDS.map((card, index) => (
              <motion.div
                key={card.rarity}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 1.2 + index * 0.1 }}
                whileHover={{ y: -8, scale: 1.02 }}
                className={`aspect-[3/4] rounded-3xl bg-gradient-to-br ${card.gradient} ${card.glow} p-[1px] cursor-pointer transition-all duration-500`}
              >
                <div className="w-full h-full rounded-3xl bg-black/80 backdrop-blur-xl flex flex-col items-center justify-center p-4">
                  <span className="text-xs font-medium text-zinc-500 tracking-widest mb-2">
                    {card.rarity}
                  </span>
                  <span className={`text-sm md:text-base font-medium bg-gradient-to-r ${card.gradient} bg-clip-text text-transparent`}>
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
        transition={{ duration: 1, delay: 1.5 }}
        className="py-12 text-center border-t border-zinc-900"
      >
        <div className="max-w-4xl mx-auto px-6">
          {/* 概率说明 */}
          <div className="flex justify-center items-center gap-6 md:gap-10 text-sm text-zinc-600 mb-6">
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
              <span className="w-2 h-2 rounded-full bg-zinc-500" />
              N 50%
            </span>
          </div>

          <p className="text-zinc-700 text-sm">
            纯属娱乐 · 问答可影响概率
          </p>
        </div>
      </motion.footer>
    </main>
  );
}
