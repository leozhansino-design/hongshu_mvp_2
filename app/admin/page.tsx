'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface Stats {
  totalGacha: number;
  todayGacha: number;
  totalCdkeyUsed: number;
  todayCdkeyUsed: number;
  rarityDistribution: {
    SSR: number;
    SR: number;
    R: number;
    N: number;
  };
}

// 模拟数据（实际生产中从 Supabase 获取）
const MOCK_STATS: Stats = {
  totalGacha: 1234,
  todayGacha: 56,
  totalCdkeyUsed: 890,
  todayCdkeyUsed: 23,
  rarityDistribution: {
    SSR: 62,
    SR: 185,
    R: 370,
    N: 617,
  },
};

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 模拟 API 调用
    setTimeout(() => {
      setStats(MOCK_STATS);
      setLoading(false);
    }, 500);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin text-4xl">📊</div>
      </div>
    );
  }

  if (!stats) return null;

  const statCards = [
    {
      title: '总抽卡次数',
      value: stats.totalGacha,
      today: stats.todayGacha,
      icon: '🎴',
      color: 'from-amber-500 to-orange-500',
    },
    {
      title: '卡密使用',
      value: stats.totalCdkeyUsed,
      today: stats.todayCdkeyUsed,
      icon: '🔑',
      color: 'from-violet-500 to-purple-500',
    },
    {
      title: 'SSR 抽出',
      value: stats.rarityDistribution.SSR,
      percentage: ((stats.rarityDistribution.SSR / stats.totalGacha) * 100).toFixed(1),
      icon: '🌟',
      color: 'from-yellow-500 to-amber-500',
    },
    {
      title: 'SR 抽出',
      value: stats.rarityDistribution.SR,
      percentage: ((stats.rarityDistribution.SR / stats.totalGacha) * 100).toFixed(1),
      icon: '💎',
      color: 'from-purple-500 to-pink-500',
    },
  ];

  return (
    <div>
      <h1 className="text-3xl font-bold text-white mb-8">数据概览</h1>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((card, index) => (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-2xl">{card.icon}</span>
              <span
                className={`px-2 py-1 rounded-full text-xs bg-gradient-to-r ${card.color} text-white`}
              >
                {card.today !== undefined ? `+${card.today} 今日` : `${card.percentage}%`}
              </span>
            </div>
            <p className="text-zinc-500 text-sm mb-1">{card.title}</p>
            <p className="text-3xl font-bold text-white">{card.value.toLocaleString()}</p>
          </motion.div>
        ))}
      </div>

      {/* 稀有度分布 */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
        <h2 className="text-xl font-semibold text-white mb-6">稀有度分布</h2>
        <div className="space-y-4">
          {Object.entries(stats.rarityDistribution).map(([rarity, count]) => {
            const percentage = (count / stats.totalGacha) * 100;
            const colors: Record<string, string> = {
              SSR: 'from-amber-500 to-orange-500',
              SR: 'from-violet-500 to-purple-500',
              R: 'from-cyan-500 to-blue-500',
              N: 'from-zinc-500 to-zinc-600',
            };

            return (
              <div key={rarity}>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-zinc-400">{rarity}</span>
                  <span className="text-white">
                    {count} ({percentage.toFixed(1)}%)
                  </span>
                </div>
                <div className="h-3 bg-zinc-800 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ duration: 1, delay: 0.5 }}
                    className={`h-full bg-gradient-to-r ${colors[rarity]} rounded-full`}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
