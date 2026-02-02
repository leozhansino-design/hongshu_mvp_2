'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const pathname = usePathname();

  useEffect(() => {
    // 检查是否已登录
    const auth = sessionStorage.getItem('adminAuth');
    if (auth === 'true') {
      setIsAuthenticated(true);
    }
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();

    // 简单密码验证（实际生产中应该使用更安全的方式）
    if (password === 'admin123456') {
      setIsAuthenticated(true);
      sessionStorage.setItem('adminAuth', 'true');
      setError('');
    } else {
      setError('密码错误');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem('adminAuth');
  };

  if (!isAuthenticated) {
    return (
      <main className="min-h-screen flex items-center justify-center px-6">
        <div className="w-full max-w-sm">
          <h1 className="text-2xl font-semibold text-white text-center mb-8">
            管理后台
          </h1>
          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="请输入管理密码"
              className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-xl text-white placeholder:text-zinc-600 focus:outline-none focus:border-zinc-600"
            />
            {error && (
              <p className="text-red-400 text-sm text-center">{error}</p>
            )}
            <button
              type="submit"
              className="w-full py-3 bg-white text-black rounded-xl font-medium hover:bg-zinc-200 transition-colors"
            >
              登录
            </button>
          </form>
          <Link
            href="/"
            className="block text-center text-zinc-600 text-sm mt-6 hover:text-zinc-400"
          >
            返回首页
          </Link>
        </div>
      </main>
    );
  }

  const navItems = [
    { href: '/admin', label: '数据概览', icon: '📊' },
    { href: '/admin/cdkeys', label: '卡密管理', icon: '🔑' },
  ];

  return (
    <div className="min-h-screen flex">
      {/* 侧边栏 */}
      <aside className="w-64 bg-zinc-900 border-r border-zinc-800 p-6">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-xl font-semibold text-white">管理后台</h1>
          <button
            onClick={handleLogout}
            className="text-zinc-500 hover:text-white text-sm"
          >
            退出
          </button>
        </div>

        <nav className="space-y-2">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                pathname === item.href
                  ? 'bg-white text-black'
                  : 'text-zinc-400 hover:bg-zinc-800 hover:text-white'
              }`}
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>
      </aside>

      {/* 主内容 */}
      <main className="flex-1 p-8 overflow-auto">{children}</main>
    </div>
  );
}
