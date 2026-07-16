import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';

interface ProgressBarProps {
  current: number;
  total: number;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ current, total }) => {
  const progress = total > 0 ? (current / total) * 100 : 0;

  return (
    <div className="w-full bg-divider-light dark:bg-divider-dark h-2 rounded-full overflow-hidden">
      <motion.div
        className="h-full bg-accent"
        initial={{ width: 0 }}
        animate={{ width: `${progress}%` }}
        transition={{ duration: 0.4, ease: "easeOut" }}
      />
    </div>
  );
};

interface StatPulseProps {
  value: number;
  label: string;
}

export const StatPulse: React.FC<StatPulseProps> = ({ value, label }) => {
  return (
    <div className="flex flex-col items-center">
      <span className="text-xs text-secondary-light dark:text-secondary-dark font-medium uppercase tracking-wider mb-1">
        {label}
      </span>
      <AnimatePresence mode="popLayout">
        <motion.span
          key={value}
          initial={{ scale: 1 }}
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 0.3 }}
          className="font-mono text-xl font-bold text-primary-light dark:text-primary-dark"
        >
          {value}
        </motion.span>
      </AnimatePresence>
    </div>
  );
};

interface TimerProps {
  timeRemaining: number;
}

export const Timer: React.FC<TimerProps> = ({ timeRemaining }) => {
  const minutes = Math.floor(timeRemaining / 60);
  const seconds = timeRemaining % 60;
  
  const formattedTime = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  
  const isCritical = timeRemaining <= 15;
  const isWarning = timeRemaining <= 60 && !isCritical;
  
  return (
    <div className="flex flex-col items-center">
      <span className="text-xs text-secondary-light dark:text-secondary-dark font-medium uppercase tracking-wider mb-1">
        Time Left
      </span>
      <motion.span
        animate={isCritical ? { opacity: [1, 0.5, 1], scale: [1, 1.05, 1] } : {}}
        transition={isCritical ? { duration: 1, repeat: Infinity } : {}}
        className={clsx(
          "font-mono text-xl font-bold transition-colors",
          isCritical ? "text-error-DEFAULT" : isWarning ? "text-warning-DEFAULT" : "text-primary-light dark:text-primary-dark"
        )}
      >
        {formattedTime}
      </motion.span>
    </div>
  );
};
