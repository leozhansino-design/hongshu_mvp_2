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

    // 显示进度提示
    const progressTimer = setInterval(() => {
      setLoadingText(prev => {
        if (prev.includes('精心创作')) return '即将完成，马上揭晓...';
        if (prev.includes('揭秘')) return 'AI 正在精心创作中，请稍候...';
        return prev;
      });
    }, 5000);

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ petImage, petType, weights }),
      });

      const data = await response.json();

      if (data.success && data.data) {
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
        setError(data.error || '生成失败');
        track(EVENTS.API_GENERATION_FAIL, { error: data.error });
      }
    } catch (err) {
      console.error('生成错误:', err);
      setError('网络错误，请重试');
      track(EVENTS.API_GENERATION_FAIL, { error: 'network_error' });
    } finally {
      clearInterval(progressTimer);
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
