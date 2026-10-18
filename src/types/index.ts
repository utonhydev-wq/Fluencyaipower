export type CEFRLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';

export type DailyTimeMinutes = 10 | 15 | 20 | 25;

export type LearningStyle = 'conversacao' | 'audio_video' | 'jogos' | 'leitura' | 'combinacao';

export type LearningGoal = 'viagens' | 'trabalho' | 'estudos' | 'tecnologia' | 'conversas_gerais';

export type MainDifficulty = 'falar' | 'ouvir' | 'ler' | 'escrever' | 'vocabulario' | 'gramatica';

export interface UserPreferences {
  dailyMinutes: DailyTimeMinutes;
  learningStyle: LearningStyle;
  primaryGoal: LearningGoal;
  mainDifficulty: MainDifficulty;
  soundEffects: boolean;
  voicePlaybackSpeed: number; // 0.75, 1.0, 1.25
  preferredAccent: 'US' | 'UK';
  theme: 'dark' | 'light';
  autoPlayAudio: boolean;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatarUrl: string;
  level: CEFRLevel;
  levelTitle: string;
  preferences: UserPreferences;
  xp: number;
  streak: number;
  lastStudiedDate: string; // YYYY-MM-DD
  todayMinutesStudied: number;
  weeklyMinutesStudied: number;
  completedLessonIds: string[];
  completedExerciseCount: number;
  accuracyRate: number;
  onboardingCompleted: boolean;
  createdAt: string;
}

export type ExerciseType =
  | 'multiple_choice'
  | 'fill_blank'
  | 'word_order'
  | 'listening_comprehension'
  | 'translation'
  | 'pronunciation'
  | 'reading';

export interface Exercise {
  id: string;
  type: ExerciseType;
  title: string;
  instruction: string;
  promptText: string;
  audioPhrase?: string;
  options?: string[];
  correctAnswer: string | string[]; // Single or multiple accepted variants
  explanation: string;
  translation: string;
  words?: string[]; // For word_order
  readingPassage?: string; // For reading comprehension
  phoneticHint?: string;
}

export interface Lesson {
  id: string;
  moduleId: string;
  level: CEFRLevel;
  title: string;
  subtitle: string;
  durationMinutes: number;
  description: string;
  grammarTip: string;
  vocabulary: Array<{
    word: string;
    translation: string;
    phonetic: string;
    example: string;
    exampleTranslation: string;
  }>;
  dialogue?: Array<{
    speaker: string;
    text: string;
    translation: string;
  }>;
  exercises: Exercise[];
}

export interface Unit {
  id: string;
  moduleId: string;
  title: string;
  description: string;
  lessons: Lesson[];
}

export interface Module {
  id: string;
  level: CEFRLevel;
  title: string;
  description: string;
  units: Unit[];
  requiredScoreToPass?: number;
}

export type FlashcardCategory =
  | 'essencial'
  | 'conversacao'
  | 'trabalho'
  | 'viagens'
  | 'tecnologia'
  | 'alimentacao'
  | 'phrasal_verbs'
  | 'girias';

export interface Flashcard {
  id: string;
  english: string;
  portuguese: string;
  phonetic: string;
  partOfSpeech: string;
  exampleSentence: string;
  exampleTranslation: string;
  category: FlashcardCategory;
  level: CEFRLevel;
  isFavorite: boolean;
  // SRS properties
  intervalDays: number;
  repetitionCount: number;
  easeFactor: number; // default 2.5
  nextReviewDate: string; // ISO date
  lastReviewedDate?: string;
  difficultyScore: 'facil' | 'bom' | 'dificil' | 'repetir' | 'novo';
  mistakeCount: number;
}

export interface RoleplayScenario {
  id: string;
  title: string;
  category: string;
  difficulty: CEFRLevel;
  partnerName: string;
  partnerRole: string;
  avatarIcon: string;
  description: string;
  goal: string;
  initialMessage: string;
  suggestedPhrases: string[];
}

export interface RoleplayMessage {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  translation?: string;
  correction?: string;
  suggestedNext?: string[];
  timestamp: string;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  xpReward: number;
  isUnlocked: boolean;
  unlockedAt?: string;
  category: 'streak' | 'xp' | 'vocab' | 'pronunciation' | 'conversation';
}

export interface PronunciationItem {
  id: string;
  phrase: string;
  translation: string;
  phonetic: string;
  level: CEFRLevel;
  brazilianTip: string;
  category: string;
}

export interface DailyRoutineStep {
  id: string;
  name: string;
  durationMinutes: number;
  iconName: string;
  completed: boolean;
  viewTarget: 'review' | 'lesson' | 'pronunciation' | 'roleplay' | 'summary';
}
