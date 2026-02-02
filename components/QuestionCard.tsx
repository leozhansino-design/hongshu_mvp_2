'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Question } from '@/lib/questions';

interface QuestionCardProps {
  question: Question;
  questionIndex: number;
  totalQuestions: number;
  selectedOption: number | null;
  onSelect: (optionIndex: number) => void;
}

export function QuestionCard({
  question,
  questionIndex,
  totalQuestions,
  selectedOption,
  onSelect,
}: QuestionCardProps) {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={question.id}
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -50 }}
        transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
        className="w-full"
      >
        {/* 进度指示器 */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-3">
            <span className="text-gray-500 text-sm">
              问题 {questionIndex + 1}/{totalQuestions}
            </span>
            <span className="text-gray-400 text-sm">
              {Math.round(((questionIndex + 1) / totalQuestions) * 100)}%
            </span>
          </div>
          <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: `${(questionIndex / totalQuestions) * 100}%` }}
              animate={{ width: `${((questionIndex + 1) / totalQuestions) * 100}%` }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              className="h-full bg-gray-900 rounded-full"
            />
          </div>
        </div>

        {/* 问题 */}
        <h2 className="text-2xl md:text-3xl font-semibold text-gray-900 text-center mb-10 leading-relaxed">
          {question.question}
        </h2>

        {/* 选项 */}
        <div className="space-y-3">
          {question.options.map((option, index) => (
            <motion.button
              key={index}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onSelect(index)}
              className={`
                w-full p-5 rounded-2xl text-left transition-all duration-300 border-2
                ${selectedOption === index
                  ? 'border-gray-900 bg-gray-900 text-white'
                  : 'border-gray-200 text-gray-600 hover:border-gray-300 hover:text-gray-900'
                }
              `}
            >
              <div className="flex items-center gap-4">
                <span className={`
                  w-8 h-8 rounded-full border-2 flex items-center justify-center text-sm font-medium
                  transition-all duration-300
                  ${selectedOption === index
                    ? 'border-white bg-white text-gray-900'
                    : 'border-gray-300'
                  }
                `}>
                  {String.fromCharCode(65 + index)}
                </span>
                <span className="flex-1 font-medium">{option.text}</span>
              </div>
            </motion.button>
          ))}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
