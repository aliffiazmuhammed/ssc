import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../store/AuthContext';
import { useQuiz } from '../store/QuizContext';
import api from '../services/api';
import { LogOut, Loader2, CheckSquare, Target, Zap, GraduationCap } from 'lucide-react';
import clsx from 'clsx';

interface TopicCount {
  topic: string;
  count: number;
}

type QuizMode = 'practice' | 'mock' | 'rapid';

const StudentHome: React.FC = () => {
  const { user, logout } = useAuth();
  const { startQuiz } = useQuiz();
  const navigate = useNavigate();

  const [selectedMode, setSelectedMode] = useState<QuizMode>('practice');

  const [subjects, setSubjects] = useState<string[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<string>('');
  
  const [topics, setTopics] = useState<TopicCount[]>([]);
  const [selectedTopics, setSelectedTopics] = useState<Set<string>>(new Set());
  
  const [questionCount, setQuestionCount] = useState<number>(10);
  
  const [timerMode, setTimerMode] = useState<'total' | 'per-question'>('total');
  const [timeValue, setTimeValue] = useState<number>(15);
  
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
      return;
    }
    
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
        timerMode
      });
      
      const fetchedQuestions = res.data.data.questions;
      const session = res.data.data.session;
      
      if (!fetchedQuestions || fetchedQuestions.length === 0) {
        setError('No questions returned from the server.');
        setStarting(false);
        return;
      }
      
      startQuiz(session._id, fetchedQuestions, session.config.timeLimit);
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
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h1 className="text-4xl font-extrabold text-primary-light dark:text-primary-dark tracking-tight">
              Dashboard
            </h1>
            <p className="mt-2 text-lg text-secondary-light dark:text-secondary-dark font-medium">
              Welcome back, {user?.name?.split(' ')[0]}
            </p>
          </div>
          <div className="flex items-center gap-4 bg-surface-light dark:bg-surface-dark px-4 py-2.5 rounded-full shadow-sm border border-divider-light dark:border-divider-dark">
            <Link
              to="/history"
              className="flex items-center gap-2 text-sm font-bold text-accent hover:text-accent/80 transition-colors"
            >
              History
            </Link>
            <div className="w-px h-4 bg-divider-light dark:bg-divider-dark"></div>
            <Link
              to="/analytics"
              className="flex items-center gap-2 text-sm font-bold text-accent hover:text-accent/80 transition-colors"
            >
              Analytics
            </Link>
            <div className="w-px h-4 bg-divider-light dark:bg-divider-dark"></div>
            <button
              onClick={logout}
              className="flex items-center space-x-2 text-sm text-secondary-light hover:text-error dark:text-secondary-dark dark:hover:text-error transition-colors font-medium"
            >
              <LogOut size={16} />
              <span>Logout</span>
            </button>
          </div>
        </div>

        {/* Step 1: Mode Selection Cards */}
        <section className="space-y-4">
          <h2 className="text-xl font-bold text-primary-light dark:text-primary-dark flex items-center gap-2">
            Select Practice Mode
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Practice Card */}
            <button
              onClick={() => setSelectedMode('practice')}
              className={clsx(
                'relative flex flex-col items-start p-6 rounded-2xl border-2 transition-all text-left overflow-hidden h-40',
                selectedMode === 'practice' 
                  ? 'border-accent bg-accent text-white shadow-lg shadow-accent/20 scale-[1.02]' 
                  : 'border-divider-light dark:border-divider-dark bg-surface-light dark:bg-surface-dark text-primary-light dark:text-primary-dark hover:border-accent/50'
              )}
            >
              <Target size={28} className={clsx("mb-3", selectedMode === 'practice' ? "text-white" : "text-accent")} />
              <h3 className="font-bold text-lg mb-1">Custom Practice</h3>
              <p className={clsx("text-sm font-medium", selectedMode === 'practice' ? "text-white/80" : "text-secondary-light dark:text-secondary-dark")}>
                Focus on specific subjects and topics.
              </p>
              {selectedMode === 'practice' && (
                <div className="absolute top-0 right-0 p-4 opacity-10">
                  <Target size={100} />
                </div>
              )}
            </button>

            {/* Mock Card */}
            <button
              disabled
              className="relative flex flex-col items-start p-6 rounded-2xl border-2 border-transparent bg-surface-light dark:bg-surface-dark text-primary-light dark:text-primary-dark opacity-60 cursor-not-allowed text-left overflow-hidden h-40"
            >
              <GraduationCap size={28} className="mb-3 text-secondary-light dark:text-secondary-dark" />
              <h3 className="font-bold text-lg mb-1">Mock Exam</h3>
              <p className="text-sm font-medium text-secondary-light dark:text-secondary-dark">
                Full-length simulated test.
              </p>
              <span className="absolute top-4 right-4 bg-divider-light dark:bg-divider-dark text-xs px-2 py-1 rounded-md font-bold text-secondary-light dark:text-secondary-dark">
                Coming Soon
              </span>
            </button>

            {/* Rapid Card */}
            <button
              disabled
              className="relative flex flex-col items-start p-6 rounded-2xl border-2 border-transparent bg-surface-light dark:bg-surface-dark text-primary-light dark:text-primary-dark opacity-60 cursor-not-allowed text-left overflow-hidden h-40"
            >
              <Zap size={28} className="mb-3 text-warning-DEFAULT" />
              <h3 className="font-bold text-lg mb-1">Rapid Fire</h3>
              <p className="text-sm font-medium text-secondary-light dark:text-secondary-dark">
                Speed drills against the clock.
              </p>
              <span className="absolute top-4 right-4 bg-divider-light dark:bg-divider-dark text-xs px-2 py-1 rounded-md font-bold text-secondary-light dark:text-secondary-dark">
                Coming Soon
              </span>
            </button>
          </div>
        </section>

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
                      <span className={clsx(
                        "text-xs px-2 py-0.5 rounded-md font-mono font-bold ml-1", 
                        selectedTopics.has(t.topic) 
                          ? "bg-white/20 text-white" 
                          : "bg-divider-light dark:bg-divider-dark text-secondary-light dark:text-secondary-dark"
                      )}>
                        {t.count}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </section>
          )}

          {/* Configuration (Count & Timer) */}
          {selectedTopics.size > 0 && (
             <section className="animate-in fade-in slide-in-from-top-4 duration-300">
               <h2 className="text-lg font-bold text-primary-light dark:text-primary-dark mb-6 flex items-center gap-3">
                 <span className="bg-primary-light dark:bg-primary-dark text-surface-light dark:text-surface-dark w-6 h-6 rounded-md flex items-center justify-center text-sm">3</span>
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
                        value={questionCount}
                        onChange={(e) => setQuestionCount(parseInt(e.target.value) || 0)}
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
                          setTimeValue(e.target.value === 'total' ? 15 : 60);
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
                        value={timeValue}
                        onChange={(e) => setTimeValue(parseInt(e.target.value) || 1)}
                        className="w-24 px-4 py-3 rounded-xl border-2 border-divider-light dark:border-divider-dark bg-surface-light dark:bg-surface-dark focus:outline-none focus:border-accent focus:ring-4 focus:ring-accent/10 transition-all text-primary-light dark:text-primary-dark font-mono text-lg text-center font-bold"
                      />
                      <span className="text-sm font-medium text-secondary-light dark:text-secondary-dark">
                        {timerMode === 'total' ? 'minutes total' : 'seconds each'}
                      </span>
                    </div>
                    <div className="mt-3 text-xs font-bold text-accent bg-accent/10 inline-flex px-3 py-1.5 rounded-lg border border-accent/20">
                        Total duration: {timerMode === 'total' ? `${timeValue}m 0s` : `${Math.floor((timeValue * questionCount) / 60)}m ${(timeValue * questionCount) % 60}s`}
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

export default StudentHome;
