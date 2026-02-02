'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { ResultCard } from '@/components/ResultCard';
import { ShareButton } from '@/components/ShareButton';
import { track, EVENTS, trackPageView } from '@/lib/analytics';
import { Rarity } from '@/lib/titles';
import { addToCollection, isCollected, getUnlockProgress } from '@/lib/collection';
import { supabase } from '@/lib/supabase';

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

// 宠物冷知识/趣味等待语
const PET_FUN_FACTS = [
  "猫咪每天睡眠时间长达16小时，是名副其实的睡神！",
  "狗狗的鼻纹就像人类指纹一样独一无二",
  "猫的呼噜声频率可以促进骨骼愈合",
  "狗狗能分辨超过250个词汇和手势",
  "猫咪不能尝出甜味，它们没有甜味受体",
  "狗的嗅觉比人类灵敏10000-100000倍",
  "猫咪一生中约70%的时间都在睡觉",
  "狗狗的听力是人类的4倍",
  "猫的耳朵有32块肌肉，可以独立旋转180度",
  "狗狗摇尾巴的方向能表达不同情绪",
  "猫咪走路时几乎无声，因为它们用脚尖走路",
  "狗的鼻子湿润是为了更好地吸收气味分子",
  "猫咪每天花30%的时间梳理毛发",
  "狗狗做梦时会抽动爪子，可能在梦里奔跑",
  "猫的心跳速度是人类的两倍",
  "狗狗可以感知主人的情绪变化",
  "猫咪有专门的\"喵喵叫\"只对人类使用",
  "狗的汗腺只在脚掌上",
  "猫咪的跳跃高度可达自身身高的6倍",
  "狗狗的忠诚度在动物界名列前茅",
];

export default function ResultPage() {
  const router = useRouter();
  const params = useParams();
  const [result, setResult] = useState<GachaResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [collected, setCollected] = useState(false);
  const [showCollectTip, setShowCollectTip] = useState(false);
  const [progress, setProgress] = useState({ unlocked: 0, total: 100, percent: 0 });
  const [currentFact, setCurrentFact] = useState(PET_FUN_FACTS[0]);
  const [factIndex, setFactIndex] = useState(0);
  const [loadingProgress, setLoadingProgress] = useState(0);

  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
  const pollingRef = useRef<NodeJS.Timeout | null>(null);

  const jobId = params.id as string;

  // 处理任务完成
  const handleJobComplete = useCallback((data: {
    id: string;
    rarity: Rarity;
    title_id: number;
    title: string;
    description: string;
    prompt: string;
    pet_image: string;
    generated_image: string;
    pet_type: 'cat' | 'dog';
  }) => {
    console.log('✅ 任务完成，展示结果');
    const resultData: GachaResult = {
      id: data.id,
      rarity: data.rarity,
      titleId: data.title_id,
      title: data.title,
      description: data.description,
      prompt: data.prompt,
      originalImage: data.pet_image,
      generatedImage: data.generated_image,
      petType: data.pet_type,
    };

    setResult(resultData);
    setIsLoading(false);
    setLoadingProgress(100);
    setCollected(isCollected(resultData.id));
    setProgress(getUnlockProgress());

    // 保存到 sessionStorage
    sessionStorage.setItem('gachaResult', JSON.stringify(resultData));

    track(EVENTS.GACHA_RESULT, {
      rarity: resultData.rarity,
      titleId: resultData.titleId,
      title: resultData.title,
    });
    track(EVENTS.API_GENERATION_SUCCESS, {
      rarity: resultData.rarity,
    });
  }, []);

  // 处理任务失败
  const handleJobFailed = useCallback((errorMessage: string) => {
    console.error('❌ 任务失败:', errorMessage);
    setError(errorMessage || '生成失败，请重试');
    setIsLoading(false);
    track(EVENTS.API_GENERATION_FAIL, { error: errorMessage });
  }, []);

  // 兜底轮询
  const pollStatus = useCallback(async () => {
    if (!jobId) return;

    try {
      console.log('🔄 轮询检查状态...');
      const response = await fetch(`/api/generate/status/${jobId}`);
      const data = await response.json();

      if (data.status === 'completed' && data.data) {
        handleJobComplete({
          id: data.data.id,
          rarity: data.data.rarity,
          title_id: data.data.titleId,
          title: data.data.title,
          description: data.data.description,
          prompt: data.data.prompt,
          pet_image: data.data.originalImage,
          generated_image: data.data.generatedImage,
          pet_type: data.data.petType,
        });
        // 停止轮询
        if (pollingRef.current) {
          clearInterval(pollingRef.current);
          pollingRef.current = null;
        }
      } else if (data.status === 'failed') {
        handleJobFailed(data.error);
        if (pollingRef.current) {
          clearInterval(pollingRef.current);
          pollingRef.current = null;
        }
      }
    } catch (err) {
      console.error('轮询错误:', err);
    }
  }, [jobId, handleJobComplete, handleJobFailed]);

  // 初始化 Realtime 订阅
  useEffect(() => {
    if (!jobId) return;

    trackPageView('result');
    console.log('🔌 初始化 Realtime 订阅:', jobId);

    // 首先检查是否已有结果（从 sessionStorage）
    const resultStr = sessionStorage.getItem('gachaResult');
    if (resultStr) {
      try {
        const parsedResult = JSON.parse(resultStr) as GachaResult;
        if (parsedResult.id === jobId && parsedResult.generatedImage) {
          console.log('📦 从缓存加载结果');
          setResult(parsedResult);
          setIsLoading(false);
          setCollected(isCollected(parsedResult.id));
          setProgress(getUnlockProgress());
          return;
        }
      } catch (e) {
        console.error('解析缓存失败:', e);
      }
    }

    // 设置 Realtime 订阅
    const channel = supabase
      .channel(`job-${jobId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'generation_jobs',
          filter: `id=eq.${jobId}`,
        },
        (payload) => {
          console.log('📡 Realtime 收到更新:', payload.new);
          const newData = payload.new as {
            status: string;
            generated_image?: string;
            error_message?: string;
            id: string;
            rarity: Rarity;
            title_id: number;
            title: string;
            description: string;
            prompt: string;
            pet_image: string;
            pet_type: 'cat' | 'dog';
          };

          if (newData.status === 'completed' && newData.generated_image) {
            handleJobComplete(newData as Parameters<typeof handleJobComplete>[0]);
          } else if (newData.status === 'failed') {
            handleJobFailed(newData.error_message || '生成失败');
          }
        }
      )
      .subscribe((status) => {
        console.log('📡 Realtime 订阅状态:', status);
      });

    channelRef.current = channel;

    // 首次立即检查状态
    pollStatus();

    // 设置兜底轮询（每 10 秒）
    pollingRef.current = setInterval(pollStatus, 10000);

    return () => {
      console.log('🔌 清理 Realtime 订阅');
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
      }
    };
  }, [jobId, pollStatus, handleJobComplete, handleJobFailed]);

  // 趣味内容轮播
  useEffect(() => {
    if (!isLoading) return;

    const timer = setInterval(() => {
      setFactIndex(prev => {
        const next = (prev + 1) % PET_FUN_FACTS.length;
        setCurrentFact(PET_FUN_FACTS[next]);
        return next;
      });
    }, 4000);

    return () => clearInterval(timer);
  }, [isLoading]);

  // 进度条动画
  useEffect(() => {
    if (!isLoading) return;

    const timer = setInterval(() => {
      setLoadingProgress(prev => {
        if (prev >= 90) return 90;
        return prev + 0.5;
      });
    }, 100);

    return () => clearInterval(timer);
  }, [isLoading]);

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
    sessionStorage.removeItem('gachaResult');
    sessionStorage.removeItem('cdkeyCode');
    sessionStorage.removeItem('weights');
    sessionStorage.removeItem('answers');
    sessionStorage.removeItem('currentJobId');
    router.push('/upload');
  };

  // 加载状态
  if (isLoading) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center px-6 py-8 bg-white">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="w-full max-w-sm text-center"
        >
          {/* 动画图标 */}
          <div className="relative w-32 h-32 mx-auto mb-8">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 3, ease: 'linear' }}
              className="absolute inset-0 rounded-full border-4 border-transparent border-t-amber-400 border-r-violet-400"
            />
            <motion.div
              animate={{ rotate: -360 }}
              transition={{ repeat: Infinity, duration: 2, ease: 'linear' }}
              className="absolute inset-4 rounded-full border-4 border-transparent border-b-blue-400 border-l-pink-400"
            />
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
              className="absolute inset-0 flex items-center justify-center text-5xl"
            >
              🎨
            </motion.div>
          </div>

          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            AI 正在创作中
          </h1>
          <p className="text-gray-500 mb-6">
            请耐心等待，马上就好...
          </p>

          {/* 进度条 */}
          <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden mb-6">
            <motion.div
              className="h-full bg-gradient-to-r from-amber-400 via-violet-400 to-blue-400"
              initial={{ width: '0%' }}
              animate={{ width: `${loadingProgress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>

          {/* 宠物冷知识 */}
          <div className="bg-amber-50 rounded-2xl p-4 min-h-[100px] flex items-center justify-center">
            <AnimatePresence mode="wait">
              <motion.div
                key={factIndex}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="text-center"
              >
                <p className="text-xs text-amber-600 mb-2">🐾 宠物冷知识</p>
                <p className="text-amber-800 text-sm leading-relaxed">
                  {currentFact}
                </p>
              </motion.div>
            </AnimatePresence>
          </div>
        </motion.div>
      </main>
    );
  }

  // 错误状态
  if (error) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center px-6 bg-white">
        <div className="text-center">
          <div className="text-6xl mb-6">😿</div>
          <h1 className="text-2xl font-semibold text-gray-900 mb-4">生成失败</h1>
          <p className="text-gray-500 mb-8">{error}</p>
          <button
            onClick={handleRetry}
            className="px-8 py-3 bg-gray-900 text-white rounded-full font-medium hover:bg-gray-800 transition-colors"
          >
            返回重试
          </button>
        </div>
      </main>
    );
  }

  // 没有结果
  if (!result) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-white">
        <div className="animate-pulse-soft text-4xl">✨</div>
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
