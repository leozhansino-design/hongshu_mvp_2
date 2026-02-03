'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { track, EVENTS, trackPageView } from '@/lib/analytics';

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

export default function GachaPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [currentSubtitle, setCurrentSubtitle] = useState(FUNNY_SUBTITLES[0]);
  const [subtitleIndex, setSubtitleIndex] = useState(0);

  // 字幕滚动
  useEffect(() => {
    const timer = setInterval(() => {
      setSubtitleIndex(prev => {
        const next = (prev + 1) % FUNNY_SUBTITLES.length;
        setCurrentSubtitle(FUNNY_SUBTITLES[next]);
        return next;
      });
    }, 2000);

    return () => clearInterval(timer);
  }, []);

  const generateImage = useCallback(async () => {
    const petImage = sessionStorage.getItem('petImage');
    const petType = sessionStorage.getItem('petType');
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
      // 使用异步模式：创建任务然后跳转到结果页轮询
      console.log('📤 创建生成任务...');
      const response = await fetch('/api/generate/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ petImage, petType, weights }),
      });

      if (!response.ok) {
        const text = await response.text();
        console.error('API 错误响应:', response.status, text);
        try {
          const errorData = JSON.parse(text);
          throw new Error(errorData.error || `创建任务失败 (${response.status})`);
        } catch (e) {
          if (e instanceof SyntaxError) {
            throw new Error(`服务错误 (${response.status})`);
          }
          throw e;
        }
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || '创建任务失败');
      }

      console.log('✅ 任务创建成功:', data.data.jobId);
      console.log('📝 发送的 Prompt:', data.data.prompt);

      // 保存任务ID到 sessionStorage
      sessionStorage.setItem('currentJobId', data.data.jobId);

      // 跳转到结果页面（结果页面会轮询状态）
      router.push(`/result/${data.data.jobId}`);

    } catch (err) {
      console.error('生成错误:', err);
      const errorMessage = err instanceof Error ? err.message : '生成失败，请重试';
      setError(errorMessage);
      track(EVENTS.API_GENERATION_FAIL, { error: errorMessage });
    }
  }, [router]);

  useEffect(() => {
    trackPageView('gacha');
    generateImage();
  }, [generateImage]);

  if (error) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center px-6 bg-white">
        <div className="text-center">
          <div className="text-6xl mb-6">😿</div>
          <h1 className="text-2xl font-semibold text-gray-900 mb-4">生成失败</h1>
          <p className="text-gray-500 mb-8">{error}</p>
          <div className="space-y-3">
            <button
              onClick={() => {
                setError(null);
                generateImage();
              }}
              className="w-full px-8 py-3 bg-amber-500 text-white rounded-full font-medium hover:bg-amber-600 transition-colors"
            >
              重新生成
            </button>
            <button
              onClick={() => router.push('/redeem')}
              className="w-full px-8 py-3 bg-gray-200 text-gray-700 rounded-full font-medium hover:bg-gray-300 transition-colors"
            >
              返回
            </button>
          </div>
        </div>
      </main>
    );
  }

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
          AI 正在创作中
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
