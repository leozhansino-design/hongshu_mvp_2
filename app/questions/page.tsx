'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { QuestionCard } from '@/components/QuestionCard';
import { QUESTIONS, calculateTotalWeight } from '@/lib/questions';
import { track, EVENTS, trackPageView } from '@/lib/analytics';

export default function QuestionsPage() {
  const router = useRouter();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<(number | null)[]>(
    new Array(QUESTIONS.length).fill(null)
  );
  const [petImage, setPetImage] = useState<string | null>(null);
  const [petType, setPetType] = useState<'cat' | 'dog' | null>(null);

  useEffect(() => {
    trackPageView('questions');
    track(EVENTS.QUESTION_START);

    // 从 sessionStorage 读取宠物信息
    const image = sessionStorage.getItem('petImage');
    const type = sessionStorage.getItem('petType') as 'cat' | 'dog' | null;

    if (!image || !type) {
      router.push('/upload');
      return;
    }

    setPetImage(image);
    setPetType(type);
  }, [router]);

  const handleSelect = (optionIndex: number) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = optionIndex;
    setAnswers(newAnswers);

    track(EVENTS.QUESTION_ANSWER, {
      questionId: QUESTIONS[currentQuestion].id,
      optionIndex,
    });

    // 自动进入下一题或完成
    setTimeout(() => {
      if (currentQuestion < QUESTIONS.length - 1) {
        setCurrentQuestion(currentQuestion + 1);
      } else {
        handleComplete(newAnswers);
      }
    }, 300);
  };

  const handleComplete = (finalAnswers: (number | null)[]) => {
    // 计算权重
    const validAnswers = finalAnswers.filter((a): a is number => a !== null);
    const weights = calculateTotalWeight(validAnswers);

    // 存储答案和权重
    sessionStorage.setItem('answers', JSON.stringify(validAnswers));
    sessionStorage.setItem('weights', JSON.stringify(weights));

    track(EVENTS.QUESTION_COMPLETE, { answers: validAnswers, weights });

    // 跳转到卡密验证页面
    router.push('/redeem');
  };

  const goBack = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    } else {
      router.push('/upload');
    }
  };

  if (!petImage || !petType) {
    return null;
  }

  return (
    <main className="min-h-screen flex flex-col px-6 py-8">
      {/* 顶部导航 */}
      <nav className="flex items-center justify-between mb-8">
        <button
          onClick={goBack}
          className="text-zinc-500 hover:text-white transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <span className="text-zinc-600 text-sm">步骤 2/3</span>
        <div className="w-6" />
      </nav>

      {/* 宠物头像 */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex justify-center mb-8"
      >
        <div className="relative">
          <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-zinc-700">
            <img
              src={petImage}
              alt="宠物"
              className="w-full h-full object-cover"
            />
          </div>
          <span className="absolute -bottom-1 -right-1 text-2xl">
            {petType === 'cat' ? '🐱' : '🐕'}
          </span>
        </div>
      </motion.div>

      {/* 问题卡片 */}
      <div className="flex-1 flex flex-col max-w-lg mx-auto w-full">
        <QuestionCard
          question={QUESTIONS[currentQuestion]}
          questionIndex={currentQuestion}
          totalQuestions={QUESTIONS.length}
          selectedOption={answers[currentQuestion]}
          onSelect={handleSelect}
        />
      </div>

      {/* 底部提示 */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="text-center text-zinc-700 text-sm mt-8"
      >
        选择答案后自动进入下一题
      </motion.p>
    </main>
  );
}
