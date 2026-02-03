'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';

const ADMIN_PASSWORD = 'Dianzi123';

interface CdkeyStats {
  total: number;
  used: number;
  available: number;
}

interface CdkeyItem {
  code: string;
  status: 'available' | 'used' | 'pending';
  createdAt: string;
  usedAt?: string;
}

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState(false);

  const [cdkeys, setCdkeys] = useState<CdkeyItem[]>([]);
  const [stats, setStats] = useState<CdkeyStats>({ total: 0, used: 0, available: 0 });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [generateCount, setGenerateCount] = useState(100);
  const [prefix, setPrefix] = useState('PET');
  const [activeTab, setActiveTab] = useState<'generate' | 'list' | 'export'>('generate');

  const handlePasswordSubmit = () => {
    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      setPasswordError(false);
      fetchCdkeys();
    } else {
      setPasswordError(true);
    }
  };

  const fetchCdkeys = async () => {
    try {
      const res = await fetch('/api/admin/cdkeys');
      const data = await res.json();
      if (data.success) {
        setCdkeys(data.data.cdkeys || []);
        setStats(data.data.stats || { total: 0, used: 0, available: 0 });
      }
    } catch (err) {
      console.error('Failed to fetch cdkeys:', err);
    }
  };

  const generateCdkeys = async () => {
    if (generateCount < 1 || generateCount > 10000) {
      setMessage({ type: 'error', text: '数量必须在 1-10000 之间' });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const res = await fetch('/api/admin/cdkeys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ count: generateCount, prefix }),
      });
      const data = await res.json();

      if (data.success) {
        setMessage({ type: 'success', text: '成功生成 ' + data.data.count + ' 个卡密' });
        fetchCdkeys();
      } else {
        setMessage({ type: 'error', text: data.error || '生成失败' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: '网络错误' });
    } finally {
      setLoading(false);
    }
  };

  const exportCsv = () => {
    const availableCdkeys = cdkeys.filter(c => c.status === 'available');
    if (availableCdkeys.length === 0) {
      setMessage({ type: 'error', text: '没有可导出的卡密' });
      return;
    }

    const csvContent = [
      ['卡密', '状态', '创建时间'].join(','),
      ...availableCdkeys.map(c => [c.code, c.status, c.createdAt].join(','))
    ].join('\n');

    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'cdkeys_' + new Date().toISOString().slice(0, 10) + '.csv';
    link.click();

    setMessage({ type: 'success', text: '已导出 ' + availableCdkeys.length + ' 个卡密' });
  };

  const clearUsedCdkeys = async () => {
    if (!confirm('确定要清理所有已使用的卡密吗？此操作不可恢复。')) return;

    setLoading(true);
    try {
      const res = await fetch('/api/admin/cdkeys?action=clearUsed', {
        method: 'DELETE',
      });
      const data = await res.json();

      if (data.success) {
        setMessage({ type: 'success', text: '已清理 ' + data.data.deleted + ' 个已使用的卡密' });
        fetchCdkeys();
      } else {
        setMessage({ type: 'error', text: data.error || '清理失败' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: '网络错误' });
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white p-6 flex items-center justify-center">
        <div className="max-w-sm w-full">
          <h1 className="text-2xl font-bold text-center mb-6">管理员后台</h1>
          <div className="space-y-4">
            <input
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setPasswordError(false);
              }}
              onKeyDown={(e) => e.key === 'Enter' && handlePasswordSubmit()}
              placeholder="请输入管理员密码"
              className="w-full bg-gray-800 border border-gray-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-amber-500"
            />
            {passwordError && (
              <p className="text-red-400 text-sm text-center">密码错误</p>
            )}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handlePasswordSubmit}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold"
            >
              进入后台
            </motion.button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-2">卡密管理后台</h1>
        <p className="text-gray-400 text-center mb-8">管理激活码</p>

        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-gray-800 rounded-xl p-4 text-center">
            <p className="text-3xl font-bold text-amber-500">{stats.total}</p>
            <p className="text-gray-400 text-sm">总数</p>
          </div>
          <div className="bg-gray-800 rounded-xl p-4 text-center">
            <p className="text-3xl font-bold text-green-500">{stats.available}</p>
            <p className="text-gray-400 text-sm">可用</p>
          </div>
          <div className="bg-gray-800 rounded-xl p-4 text-center">
            <p className="text-3xl font-bold text-red-500">{stats.used}</p>
            <p className="text-gray-400 text-sm">已用</p>
          </div>
        </div>

        {message && (
          <div className={`mb-6 p-4 rounded-xl text-center ${
            message.type === 'success'
              ? 'bg-green-500/20 border border-green-500/50 text-green-400'
              : 'bg-red-500/20 border border-red-500/50 text-red-400'
          }`}>
            {message.text}
          </div>
        )}

        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab('generate')}
            className={`flex-1 py-2 rounded-lg font-medium transition-all ${
              activeTab === 'generate'
                ? 'bg-amber-500 text-white'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            生成卡密
          </button>
          <button
            onClick={() => setActiveTab('list')}
            className={`flex-1 py-2 rounded-lg font-medium transition-all ${
              activeTab === 'list'
                ? 'bg-amber-500 text-white'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            卡密列表
          </button>
          <button
            onClick={() => setActiveTab('export')}
            className={`flex-1 py-2 rounded-lg font-medium transition-all ${
              activeTab === 'export'
                ? 'bg-amber-500 text-white'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            导出管理
          </button>
        </div>

        {activeTab === 'generate' && (
          <div className="bg-gray-800 rounded-xl p-6">
            <h2 className="text-xl font-bold mb-4">批量生成卡密</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">卡密前缀</label>
                <input
                  type="text"
                  value={prefix}
                  onChange={(e) => setPrefix(e.target.value.toUpperCase())}
                  maxLength={6}
                  placeholder="PET"
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-amber-500"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">生成数量 (1-10000)</label>
                <input
                  type="number"
                  value={generateCount}
                  onChange={(e) => setGenerateCount(Math.min(10000, Math.max(1, parseInt(e.target.value) || 1)))}
                  min={1}
                  max={10000}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-amber-500"
                />
              </div>
              <p className="text-gray-500 text-sm">
                示例格式: {prefix}-XXXX-XXXX-XXXX
              </p>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={generateCdkeys}
                disabled={loading}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold disabled:opacity-50"
              >
                {loading ? '生成中...' : '生成 ' + generateCount + ' 个卡密'}
              </motion.button>
            </div>
          </div>
        )}

        {activeTab === 'list' && (
          <div className="bg-gray-800 rounded-xl p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">卡密列表</h2>
              <button
                onClick={fetchCdkeys}
                className="text-amber-500 hover:text-amber-400 text-sm"
              >
                刷新
              </button>
            </div>
            <div className="max-h-96 overflow-y-auto space-y-2">
              {cdkeys.length === 0 ? (
                <p className="text-gray-500 text-center py-8">暂无卡密</p>
              ) : (
                cdkeys.slice(0, 100).map((cdkey, index) => (
                  <div
                    key={index}
                    className={`flex justify-between items-center p-3 rounded-lg ${
                      cdkey.status === 'used'
                        ? 'bg-gray-700/50 text-gray-500'
                        : cdkey.status === 'pending'
                        ? 'bg-yellow-500/10 text-yellow-400'
                        : 'bg-gray-700 text-white'
                    }`}
                  >
                    <code className="font-mono text-sm">{cdkey.code}</code>
                    <span className={`text-xs px-2 py-1 rounded ${
                      cdkey.status === 'used'
                        ? 'bg-red-500/20 text-red-400'
                        : cdkey.status === 'pending'
                        ? 'bg-yellow-500/20 text-yellow-400'
                        : 'bg-green-500/20 text-green-400'
                    }`}>
                      {cdkey.status === 'used' ? '已使用' : cdkey.status === 'pending' ? '使用中' : '可用'}
                    </span>
                  </div>
                ))
              )}
              {cdkeys.length > 100 && (
                <p className="text-gray-500 text-center text-sm py-2">
                  仅显示前 100 条，共 {cdkeys.length} 条
                </p>
              )}
            </div>
          </div>
        )}

        {activeTab === 'export' && (
          <div className="bg-gray-800 rounded-xl p-6 space-y-4">
            <h2 className="text-xl font-bold mb-4">导出与管理</h2>

            <div className="p-4 bg-gray-700 rounded-lg">
              <h3 className="font-medium mb-2">导出可用卡密</h3>
              <p className="text-gray-400 text-sm mb-3">
                导出所有未使用的卡密为 CSV 文件
              </p>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={exportCsv}
                className="w-full py-2 rounded-lg bg-green-600 hover:bg-green-500 text-white font-medium"
              >
                导出 CSV ({stats.available} 个可用)
              </motion.button>
            </div>

            <div className="p-4 bg-gray-700 rounded-lg">
              <h3 className="font-medium mb-2">清理已使用卡密</h3>
              <p className="text-gray-400 text-sm mb-3">
                删除所有已使用的卡密记录，释放数据库空间
              </p>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={clearUsedCdkeys}
                disabled={loading || stats.used === 0}
                className="w-full py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white font-medium disabled:opacity-50"
              >
                清理已使用 ({stats.used} 个)
              </motion.button>
            </div>
          </div>
        )}

        <p className="text-center text-gray-500 text-xs mt-8">
          管理员后台 · 仅限内部使用
        </p>
      </div>
    </main>
  );
}
