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

  const createJob = useCallback(async () => {
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
      // 创建任务
      console.log('📤 创建生成任务...');
      const startResponse = await fetch('/api/generate/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ petImage, petType, weights }),
      });

      if (!startResponse.ok) {
        const errorData = await startResponse.json();
        throw new Error(errorData.error || '创建任务失败');
      }

      const startData = await startResponse.json();
      if (!startData.success || !startData.data?.jobId) {
        throw new Error(startData.error || '创建任务失败');
      }

      const jobId = startData.data.jobId;
      console.log('✅ 任务创建成功:', jobId);

      // 保存任务信息到 sessionStorage
      sessionStorage.setItem('currentJobId', jobId);
      sessionStorage.setItem('jobRarity', startData.data.rarity);
      sessionStorage.setItem('jobTitle', startData.data.title);

      // 立即跳转到结果页面（结果页面会处理 Realtime 监听）
      router.push(`/result/${jobId}`);

    } catch (err) {
      console.error('创建任务错误:', err);
      setError(err instanceof Error ? err.message : '创建任务失败，请重试');
      track(EVENTS.API_GENERATION_FAIL, { error: err instanceof Error ? err.message : 'unknown' });
    }
  }, [router]);

  useEffect(() => {
    trackPageView('gacha');
    createJob();
  }, [createJob]);

  if (error) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center px-6 bg-white">
        <div className="text-center">
          <div className="text-6xl mb-6">😿</div>
          <h1 className="text-2xl font-semibold text-gray-900 mb-4">创建失败</h1>
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
          正在准备抽卡...
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
      </motion.div>
    </main>
  );
}
