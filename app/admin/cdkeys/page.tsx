'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface Cdkey {
  id: string;
  code: string;
  type: string;
  totalUses: number;
  usedCount: number;
  isActive: boolean;
  createdAt: string;
  expiresAt: string | null;
  note: string | null;
}

// 模拟数据
const MOCK_CDKEYS: Cdkey[] = [
  {
    id: '1',
    code: 'TEST001',
    type: 'normal',
    totalUses: 10,
    usedCount: 3,
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
    expiresAt: null,
    note: '测试卡密',
  },
  {
    id: '2',
    code: 'DEMO123',
    type: 'normal',
    totalUses: 100,
    usedCount: 45,
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
    expiresAt: null,
    note: 'Demo 卡密',
  },
  {
    id: '3',
    code: 'VIP888',
    type: 'vip',
    totalUses: 1,
    usedCount: 0,
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
    expiresAt: '2024-12-31T23:59:59Z',
    note: 'VIP 单次卡密',
  },
];

export default function CdkeysPage() {
  const [cdkeys, setCdkeys] = useState<Cdkey[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newCdkey, setNewCdkey] = useState({
    code: '',
    totalUses: 1,
    note: '',
  });

  useEffect(() => {
    // 模拟 API 调用
    setTimeout(() => {
      setCdkeys(MOCK_CDKEYS);
      setLoading(false);
    }, 500);
  }, []);

  const handleCreate = () => {
    if (!newCdkey.code) return;

    const newItem: Cdkey = {
      id: Date.now().toString(),
      code: newCdkey.code.toUpperCase(),
      type: 'normal',
      totalUses: newCdkey.totalUses,
      usedCount: 0,
      isActive: true,
      createdAt: new Date().toISOString(),
      expiresAt: null,
      note: newCdkey.note || null,
    };

    setCdkeys([newItem, ...cdkeys]);
    setShowCreateModal(false);
    setNewCdkey({ code: '', totalUses: 1, note: '' });
  };

  const handleToggleActive = (id: string) => {
    setCdkeys(
      cdkeys.map((k) =>
        k.id === id ? { ...k, isActive: !k.isActive } : k
      )
    );
  };

  const generateRandomCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 8; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setNewCdkey({ ...newCdkey, code });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin text-4xl">🔑</div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-white">卡密管理</h1>
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-6 py-3 bg-white text-black rounded-xl font-medium hover:bg-zinc-200 transition-colors"
        >
          + 创建卡密
        </button>
      </div>

      {/* 卡密列表 */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
        <table className="w-full">
          <thead className="bg-zinc-800">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-medium text-zinc-400">
                卡密
              </th>
              <th className="px-6 py-4 text-left text-sm font-medium text-zinc-400">
                使用情况
              </th>
              <th className="px-6 py-4 text-left text-sm font-medium text-zinc-400">
                状态
              </th>
              <th className="px-6 py-4 text-left text-sm font-medium text-zinc-400">
                备注
              </th>
              <th className="px-6 py-4 text-right text-sm font-medium text-zinc-400">
                操作
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800">
            {cdkeys.map((cdkey) => (
              <motion.tr
                key={cdkey.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="hover:bg-zinc-800/50"
              >
                <td className="px-6 py-4">
                  <code className="text-white font-mono bg-zinc-800 px-2 py-1 rounded">
                    {cdkey.code}
                  </code>
                </td>
                <td className="px-6 py-4">
                  <span className="text-white">
                    {cdkey.usedCount} / {cdkey.totalUses}
                  </span>
                  <div className="w-24 h-2 bg-zinc-800 rounded-full mt-1 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full"
                      style={{
                        width: `${(cdkey.usedCount / cdkey.totalUses) * 100}%`,
                      }}
                    />
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      cdkey.isActive
                        ? 'bg-green-500/20 text-green-400'
                        : 'bg-red-500/20 text-red-400'
                    }`}
                  >
                    {cdkey.isActive ? '启用' : '停用'}
                  </span>
                </td>
                <td className="px-6 py-4 text-zinc-500">
                  {cdkey.note || '-'}
                </td>
                <td className="px-6 py-4 text-right">
                  <button
                    onClick={() => handleToggleActive(cdkey.id)}
                    className="text-zinc-400 hover:text-white text-sm"
                  >
                    {cdkey.isActive ? '停用' : '启用'}
                  </button>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 创建卡密弹窗 */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 w-full max-w-md"
          >
            <h2 className="text-xl font-semibold text-white mb-6">创建卡密</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm text-zinc-400 mb-2">
                  卡密代码
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newCdkey.code}
                    onChange={(e) =>
                      setNewCdkey({ ...newCdkey, code: e.target.value.toUpperCase() })
                    }
                    placeholder="输入卡密代码"
                    className="flex-1 px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl text-white placeholder:text-zinc-600 focus:outline-none focus:border-zinc-500"
                  />
                  <button
                    onClick={generateRandomCode}
                    className="px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl text-zinc-400 hover:text-white hover:border-zinc-500 transition-colors"
                  >
                    随机
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm text-zinc-400 mb-2">
                  可使用次数
                </label>
                <input
                  type="number"
                  min="1"
                  value={newCdkey.totalUses}
                  onChange={(e) =>
                    setNewCdkey({ ...newCdkey, totalUses: parseInt(e.target.value) || 1 })
                  }
                  className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl text-white focus:outline-none focus:border-zinc-500"
                />
              </div>

              <div>
                <label className="block text-sm text-zinc-400 mb-2">
                  备注（可选）
                </label>
                <input
                  type="text"
                  value={newCdkey.note}
                  onChange={(e) =>
                    setNewCdkey({ ...newCdkey, note: e.target.value })
                  }
                  placeholder="添加备注"
                  className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl text-white placeholder:text-zinc-600 focus:outline-none focus:border-zinc-500"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowCreateModal(false)}
                className="flex-1 py-3 border border-zinc-700 text-zinc-400 rounded-xl hover:border-zinc-500 hover:text-white transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleCreate}
                disabled={!newCdkey.code}
                className={`flex-1 py-3 rounded-xl font-medium transition-colors ${
                  newCdkey.code
                    ? 'bg-white text-black hover:bg-zinc-200'
                    : 'bg-zinc-800 text-zinc-600 cursor-not-allowed'
                }`}
              >
                创建
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
