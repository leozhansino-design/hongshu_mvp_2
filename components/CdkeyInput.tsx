'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// 卡密错误类型及消息
const CDKEY_ERROR_MESSAGES: Record<string, { message: string; tip: string }> = {
  empty: {
    message: '请输入卡密',
    tip: '',
  },
  used: {
    message: '此卡密已被使用',
    tip: '每个卡密只能使用一次，请使用新的卡密。',
  },
  pending: {
    message: '此卡密正在使用中',
    tip: '如果您刚才使用过此卡密，请等待处理完成。',
  },
  invalid: {
    message: '卡密不存在',
    tip: '请检查输入是否正确，或联系客服获取有效卡密。',
  },
  expired: {
    message: '此卡密已过期',
    tip: '请联系客服获取新的卡密。',
  },
  exhausted: {
    message: '此卡密使用次数已用完',
    tip: '请使用新的卡密。',
  },
  server: {
    message: '服务器验证失败',
    tip: '请稍后重试，如问题持续请联系客服。',
  },
  network: {
    message: '网络连接失败',
    tip: '请检查网络后重试。',
  },
  default: {
    message: '卡密验证失败',
    tip: '请重试或联系客服获取帮助。',
  },
};

interface CdkeyInputProps {
  onVerify: (code: string) => Promise<{ success: boolean; errorType?: string }>;
  isVerifying: boolean;
}

export function CdkeyInput({ onVerify, isVerifying }: CdkeyInputProps) {
  const [code, setCode] = useState('');
  const [errorType, setErrorType] = useState<string | null>(null);
  const [showHelp, setShowHelp] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!code.trim()) {
      setErrorType('empty');
      return;
    }

    setErrorType(null);
    const result = await onVerify(code.trim().toUpperCase());

    if (!result.success) {
      setErrorType(result.errorType || 'default');
      setShowHelp(true);
    }
  };

  const errorInfo = errorType ? (CDKEY_ERROR_MESSAGES[errorType] || CDKEY_ERROR_MESSAGES.default) : null;

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="relative mb-4">
        <input
          type="text"
          value={code}
          onChange={(e) => {
            setCode(e.target.value.toUpperCase());
            setErrorType(null);
            setShowHelp(false);
          }}
          placeholder="请输入卡密"
          disabled={isVerifying}
          className={`
            w-full px-6 py-4 bg-gray-50 border-2 rounded-2xl text-gray-900 text-center text-lg font-mono
            placeholder:text-gray-400 focus:outline-none transition-all duration-300
            ${errorType
              ? 'border-red-400 focus:border-red-500'
              : 'border-gray-200 focus:border-gray-400'
            }
            ${isVerifying ? 'opacity-50' : ''}
          `}
        />
      </div>

      <AnimatePresence>
        {errorInfo && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mb-4"
          >
            <p className="text-red-500 text-sm text-center mb-1">
              {errorInfo.message}
            </p>
            {errorInfo.tip && (
              <p className="text-gray-400 text-xs text-center">
                {errorInfo.tip}
              </p>
            )}
            {showHelp && errorType !== 'empty' && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="mt-3 p-3 bg-green-50 rounded-lg text-center"
              >
                <p className="text-xs text-green-700 mb-1">需要帮助？添加客服微信</p>
                <p className="font-mono font-bold text-green-600">lifecurveai</p>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

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
