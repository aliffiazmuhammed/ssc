import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { useQuiz } from '../store/QuizContext';
import { Loader2, ArrowLeft, Bookmark, BookmarkX, Play, ChevronLeft, ChevronRight } from 'lucide-react';
import clsx from 'clsx';
import renderMathInText from '../utils/renderMathInText';

interface BookmarkedQuestion {
  _id: string;
  subject: string;
  topic: string;
  question: string;
  option1: string;
  option2: string;
  option3: string;
  option4: string;
  answer: string;
}

const SUBJECTS = ['All', 'Quantitative Aptitude', 'Reasoning', 'English', 'General Awareness'];

const Bookmarks: React.FC = () => {
  const navigate = useNavigate();
  const { startQuiz } = useQuiz();
  
  const [questions, setQuestions] = useState<BookmarkedQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [selectedSubject, setSelectedSubject] = useState('All');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const limit = 20;

  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [startingQuiz, setStartingQuiz] = useState(false);

  useEffect(() => {
    fetchBookmarks();
  }, [selectedSubject, page]);

  const fetchBookmarks = async () => {
    setLoading(true);
    try {
      const subjectQuery = selectedSubject !== 'All' ? `&subject=${encodeURIComponent(selectedSubject)}` : '';
      const res = await api.get(`/questions/bookmarks?page=${page}&limit=${limit}${subjectQuery}`);
      setQuestions(res.data.data.questions);
      setTotalPages(res.data.data.totalPages);
      setTotalCount(res.data.data.total);
    } catch (err) {
      setError('Failed to load bookmarks.');
    } finally {
      setLoading(false);
    }
  };

  const removeBookmark = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await api.delete(`/questions/bookmarks/${id}`);
      setQuestions(prev => prev.filter(q => q._id !== id));
      setTotalCount(prev => prev - 1);
      if (questions.length === 1 && page > 1) {
        setPage(p => p - 1);
      }
    } catch (err) {
      console.error('Failed to remove bookmark', err);
    }
  };

  const startBookmarkQuiz = async () => {
    if (totalCount === 0) return;
    setStartingQuiz(true);
    try {
      const res = await api.post('/sessions/start', {
        subject: selectedSubject === 'All' ? '' : selectedSubject,
        topics: [],
        count: Math.min(totalCount, 30),
        quizType: 'practice',
        timeLimit: 0,
        timerMode: 'total',
        source: 'bookmarked',
      });
      
      const fetchedQuestions = res.data.data.questions;
      const session = res.data.data.session;
      
      startQuiz(session._id, fetchedQuestions, 0, 'total', 0);
      navigate('/quiz');
    } catch (err) {
      setError('Failed to start quiz from bookmarks.');
      setStartingQuiz(false);
    }
  };

  return (
    <div className="min-h-screen bg-base-light dark:bg-base-dark py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link
              to="/"
              className="p-2 rounded-full hover:bg-surface-light dark:hover:bg-surface-dark transition-colors text-secondary-light dark:text-secondary-dark"
            >
              <ArrowLeft size={24} />
            </Link>
            <div>
              <h1 className="text-3xl font-extrabold text-primary-light dark:text-primary-dark tracking-tight">
                Bookmarks
              </h1>
              <p className="mt-1 text-secondary-light dark:text-secondary-dark font-medium">
                Review and practice your saved questions.
              </p>
            </div>
          </div>
          
          <button
            onClick={startBookmarkQuiz}
            disabled={startingQuiz || totalCount === 0}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-accent text-white font-bold hover:bg-accent/90 disabled:opacity-50 transition-all shadow-lg shadow-accent/20"
          >
            {startingQuiz ? <Loader2 className="animate-spin" size={20} /> : <Play size={20} />}
            Practice Bookmarks
          </button>
        </div>

        {/* Subject Filters */}
        <div className="flex flex-wrap gap-2">
          {SUBJECTS.map(subject => (
            <button
              key={subject}
              onClick={() => { setSelectedSubject(subject); setPage(1); }}
              className={clsx(
                'px-4 py-2 rounded-full text-sm font-semibold transition-all border',
                selectedSubject === subject
                  ? 'bg-accent/10 border-accent text-accent'
                  : 'bg-surface-light dark:bg-surface-dark border-divider-light dark:border-divider-dark text-secondary-light dark:text-secondary-dark hover:border-accent/40'
              )}
            >
              {subject}
            </button>
          ))}
        </div>

        {error && (
          <div className="bg-error-tint text-error p-4 rounded-xl font-medium">{error}</div>
        )}

        {/* Questions List */}
        {loading ? (
          <div className="flex justify-center py-12"><Loader2 className="animate-spin text-accent w-10 h-10" /></div>
        ) : questions.length === 0 ? (
          <div className="bg-surface-light dark:bg-surface-dark rounded-2xl p-12 text-center border border-divider-light dark:border-divider-dark">
            <Bookmark className="mx-auto w-12 h-12 text-secondary-light dark:text-secondary-dark mb-4 opacity-50" />
            <h3 className="text-xl font-bold text-primary-light dark:text-primary-dark mb-2">No bookmarks found</h3>
            <p className="text-secondary-light dark:text-secondary-dark">
              {selectedSubject === 'All' 
                ? "You haven't bookmarked any questions yet."
                : `You don't have any bookmarked questions in ${selectedSubject}.`}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {questions.map((q) => {
              const isExpanded = expandedId === q._id;
              
              return (
                <div 
                  key={q._id} 
                  className={clsx(
                    "bg-surface-light dark:bg-surface-dark rounded-2xl border transition-all cursor-pointer",
                    isExpanded ? "border-accent/50 shadow-card" : "border-divider-light dark:border-divider-dark hover:border-accent/30"
                  )}
                  onClick={() => setExpandedId(isExpanded ? null : q._id)}
                >
                  <div className="p-5 sm:p-6">
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <div className="flex items-center flex-wrap gap-2">
                        <span className="text-xs font-semibold uppercase tracking-wider text-secondary-light dark:text-secondary-dark bg-base-light dark:bg-base-dark px-2 py-1 rounded-md border border-divider-light dark:border-divider-dark">
                          {q.subject}
                        </span>
                        <span className="text-xs font-semibold uppercase tracking-wider text-accent bg-accent/10 px-2 py-1 rounded-md">
                          {q.topic}
                        </span>
                      </div>
                      <button
                        onClick={(e) => removeBookmark(q._id, e)}
                        className="text-secondary-light hover:text-error dark:text-secondary-dark dark:hover:text-error transition-colors p-1"
                        title="Remove bookmark"
                      >
                        <BookmarkX size={20} />
                      </button>
                    </div>
                    
                    <div 
                      className="text-lg font-medium text-primary-light dark:text-primary-dark"
                      dangerouslySetInnerHTML={{ __html: renderMathInText(q.question) }}
                    />
                    
                    {isExpanded && (
                      <div className="mt-6 space-y-3 pt-4 border-t border-divider-light dark:border-divider-dark animate-in fade-in duration-200">
                        {[q.option1, q.option2, q.option3, q.option4].map((opt, idx) => {
                          const isCorrect = opt === q.answer;
                          return (
                            <div
                              key={idx}
                              className={clsx(
                                "px-4 py-3 rounded-xl border-2 flex items-center justify-between",
                                isCorrect 
                                  ? "bg-success-tint border-success-DEFAULT text-success-DEFAULT font-bold" 
                                  : "bg-transparent border-divider-light dark:border-divider-dark text-primary-light dark:text-primary-dark"
                              )}
                            >
                              <span dangerouslySetInnerHTML={{ __html: renderMathInText(opt) }} />
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
            
            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-4 pt-6">
                <button
                  disabled={page === 1}
                  onClick={() => setPage(p => p - 1)}
                  className="p-2 rounded-xl bg-surface-light dark:bg-surface-dark border border-divider-light dark:border-divider-dark text-primary-light dark:text-primary-dark disabled:opacity-50 hover:bg-base-light dark:hover:bg-base-dark transition-colors"
                >
                  <ChevronLeft size={24} />
                </button>
                <span className="text-sm font-bold text-secondary-light dark:text-secondary-dark">
                  Page {page} of {totalPages}
                </span>
                <button
                  disabled={page === totalPages}
                  onClick={() => setPage(p => p + 1)}
                  className="p-2 rounded-xl bg-surface-light dark:bg-surface-dark border border-divider-light dark:border-divider-dark text-primary-light dark:text-primary-dark disabled:opacity-50 hover:bg-base-light dark:hover:bg-base-dark transition-colors"
                >
                  <ChevronRight size={24} />
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Bookmarks;
