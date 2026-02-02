'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { ResultCard } from '@/components/ResultCard';
import { ShareButton } from '@/components/ShareButton';
import { track, EVENTS, trackPageView } from '@/lib/analytics';
import { Rarity } from '@/lib/titles';
import { addToCollection, isCollected, getUnlockProgress } from '@/lib/collection';
import { playRevealSound, playSuccessSound } from '@/lib/sounds';

// 搞怪字幕列表
const FUNNY_SUBTITLES = [
  "正在分析您家主子的眼神杀伤力...",
  "AI正在被您的宠物萌到宕机...",
  "正在翻译喵星语/汪星语...",
  "检测到高浓度可爱因子，处理中...",
  "您的宠物档案已被银河联邦调阅...",
  "正在计算它每天到底睡了多少小时...",
  "分析毛发中隐藏的贵族血统...",
  "扫描中...发现它偷吃零食的证据...",
  "正在破解它发呆时在想什么...",
  "检测到作精体质，正在量化等级...",
];

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
  const [isLoading, setIsLoading] = useState(true);
  const [loadingStatus, setLoadingStatus] = useState('正在生成...');
  const [error, setError] = useState<string | null>(null);
  const [currentSubtitle, setCurrentSubtitle] = useState(FUNNY_SUBTITLES[0]);
  const [subtitleIndex, setSubtitleIndex] = useState(0);

  const resultId = params.id as string;
  const pollingRef = useRef<NodeJS.Timeout | null>(null);
  const edgeFunctionCalledRef = useRef(false);

  // 字幕滚动
  useEffect(() => {
    if (!isLoading) return;
    const timer = setInterval(() => {
      setSubtitleIndex(prev => {
        const next = (prev + 1) % FUNNY_SUBTITLES.length;
        setCurrentSubtitle(FUNNY_SUBTITLES[next]);
        return next;
      });
    }, 2000);
    return () => clearInterval(timer);
  }, [isLoading]);

  // 调用 Supabase Edge Function（从浏览器直接调用，无超时限制）
  const callEdgeFunction = useCallback(async (jobId: string) => {
    if (edgeFunctionCalledRef.current) return;
    edgeFunctionCalledRef.current = true;

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      console.error('Missing Supabase config');
      return;
    }

    try {
      console.log('🚀 从浏览器调用 Edge Function...');
      const response = await fetch(`${supabaseUrl}/functions/v1/generate-image`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${supabaseAnonKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ jobId }),
      });

      const data = await response.json();
      console.log('📦 Edge Function 响应:', data);

      if (data.success && data.status === 'completed') {
        console.log('✅ Edge Function 处理完成');
      }
    } catch (err) {
      console.error('Edge Function 调用失败:', err);
      // 重置标志，允许重试
      edgeFunctionCalledRef.current = false;
    }
  }, []);

  // 轮询任务状态
  const pollStatus = useCallback(async (jobId: string) => {
    try {
      const response = await fetch(`/api/generate/status/${jobId}`);
      const data = await response.json();

      console.log('📊 轮询状态:', data);

      if (data.status === 'completed' && data.data) {
        // 生成完成
        console.log('✅ 生成完成!');
        setIsLoading(false);

        const gachaResult: GachaResult = {
          id: data.data.id,
          rarity: data.data.rarity,
          titleId: data.data.titleId,
          title: data.data.title,
          description: data.data.description,
          prompt: data.data.prompt,
          originalImage: data.data.originalImage,
          generatedImage: data.data.generatedImage,
          petType: data.data.petType,
        };

        setResult(gachaResult);
        setCollected(isCollected(gachaResult.id));
        setProgress(getUnlockProgress());

        // 播放揭示音效
        playRevealSound(gachaResult.rarity);

        // 保存到 sessionStorage
        sessionStorage.setItem('gachaResult', JSON.stringify(gachaResult));

        track(EVENTS.GACHA_RESULT, {
          rarity: gachaResult.rarity,
          titleId: gachaResult.titleId,
          title: gachaResult.title,
        });

        // 停止轮询
        if (pollingRef.current) {
          clearInterval(pollingRef.current);
          pollingRef.current = null;
        }
      } else if (data.status === 'failed') {
        // 生成失败
        console.error('❌ 生成失败:', data.error);
        setError(data.error || '生成失败，请重试');
        setIsLoading(false);

        if (pollingRef.current) {
          clearInterval(pollingRef.current);
          pollingRef.current = null;
        }
      } else if (data.status === 'processing') {
        setLoadingStatus('AI 正在创作中...');
      } else if (data.status === 'pending') {
        setLoadingStatus('等待处理...');
        // 如果仍在 pending，尝试再次调用 Edge Function
        edgeFunctionCalledRef.current = false;
        callEdgeFunction(jobId);
      }
    } catch (err) {
      console.error('轮询失败:', err);
    }
  }, [callEdgeFunction]);

  useEffect(() => {
    trackPageView('result');

    // 先检查是否已有结果
    const resultStr = sessionStorage.getItem('gachaResult');
    if (resultStr) {
      try {
        const parsedResult = JSON.parse(resultStr) as GachaResult;
        if (parsedResult.generatedImage && parsedResult.id === resultId) {
          setResult(parsedResult);
          setCollected(isCollected(parsedResult.id));
          setProgress(getUnlockProgress());
          setIsLoading(false);

          track(EVENTS.GACHA_RESULT, {
            rarity: parsedResult.rarity,
            titleId: parsedResult.titleId,
            title: parsedResult.title,
          });
          return;
        }
      } catch {
        // 忽略解析错误
      }
    }

    // 检查是否有任务ID
    const jobId = sessionStorage.getItem('currentJobId');
    if (!jobId || jobId !== resultId) {
      router.push('/');
      return;
    }

    // 开始轮询
    console.log('🔄 开始轮询任务状态:', jobId);

    // 立即调用一次 Edge Function（从浏览器直接调用）
    callEdgeFunction(jobId);

    // 立即轮询一次
    pollStatus(jobId);

    // 设置轮询间隔（每 3 秒）
    pollingRef.current = setInterval(() => {
      pollStatus(jobId);
    }, 3000);

    // 清理
    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
        pollingRef.current = null;
      }
    };
  }, [resultId, router, pollStatus, callEdgeFunction]);

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
      playSuccessSound(); // 播放收藏成功音效
      setTimeout(() => setShowCollectTip(false), 2000);
      track(EVENTS.SHARE_CLICK, { action: 'collect', rarity: result.rarity, title: result.title });
    }
  };

  const handleRetry = () => {
    track(EVENTS.RETRY_CLICK);
    sessionStorage.removeItem('gachaResult');
    sessionStorage.removeItem('cdkeyCode');
    sessionStorage.removeItem('weights');
    sessionStorage.removeItem('answers');
    sessionStorage.removeItem('currentJobId');
    router.push('/upload');
  };

  const handleRetryFromError = () => {
    setError(null);
    setIsLoading(true);
    edgeFunctionCalledRef.current = false;
    const jobId = sessionStorage.getItem('currentJobId');
    if (jobId) {
      callEdgeFunction(jobId);
      pollStatus(jobId);
      pollingRef.current = setInterval(() => {
        pollStatus(jobId);
      }, 3000);
    }
  };

  // 错误状态
  if (error) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center px-6 bg-white">
        <div className="text-center">
          <div className="text-6xl mb-6">😿</div>
          <h1 className="text-2xl font-semibold text-gray-900 mb-4">生成失败</h1>
          <p className="text-gray-500 mb-8">{error}</p>
          <div className="space-y-3">
            <button
              onClick={handleRetryFromError}
              className="w-full px-8 py-3 bg-amber-500 text-white rounded-full font-medium hover:bg-amber-600 transition-colors"
            >
              重新生成
            </button>
            <button
              onClick={() => router.push('/upload')}
              className="w-full px-8 py-3 bg-gray-200 text-gray-700 rounded-full font-medium hover:bg-gray-300 transition-colors"
            >
              返回
            </button>
          </div>
        </div>
      </main>
    );
  }

  // 加载状态
  if (isLoading || !result) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center px-6 py-8 bg-white">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="w-full max-w-sm text-center"
        >
          {/* 动画图标 */}
          <div className="relative w-32 h-32 mx-auto mb-8">
            {/* 外圈旋转 */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 3, ease: 'linear' }}
              className="absolute inset-0 rounded-full border-4 border-transparent border-t-amber-400 border-r-violet-400"
            />
            {/* 内圈反向旋转 */}
            <motion.div
              animate={{ rotate: -360 }}
              transition={{ repeat: Infinity, duration: 2, ease: 'linear' }}
              className="absolute inset-4 rounded-full border-4 border-transparent border-b-blue-400 border-l-pink-400"
            />
            {/* 中心图标 */}
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
              className="absolute inset-0 flex items-center justify-center text-5xl"
            >
              ✨
            </motion.div>
          </div>

          {/* 标题 */}
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            {loadingStatus}
          </h1>

          {/* 滚动字幕 */}
          <div className="h-12 overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.p
                key={subtitleIndex}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="text-gray-500 text-sm"
              >
                {currentSubtitle}
              </motion.p>
            </AnimatePresence>
          </div>

          {/* 提示 */}
          <p className="text-xs text-gray-400 mt-8">
            生成需要约 30-60 秒，请耐心等待
          </p>
        </motion.div>
      </main>
    );
  }

  // 展示结果
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
