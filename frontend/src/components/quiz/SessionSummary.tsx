import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import type { Variants } from 'framer-motion';
import { useQuiz } from '../../store/QuizContext';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, TrendingUp, Target, Clock, AlertCircle } from 'lucide-react';

export const SessionSummary: React.FC = () => {
  const { state, resetQuiz } = useQuiz();
  const navigate = useNavigate();
  const [displayScore, setDisplayScore] = useState(0);

  const totalQuestions = state.questions.length;
  const answeredCount = Object.keys(state.answers).length;
  const correctCount = state.score;
  const incorrectCount = answeredCount - correctCount;
  const unansweredCount = totalQuestions - answeredCount;
  
  const accuracy = answeredCount > 0 ? Math.round((correctCount / answeredCount) * 100) : 0;
  
  const timeTakenSeconds = state.timeLimit > 0 ? state.timeLimit - state.timeRemaining : 0;
  const timeTakenFormatted = state.timeLimit > 0 
    ? `${Math.floor(timeTakenSeconds / 60)}m ${timeTakenSeconds % 60}s` 
    : 'Untimed';
    
  const timerExpired = state.timeLimit > 0 && state.timeRemaining === 0;

  // Tween score animation
  useEffect(() => {
    let startTime: number;
    const duration = 800; // ms

    const animateScore = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      setDisplayScore(Math.floor(progress * correctCount));

      if (progress < 1) {
        requestAnimationFrame(animateScore);
      } else {
        setDisplayScore(correctCount);
      }
    };

    requestAnimationFrame(animateScore);
  }, [correctCount]);

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="w-full max-w-lg mx-auto bg-surface-light dark:bg-surface-dark rounded-2xl shadow-card p-8 sm:p-10 text-center"
    >
      {timerExpired && (
        <motion.div variants={itemVariants} className="mb-6 bg-warning-tint text-warning-DEFAULT p-3 rounded-xl flex items-center justify-center gap-2">
          <AlertCircle size={20} />
          <span className="font-semibold text-sm">Time's up! The session was auto-submitted.</span>
        </motion.div>
      )}

      <motion.div variants={itemVariants} className="mb-8">
        <div className="w-16 h-16 bg-success-tint rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 className="text-success-DEFAULT w-8 h-8" />
        </div>
        <h2 className="text-3xl font-bold text-primary-light dark:text-primary-dark">Session Complete!</h2>
        <p className="text-secondary-light dark:text-secondary-dark mt-2">Here is how you performed.</p>
      </motion.div>

      <motion.div variants={itemVariants} className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-base-light dark:bg-base-dark p-4 rounded-xl">
          <div className="flex justify-center mb-2">
            <Target className="text-accent w-5 h-5" />
          </div>
          <div className="font-mono text-3xl font-bold text-primary-light dark:text-primary-dark">
            {displayScore} <span className="text-lg text-secondary-light dark:text-secondary-dark">/ {totalQuestions}</span>
          </div>
          <div className="text-xs font-semibold text-secondary-light dark:text-secondary-dark uppercase mt-1">
            Total Score
          </div>
        </div>

        <div className="bg-base-light dark:bg-base-dark p-4 rounded-xl flex flex-col justify-center">
          <div className="flex justify-center mb-2">
            <Clock className="text-secondary-light dark:text-secondary-dark w-5 h-5" />
          </div>
          <div className="font-mono text-2xl font-bold text-primary-light dark:text-primary-dark">
            {timeTakenFormatted}
          </div>
          <div className="text-xs font-semibold text-secondary-light dark:text-secondary-dark uppercase mt-1">
            Time Taken
          </div>
        </div>
      </motion.div>

      <motion.div variants={itemVariants} className="grid grid-cols-3 gap-3 mb-10">
        <div className="bg-success-tint p-3 rounded-xl flex flex-col justify-center border border-success-DEFAULT/20">
          <div className="font-mono text-2xl font-bold text-success-DEFAULT">{correctCount}</div>
          <div className="text-[10px] font-bold text-success-DEFAULT uppercase mt-1">Correct</div>
        </div>
        <div className="bg-error-tint p-3 rounded-xl flex flex-col justify-center border border-error-DEFAULT/20">
          <div className="font-mono text-2xl font-bold text-error-DEFAULT">{incorrectCount}</div>
          <div className="text-[10px] font-bold text-error-DEFAULT uppercase mt-1">Incorrect</div>
        </div>
        <div className="bg-divider-light dark:bg-divider-dark p-3 rounded-xl flex flex-col justify-center">
          <div className="font-mono text-2xl font-bold text-secondary-light dark:text-secondary-dark">{unansweredCount}</div>
          <div className="text-[10px] font-bold text-secondary-light dark:text-secondary-dark uppercase mt-1">Unanswered</div>
        </div>
      </motion.div>

      <motion.div variants={itemVariants} className="grid grid-cols-2 gap-4 mb-8">
        <div>
          <div className="font-mono text-xl font-bold text-primary-light dark:text-primary-dark">{accuracy}%</div>
          <div className="text-[10px] font-semibold text-secondary-light dark:text-secondary-dark uppercase mt-1">Accuracy</div>
        </div>
        <div>
          <div className="font-mono text-xl font-bold text-primary-light dark:text-primary-dark flex items-center justify-center gap-1">
            <TrendingUp size={16} className="text-warning-DEFAULT" /> {state.maxStreak}
          </div>
          <div className="text-[10px] font-semibold text-secondary-light dark:text-secondary-dark uppercase mt-1">Max Streak</div>
        </div>
      </motion.div>

      <motion.div variants={itemVariants} className="space-y-3">
        {state.sessionId && (
          <button
            onClick={() => {
              navigate(`/history/${state.sessionId}`);
            }}
            className="w-full py-3.5 rounded-xl bg-surface-light dark:bg-surface-dark border-2 border-accent text-accent font-semibold hover:bg-accent hover:text-white transition-colors"
          >
            View Detailed Review
          </button>
        )}
        <button
          onClick={() => {
            resetQuiz();
            navigate('/');
          }}
          className="w-full py-3.5 rounded-xl bg-accent text-white font-semibold hover:bg-accent/90 transition-colors"
        >
          Practice More
        </button>
      </motion.div>
    </motion.div>
  );
};
