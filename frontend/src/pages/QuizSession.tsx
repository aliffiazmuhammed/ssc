import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuiz } from '../store/QuizContext';
import { ProgressBar, Timer } from '../components/quiz/QuizHeader';
import { QuestionCard } from '../components/quiz/QuestionCard';
import { SessionSummary } from '../components/quiz/SessionSummary';
import { ArrowRight, ArrowLeft, XCircle, CheckCircle } from 'lucide-react';

const QuizSession: React.FC = () => {
  const { state, submitAnswer, nextQuestion, prevQuestion, resetQuiz, tickTimer, finishQuiz } = useQuiz();
  const navigate = useNavigate();

  // If accessed directly without starting, redirect home
  useEffect(() => {
    if (state.status === 'idle') {
      navigate('/');
    }
  }, [state.status, navigate]);

  // Timer tick
  useEffect(() => {
    if (state.status === 'playing' && state.timeLimit > 0) {
      const interval = setInterval(() => {
        tickTimer();
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [state.status, state.timeLimit, tickTimer]);

  if (state.status === 'idle' || state.questions.length === 0) return null;

  if (state.status === 'finished') {
    return (
      <div className="min-h-screen bg-base-light dark:bg-base-dark flex items-center justify-center p-4 py-12 overflow-y-auto">
        <SessionSummary />
      </div>
    );
  }

  const currentQuestion = state.questions[state.currentIndex];
  const selectedOption = state.answers[currentQuestion?._id] || null;

  const handleSelect = (option: string) => {
    submitAnswer(currentQuestion._id, option, 0); // 0 timeTaken for now
  };

  const handleNext = () => {
    nextQuestion();
  };

  const handlePrev = () => {
    prevQuestion();
  };

  const handleQuit = () => {
    resetQuiz();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-base-light dark:bg-base-dark flex flex-col">
      {/* Header */}
      <header className="w-full bg-surface-light dark:bg-surface-dark border-b border-divider-light dark:border-divider-dark sticky top-0 z-10">
        <ProgressBar current={state.currentIndex} total={state.questions.length} />
        
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <button 
            onClick={handleQuit}
            className="text-secondary-light hover:text-error dark:text-secondary-dark dark:hover:text-error transition-colors flex items-center gap-1"
          >
            <XCircle size={20} />
            <span className="text-sm font-medium hidden sm:inline">Quit</span>
          </button>
          
          <div className="flex items-center space-x-6 sm:space-x-8">
            {state.timeLimit > 0 && (
              <Timer timeRemaining={state.timeRemaining} />
            )}
          </div>
          
          <button
            onClick={finishQuiz}
            className="text-sm font-medium text-accent hover:text-accent/80 transition-colors flex items-center gap-1"
          >
            <CheckCircle size={18} />
            <span className="hidden sm:inline">Submit Quiz</span>
          </button>
        </div>
      </header>

      {/* Main content - centered single column */}
      <main className="flex-1 overflow-hidden flex flex-col relative w-full pt-8 pb-32">
        <QuestionCard
          question={currentQuestion}
          selectedOption={selectedOption}
          onSelect={handleSelect}
          isRevealed={false}
        />
      </main>

      {/* Bottom fixed action bar */}
      <footer className="fixed bottom-0 left-0 right-0 border-t border-divider-light dark:border-divider-dark bg-surface-light/95 dark:bg-surface-dark/95 backdrop-blur supports-[backdrop-filter]:bg-surface-light/80 p-4 z-20">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <button
            onClick={handlePrev}
            disabled={state.currentIndex === 0}
            className="flex items-center space-x-2 px-6 py-3 rounded-xl text-secondary-light dark:text-secondary-dark hover:bg-surface-light dark:hover:bg-surface-dark disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium"
          >
            <ArrowLeft size={20} />
            <span>Previous</span>
          </button>
          
          {state.currentIndex === state.questions.length - 1 ? (
            <button
              onClick={finishQuiz}
              className="flex items-center space-x-2 px-8 py-3.5 rounded-xl text-white bg-success-DEFAULT hover:bg-success-DEFAULT/90 transition-all font-medium text-[16px]"
            >
              <span>Submit Quiz</span>
              <CheckCircle size={20} />
            </button>
          ) : (
            <button
              onClick={handleNext}
              className="flex items-center space-x-2 px-8 py-3.5 rounded-xl text-white bg-accent hover:bg-accent/90 transition-all font-medium text-[16px]"
            >
              <span>Next</span>
              <ArrowRight size={20} />
            </button>
          )}
        </div>
      </footer>
    </div>
  );
};

export default QuizSession;
