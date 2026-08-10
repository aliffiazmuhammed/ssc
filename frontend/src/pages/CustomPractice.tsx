import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuiz } from '../store/QuizContext';
import api from '../services/api';
import { Loader2, CheckSquare, Target, ArrowLeft } from 'lucide-react';
import clsx from 'clsx';

interface TopicCount {
  topic: string;
  count: number;
}

type QuizMode = 'practice' | 'mock' | 'rapid';

const CustomPractice: React.FC = () => {
  const { startQuiz } = useQuiz();
  const navigate = useNavigate();

  const [selectedMode] = useState<QuizMode>('practice');

  const [subjects, setSubjects] = useState<string[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<string>('');
  
  const [topics, setTopics] = useState<TopicCount[]>([]);
  const [selectedTopics, setSelectedTopics] = useState<Set<string>>(new Set());
  
  const [questionCount, setQuestionCount] = useState<number>(10);
  const [questionCountRaw, setQuestionCountRaw] = useState<string>('10');
  
  const [timerMode, setTimerMode] = useState<'total' | 'per-question'>('total');
  const [timeValue, setTimeValue] = useState<number>(15);
  const [timeValueRaw, setTimeValueRaw] = useState<string>('15');
  
  const [attemptedStats, setAttemptedStats] = useState<Record<string, { total: number, attempted: number }>>({}); 
  const [source, setSource] = useState<'all' | 'unattempted' | 'bookmarked'>('all');
  
  const [loading, setLoading] = useState(true);
  const [topicsLoading, setTopicsLoading] = useState(false);
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState('');

  // Fetch subjects on mount
  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const res = await api.get('/questions/subjects');
        setSubjects(res.data.data.subjects);
      } catch (err) {
        setError('Failed to load subjects.');
      } finally {
        setLoading(false);
      }
    };
    fetchSubjects();
  }, []);

  // Fetch topics when subject changes
  useEffect(() => {
    if (!selectedSubject) {
      setTopics([]);
      setSelectedTopics(new Set());
      setAttemptedStats({});
      return;
    }
    
    // Fetch attempted stats
    api.get(`/questions/attempted-stats?subject=${encodeURIComponent(selectedSubject)}`)
      .then(res => {
        const stats: Record<string, { total: number, attempted: number }> = {};
        res.data.data.stats.forEach((s: any) => {
          stats[s.topic] = { total: s.totalQuestions, attempted: s.attemptedCount };
        });
        setAttemptedStats(stats);
      })
      .catch(() => {});
    
    const fetchTopics = async () => {
      setTopicsLoading(true);
      try {
        const res = await api.get(`/questions/topics-with-count?subject=${encodeURIComponent(selectedSubject)}`);
        setTopics(res.data.data.topics);
        setSelectedTopics(new Set()); // Reset selected topics
      } catch (err) {
        setError('Failed to load topics.');
      } finally {
        setTopicsLoading(false);
      }
    };
    fetchTopics();
  }, [selectedSubject]);

  const totalAvailableForSelectedTopics = topics
    .filter(t => selectedTopics.has(t.topic))
    .reduce((sum, t) => sum + t.count, 0);

  // Clamp question count if available is less
  useEffect(() => {
    if (totalAvailableForSelectedTopics > 0) {
      if (questionCount > totalAvailableForSelectedTopics) {
        setQuestionCount(totalAvailableForSelectedTopics);
      } else if (questionCount < 10 && totalAvailableForSelectedTopics >= 10) {
        setQuestionCount(10);
      } else if (totalAvailableForSelectedTopics < 10) {
        setQuestionCount(totalAvailableForSelectedTopics);
      }
    }
  }, [totalAvailableForSelectedTopics, questionCount]);

  const toggleTopic = (topic: string) => {
    const newSet = new Set(selectedTopics);
    if (newSet.has(topic)) {
      newSet.delete(topic);
    } else {
      newSet.add(topic);
    }
    setSelectedTopics(newSet);
  };

  const toggleAllTopics = () => {
    if (selectedTopics.size === topics.length) {
      setSelectedTopics(new Set());
    } else {
      setSelectedTopics(new Set(topics.map(t => t.topic)));
    }
  };

  const handleStart = async () => {
    if (!selectedSubject || selectedTopics.size === 0) {
      setError('Please select a subject and at least one topic.');
      return;
    }
    if (questionCount < 1) {
      setError('Please select at least 1 question.');
      return;
    }

    setStarting(true);
    setError('');
    
    try {
      const res = await api.post('/sessions/start', {
        subject: selectedSubject,
        topics: Array.from(selectedTopics),
        count: questionCount,
        quizType: selectedMode,
        timeLimit: timerMode === 'total' ? timeValue * 60 : timeValue * questionCount,
        timerMode,
        source
      });
      
      const fetchedQuestions = res.data.data.questions;
      const session = res.data.data.session;
      
      if (!fetchedQuestions || fetchedQuestions.length === 0) {
        setError('No questions returned from the server.');
        setStarting(false);
        return;
      }
      
      startQuiz(
        session._id,
        fetchedQuestions,
        session.config.timeLimit,
        timerMode,
        timerMode === 'per-question' ? timeValue : 0
      );
      navigate('/quiz');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to start session.');
      setStarting(false);
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin text-accent w-10 h-10" /></div>;
  }

  return (
    <div className="min-h-screen bg-base-light dark:bg-base-dark py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-10">
        
        {/* Header section */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/')}
            className="p-2 rounded-full hover:bg-surface-light dark:hover:bg-surface-dark transition-colors text-secondary-light dark:text-secondary-dark"
          >
            <ArrowLeft size={24} />
          </button>
          <div>
            <h1 className="text-3xl font-extrabold text-primary-light dark:text-primary-dark tracking-tight">
              Custom Practice
            </h1>
            <p className="mt-1 text-secondary-light dark:text-secondary-dark font-medium">
              Configure your practice session.
            </p>
          </div>
        </div>

        {/* Configuration Builder */}
        <div className="bg-surface-light dark:bg-surface-dark rounded-3xl shadow-card border border-divider-light dark:border-divider-dark p-6 sm:p-8 space-y-10">
          
          {/* Subject */}
          <section>
            <h2 className="text-lg font-bold text-primary-light dark:text-primary-dark mb-4 flex items-center gap-3">
              <span className="bg-primary-light dark:bg-primary-dark text-surface-light dark:text-surface-dark w-6 h-6 rounded-md flex items-center justify-center text-sm">1</span>
              Choose Subject
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {subjects.map(sub => (
                <button
                  key={sub}
                  onClick={() => setSelectedSubject(sub)}
                  className={clsx(
                    'p-4 rounded-xl border-2 text-left transition-all',
                    selectedSubject === sub 
                      ? 'border-accent bg-accent/5 text-accent font-semibold' 
                      : 'border-divider-light dark:border-divider-dark text-primary-light dark:text-primary-dark hover:border-accent/40 font-medium'
                  )}
                >
                  {sub}
                </button>
              ))}
            </div>
          </section>

          {/* Topics */}
          {selectedSubject && (
            <section className="animate-in fade-in slide-in-from-top-4 duration-300">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-primary-light dark:text-primary-dark flex items-center gap-3">
                  <span className="bg-primary-light dark:bg-primary-dark text-surface-light dark:text-surface-dark w-6 h-6 rounded-md flex items-center justify-center text-sm">2</span>
                  Select Topics
                </h2>
                <button 
                  onClick={toggleAllTopics}
                  className="text-sm font-bold text-accent hover:text-accent/80 transition-colors bg-accent/10 px-3 py-1.5 rounded-lg"
                >
                  {selectedTopics.size === topics.length ? 'Deselect All' : 'Select All'}
                </button>
              </div>
              
              {topicsLoading ? (
                <div className="py-8 flex justify-center"><Loader2 className="animate-spin text-accent w-8 h-8" /></div>
              ) : topics.length === 0 ? (
                <div className="bg-base-light dark:bg-base-dark rounded-xl p-6 text-center border border-divider-light dark:border-divider-dark">
                  <p className="text-secondary-light dark:text-secondary-dark font-medium">No topics available for this subject.</p>
                </div>
              ) : (
                <div className="flex flex-wrap gap-2.5">
                  {topics.map(t => (
                    <button
                      key={t.topic}
                      onClick={() => toggleTopic(t.topic)}
                      className={clsx(
                        'flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 transition-all text-sm group',
                        selectedTopics.has(t.topic)
                          ? 'border-accent bg-accent text-white shadow-md shadow-accent/20'
                          : 'border-divider-light dark:border-divider-dark text-primary-light dark:text-primary-dark hover:border-accent/40 hover:bg-base-light dark:hover:bg-base-dark'
                      )}
                    >
                      {selectedTopics.has(t.topic) ? (
                        <CheckSquare size={16} />
                      ) : (
                        <div className="w-4 h-4 rounded border-2 border-secondary-light/30 dark:border-secondary-dark/30 group-hover:border-accent/40 transition-colors" />
                      )}
                      <span className="font-semibold">{t.topic}</span>
                      <div className="flex flex-col items-start ml-1">
                        <span className={clsx(
                          "text-xs px-2 py-0.5 rounded-md font-mono font-bold w-full text-center", 
                          selectedTopics.has(t.topic) 
                            ? "bg-white/20 text-white" 
                            : "bg-divider-light dark:bg-divider-dark text-secondary-light dark:text-secondary-dark"
                        )}>
                          {t.count}
                        </span>
                        <span className={clsx("text-[10px] mt-0.5 opacity-80",
                          selectedTopics.has(t.topic) ? "text-white" : "text-secondary-light dark:text-secondary-dark"
                        )}>
                          {attemptedStats[t.topic]?.attempted || 0}/{t.count} done
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </section>
          )}

          {/* Source filter */}
          {selectedTopics.size > 0 && (
            <section className="animate-in fade-in slide-in-from-top-4 duration-300">
              <h2 className="text-lg font-bold text-primary-light dark:text-primary-dark mb-4 flex items-center gap-3">
                <span className="bg-primary-light dark:bg-primary-dark text-surface-light dark:text-surface-dark w-6 h-6 rounded-md flex items-center justify-center text-sm">3</span>
                Question Source
              </h2>
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => setSource('all')}
                  className={clsx(
                    'px-5 py-3 rounded-xl border-2 transition-all font-semibold',
                    source === 'all'
                      ? 'border-accent bg-accent/5 text-accent'
                      : 'border-divider-light dark:border-divider-dark text-primary-light dark:text-primary-dark hover:border-accent/40'
                  )}
                >
                  All Questions
                </button>
                <button
                  onClick={() => setSource('unattempted')}
                  className={clsx(
                    'px-5 py-3 rounded-xl border-2 transition-all font-semibold',
                    source === 'unattempted'
                      ? 'border-accent bg-accent/5 text-accent'
                      : 'border-divider-light dark:border-divider-dark text-primary-light dark:text-primary-dark hover:border-accent/40'
                  )}
                >
                  Unattempted Only
                </button>
                <button
                  onClick={() => setSource('bookmarked')}
                  className={clsx(
                    'px-5 py-3 rounded-xl border-2 transition-all font-semibold',
                    source === 'bookmarked'
                      ? 'border-accent bg-accent/5 text-accent'
                      : 'border-divider-light dark:border-divider-dark text-primary-light dark:text-primary-dark hover:border-accent/40'
                  )}
                >
                  Bookmarked Only
                </button>
              </div>
            </section>
          )}

          {/* Configuration (Count & Timer) */}
          {selectedTopics.size > 0 && (
             <section className="animate-in fade-in slide-in-from-top-4 duration-300">
               <h2 className="text-lg font-bold text-primary-light dark:text-primary-dark mb-6 flex items-center gap-3">
                 <span className="bg-primary-light dark:bg-primary-dark text-surface-light dark:text-surface-dark w-6 h-6 rounded-md flex items-center justify-center text-sm">4</span>
                 Customize Parameters
               </h2>
               
               <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-base-light dark:bg-base-dark p-6 rounded-2xl border border-divider-light dark:border-divider-dark">
                 {/* Count */}
                 <div>
                    <label className="block text-sm font-bold text-secondary-light dark:text-secondary-dark uppercase tracking-wider mb-3">
                      Number of Questions
                    </label>
                    <div className="flex items-center gap-3">
                      <input
                        type="number"
                        min={Math.min(10, totalAvailableForSelectedTopics)}
                        max={totalAvailableForSelectedTopics}
                        value={questionCountRaw}
                        onChange={(e) => setQuestionCountRaw(e.target.value)}
                        onBlur={() => {
                          const val = parseInt(questionCountRaw) || 10;
                          const clamped = Math.max(1, Math.min(val, totalAvailableForSelectedTopics));
                          setQuestionCount(clamped);
                          setQuestionCountRaw(String(clamped));
                        }}
                        className="w-24 px-4 py-3 rounded-xl border-2 border-divider-light dark:border-divider-dark bg-surface-light dark:bg-surface-dark focus:outline-none focus:border-accent focus:ring-4 focus:ring-accent/10 transition-all text-primary-light dark:text-primary-dark font-mono text-lg text-center font-bold"
                      />
                      <span className="text-sm font-medium text-secondary-light dark:text-secondary-dark">
                        of {totalAvailableForSelectedTopics} max
                      </span>
                    </div>
                    {questionCount < 10 && totalAvailableForSelectedTopics >= 10 && (
                      <p className="text-xs font-semibold text-warning-DEFAULT mt-2">Minimum 10 questions recommended.</p>
                    )}
                 </div>

                 {/* Timer */}
                 <div>
                    <div className="flex items-center justify-between mb-3">
                      <label className="block text-sm font-bold text-secondary-light dark:text-secondary-dark uppercase tracking-wider">
                        Time Limit
                      </label>
                      <select 
                        value={timerMode}
                        onChange={(e) => {
                          setTimerMode(e.target.value as 'total' | 'per-question');
                          const newVal = e.target.value === 'total' ? 15 : 60;
                          setTimeValue(newVal);
                          setTimeValueRaw(String(newVal));
                        }}
                        className="text-xs font-bold bg-surface-light dark:bg-surface-dark border-2 border-divider-light dark:border-divider-dark text-primary-light dark:text-primary-dark rounded-lg px-2 py-1 focus:outline-none focus:border-accent"
                      >
                        <option value="total">Total Time</option>
                        <option value="per-question">Per Question</option>
                      </select>
                    </div>

                    <div className="flex items-center gap-3">
                      <input
                        type="number"
                        min={1}
                        value={timeValueRaw}
                        onChange={(e) => setTimeValueRaw(e.target.value)}
                        onBlur={() => {
                          const val = parseInt(timeValueRaw) || 1;
                          const clamped = Math.max(1, val);
                          setTimeValue(clamped);
                          setTimeValueRaw(String(clamped));
                        }}
                        className="w-24 px-4 py-3 rounded-xl border-2 border-divider-light dark:border-divider-dark bg-surface-light dark:bg-surface-dark focus:outline-none focus:border-accent focus:ring-4 focus:ring-accent/10 transition-all text-primary-light dark:text-primary-dark font-mono text-lg text-center font-bold"
                      />
                      <span className="text-sm font-medium text-secondary-light dark:text-secondary-dark">
                        {timerMode === 'total' ? 'minutes total' : 'seconds each'}
                      </span>
                    </div>
                    <div className="mt-3 text-xs font-bold text-accent bg-accent/10 inline-flex px-3 py-1.5 rounded-lg border border-accent/20">
                        Total duration: {(() => {
                          const t = parseInt(timeValueRaw) || 0;
                          const c = parseInt(questionCountRaw) || 0;
                          if (timerMode === 'total') return `${t}m 0s`;
                          const totalSec = t * c;
                          return `${Math.floor(totalSec / 60)}m ${totalSec % 60}s`;
                        })()}
                    </div>
                 </div>
               </div>
           </section>
          )}

          {error && (
            <div className="text-error bg-error-tint p-4 rounded-xl text-sm font-medium border border-error-DEFAULT/20 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-error-DEFAULT"></span>
              {error}
            </div>
          )}

          {selectedTopics.size > 0 && (
             <div className="pt-2">
              <button
                onClick={handleStart}
                disabled={starting}
                className="w-full flex items-center justify-center gap-3 py-4 px-6 rounded-2xl text-white bg-accent hover:bg-accent/90 focus:outline-none focus:ring-4 focus:ring-accent/30 transition-all font-bold text-lg disabled:opacity-70 shadow-lg shadow-accent/20 hover:-translate-y-0.5 active:translate-y-0"
              >
                {starting ? <Loader2 className="animate-spin h-6 w-6" /> : (
                  <>
                    <Target size={24} />
                    Launch Session
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CustomPractice;
