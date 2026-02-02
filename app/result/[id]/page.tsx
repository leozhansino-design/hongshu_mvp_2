'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ResultCard } from '@/components/ResultCard';
import { ShareButton } from '@/components/ShareButton';
import { track, EVENTS, trackPageView } from '@/lib/analytics';
import { Rarity } from '@/lib/titles';

interface GachaResult {
  id: string;
  rarity: Rarity;
  titleId: number;
  title: string;
  description: string;
  prompt: string;
  originalImage: string;
  generatedImage: string;
  petType: 'cat' | 'dog';
}

export default function ResultPage() {
  const router = useRouter();
  const params = useParams();
  const [result, setResult] = useState<GachaResult | null>(null);

  useEffect(() => {
    trackPageView('result');

    // 从 sessionStorage 获取结果
    const resultStr = sessionStorage.getItem('gachaResult');

    if (!resultStr) {
      router.push('/');
      return;
    }

    const parsedResult = JSON.parse(resultStr) as GachaResult;

    // 验证结果 ID 是否匹配
    if (parsedResult.id !== params.id) {
      router.push('/');
      return;
    }

    setResult(parsedResult);
    track(EVENTS.RESULT_VIEW, {
      rarity: parsedResult.rarity,
      titleId: parsedResult.titleId,
      title: parsedResult.title,
    });
  }, [params.id, router]);

  const handleRetry = () => {
    track(EVENTS.RETRY_CLICK);
    // 清除之前的数据
    sessionStorage.removeItem('gachaResult');
    sessionStorage.removeItem('cdkeyCode');
    sessionStorage.removeItem('weights');
    sessionStorage.removeItem('answers');
    router.push('/upload');
  };

  if (!result) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="animate-spin text-4xl">🔮</div>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex flex-col px-6 py-8">
      {/* 顶部导航 */}
      <nav className="flex items-center justify-between mb-8">
        <Link href="/" className="text-zinc-500 hover:text-white transition-colors">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </Link>
        <span className="text-zinc-600 text-sm">鉴定完成</span>
        <div className="w-6" />
      </nav>

      {/* 结果标题 */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <h1 className="text-2xl font-semibold text-white mb-2">
          命运鉴定结果
        </h1>
        <p className="text-zinc-500">
          你家毛孩子的前世身份揭晓！
        </p>
      </motion.div>

      {/* 结果卡牌 */}
      <div className="flex-1 flex items-center justify-center mb-8">
        <ResultCard
          rarity={result.rarity}
          title={result.title}
          description={result.description}
          image={result.generatedImage}
        />
      </div>

      {/* 底部按钮 */}
      <div className="max-w-sm mx-auto w-full space-y-4">
        <ShareButton
          title={result.title}
          rarity={result.rarity}
          resultId={result.id}
        />

        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleRetry}
          className="w-full py-4 rounded-full border-2 border-zinc-700 text-zinc-400 font-medium text-lg hover:border-zinc-500 hover:text-white transition-all duration-300"
        >
          再测一次
        </motion.button>
      </div>

      {/* 底部提示 */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="text-center text-zinc-700 text-xs mt-6"
      >
        结果仅供娱乐，请勿当真 🐾
      </motion.p>
    </main>
  );
}
