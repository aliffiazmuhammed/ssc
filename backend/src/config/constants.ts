export const SUBJECTS = [
  'Quantitative Aptitude',
  'Reasoning',
  'English',
  'General Awareness',
] as const;

export type Subject = (typeof SUBJECTS)[number];

export const ROLES = ['admin', 'student'] as const;

export type Role = (typeof ROLES)[number];

export const QUIZ_TYPES = ['practice', 'mock', 'rapid'] as const;

export type QuizType = (typeof QUIZ_TYPES)[number];

