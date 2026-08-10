import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { useQuiz } from '../store/QuizContext';
import { Loader2, ArrowLeft, Bookmark, BookmarkX, Play, ChevronLeft, ChevronRight, BookOpen } from 'lucide-react';
import clsx from 'clsx';
import renderMathInText from '../utils/renderMathInText';
import WordCard from '../components/vocab/WordCard';

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
  
  // Vocabulary state
  const [activeTab, setActiveTab] = useState<'questions' | 'vocabulary'>('questions');
  const [vocabWords, setVocabWords] = useState<any[]>([]);
  const [vocabPage, setVocabPage] = useState(1);
  const [vocabTotalPages, setVocabTotalPages] = useState(1);
  const [vocabTotalCount, setVocabTotalCount] = useState(0);
  const vocabLimit = 20;
  const [loadingVocab, setLoadingVocab] = useState(false);

  useEffect(() => {
    if (activeTab === 'questions') {
      fetchBookmarks();
    } else {
      fetchVocabBookmarks();
    }
  }, [selectedSubject, page, activeTab, vocabPage]);

  const fetchVocabBookmarks = async () => {
    setLoadingVocab(true);
    try {
      const res = await api.get(`/vocab/bookmarks?page=${vocabPage}&limit=${vocabLimit}`);
      setVocabWords(res.data.data.words);
      setVocabTotalPages(res.data.data.pagination.pages);
      setVocabTotalCount(res.data.data.pagination.total);
    } catch (err) {
      setError('Failed to load vocabulary bookmarks.');
    } finally {
      setLoadingVocab(false);
    }
  };

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

  const removeVocabBookmark = async (id: string) => {
    try {
      await api.post(`/vocab/words/${id}/bookmark`);
      setVocabWords(prev => prev.filter(w => w._id !== id));
      setVocabTotalCount(prev => prev - 1);
      if (vocabWords.length === 1 && vocabPage > 1) {
        setVocabPage(p => p - 1);
      }
    } catch (err) {
      console.error('Failed to remove vocab bookmark', err);
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
        <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-pink-500 to-rose-500 p-8 sm:p-10 shadow-lg shadow-pink-500/20">
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none"></div>
          
          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <Link
                to="/"
                className="p-2 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-md border border-white/20 text-white transition-all shadow-sm flex items-center justify-center"
              >
                <ArrowLeft size={24} />
              </Link>
              <div>
                <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-1">
                  Bookmarks
                </h1>
                <p className="text-white/90 font-medium">
                  Review and practice your saved questions.
                </p>
              </div>
            </div>
            
            <button
              onClick={startBookmarkQuiz}
              disabled={startingQuiz || totalCount === 0 || activeTab === 'vocabulary'}
              className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-white text-pink-600 font-extrabold hover:bg-white/90 disabled:opacity-50 transition-all shadow-lg hover:-translate-y-0.5 active:translate-y-0"
            >
              {startingQuiz ? <Loader2 className="animate-spin" size={20} /> : <Play size={20} />}
              Practice Questions
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-divider-light dark:border-divider-dark">
          <button
            onClick={() => setActiveTab('questions')}
            className={clsx(
              "px-6 py-3 text-sm font-bold border-b-2 transition-colors",
              activeTab === 'questions' 
                ? "border-pink-500 text-pink-500" 
                : "border-transparent text-secondary-light dark:text-secondary-dark hover:text-primary-light dark:hover:text-primary-dark"
            )}
          >
            Questions
          </button>
          <button
            onClick={() => setActiveTab('vocabulary')}
            className={clsx(
              "px-6 py-3 text-sm font-bold border-b-2 transition-colors",
              activeTab === 'vocabulary' 
                ? "border-pink-500 text-pink-500" 
                : "border-transparent text-secondary-light dark:text-secondary-dark hover:text-primary-light dark:hover:text-primary-dark"
            )}
          >
            Vocabulary
          </button>
        </div>

        {/* Subject Filters (Only for Questions Tab) */}
        {activeTab === 'questions' && (
          <div className="flex flex-wrap gap-2">
            {SUBJECTS.map(subject => (
              <button
                key={subject}
                onClick={() => { setSelectedSubject(subject); setPage(1); }}
                className={clsx(
                  'px-4 py-2 rounded-full text-sm font-semibold transition-all border',
                  selectedSubject === subject
                    ? 'bg-pink-500 text-white shadow-md shadow-pink-500/20'
                    : 'bg-surface-light dark:bg-surface-dark border-divider-light dark:border-divider-dark text-secondary-light dark:text-secondary-dark hover:border-pink-500/40 hover:text-pink-500'
                )}
              >
                {subject}
              </button>
            ))}
          </div>
        )}

        {error && (
          <div className="bg-error-tint text-error p-4 rounded-xl font-medium">{error}</div>
        )}

        {/* Questions List */}
        {activeTab === 'questions' && (
          loading ? (
            <div className="flex justify-center py-12"><Loader2 className="animate-spin text-pink-500 w-10 h-10" /></div>
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
                    "bg-surface-light dark:bg-surface-dark rounded-[1.5rem] border transition-all cursor-pointer",
                    isExpanded ? "border-pink-500/50 shadow-sm" : "border-divider-light dark:border-divider-dark hover:border-pink-500/30"
                  )}
                  onClick={() => setExpandedId(isExpanded ? null : q._id)}
                >
                  <div className="p-5 sm:p-6">
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <div className="flex items-center flex-wrap gap-2">
                        <span className="text-xs font-semibold uppercase tracking-wider text-secondary-light dark:text-secondary-dark bg-base-light dark:bg-base-dark px-2 py-1 rounded-md border border-divider-light dark:border-divider-dark">
                          {q.subject}
                        </span>
                        <span className="text-xs font-semibold uppercase tracking-wider text-pink-500 bg-pink-500/10 px-2 py-1 rounded-md">
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

        {/* Vocabulary List */}
        {activeTab === 'vocabulary' && (
          loadingVocab ? (
            <div className="flex justify-center py-12"><Loader2 className="animate-spin text-pink-500 w-10 h-10" /></div>
          ) : vocabWords.length === 0 ? (
            <div className="bg-surface-light dark:bg-surface-dark rounded-2xl p-12 text-center border border-divider-light dark:border-divider-dark">
              <BookOpen className="mx-auto w-12 h-12 text-secondary-light dark:text-secondary-dark mb-4 opacity-50" />
              <h3 className="text-xl font-bold text-primary-light dark:text-primary-dark mb-2">No vocabulary bookmarked</h3>
              <p className="text-secondary-light dark:text-secondary-dark">
                You haven't bookmarked any vocabulary words yet. Explore the dictionary to save words!
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {vocabWords.map((word) => (
                <WordCard 
                  key={word._id} 
                  word={word} 
                  onToggleStudy={async (id) => {
                    // Update study status in place
                    setVocabWords(prev => prev.map(w => w._id === id ? { ...w, isStudied: !w.isStudied } : w));
                    await api.post(`/vocab/words/${id}/study`);
                  }}
                  isBookmarked={true}
                  onToggleBookmark={removeVocabBookmark}
                />
              ))}

              {/* Vocab Pagination */}
              {vocabTotalPages > 1 && (
                <div className="flex items-center justify-center gap-4 pt-6">
                  <button
                    disabled={vocabPage === 1}
                    onClick={() => setVocabPage(p => p - 1)}
                    className="p-2 rounded-xl bg-surface-light dark:bg-surface-dark border border-divider-light dark:border-divider-dark text-primary-light dark:text-primary-dark disabled:opacity-50 hover:bg-base-light dark:hover:bg-base-dark transition-colors"
                  >
                    <ChevronLeft size={24} />
                  </button>
                  <span className="text-sm font-bold text-secondary-light dark:text-secondary-dark">
                    Page {vocabPage} of {vocabTotalPages}
                  </span>
                  <button
                    disabled={vocabPage === vocabTotalPages}
                    onClick={() => setVocabPage(p => p + 1)}
                    className="p-2 rounded-xl bg-surface-light dark:bg-surface-dark border border-divider-light dark:border-divider-dark text-primary-light dark:text-primary-dark disabled:opacity-50 hover:bg-base-light dark:hover:bg-base-dark transition-colors"
                  >
                    <ChevronRight size={24} />
                  </button>
                </div>
              )}
            </div>
          )
        )}
      </div>
    </div>
  );
};

export default Bookmarks;
