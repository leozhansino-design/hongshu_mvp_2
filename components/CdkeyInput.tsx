'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';

interface CdkeyInputProps {
  onVerify: (code: string) => Promise<boolean>;
  isVerifying: boolean;
}

export function CdkeyInput({ onVerify, isVerifying }: CdkeyInputProps) {
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!code.trim()) {
      setError('请输入卡密');
      return;
    }

    setError(null);
    const success = await onVerify(code.trim().toUpperCase());

    if (!success) {
      setError('卡密无效或已过期');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="relative mb-4">
        <input
          type="text"
          value={code}
          onChange={(e) => {
            setCode(e.target.value.toUpperCase());
            setError(null);
          }}
          placeholder="请输入卡密"
          disabled={isVerifying}
          className={`
            w-full px-6 py-4 bg-gray-50 border-2 rounded-2xl text-gray-900 text-center text-lg font-mono
            placeholder:text-gray-400 focus:outline-none transition-all duration-300
            ${error
              ? 'border-red-400 focus:border-red-500'
              : 'border-gray-200 focus:border-gray-400'
            }
            ${isVerifying ? 'opacity-50' : ''}
          `}
        />
      </div>

      {error && (
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-red-500 text-sm text-center mb-4"
        >
          {error}
        </motion.p>
      )}

      <button
        type="submit"
        disabled={isVerifying || !code.trim()}
        className={`
          w-full py-4 rounded-full font-medium text-lg transition-all duration-300
          ${code.trim() && !isVerifying
            ? 'bg-gray-900 text-white hover:bg-gray-800'
            : 'bg-gray-100 text-gray-400 cursor-not-allowed'
          }
        `}
      >
        {isVerifying ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            验证中...
          </span>
        ) : (
          '验证卡密'
        )}
      </button>
    </form>
  );
}
