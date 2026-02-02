'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
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

export default function GachaPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isRevealing, setIsRevealing] = useState(false);
  const [result, setResult] = useState<GachaResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [loadingText, setLoadingText] = useState('AI 正在揭秘你家毛孩子的真实身份');

  // 轮询任务状态
  const pollTaskStatus = useCallback(async (taskId: string): Promise<GachaResult | null> => {
    const maxAttempts = 60; // 最多轮询 60 次（约 2 分钟）
    const pollInterval = 2000; // 每 2 秒轮询一次

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      try {
        const response = await fetch(`/api/generate?taskId=${taskId}`);
        const data = await response.json();

        console.log(`轮询 #${attempt + 1}:`, data.status);

        if (data.status === 'completed' && data.data) {
          return data.data as GachaResult;
        }

        if (data.status === 'failed') {
          throw new Error(data.error || '生成失败');
        }

        // 更新加载提示
        if (attempt > 5) {
          setLoadingText('AI 正在精心创作中，请稍候...');
        }
        if (attempt > 15) {
          setLoadingText('即将完成，马上揭晓...');
        }

        // 等待后继续轮询
        await new Promise(resolve => setTimeout(resolve, pollInterval));
      } catch (err) {
        console.error('轮询错误:', err);
        throw err;
      }
    }

    throw new Error('生成超时，请重试');
  }, []);

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
      // 第一步：创建任务
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ petImage, petType, weights }),
      });

      const data = await response.json();

      if (!data.success || !data.taskId) {
        throw new Error(data.error || '创建任务失败');
      }

      console.log('任务已创建:', data.taskId);

      // 第二步：轮询等待结果
      const result = await pollTaskStatus(data.taskId);

      if (result) {
        setResult(result);
        track(EVENTS.GACHA_RESULT, {
          rarity: result.rarity,
          titleId: result.titleId,
          title: result.title,
        });
        track(EVENTS.API_GENERATION_SUCCESS, {
          rarity: result.rarity,
          prompt: result.prompt,
        });
      }
    } catch (err) {
      console.error('生成错误:', err);
      setError(err instanceof Error ? err.message : '网络错误，请重试');
      track(EVENTS.API_GENERATION_FAIL, { error: String(err) });
    } finally {
      setIsLoading(false);
    }
  }, [router, pollTaskStatus]);

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
      // 保存结果到 sessionStorage
      sessionStorage.setItem('gachaResult', JSON.stringify(result));

      // 延迟跳转到结果页
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
          className="text-center"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 2, ease: 'linear' }}
            className="text-6xl mb-6"
          >
            ✨
          </motion.div>
          <h1 className="text-2xl font-semibold text-gray-900 mb-2">
            身份解析中...
          </h1>
          <p className="text-gray-500">{loadingText}</p>
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
