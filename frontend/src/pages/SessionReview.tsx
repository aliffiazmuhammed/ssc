import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import { Loader2, ArrowLeft, Check, X } from 'lucide-react';
import clsx from 'clsx';
import type { Question } from '../store/QuizContext';
import renderMathInText from '../utils/renderMathInText';
import 'katex/dist/katex.min.css';

interface Attempt {
  _id: string;
  questionId: Question;
  selectedOption: string | null;
  isCorrect: boolean;
  timeTaken: number;
}

interface SessionData {
  session: any;
  attempts: Attempt[];
}

const SessionReview: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [data, setData] = useState<SessionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const res = await api.get(`/sessions/${id}`);
        setData(res.data.data);
      } catch (err: any) {
        setError('Failed to load session details.');
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchSession();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-accent w-10 h-10" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center flex-col gap-4">
        <div className="bg-error-tint text-error p-4 rounded-xl font-medium">{error || 'Session not found'}</div>
        <Link to="/history" className="text-accent hover:underline">Back to History</Link>
      </div>
    );
  }

  const { session, attempts } = data;

  return (
    <div className="min-h-screen bg-base-light dark:bg-base-dark py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex items-center gap-4 mb-8">
          <Link
            to="/history"
            className="p-2 rounded-full hover:bg-surface-light dark:hover:bg-surface-dark transition-colors text-secondary-light dark:text-secondary-dark"
          >
            <ArrowLeft size={24} />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-primary-light dark:text-primary-dark tracking-tight">Session Review</h1>
            <p className="mt-1 text-secondary-light dark:text-secondary-dark">
              Score: {session.results.score}% • Correct: {session.results.correctCount}/{session.config.totalQuestions}
            </p>
          </div>
        </div>

        <div className="space-y-6">
          {attempts.map((attempt, index) => {
            const q = attempt.questionId;
            if (!q) return null; // Fallback if question was deleted

            const isCorrect = attempt.isCorrect;
            const isUnanswered = attempt.selectedOption === null;

            return (
              <div key={attempt._id} className="bg-surface-light dark:bg-surface-dark rounded-2xl shadow-card p-6 sm:p-8">
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="flex items-center flex-wrap gap-2">
                    <span className="bg-primary-light/5 dark:bg-primary-dark/5 text-primary-light dark:text-primary-dark px-3 py-1 rounded-lg text-sm font-bold font-mono">
                      Q{index + 1}
                    </span>
                    <span className="text-xs font-semibold uppercase tracking-wider text-secondary-light dark:text-secondary-dark bg-base-light dark:bg-base-dark px-2 py-1 rounded-md">
                      {q.topic}
                    </span>
                    {q.examYearAndType && (
                      <span className="text-xs font-semibold tracking-wider text-accent bg-accent/10 px-2 py-1 rounded-md border border-accent/20">
                        {q.examYearAndType}
                      </span>
                    )}
                  </div>
                  {isUnanswered ? (
                    <div className="flex items-center gap-1 text-secondary-light dark:text-secondary-dark bg-base-light dark:bg-base-dark px-3 py-1 rounded-lg text-sm font-medium">
                      Unanswered
                    </div>
                  ) : isCorrect ? (
                    <div className="flex items-center gap-1 text-success-DEFAULT bg-success-tint px-3 py-1 rounded-lg text-sm font-medium">
                      <Check size={16} /> Correct
                    </div>
                  ) : (
                    <div className="flex items-center gap-1 text-error-DEFAULT bg-error-tint px-3 py-1 rounded-lg text-sm font-medium">
                      <X size={16} /> Incorrect
                    </div>
                  )}
                </div>

                <div 
                  className="text-lg font-medium text-primary-light dark:text-primary-dark mb-6"
                  dangerouslySetInnerHTML={{ __html: renderMathInText(q.question) }}
                />

                <div className="space-y-3">
                  {[q.option1, q.option2, q.option3, q.option4].map((opt, i) => {
                    const isSelected = attempt.selectedOption === opt;
                    const isActualAnswer = q.answer === opt;

                    let bgClass = "bg-transparent border-divider-light dark:border-divider-dark";
                    let textClass = "text-primary-light dark:text-primary-dark";
                    let icon = null;

                    if (isActualAnswer) {
                      bgClass = "bg-success-tint border-success-DEFAULT border-2 shadow-sm";
                      textClass = "text-success-DEFAULT font-bold";
                      icon = <Check size={18} className="text-success-DEFAULT" />;
                    } else if (isSelected && !isActualAnswer) {
                      bgClass = "bg-error-tint border-error-DEFAULT border-2";
                      textClass = "text-error-DEFAULT font-medium";
                      icon = <X size={18} className="text-error-DEFAULT" />;
                    }

                    return (
                      <div
                        key={i}
                        className={clsx(
                          "w-full text-left px-5 py-4 rounded-xl border flex items-center justify-between transition-all",
                          bgClass, textClass
                        )}
                      >
                        <span dangerouslySetInnerHTML={{ __html: renderMathInText(opt) }} />
                        {icon}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default SessionReview;
