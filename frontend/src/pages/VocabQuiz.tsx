import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2, CheckCircle2, XCircle } from 'lucide-react';
import api from '../services/api';
import clsx from 'clsx';

const CATEGORY_NAMES: Record<string, string> = {
  'ows': 'One Word Substitutions',
  'synonyms-antonyms': 'Synonyms & Antonyms',
  'idioms-phrases': 'Idioms & Phrases'
};

type QuizPhase = 'config' | 'quiz' | 'results';

const VocabQuiz: React.FC = () => {
  const { vocabType } = useParams<{ vocabType: string }>();
  const navigate = useNavigate();

  const [phase, setPhase] = useState<QuizPhase>('config');
  
  // Config state
  const [count, setCount] = useState<number>(10);
  const [source, setSource] = useState<'all' | 'top200' | 'studied' | 'unstudied'>('all');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Quiz state
  const [questions, setQuestions] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  
  // Results state
  const [results, setResults] = useState<any>(null);

  const title = vocabType ? CATEGORY_NAMES[vocabType] || 'Vocabulary' : 'Vocabulary';

  const handleStart = async () => {
    if (!vocabType) return;
    setLoading(true);
    setError('');
    try {
      const res = await api.post('/vocab/quiz/generate', { vocabType, count, source });
      setQuestions(res.data.data || []);
      setPhase('quiz');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to generate quiz');
    } finally {
      setLoading(false);
    }
  };

  const handleAnswer = (option: string) => {
    const q = questions[currentIndex];
    const id = q.wordId || q._id;
    setAnswers(prev => ({ ...prev, [id]: option }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const formattedAnswers = questions.map(q => {
        const id = q.wordId || q._id;
        return {
          wordId: id,
          selectedOption: answers[id] || '',
          correctAnswer: q.correctAnswer
        };
      });

      const res = await api.post('/vocab/quiz/submit', {
        vocabType,
        answers: formattedAnswers
      });
      setResults(res.data.data);
      setPhase('results');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to submit quiz');
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setPhase('config');
    setQuestions([]);
    setCurrentIndex(0);
    setAnswers({});
    setResults(null);
  };

  if (phase === 'config') {
    return (
      <div className="min-h-screen bg-base-light dark:bg-base-dark py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto space-y-8">
          <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-pink-500 to-fuchsia-600 p-8 sm:p-10 shadow-lg shadow-pink-500/20">
            <div className="absolute -top-24 -right-24 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none"></div>
            <div className="relative z-10 flex items-center gap-4">
              <button
                onClick={() => navigate('/vocab')}
                className="p-2 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-md border border-white/20 text-white transition-all shadow-sm"
              >
                <ArrowLeft size={24} />
              </button>
              <h1 className="text-3xl font-extrabold text-white tracking-tight">
                Quiz: {title}
              </h1>
            </div>
          </div>

          <div className="bg-surface-light dark:bg-surface-dark rounded-[2rem] p-8 border border-divider-light dark:border-divider-dark shadow-sm space-y-10">
            <div>
              <label className="block text-sm font-bold text-secondary-light dark:text-secondary-dark uppercase tracking-wider mb-4">
                Number of Questions
              </label>
              <div className="flex bg-base-light dark:bg-base-dark p-1.5 rounded-2xl overflow-x-auto scrollbar-hide shadow-inner border border-divider-light dark:border-divider-dark gap-1">
                {[10, 20, 30].map(c => (
                  <button
                    key={c}
                    onClick={() => setCount(c)}
                    className={clsx(
                      "flex-1 py-3 rounded-xl font-bold transition-all duration-300",
                      count === c 
                        ? "bg-surface-light dark:bg-surface-dark text-pink-600 dark:text-pink-400 shadow-sm ring-1 ring-divider-light dark:ring-divider-dark" 
                        : "text-secondary-light dark:text-secondary-dark hover:text-primary-light dark:hover:text-primary-dark hover:bg-surface-light/50 dark:hover:bg-surface-dark/50"
                    )}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-secondary-light dark:text-secondary-dark uppercase tracking-wider mb-4">
                Question Source
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { id: 'all', label: 'All Words' },
                  { id: 'top200', label: 'Top 200 Only' },
                  { id: 'studied', label: 'Studied Words' },
                  { id: 'unstudied', label: 'Unstudied Words' }
                ].map(s => (
                  <button
                    key={s.id}
                    onClick={() => setSource(s.id as any)}
                    className={clsx(
                      "py-4 px-4 rounded-2xl border font-bold transition-all duration-300 text-center",
                      source === s.id 
                        ? "border-pink-500 bg-pink-500/10 text-pink-600 dark:text-pink-400 shadow-sm" 
                        : "border-divider-light dark:border-divider-dark bg-base-light dark:bg-base-dark text-secondary-light dark:text-secondary-dark hover:border-pink-500/40 hover:text-primary-light dark:hover:text-primary-dark"
                    )}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            {error && (
              <div className="text-error bg-error-tint p-4 rounded-xl text-sm font-medium border border-error-DEFAULT/20">
                {error}
              </div>
            )}

              <button
                onClick={handleStart}
                disabled={loading}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-pink-500 to-fuchsia-600 text-white font-extrabold text-lg shadow-md shadow-pink-500/20 hover:shadow-lg hover:shadow-pink-500/40 hover:-translate-y-0.5 transition-all disabled:opacity-70 disabled:hover:translate-y-0"
              >
                {loading ? <Loader2 className="animate-spin mx-auto" /> : 'Start Quiz'}
              </button>
          </div>
        </div>
      </div>
    );
  }

  if (phase === 'quiz') {
    const q = questions[currentIndex];
    const isLast = currentIndex === questions.length - 1;
    const answeredCount = Object.keys(answers).length;

    return (
      <div className="min-h-screen bg-base-light dark:bg-base-dark py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto flex flex-col min-h-[calc(100vh-4rem)]">
          
          {/* Progress */}
          <div className="mb-8">
             <div className="flex justify-between text-sm font-bold text-secondary-light dark:text-secondary-dark mb-2">
               <span>Question {currentIndex + 1} of {questions.length}</span>
               <span>{answeredCount} Answered</span>
             </div>
             <div className="w-full h-2 bg-divider-light dark:bg-divider-dark rounded-full overflow-hidden">
               <div 
                 className="h-full bg-gradient-to-r from-pink-500 to-fuchsia-600 transition-all duration-300"
                 style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
               />
             </div>
          </div>

          {/* Question Area */}
          <div className="flex-grow flex flex-col justify-center">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-primary-light dark:text-primary-dark text-center mb-12 leading-relaxed">
              {q.question}
            </h2>

            <div className="grid grid-cols-1 gap-4 max-w-2xl mx-auto w-full">
              {q.options.map((opt: string, i: number) => {
                const id = q.wordId || q._id;
                const isSelected = answers[id] === opt;
                return (
                  <button
                    key={i}
                    onClick={() => handleAnswer(opt)}
                    className={clsx(
                      "p-5 sm:p-6 rounded-[1.5rem] border-2 text-left transition-all duration-300 font-bold text-lg group relative overflow-hidden",
                      isSelected
                        ? "border-pink-500 bg-pink-500/10 text-pink-600 dark:text-pink-400 shadow-md sm:scale-[1.02]"
                        : "border-divider-light dark:border-divider-dark text-primary-light dark:text-primary-dark hover:border-pink-500/40 hover:bg-surface-light dark:hover:bg-surface-dark bg-base-light dark:bg-base-dark"
                    )}
                  >
                    <div className="flex items-center gap-4 relative z-10">
                      <div className={clsx(
                        "w-6 h-6 sm:w-8 sm:h-8 rounded-full border-2 flex items-center justify-center transition-colors shrink-0",
                        isSelected ? "border-pink-500 bg-pink-500" : "border-secondary-light dark:border-secondary-dark group-hover:border-pink-400"
                      )}>
                        {isSelected && <div className="w-2 h-2 sm:w-3 sm:h-3 bg-white rounded-full" />}
                      </div>
                      <span className="leading-tight">{opt}</span>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Controls */}
          <div className="mt-10 flex justify-between items-center max-w-2xl mx-auto w-full">
            <button
              onClick={() => setCurrentIndex(i => Math.max(0, i - 1))}
              disabled={currentIndex === 0}
              className="px-6 py-3 rounded-xl font-bold text-secondary-light dark:text-secondary-dark disabled:opacity-50 hover:bg-surface-light dark:hover:bg-surface-dark transition-colors"
            >
              Previous
            </button>
            
            {isLast ? (
              <button
                onClick={handleSubmit}
                disabled={answeredCount < questions.length || loading}
                className="px-8 py-3 rounded-2xl font-bold text-white bg-gradient-to-r from-pink-500 to-fuchsia-600 hover:opacity-90 disabled:opacity-50 transition-all shadow-md shadow-pink-500/20 hover:shadow-lg hover:-translate-y-0.5 flex items-center gap-2"
              >
                {loading && <Loader2 className="animate-spin w-4 h-4" />}
                Submit Quiz
              </button>
            ) : (
              <button
                onClick={() => setCurrentIndex(i => Math.min(questions.length - 1, i + 1))}
                className="px-8 py-3 rounded-2xl font-bold text-white bg-primary-light dark:bg-primary-dark hover:bg-opacity-90 transition-all shadow-md hover:-translate-y-0.5"
              >
                Next
              </button>
            )}
          </div>

        </div>
      </div>
    );
  }

  // phase === 'results'
  const percentage = Math.round((results.score / results.totalQuestions) * 100);
  
  return (
    <div className="min-h-screen bg-base-light dark:bg-base-dark py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-10">
        
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-extrabold text-primary-light dark:text-primary-dark">Quiz Results</h1>
          
          <div className="relative w-36 h-36 mx-auto mt-8 mb-4">
            <div className="absolute inset-0 bg-gradient-to-tr from-pink-500 to-fuchsia-600 rounded-full blur-xl opacity-20"></div>
            <div className="relative w-full h-full rounded-full border-4 border-pink-500 flex items-center justify-center bg-surface-light dark:bg-surface-dark shadow-xl">
              <span className="text-4xl font-black bg-gradient-to-r from-pink-500 to-fuchsia-600 bg-clip-text text-transparent">{percentage}%</span>
            </div>
          </div>
          
          <div className="flex justify-center gap-8 mt-6">
            <div className="text-center bg-surface-light dark:bg-surface-dark px-6 py-4 rounded-2xl border border-divider-light dark:border-divider-dark shadow-sm">
              <span className="block text-3xl font-black text-success-DEFAULT mb-1">{results.correctCount}</span>
              <span className="text-xs font-bold text-secondary-light dark:text-secondary-dark uppercase tracking-wider">Correct</span>
            </div>
            <div className="text-center bg-surface-light dark:bg-surface-dark px-6 py-4 rounded-2xl border border-divider-light dark:border-divider-dark shadow-sm">
              <span className="block text-3xl font-black text-error-DEFAULT mb-1">{results.incorrectCount}</span>
              <span className="text-xs font-bold text-secondary-light dark:text-secondary-dark uppercase tracking-wider">Incorrect</span>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap justify-center gap-4 mt-10">
           <button
             onClick={reset}
             className="px-8 py-3.5 rounded-2xl font-bold bg-gradient-to-r from-pink-500 to-fuchsia-600 text-white shadow-md shadow-pink-500/20 hover:shadow-lg hover:-translate-y-0.5 transition-all"
           >
             Try Again
           </button>
           <button
             onClick={() => navigate('/vocab')}
             className="px-8 py-3.5 rounded-2xl font-bold border-2 border-divider-light dark:border-divider-dark text-primary-light dark:text-primary-dark hover:bg-surface-light dark:hover:bg-surface-dark transition-all hover:-translate-y-0.5"
           >
             Back to Vocab
           </button>
        </div>

        <div className="space-y-4 pt-8">
          <h2 className="text-xl font-bold text-primary-light dark:text-primary-dark mb-6">Review Answers</h2>
          {results.answers?.map((r: any) => {
            const isCorrect = r.isCorrect;
            const originalQuestion = questions.find(q => (q.wordId || q._id) === r.wordId);
            return (
              <div key={r.wordId} className="bg-surface-light dark:bg-surface-dark p-6 rounded-2xl border-2 border-divider-light dark:border-divider-dark shadow-sm">
                <div className="flex gap-3 items-start mb-4">
                  <div className="mt-1">
                    {isCorrect ? <CheckCircle2 className="text-success-DEFAULT" /> : <XCircle className="text-error-DEFAULT" />}
                  </div>
                  <div>
                    <h3 className="font-bold text-primary-light dark:text-primary-dark text-lg">{originalQuestion?.question || 'Question text not found'}</h3>
                  </div>
                </div>
                
                <div className="ml-9 space-y-2">
                  <p className="text-sm font-medium">
                    <span className="text-secondary-light dark:text-secondary-dark inline-block w-24">Your Answer:</span>
                    <span className={isCorrect ? 'text-success-DEFAULT font-bold' : 'text-error-DEFAULT font-bold'}>
                      {r.selectedOption || 'Not answered'}
                    </span>
                  </p>
                  {!isCorrect && (
                    <p className="text-sm font-medium">
                      <span className="text-secondary-light dark:text-secondary-dark inline-block w-24">Correct:</span>
                      <span className="text-success-DEFAULT font-bold">{r.correctAnswer}</span>
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
};

export default VocabQuiz;
