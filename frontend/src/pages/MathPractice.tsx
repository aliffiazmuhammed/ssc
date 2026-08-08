import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Calculator,
  Grid3X3,
  Box,
  Plus,
  Minus,
  ChevronRight,
  Check,
  X,
  RotateCcw,
  Trophy,
  Sparkles,
  Hash,
} from 'lucide-react';
import clsx from 'clsx';

// ── Types ──────────────────────────────────────────────────────────────────────

type PracticeType = 'squares' | 'cubes' | 'multiplication' | 'addition' | 'subtraction';

interface MathQuestion {
  display: string;
  answer: number;
  id: number;
}

interface AnswerRecord {
  question: MathQuestion;
  userAnswer: number | null;
  correct: boolean;
}

// ── Question Generators ────────────────────────────────────────────────────────

function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randIntByDigits(digits: number): number {
  if (digits <= 0) return randInt(1, 9);
  const min = digits === 1 ? 1 : Math.pow(10, digits - 1);
  const max = Math.pow(10, digits) - 1;
  return randInt(min, max);
}

function generateQuestions(
  type: PracticeType,
  min: number,
  max: number,
  count: number,
  digits: number
): MathQuestion[] {
  const questions: MathQuestion[] = [];

  for (let i = 0; i < count; i++) {
    let display = '';
    let answer = 0;

    switch (type) {
      case 'squares': {
        const n = randInt(min, max);
        display = `${n}² = ?`;
        answer = n * n;
        break;
      }
      case 'cubes': {
        const n = randInt(min, max);
        display = `${n}³ = ?`;
        answer = n * n * n;
        break;
      }
      case 'multiplication': {
        const a = randInt(min, max);
        const b = randInt(1, 12);
        display = `${a} × ${b} = ?`;
        answer = a * b;
        break;
      }
      case 'addition': {
        const a = randIntByDigits(digits);
        const b = randIntByDigits(digits);
        const sum = a + b;
        const format = randInt(0, 2);
        if (format === 0) {
          display = `${a} + ${b} = ?`;
          answer = sum;
        } else if (format === 1) {
          display = `${a} + ? = ${sum}`;
          answer = b;
        } else {
          display = `? + ${b} = ${sum}`;
          answer = a;
        }
        break;
      }
      case 'subtraction': {
        const b = randIntByDigits(digits);
        const diff = randIntByDigits(digits);
        const a = b + diff;
        const format = randInt(0, 2);
        if (format === 0) {
          display = `${a} − ${b} = ?`;
          answer = diff;
        } else if (format === 1) {
          display = `${a} − ? = ${diff}`;
          answer = b;
        } else {
          display = `? − ${b} = ${diff}`;
          answer = a;
        }
        break;
      }
    }

    questions.push({ display, answer, id: i });
  }

  return questions;
}

// ── Practice type metadata ─────────────────────────────────────────────────────

const practiceTypes: { key: PracticeType; label: string; icon: React.ReactNode; description: string }[] = [
  { key: 'squares',        label: 'Squares',        icon: <Grid3X3 size={24} />,   description: 'n² — Perfect squares' },
  { key: 'cubes',          label: 'Cubes',          icon: <Box size={24} />,       description: 'n³ — Perfect cubes' },
  { key: 'multiplication', label: 'Multiplication', icon: <Hash size={24} />,      description: 'a × b — Times tables' },
  { key: 'addition',       label: 'Addition',       icon: <Plus size={24} />,      description: 'a + b — Fill the blank' },
  { key: 'subtraction',    label: 'Subtraction',    icon: <Minus size={24} />,     description: 'a − b — Fill the blank' },
];

const digitOptions = [
  { value: 1, label: '1-digit' },
  { value: 2, label: '2-digit' },
  { value: 3, label: '3-digit' },
];

// ── Component ──────────────────────────────────────────────────────────────────

const MathPractice: React.FC = () => {
  const navigate = useNavigate();

  // ── Setup state ──
  const [selectedType, setSelectedType] = useState<PracticeType | null>(null);
  const [rangeMin, setRangeMin] = useState(2);
  const [rangeMax, setRangeMax] = useState(20);
  const [questionCount, setQuestionCount] = useState(10);
  const [digits, setDigits] = useState(2);

  // ── Session state ──
  const [phase, setPhase] = useState<'setup' | 'session' | 'summary'>('setup');
  const [questions, setQuestions] = useState<MathQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userInput, setUserInput] = useState('');
  const [answered, setAnswered] = useState(false);
  const [answerRecords, setAnswerRecords] = useState<AnswerRecord[]>([]);

  const inputRef = useRef<HTMLInputElement>(null);

  const needsRange = selectedType === 'squares' || selectedType === 'cubes' || selectedType === 'multiplication';

  // Focus input when question changes
  useEffect(() => {
    if (phase === 'session' && !answered) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [currentIndex, phase, answered]);

  // ── Handlers ──

  const handleStart = useCallback(() => {
    if (!selectedType) return;
    const qs = generateQuestions(
      selectedType,
      needsRange ? rangeMin : 1,
      needsRange ? rangeMax : 99,
      questionCount,
      digits
    );
    setQuestions(qs);
    setCurrentIndex(0);
    setUserInput('');
    setAnswered(false);
    setAnswerRecords([]);
    setPhase('session');
  }, [selectedType, rangeMin, rangeMax, questionCount, digits, needsRange]);

  const handleSubmitAnswer = useCallback(() => {
    if (answered || userInput.trim() === '') return;
    const currentQ = questions[currentIndex];
    const numAnswer = parseInt(userInput.trim(), 10);
    const isCorrect = numAnswer === currentQ.answer;

    setAnswerRecords(prev => [...prev, {
      question: currentQ,
      userAnswer: isNaN(numAnswer) ? null : numAnswer,
      correct: isCorrect,
    }]);
    setAnswered(true);
  }, [answered, userInput, questions, currentIndex]);

  const handleNext = useCallback(() => {
    if (currentIndex + 1 >= questions.length) {
      setPhase('summary');
    } else {
      setCurrentIndex(prev => prev + 1);
      setUserInput('');
      setAnswered(false);
    }
  }, [currentIndex, questions.length]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      if (!answered) {
        handleSubmitAnswer();
      } else {
        handleNext();
      }
    }
  }, [answered, handleSubmitAnswer, handleNext]);

  const handleRestart = useCallback(() => {
    setPhase('setup');
    setQuestions([]);
    setCurrentIndex(0);
    setUserInput('');
    setAnswered(false);
    setAnswerRecords([]);
  }, []);

  const handlePracticeAgain = useCallback(() => {
    handleStart();
  }, [handleStart]);

  // Auto-advance to next question
  useEffect(() => {
    if (phase === 'session' && answered) {
      const timer = setTimeout(() => {
        handleNext();
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [phase, answered, handleNext]);

  // ── Derived ──
  const currentQuestion = questions[currentIndex] || null;
  const correctCount = answerRecords.filter(r => r.correct).length;
  const currentRecord = answered ? answerRecords[answerRecords.length - 1] : null;

  const canStart = selectedType !== null && questionCount >= 1 &&
    (needsRange ? rangeMin <= rangeMax && rangeMin >= 0 : true);

  // ── RENDER: Setup Phase ──────────────────────────────────────────────────────

  if (phase === 'setup') {
    return (
      <div className="min-h-screen bg-base-light dark:bg-base-dark py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto space-y-10">

          {/* Header */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/')}
              className="flex items-center justify-center w-10 h-10 rounded-xl border-2 border-divider-light dark:border-divider-dark bg-surface-light dark:bg-surface-dark hover:border-accent/50 transition-all text-primary-light dark:text-primary-dark"
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 className="text-4xl font-extrabold text-primary-light dark:text-primary-dark tracking-tight flex items-center gap-3">
                <Calculator className="text-accent" size={36} />
                Math Practice
              </h1>
              <p className="mt-1 text-lg text-secondary-light dark:text-secondary-dark font-medium">
                Sharpen your arithmetic skills
              </p>
            </div>
          </div>

          {/* Config Card */}
          <div className="bg-surface-light dark:bg-surface-dark rounded-3xl shadow-card border border-divider-light dark:border-divider-dark p-6 sm:p-8 space-y-10">

            {/* Step 1: Practice Type */}
            <section>
              <h2 className="text-lg font-bold text-primary-light dark:text-primary-dark mb-4 flex items-center gap-3">
                <span className="bg-primary-light dark:bg-primary-dark text-surface-light dark:text-surface-dark w-6 h-6 rounded-md flex items-center justify-center text-sm">1</span>
                Choose Practice Type
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {practiceTypes.map(pt => (
                  <button
                    key={pt.key}
                    onClick={() => setSelectedType(pt.key)}
                    className={clsx(
                      'relative flex flex-col items-start p-5 rounded-2xl border-2 transition-all text-left overflow-hidden group',
                      selectedType === pt.key
                        ? 'border-accent bg-accent text-white shadow-lg shadow-accent/20 scale-[1.02]'
                        : 'border-divider-light dark:border-divider-dark bg-surface-light dark:bg-surface-dark text-primary-light dark:text-primary-dark hover:border-accent/50'
                    )}
                  >
                    <div className={clsx(
                      'mb-2 p-2 rounded-xl transition-colors',
                      selectedType === pt.key ? 'bg-white/20' : 'bg-accent/10'
                    )}>
                      <div className={clsx(selectedType === pt.key ? 'text-white' : 'text-accent')}>
                        {pt.icon}
                      </div>
                    </div>
                    <h3 className="font-bold text-base">{pt.label}</h3>
                    <p className={clsx(
                      'text-xs font-medium mt-0.5',
                      selectedType === pt.key ? 'text-white/70' : 'text-secondary-light dark:text-secondary-dark'
                    )}>
                      {pt.description}
                    </p>
                    {selectedType === pt.key && (
                      <div className="absolute top-0 right-0 p-3 opacity-10">
                        <div className="text-white">{React.cloneElement(pt.icon as React.ReactElement, { size: 80 })}</div>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </section>

            {/* Step 2: Range / Digits */}
            {selectedType && (
              <motion.section
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <h2 className="text-lg font-bold text-primary-light dark:text-primary-dark mb-4 flex items-center gap-3">
                  <span className="bg-primary-light dark:bg-primary-dark text-surface-light dark:text-surface-dark w-6 h-6 rounded-md flex items-center justify-center text-sm">2</span>
                  {needsRange ? 'Set Number Range' : 'Set Digit Count'}
                </h2>

                <div className="bg-base-light dark:bg-base-dark p-6 rounded-2xl border border-divider-light dark:border-divider-dark">
                  {needsRange ? (
                    <div className="flex flex-wrap items-end gap-6">
                      <div>
                        <label className="block text-sm font-bold text-secondary-light dark:text-secondary-dark uppercase tracking-wider mb-2">
                          Minimum
                        </label>
                        <input
                          type="number"
                          min={0}
                          value={rangeMin}
                          onChange={e => setRangeMin(parseInt(e.target.value) || 0)}
                          className="w-28 px-4 py-3 rounded-xl border-2 border-divider-light dark:border-divider-dark bg-surface-light dark:bg-surface-dark focus:outline-none focus:border-accent focus:ring-4 focus:ring-accent/10 transition-all text-primary-light dark:text-primary-dark font-mono text-lg text-center font-bold"
                        />
                      </div>
                      <span className="text-2xl font-bold text-secondary-light dark:text-secondary-dark pb-3">—</span>
                      <div>
                        <label className="block text-sm font-bold text-secondary-light dark:text-secondary-dark uppercase tracking-wider mb-2">
                          Maximum
                        </label>
                        <input
                          type="number"
                          min={rangeMin}
                          value={rangeMax}
                          onChange={e => setRangeMax(parseInt(e.target.value) || 0)}
                          className="w-28 px-4 py-3 rounded-xl border-2 border-divider-light dark:border-divider-dark bg-surface-light dark:bg-surface-dark focus:outline-none focus:border-accent focus:ring-4 focus:ring-accent/10 transition-all text-primary-light dark:text-primary-dark font-mono text-lg text-center font-bold"
                        />
                      </div>
                      {rangeMin > rangeMax && (
                        <p className="text-xs font-semibold text-error w-full">Minimum must be ≤ Maximum.</p>
                      )}
                    </div>
                  ) : (
                    <div>
                      <label className="block text-sm font-bold text-secondary-light dark:text-secondary-dark uppercase tracking-wider mb-3">
                        Operand Digits
                      </label>
                      <div className="flex gap-3">
                        {digitOptions.map(opt => (
                          <button
                            key={opt.value}
                            onClick={() => setDigits(opt.value)}
                            className={clsx(
                              'px-5 py-3 rounded-xl border-2 font-bold transition-all text-sm',
                              digits === opt.value
                                ? 'border-accent bg-accent text-white shadow-md shadow-accent/20'
                                : 'border-divider-light dark:border-divider-dark text-primary-light dark:text-primary-dark hover:border-accent/40'
                            )}
                          >
                            {opt.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </motion.section>
            )}

            {/* Step 3: Question Count */}
            {selectedType && (
              <motion.section
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.1 }}
              >
                <h2 className="text-lg font-bold text-primary-light dark:text-primary-dark mb-4 flex items-center gap-3">
                  <span className="bg-primary-light dark:bg-primary-dark text-surface-light dark:text-surface-dark w-6 h-6 rounded-md flex items-center justify-center text-sm">3</span>
                  Number of Questions
                </h2>
                <div className="bg-base-light dark:bg-base-dark p-6 rounded-2xl border border-divider-light dark:border-divider-dark">
                  <input
                    type="number"
                    min={1}
                    max={100}
                    value={questionCount}
                    onChange={e => setQuestionCount(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-28 px-4 py-3 rounded-xl border-2 border-divider-light dark:border-divider-dark bg-surface-light dark:bg-surface-dark focus:outline-none focus:border-accent focus:ring-4 focus:ring-accent/10 transition-all text-primary-light dark:text-primary-dark font-mono text-lg text-center font-bold"
                  />
                  <span className="ml-3 text-sm font-medium text-secondary-light dark:text-secondary-dark">questions</span>
                </div>
              </motion.section>
            )}

            {/* Start Button */}
            {selectedType && (
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.2 }}
                className="pt-2"
              >
                <button
                  onClick={handleStart}
                  disabled={!canStart}
                  className="w-full flex items-center justify-center gap-3 py-4 px-6 rounded-2xl text-white bg-accent hover:bg-accent/90 focus:outline-none focus:ring-4 focus:ring-accent/30 transition-all font-bold text-lg disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-accent/20 hover:-translate-y-0.5 active:translate-y-0"
                >
                  <Sparkles size={24} />
                  Start Practice
                </button>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ── RENDER: Session Phase ────────────────────────────────────────────────────

  if (phase === 'session' && currentQuestion) {
    const progress = ((currentIndex + 1) / questions.length) * 100;
    const runningCorrect = answerRecords.filter(r => r.correct).length;

    return (
      <div className="min-h-screen bg-base-light dark:bg-base-dark py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto space-y-8">

          {/* Progress Header */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <button
                onClick={handleRestart}
                className="flex items-center gap-2 text-sm font-bold text-secondary-light dark:text-secondary-dark hover:text-accent transition-colors"
              >
                <ArrowLeft size={16} />
                Exit
              </button>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5 text-sm font-bold text-success">
                  <Check size={14} />
                  {runningCorrect}
                </div>
                <div className="flex items-center gap-1.5 text-sm font-bold text-error">
                  <X size={14} />
                  {answerRecords.length - runningCorrect}
                </div>
              </div>
            </div>

            {/* Progress bar */}
            <div className="relative h-2 bg-divider-light dark:bg-divider-dark rounded-full overflow-hidden">
              <motion.div
                className="absolute inset-y-0 left-0 bg-accent rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.4, ease: 'easeOut' }}
              />
            </div>
            <p className="text-sm font-bold text-secondary-light dark:text-secondary-dark text-center">
              Question {currentIndex + 1} of {questions.length}
            </p>
          </div>

          {/* Question Card */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentQuestion.id}
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              transition={{ duration: 0.3 }}
              className="bg-surface-light dark:bg-surface-dark rounded-3xl shadow-card border border-divider-light dark:border-divider-dark p-8 sm:p-12 space-y-8"
            >
              {/* Question Display */}
              <div className="text-center">
                <p className="text-4xl sm:text-5xl font-extrabold text-primary-light dark:text-primary-dark tracking-tight font-mono">
                  {currentQuestion.display}
                </p>
              </div>

              {/* Answer Input */}
              <div className="flex flex-col items-center gap-4">
                <input
                  ref={inputRef}
                  type="number"
                  value={userInput}
                  onChange={e => setUserInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  disabled={answered}
                  placeholder="Your answer"
                  className={clsx(
                    'w-48 px-6 py-4 rounded-2xl border-2 text-center font-mono text-2xl font-bold transition-all focus:outline-none',
                    answered
                      ? currentRecord?.correct
                        ? 'border-success bg-success/5 text-success'
                        : 'border-error bg-error/5 text-error'
                      : 'border-divider-light dark:border-divider-dark bg-base-light dark:bg-base-dark text-primary-light dark:text-primary-dark focus:border-accent focus:ring-4 focus:ring-accent/10'
                  )}
                  autoComplete="off"
                />

                {!answered ? (
                  <button
                    onClick={handleSubmitAnswer}
                    disabled={userInput.trim() === ''}
                    className="flex items-center gap-2 px-8 py-3 rounded-xl bg-accent text-white font-bold hover:bg-accent/90 transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-md shadow-accent/20 hover:-translate-y-0.5 active:translate-y-0"
                  >
                    Check
                    <ChevronRight size={18} />
                  </button>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col items-center gap-4"
                  >
                    {/* Feedback Badge */}
                    <div className={clsx(
                      'flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm',
                      currentRecord?.correct
                        ? 'bg-success/10 text-success border border-success/20'
                        : 'bg-error/10 text-error border border-error/20'
                    )}>
                      {currentRecord?.correct ? (
                        <>
                          <Check size={18} />
                          Correct!
                        </>
                      ) : (
                        <>
                          <X size={18} />
                          Wrong — answer is <span className="font-mono ml-1">{currentQuestion.answer}</span>
                        </>
                      )}
                    </div>

                    {/* Next Button */}
                    <button
                      onClick={handleNext}
                      className="flex items-center gap-2 px-8 py-3 rounded-xl bg-accent text-white font-bold hover:bg-accent/90 transition-all shadow-md shadow-accent/20 hover:-translate-y-0.5 active:translate-y-0"
                    >
                      {currentIndex + 1 >= questions.length ? 'See Results' : 'Next'}
                      <ChevronRight size={18} />
                    </button>
                  </motion.div>
                )}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    );
  }

  // ── RENDER: Summary Phase ────────────────────────────────────────────────────

  if (phase === 'summary') {
    const accuracy = questions.length > 0 ? Math.round((correctCount / questions.length) * 100) : 0;
    const selectedPT = practiceTypes.find(p => p.key === selectedType);

    return (
      <div className="min-h-screen bg-base-light dark:bg-base-dark py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto space-y-8">

          {/* Score Card */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-surface-light dark:bg-surface-dark rounded-3xl shadow-card border border-divider-light dark:border-divider-dark p-8 sm:p-10 text-center space-y-6"
          >
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-accent/10 text-accent">
              <Trophy size={40} />
            </div>

            <div>
              <h2 className="text-3xl font-extrabold text-primary-light dark:text-primary-dark">
                Practice Complete!
              </h2>
              <p className="text-secondary-light dark:text-secondary-dark font-medium mt-1">
                {selectedPT?.label} — {questions.length} questions
              </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-base-light dark:bg-base-dark rounded-2xl p-4 border border-divider-light dark:border-divider-dark">
                <p className="text-3xl font-extrabold text-accent font-mono">{accuracy}%</p>
                <p className="text-xs font-bold text-secondary-light dark:text-secondary-dark uppercase mt-1">Accuracy</p>
              </div>
              <div className="bg-success/5 rounded-2xl p-4 border border-success/20">
                <p className="text-3xl font-extrabold text-success font-mono">{correctCount}</p>
                <p className="text-xs font-bold text-secondary-light dark:text-secondary-dark uppercase mt-1">Correct</p>
              </div>
              <div className="bg-error/5 rounded-2xl p-4 border border-error/20">
                <p className="text-3xl font-extrabold text-error font-mono">{questions.length - correctCount}</p>
                <p className="text-xs font-bold text-secondary-light dark:text-secondary-dark uppercase mt-1">Wrong</p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                onClick={handlePracticeAgain}
                className="flex-1 flex items-center justify-center gap-2 py-3.5 px-6 rounded-2xl bg-accent text-white font-bold hover:bg-accent/90 transition-all shadow-md shadow-accent/20 hover:-translate-y-0.5 active:translate-y-0"
              >
                <RotateCcw size={18} />
                Practice Again
              </button>
              <button
                onClick={handleRestart}
                className="flex-1 flex items-center justify-center gap-2 py-3.5 px-6 rounded-2xl border-2 border-divider-light dark:border-divider-dark text-primary-light dark:text-primary-dark font-bold hover:border-accent/50 transition-all"
              >
                <ArrowLeft size={18} />
                Change Settings
              </button>
            </div>
          </motion.div>

          {/* Question Review List */}
          <div className="bg-surface-light dark:bg-surface-dark rounded-3xl shadow-card border border-divider-light dark:border-divider-dark p-6 sm:p-8 space-y-4">
            <h3 className="text-lg font-bold text-primary-light dark:text-primary-dark">Review</h3>
            <div className="space-y-2">
              {answerRecords.map((record, idx) => (
                <div
                  key={idx}
                  className={clsx(
                    'flex items-center justify-between p-4 rounded-xl border transition-all',
                    record.correct
                      ? 'border-success/20 bg-success/5'
                      : 'border-error/20 bg-error/5'
                  )}
                >
                  <div className="flex items-center gap-3">
                    <span className={clsx(
                      'flex items-center justify-center w-7 h-7 rounded-lg text-white text-xs font-bold',
                      record.correct ? 'bg-success' : 'bg-error'
                    )}>
                      {record.correct ? <Check size={14} /> : <X size={14} />}
                    </span>
                    <span className="font-mono font-bold text-primary-light dark:text-primary-dark text-sm">
                      {record.question.display}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    {!record.correct && (
                      <span className="text-error font-mono font-bold line-through">
                        {record.userAnswer ?? '—'}
                      </span>
                    )}
                    <span className={clsx(
                      'font-mono font-bold',
                      record.correct ? 'text-success' : 'text-primary-light dark:text-primary-dark'
                    )}>
                      {record.question.answer}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default MathPractice;
