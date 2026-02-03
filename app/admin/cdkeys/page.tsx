'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

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

export default function CdkeysPage() {
  const [cdkeys, setCdkeys] = useState<CdkeyItem[]>([]);
  const [stats, setStats] = useState<CdkeyStats>({ total: 0, used: 0, available: 0 });
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [generateCount, setGenerateCount] = useState(100);
  const [prefix, setPrefix] = useState('PET');
  const [activeTab, setActiveTab] = useState<'generate' | 'list' | 'export'>('generate');

  useEffect(() => {
    fetchCdkeys();
  }, []);

  const fetchCdkeys = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/cdkeys');
      const data = await res.json();
      if (data.success) {
        setCdkeys(data.data.cdkeys || []);
        setStats(data.data.stats || { total: 0, used: 0, available: 0 });
      } else {
        setMessage({ type: 'error', text: data.error || '获取卡密失败' });
      }
    } catch (err) {
      console.error('Failed to fetch cdkeys:', err);
      setMessage({ type: 'error', text: '网络错误' });
    } finally {
      setLoading(false);
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
        setMessage({ type: 'success', text: `成功生成 ${data.data.count} 个卡密` });
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

  const exportTxt = async () => {
    setLoading(true);
    setMessage(null);

    try {
      // 从服务器获取所有可用卡密
      const res = await fetch('/api/admin/cdkeys/export');
      const data = await res.json();

      if (!data.success) {
        setMessage({ type: 'error', text: data.error || '导出失败' });
        return;
      }

      const codes = data.data.codes as string[];
      if (codes.length === 0) {
        setMessage({ type: 'error', text: '没有可导出的卡密' });
        return;
      }

      // 每行一个卡密
      const txtContent = codes.join('\n');

      const blob = new Blob([txtContent], { type: 'text/plain;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `cdkeys_${new Date().toISOString().slice(0, 10)}.txt`;
      link.click();

      setMessage({ type: 'success', text: `已导出 ${codes.length} 个卡密` });
    } catch (err) {
      setMessage({ type: 'error', text: '导出失败' });
    } finally {
      setLoading(false);
    }
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
        setMessage({ type: 'success', text: `已清理 ${data.data.deleted} 个已使用的卡密` });
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

  const clearAllCdkeys = async () => {
    if (!confirm('⚠️ 确定要清空所有卡密吗？此操作将删除全部 ' + stats.total + ' 个卡密，不可恢复！')) return;
    if (!confirm('⚠️⚠️ 再次确认：真的要删除所有卡密吗？')) return;

    setLoading(true);
    try {
      const res = await fetch('/api/admin/cdkeys?action=clearAll', {
        method: 'DELETE',
      });
      const data = await res.json();

      if (data.success) {
        setMessage({ type: 'success', text: `已清空 ${data.data.deleted} 个卡密` });
        fetchCdkeys();
      } else {
        setMessage({ type: 'error', text: data.error || '清空失败' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: '网络错误' });
    } finally {
      setLoading(false);
    }
  };

  if (loading && cdkeys.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin text-4xl">🔑</div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-white mb-8">卡密管理</h1>

      {/* 统计卡片 */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-center">
          <p className="text-3xl font-bold text-amber-500">{stats.total}</p>
          <p className="text-zinc-400 text-sm">总数</p>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-center">
          <p className="text-3xl font-bold text-green-500">{stats.available}</p>
          <p className="text-zinc-400 text-sm">可用</p>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-center">
          <p className="text-3xl font-bold text-red-500">{stats.used}</p>
          <p className="text-zinc-400 text-sm">已用</p>
        </div>
      </div>

      {/* 消息提示 */}
      {message && (
        <div className={`mb-6 p-4 rounded-xl text-center ${
          message.type === 'success'
            ? 'bg-green-500/20 border border-green-500/50 text-green-400'
            : 'bg-red-500/20 border border-red-500/50 text-red-400'
        }`}>
          {message.text}
        </div>
      )}

      {/* Tab 切换 */}
      <div className="flex gap-2 mb-6">
        {(['generate', 'list', 'export'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-2 rounded-lg font-medium transition-all ${
              activeTab === tab
                ? 'bg-white text-black'
                : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
            }`}
          >
            {tab === 'generate' ? '生成卡密' : tab === 'list' ? '卡密列表' : '导出管理'}
          </button>
        ))}
      </div>

      {/* 生成卡密 Tab */}
      {activeTab === 'generate' && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
          <h2 className="text-xl font-bold text-white mb-4">批量生成卡密</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-zinc-400 mb-2">卡密前缀</label>
              <input
                type="text"
                value={prefix}
                onChange={(e) => setPrefix(e.target.value.toUpperCase())}
                maxLength={6}
                placeholder="PET"
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-zinc-500"
              />
            </div>
            <div>
              <label className="block text-sm text-zinc-400 mb-2">生成数量 (1-10000)</label>
              <input
                type="number"
                value={generateCount}
                onChange={(e) => setGenerateCount(Math.min(10000, Math.max(1, parseInt(e.target.value) || 1)))}
                min={1}
                max={10000}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-zinc-500"
              />
            </div>
            <p className="text-zinc-500 text-sm">
              示例格式: {prefix}-XXXX-XXXX-XXXX
            </p>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={generateCdkeys}
              disabled={loading}
              className="w-full py-3 rounded-xl bg-white text-black font-bold disabled:opacity-50 hover:bg-zinc-200 transition-colors"
            >
              {loading ? '生成中...' : `生成 ${generateCount} 个卡密`}
            </motion.button>
          </div>
        </div>
      )}

      {/* 卡密列表 Tab */}
      {activeTab === 'list' && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-white">卡密列表</h2>
            <button
              onClick={fetchCdkeys}
              className="text-zinc-400 hover:text-white text-sm"
            >
              刷新
            </button>
          </div>
          <div className="max-h-96 overflow-y-auto space-y-2">
            {cdkeys.length === 0 ? (
              <p className="text-zinc-500 text-center py-8">暂无卡密</p>
            ) : (
              cdkeys.slice(0, 100).map((cdkey, index) => (
                <div
                  key={index}
                  className={`flex justify-between items-center p-3 rounded-lg ${
                    cdkey.status === 'used'
                      ? 'bg-zinc-800/50 text-zinc-500'
                      : cdkey.status === 'pending'
                      ? 'bg-yellow-500/10 text-yellow-400'
                      : 'bg-zinc-800 text-white'
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
              <p className="text-zinc-500 text-center text-sm py-2">
                仅显示前 100 条，共 {cdkeys.length} 条
              </p>
            )}
          </div>
        </div>
      )}

      {/* 导出管理 Tab */}
      {activeTab === 'export' && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 space-y-4">
          <h2 className="text-xl font-bold text-white mb-4">导出与管理</h2>

          <div className="p-4 bg-zinc-800 rounded-lg">
            <h3 className="font-medium text-white mb-2">导出可用卡密</h3>
            <p className="text-zinc-400 text-sm mb-3">
              导出所有未使用的卡密为 TXT 文件（每行一个卡密）
            </p>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={exportTxt}
              disabled={loading || stats.available === 0}
              className="w-full py-2 rounded-lg bg-green-600 hover:bg-green-500 text-white font-medium disabled:opacity-50"
            >
              {loading ? '导出中...' : `导出 TXT (${stats.available} 个可用)`}
            </motion.button>
          </div>

          <div className="p-4 bg-zinc-800 rounded-lg">
            <h3 className="font-medium text-white mb-2">清理已使用卡密</h3>
            <p className="text-zinc-400 text-sm mb-3">
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

          <div className="p-4 bg-zinc-800 rounded-lg border border-red-500/30">
            <h3 className="font-medium text-red-400 mb-2">⚠️ 清空所有卡密</h3>
            <p className="text-zinc-400 text-sm mb-3">
              删除数据库中的所有卡密，此操作不可恢复！
            </p>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={clearAllCdkeys}
              disabled={loading || stats.total === 0}
              className="w-full py-2 rounded-lg bg-red-700 hover:bg-red-600 text-white font-medium disabled:opacity-50"
            >
              清空所有 ({stats.total} 个)
            </motion.button>
          </div>
        </div>
      )}
    </div>
  );
}
