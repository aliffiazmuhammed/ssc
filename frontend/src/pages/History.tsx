import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { Loader2, ArrowLeft, Clock, Target, Calendar } from 'lucide-react';
import clsx from 'clsx';

interface QuizSession {
  _id: string;
  quizType: string;
  status: string;
  subject?: string;
  topics?: string[];
  config: {
    totalQuestions: number;
    timeLimit: number;
  };
  results: {
    correctCount: number;
    score: number;
    timeTaken: number;
  };
  completedAt?: string;
  createdAt: string;
}

const History: React.FC = () => {
  const [sessions, setSessions] = useState<QuizSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await api.get('/sessions');
        setSessions(res.data.data.sessions);
      } catch (err: any) {
        setError('Failed to load history.');
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
    }).format(date);
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}m ${s}s`;
  };

  return (
    <div className="min-h-screen bg-base-light dark:bg-base-dark py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex items-center gap-4">
          <Link
            to="/"
            className="p-2 rounded-full hover:bg-surface-light dark:hover:bg-surface-dark transition-colors text-secondary-light dark:text-secondary-dark"
          >
            <ArrowLeft size={24} />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-primary-light dark:text-primary-dark tracking-tight">Your History</h1>
            <p className="mt-1 text-secondary-light dark:text-secondary-dark">Review your past performance</p>
          </div>
        </div>

        {error && (
          <div className="bg-error-tint text-error p-4 rounded-xl font-medium">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="animate-spin text-accent w-10 h-10" />
          </div>
        ) : sessions.length === 0 ? (
          <div className="bg-surface-light dark:bg-surface-dark p-8 rounded-2xl shadow-card text-center">
            <p className="text-secondary-light dark:text-secondary-dark mb-4">You haven't attempted any quizzes yet.</p>
            <Link
              to="/"
              className="inline-block py-2 px-6 rounded-xl bg-accent text-white font-medium hover:bg-accent/90 transition-colors"
            >
              Start Practice
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {sessions.map((session) => {
              const isAbandoned = session.status === 'in-progress';
              return (
              <Link
                key={session._id}
                to={`/history/${session._id}`}
                className={clsx(
                  "block bg-surface-light dark:bg-surface-dark rounded-2xl shadow-card p-6 hover:shadow-lg transition-shadow border",
                  isAbandoned ? "border-warning-DEFAULT/30 hover:border-warning-DEFAULT/50 opacity-80" : "border-transparent hover:border-accent/20"
                )}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <span className={clsx(
                        "text-xs font-bold uppercase tracking-wider px-2 py-1 rounded-md",
                        session.quizType === 'mock' ? "bg-primary-light/10 text-primary-light dark:bg-primary-dark/10 dark:text-primary-dark" : "bg-accent/10 text-accent"
                      )}>
                        {session.quizType}
                      </span>
                      {isAbandoned && (
                        <span className="text-xs font-bold uppercase tracking-wider px-2 py-1 rounded-md bg-warning-DEFAULT/10 text-warning-DEFAULT">
                          Abandoned
                        </span>
                      )}
                      <h3 className="font-semibold text-lg text-primary-light dark:text-primary-dark">
                        {session.subject || 'Mixed Subjects'}
                      </h3>
                    </div>
                    {session.topics && session.topics.length > 0 && (
                      <p className="text-sm text-secondary-light dark:text-secondary-dark line-clamp-1">
                        {session.topics.join(', ')}
                      </p>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-6 text-sm">
                    {!isAbandoned ? (
                      <div className="flex flex-col items-center sm:items-end">
                        <div className="flex items-center gap-1 text-secondary-light dark:text-secondary-dark font-medium mb-1">
                          <Target size={16} /> Score
                        </div>
                        <span className={clsx(
                          "font-mono font-bold text-lg",
                          session.results?.score >= 80 ? "text-success-DEFAULT" : session.results?.score < 50 ? "text-error-DEFAULT" : "text-warning-DEFAULT"
                        )}>
                          {session.results?.score || 0}%
                        </span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center sm:items-end">
                         <span className="text-secondary-light dark:text-secondary-dark font-medium italic">Incomplete</span>
                      </div>
                    )}

                    <div className="w-px h-10 bg-divider-light dark:bg-divider-dark hidden sm:block"></div>

                    <div className="flex flex-col items-center sm:items-end">
                      <div className="flex items-center gap-1 text-secondary-light dark:text-secondary-dark font-medium mb-1">
                        <Clock size={16} /> Time
                      </div>
                      <span className="font-mono font-semibold text-primary-light dark:text-primary-dark">
                        {isAbandoned ? '--:--' : formatTime(session.results?.timeTaken || 0)}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="mt-4 pt-4 border-t border-divider-light dark:border-divider-dark flex items-center justify-between text-xs text-secondary-light dark:text-secondary-dark font-medium">
                  <div className="flex items-center gap-1">
                    <Calendar size={14} />
                    {formatDate(session.completedAt || session.createdAt)}
                  </div>
                  <div>
                    {isAbandoned 
                      ? `${session.config.totalQuestions} Questions`
                      : `${session.results?.correctCount || 0} / ${session.config.totalQuestions} Correct`
                    }
                  </div>
                </div>
              </Link>
            )})}
          </div>
        )}
      </div>
    </div>
  );
};

export default History;
