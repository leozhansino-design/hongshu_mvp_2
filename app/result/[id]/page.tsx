'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ResultCard } from '@/components/ResultCard';
import { ShareButton } from '@/components/ShareButton';
import { track, EVENTS, trackPageView } from '@/lib/analytics';
import { Rarity } from '@/lib/titles';
import { addToCollection, isCollected, getUnlockProgress } from '@/lib/collection';

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
  const [collected, setCollected] = useState(false);
  const [showCollectTip, setShowCollectTip] = useState(false);
  const [progress, setProgress] = useState({ unlocked: 0, total: 100, percent: 0 });

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
    setCollected(isCollected(parsedResult.id));
    setProgress(getUnlockProgress());

    track(EVENTS.RESULT_VIEW, {
      rarity: parsedResult.rarity,
      titleId: parsedResult.titleId,
      title: parsedResult.title,
    });
  }, [params.id, router]);

  const handleCollect = () => {
    if (!result || collected) return;

    const success = addToCollection({
      id: result.id,
      titleId: result.titleId,
      title: result.title,
      rarity: result.rarity,
      description: result.description,
      image: result.generatedImage,
      petType: result.petType,
    });

    if (success) {
      setCollected(true);
      setProgress(getUnlockProgress());
      setShowCollectTip(true);
      setTimeout(() => setShowCollectTip(false), 2000);
      track(EVENTS.SHARE_CLICK, { action: 'collect', rarity: result.rarity, title: result.title });
    }
  };

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
      <main className="min-h-screen flex items-center justify-center bg-white">
        <div className="animate-pulse-soft text-4xl">✨</div>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex flex-col px-6 py-8 bg-white">
      {/* 顶部导航 */}
      <nav className="flex items-center justify-between mb-6">
        <Link href="/" className="text-gray-400 hover:text-gray-600 transition-colors">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </Link>
        <span className="text-gray-400 text-sm">揭秘完成</span>
        <Link href="/collection" className="text-gray-400 hover:text-gray-600 transition-colors">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
        </Link>
      </nav>

      {/* 结果标题 */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-6"
      >
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          真实身份揭晓
        </h1>
        <p className="text-gray-500">
          你家毛孩子的隐藏人格
        </p>
      </motion.div>

      {/* 结果卡牌 */}
      <div className="flex-1 flex items-center justify-center mb-6">
        <ResultCard
          rarity={result.rarity}
          title={result.title}
          description={result.description}
          image={result.generatedImage}
        />
      </div>

      {/* 底部按钮 */}
      <div className="max-w-sm mx-auto w-full space-y-3">
        {/* 收藏按钮 */}
        <div className="flex gap-3">
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleCollect}
            disabled={collected}
            className={`flex-1 py-4 rounded-full font-medium text-lg transition-all duration-300 flex items-center justify-center gap-2 ${
              collected
                ? 'bg-amber-100 text-amber-600 border-2 border-amber-200'
                : 'bg-amber-500 text-white hover:bg-amber-600'
            }`}
          >
            {collected ? (
              <>
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                </svg>
                <span>已收藏</span>
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                <span>收藏</span>
              </>
            )}
          </motion.button>

          {/* 查看收藏进度 */}
          <Link href="/collection">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="py-4 px-4 rounded-full bg-gray-100 text-gray-700 font-medium flex items-center gap-2"
            >
              <span className="text-lg">{progress.unlocked}</span>
              <span className="text-xs text-gray-400">/{progress.total}</span>
            </motion.div>
          </Link>
        </div>

        <ShareButton
          title={result.title}
          rarity={result.rarity}
          image={result.generatedImage}
          description={result.description}
        />

        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleRetry}
          className="w-full py-4 rounded-full border-2 border-gray-200 text-gray-500 font-medium text-lg hover:border-gray-300 hover:text-gray-700 transition-all duration-300"
        >
          再测一次
        </motion.button>
      </div>

      {/* 收藏成功提示 */}
      {showCollectTip && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          className="fixed bottom-24 left-1/2 -translate-x-1/2 bg-gray-900 text-white px-6 py-3 rounded-full text-sm font-medium shadow-lg"
        >
          已加入收藏！解锁进度 {progress.unlocked}/{progress.total}
        </motion.div>
      )}

      {/* 底部提示 */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="text-center text-gray-400 text-xs mt-6"
      >
        结果仅供娱乐
      </motion.p>
    </main>
  );
}
