import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuiz } from '../store/QuizContext';
import { ProgressBar, Timer } from '../components/quiz/QuizHeader';
import { QuestionCard } from '../components/quiz/QuestionCard';
import { SessionSummary } from '../components/quiz/SessionSummary';
import { ArrowRight, ArrowLeft, XCircle, CheckCircle, AlertTriangle } from 'lucide-react';
import api from '../services/api';

const QuizSession: React.FC = () => {
  const { state, submitAnswer, nextQuestion, prevQuestion, resetQuiz, tickTimer, finishQuiz } = useQuiz();
  const navigate = useNavigate();
  const [showQuitModal, setShowQuitModal] = useState(false);
  const [bookmarkedIds, setBookmarkedIds] = useState<Set<string>>(new Set());

  // Fetch initial bookmark status for all quiz questions on mount
  useEffect(() => {
    if (state.questions.length > 0) {
      const ids = state.questions.map(q => q._id).join(',');
      api.get(`/questions/bookmark-ids?questionIds=${ids}`)
        .then(res => setBookmarkedIds(new Set(res.data.data.bookmarkedIds)))
        .catch(() => {});
    }
  }, [state.questions]);

  const handleToggleBookmark = async (questionId: string) => {
    try {
      const res = await api.post(`/questions/${questionId}/bookmark`);
      setBookmarkedIds(prev => {
        const next = new Set(prev);
        if (res.data.data.isBookmarked) next.add(questionId);
        else next.delete(questionId);
        return next;
      });
    } catch (err) {
      console.error('Failed to toggle bookmark', err);
    }
  };

  // Prevent accidental reload/leave
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (state.status === 'playing') {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [state.status]);

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

  const handleQuitRequest = () => {
    setShowQuitModal(true);
  };

  const confirmQuit = () => {
    setShowQuitModal(false);
    resetQuiz();
    navigate('/');
  };

  const cancelQuit = () => {
    setShowQuitModal(false);
  };

  return (
    <div className="min-h-screen bg-base-light dark:bg-base-dark flex flex-col">
      {/* Header */}
      <header className="w-full bg-surface-light dark:bg-surface-dark border-b border-divider-light dark:border-divider-dark sticky top-0 z-10">
        <ProgressBar current={state.currentIndex} total={state.questions.length} />
        
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <button 
            onClick={handleQuitRequest}
            className="text-secondary-light hover:text-error dark:text-secondary-dark dark:hover:text-error transition-colors flex items-center gap-1"
          >
            <XCircle size={20} />
            <span className="text-sm font-medium hidden sm:inline">Quit</span>
          </button>
          
          <div className="flex items-center space-x-6 sm:space-x-8">
            {state.timeLimit > 0 && (
              <div className="flex items-center gap-2">
                <Timer timeRemaining={state.timeRemaining} />
                {state.timerMode === 'per-question' && (
                  <span className="text-xs font-medium text-secondary-light dark:text-secondary-dark bg-base-light dark:bg-base-dark px-2 py-1 rounded-lg">
                    per Q
                  </span>
                )}
              </div>
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
          isBookmarked={bookmarkedIds.has(currentQuestion._id)}
          onToggleBookmark={handleToggleBookmark}
        />

        {/* Submit button below question on last question */}
        {state.currentIndex === state.questions.length - 1 && (
          <div className="max-w-2xl mx-auto w-full px-4 mt-6">
            <button
              onClick={finishQuiz}
              className="w-full flex items-center justify-center gap-3 py-4 px-6 rounded-2xl text-white bg-success-DEFAULT hover:bg-success-DEFAULT/90 transition-all font-bold text-lg shadow-lg hover:-translate-y-0.5 active:translate-y-0"
            >
              <CheckCircle size={22} />
              Submit Quiz
            </button>
          </div>
        )}
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

      {/* Quit Warning Modal */}
      {showQuitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-surface-light dark:bg-surface-dark rounded-2xl shadow-xl max-w-md w-full overflow-hidden border border-divider-light dark:border-divider-dark animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 sm:p-8 space-y-6">
              <div className="w-12 h-12 rounded-full bg-error-tint flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="text-error w-6 h-6" />
              </div>
              <div className="text-center space-y-2">
                <h3 className="text-xl font-bold text-primary-light dark:text-primary-dark">
                  Exit Quiz?
                </h3>
                <p className="text-secondary-light dark:text-secondary-dark">
                  Are you sure you want to exit? The quiz will be terminated without valuation. Your progress will be lost.
                </p>
              </div>
              
              <div className="flex flex-col-reverse sm:flex-row gap-3 sm:gap-4 mt-8">
                <button
                  onClick={cancelQuit}
                  className="flex-1 py-3 px-4 rounded-xl text-primary-light dark:text-primary-dark font-medium border border-divider-light dark:border-divider-dark hover:bg-surface-hover-light dark:hover:bg-surface-hover-dark transition-colors"
                >
                  Continue Quiz
                </button>
                <button
                  onClick={confirmQuit}
                  className="flex-1 py-3 px-4 rounded-xl text-white font-medium bg-error hover:bg-error/90 transition-colors"
                >
                  Yes, Exit
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuizSession;
