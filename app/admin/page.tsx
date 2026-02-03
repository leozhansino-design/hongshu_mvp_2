'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface AnalyticsData {
  totalUsers: number;
  todayUsers: number;
  totalGenerations: number;
  todayGenerations: number;
  successRate: number;
  topTitles: { title: string; count: number }[];
  recentEvents: { event: string; time: string; device: string }[];
  dailyStats: { date: string; users: number; generations: number }[];
}

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [timeRange, setTimeRange] = useState<'today' | 'week' | 'month'>('week');

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/analytics?range=${timeRange}`);
      const result = await res.json();
      if (result.success) {
        setData(result.data);
      }
    } catch (err) {
      console.error('Failed to fetch analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin text-4xl">📊</div>
      </div>
    );
  }

  // 使用默认数据如果API失败
  const stats = data || {
    totalUsers: 0,
    todayUsers: 0,
    totalGenerations: 0,
    todayGenerations: 0,
    successRate: 0,
    topTitles: [],
    recentEvents: [],
    dailyStats: [],
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-white">数据概览</h1>
        <div className="flex gap-2">
          {(['today', 'week', 'month'] as const).map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                timeRange === range
                  ? 'bg-white text-black'
                  : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
              }`}
            >
              {range === 'today' ? '今日' : range === 'week' ? '本周' : '本月'}
            </button>
          ))}
        </div>
      </div>

      {/* 核心指标卡片 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6"
        >
          <p className="text-zinc-400 text-sm mb-2">总用户数</p>
          <p className="text-3xl font-bold text-white">{stats.totalUsers.toLocaleString()}</p>
          <p className="text-green-400 text-sm mt-2">+{stats.todayUsers} 今日</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6"
        >
          <p className="text-zinc-400 text-sm mb-2">总生成次数</p>
          <p className="text-3xl font-bold text-white">{stats.totalGenerations.toLocaleString()}</p>
          <p className="text-green-400 text-sm mt-2">+{stats.todayGenerations} 今日</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6"
        >
          <p className="text-zinc-400 text-sm mb-2">生成成功率</p>
          <p className="text-3xl font-bold text-white">{stats.successRate.toFixed(1)}%</p>
          <div className="w-full h-2 bg-zinc-800 rounded-full mt-3 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full"
              style={{ width: `${stats.successRate}%` }}
            />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6"
        >
          <p className="text-zinc-400 text-sm mb-2">今日活跃</p>
          <p className="text-3xl font-bold text-white">{stats.todayUsers}</p>
          <p className="text-zinc-500 text-sm mt-2">独立设备</p>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 热门称号 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6"
        >
          <h2 className="text-lg font-semibold text-white mb-4">热门称号 TOP 10</h2>
          <div className="space-y-3">
            {stats.topTitles.length > 0 ? (
              stats.topTitles.map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                      index < 3 ? 'bg-amber-500 text-black' : 'bg-zinc-700 text-zinc-400'
                    }`}>
                      {index + 1}
                    </span>
                    <span className="text-white text-sm">{item.title}</span>
                  </div>
                  <span className="text-zinc-400 text-sm">{item.count} 次</span>
                </div>
              ))
            ) : (
              <p className="text-zinc-500 text-center py-4">暂无数据</p>
            )}
          </div>
        </motion.div>

        {/* 最近事件 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6"
        >
          <h2 className="text-lg font-semibold text-white mb-4">最近活动</h2>
          <div className="space-y-3 max-h-80 overflow-y-auto">
            {stats.recentEvents.length > 0 ? (
              stats.recentEvents.map((event, index) => (
                <div key={index} className="flex items-center justify-between py-2 border-b border-zinc-800 last:border-0">
                  <div>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      event.event.includes('生成') ? 'bg-green-500/20 text-green-400' :
                      event.event.includes('验证') ? 'bg-blue-500/20 text-blue-400' :
                      'bg-zinc-700 text-zinc-400'
                    }`}>
                      {event.event}
                    </span>
                    <span className="text-zinc-500 text-xs ml-2">{event.device}</span>
                  </div>
                  <span className="text-zinc-500 text-xs">{event.time}</span>
                </div>
              ))
            ) : (
              <p className="text-zinc-500 text-center py-4">暂无数据</p>
            )}
          </div>
        </motion.div>
      </div>

      {/* 每日趋势图 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 mt-6"
      >
        <h2 className="text-lg font-semibold text-white mb-4">每日趋势</h2>
        {stats.dailyStats.length > 0 ? (
          <div className="flex items-end justify-between h-40 gap-2">
            {stats.dailyStats.map((day, index) => (
              <div key={index} className="flex-1 flex flex-col items-center gap-2">
                <div className="w-full flex flex-col gap-1">
                  <div
                    className="w-full bg-gradient-to-t from-blue-500 to-blue-400 rounded-t"
                    style={{ height: `${Math.max(4, (day.users / Math.max(...stats.dailyStats.map(d => d.users || 1))) * 100)}px` }}
                    title={`${day.users} 用户`}
                  />
                  <div
                    className="w-full bg-gradient-to-t from-green-500 to-green-400 rounded-t"
                    style={{ height: `${Math.max(4, (day.generations / Math.max(...stats.dailyStats.map(d => d.generations || 1))) * 60)}px` }}
                    title={`${day.generations} 生成`}
                  />
                </div>
                <span className="text-zinc-500 text-xs">{day.date.slice(-5)}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-zinc-500 text-center py-8">暂无数据</p>
        )}
        <div className="flex justify-center gap-6 mt-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-500 rounded" />
            <span className="text-zinc-400 text-xs">用户数</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded" />
            <span className="text-zinc-400 text-xs">生成次数</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
