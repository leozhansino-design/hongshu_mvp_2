'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { GachaCard } from '@/components/GachaCard';
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
  "正在评估它拆家的潜在能力...",
  "分析它假装听话的演技水平...",
  "计算它一天能产生多少表情包...",
  "正在联系它前世的档案馆...",
  "发现了！它果然在背后嫌弃你...",
  "正在匹配它在喵/汪届的社会地位...",
  "检测到超标的撒娇指数...",
  "您的宠物正在觉醒隐藏技能...",
  "警告：可爱程度即将溢出...",
  "正在生成它的霸道总裁人设...",
];

export default function GachaPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isRevealing, setIsRevealing] = useState(false);
  const [result, setResult] = useState<GachaResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [currentSubtitle, setCurrentSubtitle] = useState(FUNNY_SUBTITLES[0]);
  const [subtitleIndex, setSubtitleIndex] = useState(0);

  // 进度条动画 (约16秒)
  useEffect(() => {
    if (!isLoading) return;

    const duration = 16000; // 16秒
    const interval = 100; // 每100ms更新
    const increment = 100 / (duration / interval);

    const timer = setInterval(() => {
      setProgress(prev => {
        if (prev >= 95) return 95; // 最多到95%，等待实际完成
        return prev + increment;
      });
    }, interval);

    return () => clearInterval(timer);
  }, [isLoading]);

  // 字幕滚动
  useEffect(() => {
    if (!isLoading) return;

    const timer = setInterval(() => {
      setSubtitleIndex(prev => {
        const next = (prev + 1) % FUNNY_SUBTITLES.length;
        setCurrentSubtitle(FUNNY_SUBTITLES[next]);
        return next;
      });
    }, 2000); // 每2秒换一条

    return () => clearInterval(timer);
  }, [isLoading]);

  const generateResult = useCallback(async () => {
    const petImage = sessionStorage.getItem('petImage');
    const petType = sessionStorage.getItem('petType') as 'cat' | 'dog' | null;
    const weightsStr = sessionStorage.getItem('weights');
    const cdkeyCode = sessionStorage.getItem('cdkeyCode');

    if (!petImage || !petType || !weightsStr) {
      router.push('/upload');
      return;
    }

    if (!cdkeyCode) {
      router.push('/redeem');
      return;
    }

    const weights = JSON.parse(weightsStr);
    track(EVENTS.GACHA_START, { petType, weights });

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 60000); // 60秒超时

      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ petImage, petType, weights }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        if (response.status === 504) {
          throw new Error('服务器处理超时，请重试');
        }
        throw new Error(`请求失败: ${response.status}`);
      }

      const data = await response.json();

      if (data.success && data.data) {
        setProgress(100);
        setResult(data.data);
        track(EVENTS.GACHA_RESULT, {
          rarity: data.data.rarity,
          titleId: data.data.titleId,
          title: data.data.title,
        });
        track(EVENTS.API_GENERATION_SUCCESS, {
          rarity: data.data.rarity,
          prompt: data.data.prompt,
        });
      } else {
        setError(data.error || '生成失败，请重试');
        track(EVENTS.API_GENERATION_FAIL, { error: data.error });
      }
    } catch (err) {
      console.error('生成错误:', err);
      if (err instanceof Error) {
        if (err.name === 'AbortError') {
          setError('请求超时，请重试');
        } else {
          setError(err.message || '网络错误，请重试');
        }
      } else {
        setError('网络错误，请重试');
      }
      track(EVENTS.API_GENERATION_FAIL, { error: 'network_error' });
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  useEffect(() => {
    trackPageView('gacha');
    generateResult();
  }, [generateResult]);

  const handleCardClick = () => {
    if (!isLoading && result && !isRevealing) {
      setIsRevealing(true);
    }
  };

  const handleFlipComplete = () => {
    if (result) {
      sessionStorage.setItem('gachaResult', JSON.stringify(result));
      setTimeout(() => {
        router.push(`/result/${result.id}`);
      }, 1500);
    }
  };

  if (error) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center px-6 bg-white">
        <div className="text-center">
          <div className="text-6xl mb-6">😿</div>
          <h1 className="text-2xl font-semibold text-gray-900 mb-4">生成失败</h1>
          <p className="text-gray-500 mb-8">{error}</p>
          <button
            onClick={() => router.push('/redeem')}
            className="px-8 py-3 bg-gray-900 text-white rounded-full font-medium hover:bg-gray-800 transition-colors"
          >
            返回重试
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6 py-8 bg-white">
      {/* 加载中 */}
      {isLoading && (
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
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            身份解析中
          </h1>

          {/* 进度条 */}
          <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden mb-4">
            <motion.div
              className="h-full bg-gradient-to-r from-amber-400 via-violet-400 to-blue-400"
              initial={{ width: '0%' }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>

          {/* 进度百分比 */}
          <p className="text-sm text-gray-400 mb-6">
            {Math.round(progress)}%
          </p>

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
        </motion.div>
      )}

      {/* 卡牌展示 */}
      {!isLoading && result && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-sm"
          onClick={handleCardClick}
        >
          <GachaCard
            isRevealing={isRevealing}
            rarity={result.rarity}
            resultImage={result.generatedImage}
            title={result.title}
            description={result.description}
            onFlipComplete={handleFlipComplete}
          />

          {!isRevealing && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-center text-gray-500 mt-8"
            >
              点击卡牌揭晓身份
            </motion.p>
          )}
        </motion.div>
      )}
    </main>
  );
}
