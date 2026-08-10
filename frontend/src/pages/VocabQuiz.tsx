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
    setAnswers(prev => ({ ...prev, [questions[currentIndex]._id]: option }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const res = await api.post('/vocab/quiz/submit', {
        vocabType,
        answers
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
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/vocab')}
              className="p-2 rounded-full hover:bg-surface-light dark:hover:bg-surface-dark transition-colors text-secondary-light dark:text-secondary-dark"
            >
              <ArrowLeft size={24} />
            </button>
            <h1 className="text-3xl font-extrabold text-primary-light dark:text-primary-dark">
              Quiz: {title}
            </h1>
          </div>

          <div className="bg-surface-light dark:bg-surface-dark rounded-3xl p-8 border border-divider-light dark:border-divider-dark shadow-card space-y-8">
            <div>
              <label className="block text-sm font-bold text-secondary-light dark:text-secondary-dark uppercase tracking-wider mb-4">
                Number of Questions
              </label>
              <div className="flex gap-4">
                {[10, 20, 30].map(c => (
                  <button
                    key={c}
                    onClick={() => setCount(c)}
                    className={clsx(
                      "flex-1 py-3 rounded-xl border-2 font-bold transition-colors",
                      count === c 
                        ? "border-accent bg-accent/10 text-accent" 
                        : "border-divider-light dark:border-divider-dark text-primary-light dark:text-primary-dark hover:border-accent/40"
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
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                      "flex-1 py-3 px-4 rounded-xl border-2 font-bold transition-colors",
                      source === s.id 
                        ? "border-accent bg-accent/10 text-accent" 
                        : "border-divider-light dark:border-divider-dark text-primary-light dark:text-primary-dark hover:border-accent/40"
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
              className="w-full py-4 rounded-2xl font-bold text-lg text-white bg-accent hover:bg-accent/90 transition-colors shadow-lg shadow-accent/20 flex justify-center items-center disabled:opacity-70"
            >
              {loading ? <Loader2 className="animate-spin w-6 h-6" /> : 'Start Quiz'}
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
                 className="h-full bg-accent transition-all duration-300"
                 style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
               />
             </div>
          </div>

          {/* Question Area */}
          <div className="flex-grow flex flex-col justify-center">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-primary-light dark:text-primary-dark text-center mb-10 leading-relaxed">
              {q.question}
            </h2>

            <div className="grid grid-cols-1 gap-4 max-w-xl mx-auto w-full">
              {q.options.map((opt: string, i: number) => {
                const isSelected = answers[q._id] === opt;
                return (
                  <button
                    key={i}
                    onClick={() => handleAnswer(opt)}
                    className={clsx(
                      "p-5 rounded-2xl border-2 text-left transition-all font-medium text-lg",
                      isSelected
                        ? "border-accent bg-accent/5 text-accent shadow-sm"
                        : "border-divider-light dark:border-divider-dark text-primary-light dark:text-primary-dark hover:border-accent/40 bg-surface-light dark:bg-surface-dark"
                    )}
                  >
                    {opt}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Controls */}
          <div className="mt-10 flex justify-between items-center max-w-xl mx-auto w-full">
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
                className="px-8 py-3 rounded-xl font-bold text-white bg-accent hover:bg-accent/90 disabled:opacity-50 transition-colors shadow-lg shadow-accent/20 flex items-center gap-2"
              >
                {loading && <Loader2 className="animate-spin w-4 h-4" />}
                Submit Quiz
              </button>
            ) : (
              <button
                onClick={() => setCurrentIndex(i => Math.min(questions.length - 1, i + 1))}
                className="px-8 py-3 rounded-xl font-bold text-white bg-primary-light dark:bg-primary-dark hover:bg-opacity-90 transition-colors shadow-md"
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
  const percentage = Math.round((results.score / results.total) * 100);
  
  return (
    <div className="min-h-screen bg-base-light dark:bg-base-dark py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-10">
        
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-extrabold text-primary-light dark:text-primary-dark">Quiz Results</h1>
          
          <div className="w-32 h-32 mx-auto rounded-full border-4 border-accent flex items-center justify-center bg-surface-light dark:bg-surface-dark shadow-lg shadow-accent/10">
            <span className="text-4xl font-black text-accent">{percentage}%</span>
          </div>
          
          <div className="flex justify-center gap-6 mt-6">
            <div className="text-center">
              <span className="block text-2xl font-bold text-success-DEFAULT">{results.correct}</span>
              <span className="text-sm font-bold text-secondary-light dark:text-secondary-dark uppercase">Correct</span>
            </div>
            <div className="w-px bg-divider-light dark:bg-divider-dark"></div>
            <div className="text-center">
              <span className="block text-2xl font-bold text-error-DEFAULT">{results.incorrect}</span>
              <span className="text-sm font-bold text-secondary-light dark:text-secondary-dark uppercase">Incorrect</span>
            </div>
          </div>
        </div>

        <div className="flex justify-center gap-4">
           <button
             onClick={reset}
             className="px-6 py-3 rounded-xl font-bold bg-accent text-white shadow-lg shadow-accent/20 hover:bg-accent/90 transition-colors"
           >
             Try Again
           </button>
           <button
             onClick={() => navigate('/vocab')}
             className="px-6 py-3 rounded-xl font-bold border-2 border-divider-light dark:border-divider-dark text-primary-light dark:text-primary-dark hover:bg-surface-light dark:hover:bg-surface-dark transition-colors"
           >
             Back to Vocab
           </button>
        </div>

        <div className="space-y-4 pt-8">
          <h2 className="text-xl font-bold text-primary-light dark:text-primary-dark mb-6">Review Answers</h2>
          {results.results.map((r: any) => {
            const isCorrect = r.isCorrect;
            return (
              <div key={r.questionId} className="bg-surface-light dark:bg-surface-dark p-6 rounded-2xl border-2 border-divider-light dark:border-divider-dark shadow-sm">
                <div className="flex gap-3 items-start mb-4">
                  <div className="mt-1">
                    {isCorrect ? <CheckCircle2 className="text-success-DEFAULT" /> : <XCircle className="text-error-DEFAULT" />}
                  </div>
                  <div>
                    <h3 className="font-bold text-primary-light dark:text-primary-dark text-lg">{r.question}</h3>
                  </div>
                </div>
                
                <div className="ml-9 space-y-2">
                  <p className="text-sm font-medium">
                    <span className="text-secondary-light dark:text-secondary-dark inline-block w-24">Your Answer:</span>
                    <span className={isCorrect ? 'text-success-DEFAULT font-bold' : 'text-error-DEFAULT font-bold'}>
                      {r.userAnswer || 'Not answered'}
                    </span>
                  </p>
                  {!isCorrect && (
                    <p className="text-sm font-medium">
                      <span className="text-secondary-light dark:text-secondary-dark inline-block w-24">Correct:</span>
                      <span className="text-success-DEFAULT font-bold">{r.correctAnswer}</span>
                    </p>
                  )}
                  {r.word && r.meaning && (
                    <div className="mt-4 pt-4 border-t border-divider-light dark:border-divider-dark">
                       <p className="text-sm font-bold text-primary-light dark:text-primary-dark">{r.word}</p>
                       <p className="text-sm text-secondary-light dark:text-secondary-dark mt-1">{r.meaning}</p>
                    </div>
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
