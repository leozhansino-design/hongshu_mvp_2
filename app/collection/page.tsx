'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  getCollection,
  getUnlockProgress,
  getCollectionStats,
  removeFromCollection,
  CollectionItem,
} from '@/lib/collection';
import { Rarity } from '@/lib/titles';

const RARITY_CONFIG = {
  SSR: {
    gradient: 'from-amber-400 via-orange-500 to-rose-500',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/30',
    text: 'text-amber-500',
  },
  SR: {
    gradient: 'from-violet-500 via-purple-500 to-fuchsia-500',
    bg: 'bg-violet-500/10',
    border: 'border-violet-500/30',
    text: 'text-violet-500',
  },
  R: {
    gradient: 'from-cyan-400 via-blue-500 to-indigo-500',
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/30',
    text: 'text-blue-500',
  },
  N: {
    gradient: 'from-zinc-400 via-zinc-500 to-zinc-600',
    bg: 'bg-zinc-500/10',
    border: 'border-zinc-500/30',
    text: 'text-zinc-500',
  },
};

export default function CollectionPage() {
  const [collection, setCollection] = useState<CollectionItem[]>([]);
  const [progress, setProgress] = useState({ unlocked: 0, total: 100, percent: 0 });
  const [stats, setStats] = useState({ SSR: 0, SR: 0, R: 0, N: 0, total: 0 });
  const [filter, setFilter] = useState<Rarity | 'all'>('all');
  const [selectedItem, setSelectedItem] = useState<CollectionItem | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setCollection(getCollection());
    setProgress(getUnlockProgress());
    setStats(getCollectionStats());
  };

  const handleDelete = (id: string) => {
    if (confirm('确定要删除这个收藏吗？')) {
      removeFromCollection(id);
      loadData();
      setSelectedItem(null);
    }
  };

  const filteredCollection = filter === 'all'
    ? collection
    : collection.filter(item => item.rarity === filter);

  // 按稀有度和时间排序
  const sortedCollection = [...filteredCollection].sort((a, b) => {
    const rarityOrder = { SSR: 0, SR: 1, R: 2, N: 3 };
    if (rarityOrder[a.rarity] !== rarityOrder[b.rarity]) {
      return rarityOrder[a.rarity] - rarityOrder[b.rarity];
    }
    return b.collectedAt - a.collectedAt;
  });

  return (
    <main className="min-h-screen bg-white px-4 py-6">
      {/* 顶部导航 */}
      <nav className="flex items-center justify-between mb-6">
        <Link href="/" className="text-gray-400 hover:text-gray-600 transition-colors">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <h1 className="text-lg font-semibold text-gray-900">我的收藏</h1>
        <div className="w-6" />
      </nav>

      {/* 解锁进度卡片 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-5 mb-6 text-white"
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-gray-400 text-sm">解锁进度</p>
            <p className="text-3xl font-bold">
              {progress.unlocked}
              <span className="text-lg text-gray-400 font-normal"> / {progress.total}</span>
            </p>
          </div>
          <div className="text-right">
            <div className="text-4xl font-bold bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">
              {progress.percent}%
            </div>
          </div>
        </div>

        {/* 进度条 */}
        <div className="h-3 bg-gray-700 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress.percent}%` }}
            transition={{ duration: 1, ease: 'easeOut' }}
            className="h-full bg-gradient-to-r from-amber-400 via-orange-500 to-rose-500 rounded-full"
          />
        </div>

        {/* 稀有度统计 */}
        <div className="grid grid-cols-4 gap-2 mt-4">
          {(['SSR', 'SR', 'R', 'N'] as Rarity[]).map(rarity => (
            <div key={rarity} className="text-center">
              <div className={`text-xs ${RARITY_CONFIG[rarity].text} mb-1`}>{rarity}</div>
              <div className="text-lg font-semibold">{stats[rarity]}</div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* 筛选标签 */}
      <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
        {(['all', 'SSR', 'SR', 'R', 'N'] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
              filter === f
                ? 'bg-gray-900 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {f === 'all' ? '全部' : f}
            {f !== 'all' && ` (${stats[f]})`}
          </button>
        ))}
      </div>

      {/* 收藏列表 */}
      {sortedCollection.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-16"
        >
          <div className="text-6xl mb-4">📦</div>
          <p className="text-gray-400 mb-6">
            {filter === 'all' ? '还没有收藏，快去测试吧！' : `没有 ${filter} 稀有度的收藏`}
          </p>
          <Link
            href="/upload"
            className="inline-block px-6 py-3 bg-gray-900 text-white rounded-full font-medium hover:bg-gray-800 transition-colors"
          >
            开始测试
          </Link>
        </motion.div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {sortedCollection.map((item, index) => {
            const config = RARITY_CONFIG[item.rarity];
            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => setSelectedItem(item)}
                className={`relative aspect-[3/4] rounded-xl overflow-hidden cursor-pointer border ${config.border} hover:scale-[1.02] transition-transform`}
              >
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                {/* 稀有度标签 */}
                <div className={`absolute top-2 left-2 px-2 py-0.5 rounded-full bg-gradient-to-r ${config.gradient} text-white text-xs font-bold`}>
                  {item.rarity}
                </div>

                {/* 标题 */}
                <div className="absolute bottom-0 left-0 right-0 p-3">
                  <p className="text-white text-sm font-medium truncate">{item.title}</p>
                  <p className="text-gray-400 text-xs">
                    {new Date(item.collectedAt).toLocaleDateString()}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* 详情弹窗 */}
      {selectedItem && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedItem(null)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            onClick={e => e.stopPropagation()}
            className="bg-white rounded-2xl max-w-sm w-full overflow-hidden"
          >
            {/* 图片 */}
            <div className="relative aspect-square">
              <img
                src={selectedItem.image}
                alt={selectedItem.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

              {/* 稀有度 */}
              <div className={`absolute top-4 left-4 px-3 py-1 rounded-full bg-gradient-to-r ${RARITY_CONFIG[selectedItem.rarity].gradient} text-white text-sm font-bold`}>
                {selectedItem.rarity}
              </div>

              {/* 关闭按钮 */}
              <button
                onClick={() => setSelectedItem(null)}
                className="absolute top-4 right-4 w-8 h-8 bg-black/30 rounded-full flex items-center justify-center text-white hover:bg-black/50"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              {/* 标题 */}
              <div className="absolute bottom-4 left-4 right-4">
                <h2 className={`text-xl font-bold ${RARITY_CONFIG[selectedItem.rarity].text === 'text-zinc-500' ? 'text-white' : RARITY_CONFIG[selectedItem.rarity].text}`}>
                  {selectedItem.title}
                </h2>
              </div>
            </div>

            {/* 信息 */}
            <div className="p-4">
              <p className="text-gray-600 text-sm mb-4">{selectedItem.description}</p>

              <div className="flex items-center justify-between text-xs text-gray-400 mb-4">
                <span>{selectedItem.petType === 'cat' ? '🐱 猫咪' : '🐕 狗狗'}</span>
                <span>收藏于 {new Date(selectedItem.collectedAt).toLocaleString()}</span>
              </div>

              <button
                onClick={() => handleDelete(selectedItem.id)}
                className="w-full py-3 rounded-full border border-red-200 text-red-500 text-sm font-medium hover:bg-red-50 transition-colors"
              >
                删除收藏
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </main>
  );
}
