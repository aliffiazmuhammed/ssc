import React, { createContext, useContext, useState, useCallback } from 'react';
import api from '../services/api';

export interface Question {
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

interface QuizState {
  sessionId: string | null;
  questions: Question[];
  currentIndex: number;
  score: number;
  streak: number;
  maxStreak: number;
  status: 'idle' | 'loading' | 'playing' | 'finished';
  answers: Record<string, string>; // questionId -> selectedOption
  timeLimit: number; // total time in seconds (0 = untimed)
  timeRemaining: number; // countdown in seconds
}

interface QuizContextType {
  state: QuizState;
  startQuiz: (sessionId: string, questions: Question[], timeLimitSeconds: number) => void;
  submitAnswer: (questionId: string, selectedOption: string, timeTaken: number) => Promise<boolean>;
  nextQuestion: () => void;
  prevQuestion: () => void;
  resetQuiz: () => void;
  tickTimer: () => void;
  finishQuiz: () => Promise<void>;
}

const initialState: QuizState = {
  sessionId: null,
  questions: [],
  currentIndex: 0,
  score: 0,
  streak: 0,
  maxStreak: 0,
  status: 'idle',
  answers: {},
  timeLimit: 0,
  timeRemaining: 0,
};

const QuizContext = createContext<QuizContextType | undefined>(undefined);

export const QuizProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<QuizState>(initialState);

  const startQuiz = useCallback((sessionId: string, questions: Question[], timeLimitSeconds: number) => {
    setState({
      ...initialState,
      sessionId,
      questions,
      timeLimit: timeLimitSeconds,
      timeRemaining: timeLimitSeconds,
      status: 'playing',
    });
  }, []);

  const submitAnswer = useCallback(
    async (questionId: string, selectedOption: string, timeTaken: number) => {
      let activeSessionId: string | null = null;
      let isCorrect = false;

      // Update local state using prev to guarantee fresh state
      setState((prev) => {
        const currentQuestion = prev.questions.find((q) => q._id === questionId);
        if (!currentQuestion || !prev.sessionId) return prev;

        activeSessionId = prev.sessionId;
        isCorrect = currentQuestion.answer === selectedOption;

        return {
          ...prev,
          answers: {
            ...prev.answers,
            [questionId]: selectedOption,
          },
        };
      });

      // Fire and forget backend sync if we have a valid session
      // Small timeout to allow setState to flush and activeSessionId to be extracted
      setTimeout(async () => {
        if (!activeSessionId) return;
        try {
          await api.post(`/sessions/${activeSessionId}/answer`, {
            questionId,
            selectedOption,
            timeTaken,
          });
        } catch (err) {
          console.error('Failed to sync answer with backend', err);
        }
      }, 0);

      return isCorrect;
    },
    [] // No dependencies needed!
  );

  const nextQuestion = useCallback(() => {
    setState((prev) => {
      const nextIndex = prev.currentIndex + 1;
      if (nextIndex >= prev.questions.length) {
        return prev; // Do nothing if at the end
      }
      return { ...prev, currentIndex: nextIndex };
    });
  }, []);

  const prevQuestion = useCallback(() => {
    setState((prev) => {
      const prevIndex = prev.currentIndex - 1;
      if (prevIndex < 0) {
        return prev;
      }
      return { ...prev, currentIndex: prevIndex };
    });
  }, []);

  const finishQuiz = useCallback(async () => {
    setState((prev) => {
      if (prev.sessionId && prev.status === 'playing') {
        const timeTaken = prev.timeLimit > 0 ? prev.timeLimit - prev.timeRemaining : 0;
        
        let finalScore = 0;
        prev.questions.forEach((q) => {
          if (prev.answers[q._id] === q.answer) finalScore++;
        });

        api.post(`/sessions/${prev.sessionId}/complete`, {
          timeTaken,
          maxStreak: 0,
        }).catch(err => console.error('Failed to complete session', err));

        return { ...prev, status: 'finished', score: finalScore };
      }
      return { ...prev, status: 'finished' };
    });
  }, []);

  const tickTimer = useCallback(() => {
    setState((prev) => {
      if (prev.status !== 'playing' || prev.timeLimit === 0) return prev;
      if (prev.timeRemaining <= 1) {
        // Auto-complete the quiz
        if (prev.sessionId) {
          const timeTaken = prev.timeLimit;
          
          let finalScore = 0;
          prev.questions.forEach((q) => {
            if (prev.answers[q._id] === q.answer) finalScore++;
          });

          api.post(`/sessions/${prev.sessionId}/complete`, {
            timeTaken,
            maxStreak: 0,
          }).catch(err => console.error('Failed to complete session', err));
          
          return { ...prev, timeRemaining: 0, status: 'finished', score: finalScore };
        }
        return { ...prev, timeRemaining: 0, status: 'finished' };
      }
      return { ...prev, timeRemaining: prev.timeRemaining - 1 };
    });
  }, []);

  const resetQuiz = useCallback(() => {
    setState(initialState);
  }, []);

  return (
    <QuizContext.Provider value={{ state, startQuiz, submitAnswer, nextQuestion, prevQuestion, resetQuiz, tickTimer, finishQuiz }}>
      {children}
    </QuizContext.Provider>
  );
};

export const useQuiz = () => {
  const context = useContext(QuizContext);
  if (context === undefined) {
    throw new Error('useQuiz must be used within a QuizProvider');
  }
  return context;
};
