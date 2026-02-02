'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { CdkeyInput } from '@/components/CdkeyInput';
import { track, EVENTS, trackPageView } from '@/lib/analytics';

export default function RedeemPage() {
  const router = useRouter();
  const [isVerifying, setIsVerifying] = useState(false);
  const [petImage, setPetImage] = useState<string | null>(null);

  useEffect(() => {
    trackPageView('redeem');

    // 检查是否有宠物图片
    const image = sessionStorage.getItem('petImage');
    const answers = sessionStorage.getItem('answers');

    if (!image || !answers) {
      router.push('/upload');
      return;
    }

    setPetImage(image);
  }, [router]);

  const handleVerify = async (code: string): Promise<boolean> => {
    setIsVerifying(true);
    track(EVENTS.CDKEY_VERIFY, { code });

    try {
      const response = await fetch('/api/cdkey/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
      });

      const data = await response.json();

      if (data.success) {
        track(EVENTS.CDKEY_SUCCESS, { code });
        sessionStorage.setItem('cdkeyCode', code);
        router.push('/gacha');
        return true;
      } else {
        track(EVENTS.CDKEY_FAIL, { code, error: data.error });
        return false;
      }
    } catch (error) {
      console.error('验证错误:', error);
      track(EVENTS.CDKEY_FAIL, { code, error: 'network_error' });
      return false;
    } finally {
      setIsVerifying(false);
    }
  };

  const handlePayClick = () => {
    track(EVENTS.BTN_PAY_CLICK);
    // TODO: 跳转到购买页面或显示购买弹窗
    alert('购买功能开发中...\n\n测试卡密：TEST001、DEMO123、VIP888');
  };

  if (!petImage) {
    return null;
  }

  return (
    <main className="min-h-screen flex flex-col px-6 py-8">
      {/* 顶部导航 */}
      <nav className="flex items-center justify-between mb-12">
        <Link
          href="/questions"
          className="text-zinc-500 hover:text-white transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <span className="text-zinc-600 text-sm">步骤 3/3</span>
        <div className="w-6" />
      </nav>

      {/* 主内容 */}
      <div className="flex-1 flex flex-col max-w-md mx-auto w-full">
        {/* 标题 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <h1 className="text-3xl md:text-4xl font-semibold text-white mb-3">
            验证卡密
          </h1>
          <p className="text-zinc-500">
            输入卡密解锁命运鉴定
          </p>
        </motion.div>

        {/* 宠物预览 */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="flex justify-center mb-10"
        >
          <div className="relative">
            <div className="w-24 h-24 rounded-2xl overflow-hidden border-2 border-zinc-700 bg-zinc-900">
              <img
                src={petImage}
                alt="宠物"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-zinc-800 rounded-full flex items-center justify-center text-xl">
              🔮
            </div>
          </div>
        </motion.div>

        {/* 卡密输入 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <CdkeyInput onVerify={handleVerify} isVerifying={isVerifying} />
        </motion.div>

        {/* 分隔线 */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="flex items-center gap-4 mb-8"
        >
          <div className="flex-1 h-px bg-zinc-800" />
          <span className="text-zinc-600 text-sm">没有卡密？</span>
          <div className="flex-1 h-px bg-zinc-800" />
        </motion.div>

        {/* 购买按钮 */}
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          onClick={handlePayClick}
          className="w-full py-4 rounded-full font-medium text-lg border-2 border-zinc-700 text-zinc-400 hover:border-zinc-500 hover:text-white transition-all duration-300"
        >
          获取卡密
        </motion.button>

        {/* 底部提示 */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center text-zinc-700 text-xs mt-8"
        >
          测试卡密：TEST001、DEMO123、VIP888
        </motion.p>
      </div>
    </main>
  );
}
