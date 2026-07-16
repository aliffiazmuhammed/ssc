import React from 'react';
import { motion } from 'framer-motion';
import { Check, X } from 'lucide-react';
import clsx from 'clsx';
import 'katex/dist/katex.min.css';
import renderMathInText from '../../utils/renderMathInText';

interface AnswerOptionProps {
  option: string;
  isSelected: boolean;
  isCorrect?: boolean; // undefined = not revealed yet
  isRevealed: boolean;
  onSelect: () => void;
  disabled: boolean;
}

const shakeVariant = {
  shake: {
    x: [-6, 6, -4, 4, 0],
    transition: { duration: 0.3 },
  },
  idle: { x: 0 },
};

export const AnswerOption: React.FC<AnswerOptionProps> = ({
  option,
  isSelected,
  isCorrect,
  isRevealed,
  onSelect,
  disabled,
}) => {
  const getStyles = () => {
    if (!isRevealed) {
      if (isSelected) {
        return 'border-accent bg-accent/10 ring-1 ring-accent text-primary-light dark:text-primary-dark shadow-sm bg-surface-light dark:bg-surface-dark';
      }
      return clsx(
        'border-divider-light dark:border-divider-dark bg-surface-light dark:bg-surface-dark',
        !disabled && 'hover:-translate-y-[1px] hover:shadow-card hover:border-accent/50'
      );
    }
    
    // Revealed state
    if (isSelected && isCorrect) {
      return 'border-success-DEFAULT bg-success-tint text-success-DEFAULT';
    }
    if (isSelected && !isCorrect) {
      return 'border-error-DEFAULT bg-error-tint text-error-DEFAULT';
    }
    if (!isSelected && isCorrect) {
      // Highlight the correct answer if they got it wrong
      return 'border-success-DEFAULT bg-success-tint text-success-DEFAULT';
    }
    
    return 'border-divider-light dark:border-divider-dark opacity-50';
  };

  return (
    <motion.button
      onClick={onSelect}
      disabled={disabled}
      variants={shakeVariant}
      animate={isRevealed && isSelected && !isCorrect ? 'shake' : 'idle'}
      whileTap={!disabled ? { scale: 0.97 } : {}}
      className={clsx(
        'w-full min-h-[56px] px-6 py-4 rounded-xl border-2 text-left text-[16px] transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2',
        getStyles()
      )}
    >
      <div className="flex items-center justify-between">
        <span 
          className="leading-relaxed"
          dangerouslySetInnerHTML={{ __html: renderMathInText(option) }} 
        />
        
        {isRevealed && isCorrect && (isSelected || !isSelected) && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            className="text-success-DEFAULT"
          >
            <Check size={20} strokeWidth={3} />
          </motion.div>
        )}

        {isRevealed && isSelected && !isCorrect && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            className="text-error-DEFAULT"
          >
            <X size={20} strokeWidth={3} />
          </motion.div>
        )}
      </div>
    </motion.button>
  );
};
