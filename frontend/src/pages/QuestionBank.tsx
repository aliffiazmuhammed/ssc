import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, LayoutGrid, List, Bookmark, Check, Loader2 } from 'lucide-react';
import clsx from 'clsx';
import api from '../services/api';
import renderMathInText from '../utils/renderMathInText';
import 'katex/dist/katex.min.css';

interface Question {
  _id: string;
  question: string;
  option1: string;
  option2: string;
  option3: string;
  option4: string;
  answer: string;
  subject: string;
  topic: string;
  subTopic?: string;
  examYearAndType?: string;
}

const SUBJECTS = [
  'Quantitative Aptitude',
  'Reasoning',
  'English',
  'General Awareness',
];

const QuestionBank: React.FC = () => {
  const navigate = useNavigate();
  const [subject, setSubject] = useState<string>(SUBJECTS[0]);
  const [topic, setTopic] = useState<string>('All');
  const [topics, setTopics] = useState<string[]>([]);
  
  const [questions, setQuestions] = useState<Question[]>([]);
  const [page, setPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(10);
  const [totalCount, setTotalCount] = useState<number>(0);
  
  const [loading, setLoading] = useState<boolean>(false);
  const [layout, setLayout] = useState<'card' | 'compact'>('card');
  const [globalShowAnswer, setGlobalShowAnswer] = useState<boolean>(false);
  const [revealedAnswers, setRevealedAnswers] = useState<Set<string>>(new Set());
  const [bookmarkedIds, setBookmarkedIds] = useState<Set<string>>(new Set());

  // Fetch topics when subject changes
  useEffect(() => {
    const fetchTopics = async () => {
      try {
        const res = await api.get(`/questions/topics?subject=${encodeURIComponent(subject)}`);
        setTopics(res.data.data.topics || []);
      } catch (err) {
        console.error('Failed to fetch topics', err);
      }
    };
    fetchTopics();
    setTopic('All');
    setPage(1);
  }, [subject]);

  // Fetch questions when subject, topic, page, or limit changes
  useEffect(() => {
    const fetchQuestions = async () => {
      setLoading(true);
      try {
        let url = `/questions?subject=${encodeURIComponent(subject)}&page=${page}&limit=${limit}`;
        if (topic !== 'All') {
          url += `&topic=${encodeURIComponent(topic)}`;
        }
        const res = await api.get(url);
        const fetchedQuestions = res.data.data.questions || [];
        setQuestions(fetchedQuestions);
        setTotalCount(res.data.data.total || 0);

        // Fetch bookmarks for these questions
        const ids = fetchedQuestions.map((q: Question) => q._id).join(',');
        if (ids) {
          const bRes = await api.get(`/questions/bookmark-ids?questionIds=${ids}`);
          setBookmarkedIds(new Set(bRes.data.data.bookmarkedIds));
        }
      } catch (err) {
        console.error('Failed to fetch questions', err);
      } finally {
        setLoading(false);
      }
    };
    
    // Reset revealed answers on page change
    setGlobalShowAnswer(false);
    setRevealedAnswers(new Set());
    
    fetchQuestions();
  }, [subject, topic, page, limit]);

  const handleTopicChange = (newTopic: string) => {
    setTopic(newTopic);
    setPage(1);
  };

  const handleLimitChange = (newLimit: number) => {
    setLimit(newLimit);
    setPage(1);
  };

  const handleToggleBookmark = async (id: string) => {
    try {
      const res = await api.post(`/questions/${id}/bookmark`);
      setBookmarkedIds(prev => {
        const next = new Set(prev);
        if (res.data.data.isBookmarked) next.add(id);
        else next.delete(id);
        return next;
      });
    } catch (err) {
      console.error('Failed to toggle bookmark', err);
    }
  };

  const toggleReveal = (id: string) => {
    setRevealedAnswers(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const totalPages = Math.ceil(totalCount / limit) || 1;

  const paginationControls = !loading && totalPages > 1 && (
    <div className="flex items-center justify-between bg-surface-light dark:bg-surface-dark p-4 rounded-2xl shadow-sm border border-divider-light dark:border-divider-dark mt-4">
      <button
        onClick={() => setPage(p => Math.max(1, p - 1))}
        disabled={page === 1}
        className="px-4 py-2 rounded-xl text-sm font-bold disabled:opacity-50 disabled:cursor-not-allowed bg-base-light dark:bg-base-dark border border-divider-light dark:border-divider-dark text-primary-light dark:text-primary-dark hover:bg-accent hover:text-white hover:border-accent transition-colors"
      >
        Previous
      </button>
      <span className="text-sm font-bold text-secondary-light dark:text-secondary-dark">
        Page {page} of {totalPages}
      </span>
      <button
        onClick={() => setPage(p => Math.min(totalPages, p + 1))}
        disabled={page === totalPages}
        className="px-4 py-2 rounded-xl text-sm font-bold disabled:opacity-50 disabled:cursor-not-allowed bg-base-light dark:bg-base-dark border border-divider-light dark:border-divider-dark text-primary-light dark:text-primary-dark hover:bg-accent hover:text-white hover:border-accent transition-colors"
      >
        Next
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-base-light dark:bg-base-dark py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/')}
            className="p-2 rounded-full hover:bg-surface-light dark:hover:bg-surface-dark transition-colors text-secondary-light dark:text-secondary-dark"
          >
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-3xl font-extrabold text-primary-light dark:text-primary-dark tracking-tight">
            Question Bank
          </h1>
        </div>

        {/* Controls */}
        <div className="bg-surface-light dark:bg-surface-dark p-4 rounded-2xl shadow-sm border border-divider-light dark:border-divider-dark space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-secondary-light dark:text-secondary-dark mb-1">Subject</label>
              <select
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full bg-base-light dark:bg-base-dark border border-divider-light dark:border-divider-dark rounded-xl px-4 py-2.5 text-primary-light dark:text-primary-dark font-medium focus:ring-2 focus:ring-accent outline-none"
              >
                {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-secondary-light dark:text-secondary-dark mb-1">Topic</label>
              <select
                value={topic}
                onChange={(e) => handleTopicChange(e.target.value)}
                className="w-full bg-base-light dark:bg-base-dark border border-divider-light dark:border-divider-dark rounded-xl px-4 py-2.5 text-primary-light dark:text-primary-dark font-medium focus:ring-2 focus:ring-accent outline-none"
              >
                <option value="All">All Topics</option>
                {topics.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-4 border-t border-divider-light dark:border-divider-dark">
            <div className="flex flex-wrap items-center gap-4 w-full sm:w-auto">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-secondary-light dark:text-secondary-dark">Per page:</span>
                <select
                  value={limit}
                  onChange={(e) => handleLimitChange(Number(e.target.value))}
                  className="bg-base-light dark:bg-base-dark border border-divider-light dark:border-divider-dark rounded-lg px-2 py-1 text-sm font-medium text-primary-light dark:text-primary-dark focus:ring-2 focus:ring-accent outline-none"
                >
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={30}>30</option>
                </select>
              </div>
              
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-secondary-light dark:text-secondary-dark">Layout:</span>
                <div className="flex bg-base-light dark:bg-base-dark border border-divider-light dark:border-divider-dark rounded-lg overflow-hidden">
                  <button
                    onClick={() => setLayout('card')}
                    className={clsx('p-1.5 transition-colors', layout === 'card' ? 'bg-accent text-white' : 'text-secondary-light dark:text-secondary-dark hover:bg-surface-light dark:hover:bg-surface-dark')}
                  >
                    <LayoutGrid size={18} />
                  </button>
                  <button
                    onClick={() => setLayout('compact')}
                    className={clsx('p-1.5 transition-colors', layout === 'compact' ? 'bg-accent text-white' : 'text-secondary-light dark:text-secondary-dark hover:bg-surface-light dark:hover:bg-surface-dark')}
                  >
                    <List size={18} />
                  </button>
                </div>
              </div>
            </div>

            <button
              onClick={() => setGlobalShowAnswer(!globalShowAnswer)}
              className="w-full sm:w-auto px-4 py-2 bg-base-light dark:bg-base-dark border border-divider-light dark:border-divider-dark rounded-xl text-sm font-bold text-accent hover:bg-accent/10 transition-colors"
            >
              {globalShowAnswer ? 'Hide All Answers' : 'Show All Answers'}
            </button>
          </div>
        </div>

        {/* Top Pagination */}
        {paginationControls}

        {/* Questions List */}
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="animate-spin text-accent w-10 h-10" />
          </div>
        ) : questions.length === 0 ? (
          <div className="text-center py-12 bg-surface-light dark:bg-surface-dark rounded-2xl border border-divider-light dark:border-divider-dark">
            <p className="text-secondary-light dark:text-secondary-dark font-medium">No questions found for the selected criteria.</p>
          </div>
        ) : (
          <div className={clsx("space-y-6", layout === 'compact' && "bg-surface-light dark:bg-surface-dark rounded-2xl shadow-card border border-divider-light dark:border-divider-dark p-6 space-y-0 divide-y divide-divider-light dark:divide-divider-dark")}>
            {questions.map((q, index) => {
              const qNumber = (page - 1) * limit + index + 1;
              const isRevealed = globalShowAnswer || revealedAnswers.has(q._id);
              
              if (layout === 'card') {
                return (
                  <div key={q._id} className="bg-surface-light dark:bg-surface-dark rounded-2xl shadow-card p-6 sm:p-8">
                    <div className="flex items-start justify-between gap-4 mb-4">
                      <div className="flex items-center flex-wrap gap-2">
                        <span className="bg-primary-light/5 dark:bg-primary-dark/5 text-primary-light dark:text-primary-dark px-3 py-1 rounded-lg text-sm font-bold font-mono">
                          Q{qNumber}
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
                      <button
                        onClick={() => handleToggleBookmark(q._id)}
                        className={clsx(
                          'p-2 rounded-lg transition-all',
                          bookmarkedIds.has(q._id)
                            ? 'text-accent bg-accent/10'
                            : 'text-secondary-light dark:text-secondary-dark hover:text-accent hover:bg-accent/5'
                        )}
                      >
                        <Bookmark size={18} fill={bookmarkedIds.has(q._id) ? 'currentColor' : 'none'} />
                      </button>
                    </div>

                    <div 
                      className="text-lg font-medium text-primary-light dark:text-primary-dark mb-6"
                      dangerouslySetInnerHTML={{ __html: renderMathInText(q.question) }}
                    />

                    <div className="space-y-3 mb-6">
                      {[q.option1, q.option2, q.option3, q.option4].map((opt, i) => {
                        const isCorrect = opt === q.answer;
                        const showAsCorrect = isRevealed && isCorrect;
                        const dimOther = isRevealed && !isCorrect;

                        return (
                          <div
                            key={i}
                            className={clsx(
                              "w-full text-left px-5 py-4 rounded-xl border flex items-center justify-between transition-all",
                              showAsCorrect 
                                ? "bg-success-tint border-success-DEFAULT border-2 shadow-sm text-success-DEFAULT font-bold" 
                                : "bg-transparent border-divider-light dark:border-divider-dark text-primary-light dark:text-primary-dark",
                              dimOther && "opacity-50"
                            )}
                          >
                            <span dangerouslySetInnerHTML={{ __html: renderMathInText(opt) }} />
                            {showAsCorrect && <Check size={18} className="text-success-DEFAULT" />}
                          </div>
                        );
                      })}
                    </div>
                    
                    {!globalShowAnswer && (
                      <button
                        onClick={() => toggleReveal(q._id)}
                        className="text-sm font-bold text-accent hover:underline"
                      >
                        {isRevealed ? 'Hide Answer' : 'Show Answer'}
                      </button>
                    )}
                  </div>
                );
              } else {
                // Compact Layout
                return (
                  <div key={q._id} className="py-6 first:pt-0 last:pb-0">
                    <div className="flex items-start gap-3">
                      <span className="font-bold text-primary-light dark:text-primary-dark w-8 shrink-0">
                        {qNumber}.
                      </span>
                      <div className="flex-1 space-y-4">
                        <div className="flex justify-between items-start gap-4">
                          <div 
                            className="text-primary-light dark:text-primary-dark leading-relaxed"
                            dangerouslySetInnerHTML={{ __html: renderMathInText(q.question) }}
                          />
                          <button
                            onClick={() => handleToggleBookmark(q._id)}
                            className={clsx(
                              'p-1.5 rounded-lg transition-all shrink-0',
                              bookmarkedIds.has(q._id)
                                ? 'text-accent bg-accent/10'
                                : 'text-secondary-light dark:text-secondary-dark hover:text-accent hover:bg-accent/5'
                            )}
                          >
                            <Bookmark size={16} fill={bookmarkedIds.has(q._id) ? 'currentColor' : 'none'} />
                          </button>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2 text-sm">
                          {[q.option1, q.option2, q.option3, q.option4].map((opt, i) => {
                            const isCorrect = opt === q.answer;
                            const showAsCorrect = isRevealed && isCorrect;
                            const label = String.fromCharCode(65 + i);

                            return (
                              <div
                                key={i}
                                className={clsx(
                                  "flex items-start gap-2 py-1 px-2 rounded",
                                  showAsCorrect ? "bg-success-tint text-success-DEFAULT font-bold" : "text-secondary-light dark:text-secondary-dark"
                                )}
                              >
                                <span className="font-semibold">{label})</span>
                                <span dangerouslySetInnerHTML={{ __html: renderMathInText(opt) }} />
                              </div>
                            );
                          })}
                        </div>
                        
                        {!globalShowAnswer && (
                          <div>
                            <button
                              onClick={() => toggleReveal(q._id)}
                              className="text-xs font-bold text-accent hover:underline bg-accent/10 px-2 py-1 rounded"
                            >
                              {isRevealed ? 'Hide Answer' : 'Show Answer'}
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              }
            })}
          </div>
        )}

        {/* Pagination */}
        {paginationControls}

      </div>
    </div>
  );
};

export default QuestionBank;
