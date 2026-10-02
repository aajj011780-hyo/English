export interface QuizQuestion {
  id: number;
  word: string;
  phonetic: string;
  partOfSpeech: string;
  question: string;
  options: string[];
  correctAnswerIndex: number;
  meaning: string;
  explanation: string;
  exampleSentence: string;
  exampleTranslation: string;
}

export interface QuizData {
  topic: string;
  level: string;
  questions: QuizQuestion[];
}

export type QuizLevel = '초급 (기초/일상)' | '중급 (수능/토익)' | '고급 (비즈니스/학술)';

export interface QuizTopicPreset {
  id: string;
  label: string;
  description: string;
  iconName: string;
}
