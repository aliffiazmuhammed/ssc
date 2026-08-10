import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bookmark } from 'lucide-react';
import clsx from 'clsx';
import { AnswerOption } from './AnswerOption';
import renderMathInText from '../../utils/renderMathInText';
import type { Question } from '../../store/QuizContext';

interface QuestionCardProps {
  question: Question;
  selectedOption: string | null;
  onSelect: (option: string) => void;
  isRevealed: boolean;
  isBookmarked?: boolean;
  onToggleBookmark?: (questionId: string) => void;
}

const slideVariants = {
  enter: { x: 24, opacity: 0 },
  center: { x: 0, opacity: 1 },
  exit: { x: -24, opacity: 0 },
};

export const QuestionCard: React.FC<QuestionCardProps> = ({
  question,
  selectedOption,
  onSelect,
  isRevealed,
  isBookmarked,
  onToggleBookmark,
}) => {
  const options = [question.option1, question.option2, question.option3, question.option4];

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={question._id}
        variants={slideVariants}
        initial="enter"
        animate="center"
        exit="exit"
        transition={{ duration: 0.25, ease: 'easeOut' }}
        className="w-full max-w-2xl mx-auto bg-surface-light dark:bg-surface-dark rounded-2xl shadow-card p-8 sm:p-10"
      >
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2 text-xs font-semibold text-accent uppercase tracking-wider">
              <span>{question.subject}</span>
              <span className="w-1 h-1 rounded-full bg-divider-light dark:bg-divider-dark"></span>
              <span>{question.topic}</span>
            </div>
            {onToggleBookmark && (
              <button
                onClick={(e) => { e.stopPropagation(); onToggleBookmark(question._id); }}
                className={clsx(
                  'p-2 rounded-lg transition-all',
                  isBookmarked
                    ? 'text-accent bg-accent/10'
                    : 'text-secondary-light dark:text-secondary-dark hover:text-accent hover:bg-accent/5'
                )}
                title={isBookmarked ? 'Remove bookmark' : 'Bookmark this question'}
              >
                <Bookmark size={18} fill={isBookmarked ? 'currentColor' : 'none'} />
              </button>
            )}
          </div>
          <h2 
            className="text-xl sm:text-2xl font-semibold text-primary-light dark:text-primary-dark leading-snug"
            dangerouslySetInnerHTML={{ __html: renderMathInText(question.question) }}
          />
        </div>

        <div className="space-y-4">
          {options.map((option, index) => {
            const isCorrect = option === question.answer;
            const isSelected = selectedOption === option;

            return (
              <AnswerOption
                key={index}
                option={option}
                isSelected={isSelected}
                isCorrect={isRevealed ? isCorrect : undefined}
                isRevealed={isRevealed}
                onSelect={() => onSelect(option)}
                disabled={isRevealed}
              />
            );
          })}
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
