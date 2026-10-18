import { UserProfile, Flashcard, FlashcardCategory, Achievement, CEFRLevel, DailyTimeMinutes } from '../types';
import { INITIAL_FLASHCARDS } from '../data/flashcards';
import { INITIAL_ACHIEVEMENTS } from '../data/achievements';
import { soundService } from './soundService';

const USER_KEY = 'englishflow_user_profile_v1';
const FLASHCARDS_KEY = 'englishflow_flashcards_v1';
const ACHIEVEMENTS_KEY = 'englishflow_achievements_v1';

export const DEFAULT_USER_PROFILE: UserProfile = {
  id: 'usr_' + Date.now(),
  name: 'Estudante',
  email: 'aluno@englishflow.ai',
  avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80',
  level: 'A1',
  levelTitle: 'Iniciante (A1) — Primeiros Passos',
  preferences: {
    dailyMinutes: 15,
    learningStyle: 'combinacao',
    primaryGoal: 'conversas_gerais',
    mainDifficulty: 'falar',
    soundEffects: true,
    voicePlaybackSpeed: 1.0,
    preferredAccent: 'US',
    theme: 'dark',
    autoPlayAudio: true,
  },
  xp: 120,
  streak: 1,
  lastStudiedDate: new Date().toISOString().split('T')[0],
  todayMinutesStudied: 5,
  weeklyMinutesStudied: 35,
  completedLessonIds: [],
  completedExerciseCount: 0,
  accuracyRate: 92,
  onboardingCompleted: false,
  createdAt: new Date().toISOString(),
};

export const storageService = {
  getUserProfile(): UserProfile {
    try {
      const data = localStorage.getItem(USER_KEY);
      if (!data) return DEFAULT_USER_PROFILE;
      const parsed = JSON.parse(data);
      // Sync sound service preference
      soundService.enabled = parsed.preferences?.soundEffects ?? true;
      return parsed;
    } catch {
      return DEFAULT_USER_PROFILE;
    }
  },

  saveUserProfile(profile: UserProfile): void {
    try {
      localStorage.setItem(USER_KEY, JSON.stringify(profile));
      soundService.enabled = profile.preferences?.soundEffects ?? true;
    } catch (e) {
      console.error('Failed to save profile:', e);
    }
  },

  getFlashcards(): Flashcard[] {
    try {
      const data = localStorage.getItem(FLASHCARDS_KEY);
      if (!data) return INITIAL_FLASHCARDS;
      return JSON.parse(data);
    } catch {
      return INITIAL_FLASHCARDS;
    }
  },

  saveFlashcards(cards: Flashcard[]): void {
    try {
      localStorage.setItem(FLASHCARDS_KEY, JSON.stringify(cards));
    } catch (e) {
      console.error('Failed to save flashcards:', e);
    }
  },

  addCustomFlashcard(cardData: {
    english: string;
    portuguese: string;
    phonetic?: string;
    category?: FlashcardCategory;
    exampleSentence?: string;
    exampleTranslation?: string;
  }): Flashcard {
    const cards = this.getFlashcards();
    const newCard: Flashcard = {
      id: `custom_${Date.now()}`,
      english: cardData.english,
      portuguese: cardData.portuguese,
      phonetic: cardData.phonetic || '',
      partOfSpeech: 'Expressão',
      exampleSentence: cardData.exampleSentence || `${cardData.english} is a great phrase to practice.`,
      exampleTranslation: cardData.exampleTranslation || '',
      category: cardData.category || 'conversacao',
      level: 'A1',
      isFavorite: false,
      intervalDays: 1,
      repetitionCount: 0,
      easeFactor: 2.5,
      mistakeCount: 0,
      difficultyScore: 'novo',
      nextReviewDate: new Date().toISOString()
    };
    cards.unshift(newCard);
    this.saveFlashcards(cards);
    return newCard;
  },

  getAchievements(): Achievement[] {
    try {
      const data = localStorage.getItem(ACHIEVEMENTS_KEY);
      if (!data) return INITIAL_ACHIEVEMENTS;
      return JSON.parse(data);
    } catch {
      return INITIAL_ACHIEVEMENTS;
    }
  },

  saveAchievements(achs: Achievement[]): void {
    try {
      localStorage.setItem(ACHIEVEMENTS_KEY, JSON.stringify(achs));
    } catch (e) {
      console.error('Failed to save achievements:', e);
    }
  },

  // Update spaced repetition score for a card
  rateFlashcard(cardId: string, rating: 'facil' | 'bom' | 'dificil' | 'repetir'): { updatedCard: Flashcard; xpGained: number } {
    const cards = this.getFlashcards();
    const cardIndex = cards.findIndex(c => c.id === cardId);
    if (cardIndex === -1) throw new Error('Card not found');

    const card = { ...cards[cardIndex] };
    const now = new Date();
    card.lastReviewedDate = now.toISOString();

    let daysToAdd = 1;
    let xpGained = 10;

    if (rating === 'facil') {
      card.repetitionCount += 1;
      card.intervalDays = Math.max(3, Math.round((card.intervalDays || 1) * 2.5));
      card.easeFactor = Math.min(3.0, (card.easeFactor || 2.5) + 0.15);
      daysToAdd = card.intervalDays;
      xpGained = 15;
    } else if (rating === 'bom') {
      card.repetitionCount += 1;
      card.intervalDays = Math.max(2, Math.round((card.intervalDays || 1) * 1.8));
      daysToAdd = card.intervalDays;
      xpGained = 10;
    } else if (rating === 'dificil') {
      card.intervalDays = 1;
      card.mistakeCount = (card.mistakeCount || 0) + 1;
      card.easeFactor = Math.max(1.3, (card.easeFactor || 2.5) - 0.2);
      daysToAdd = 1;
      xpGained = 5;
    } else { // repetir
      card.intervalDays = 0.5;
      card.mistakeCount = (card.mistakeCount || 0) + 1;
      daysToAdd = 0; // due now/today
      xpGained = 3;
    }

    card.difficultyScore = rating;
    const nextDate = new Date(now.getTime() + daysToAdd * 24 * 60 * 60 * 1000);
    card.nextReviewDate = nextDate.toISOString();

    cards[cardIndex] = card;
    this.saveFlashcards(cards);
    this.addXP(xpGained);

    return { updatedCard: card, xpGained };
  },

  // Toggle favorite flashcard
  toggleFavoriteCard(cardId: string): Flashcard[] {
    const cards = this.getFlashcards();
    const updated = cards.map(c => (c.id === cardId ? { ...c, isFavorite: !c.isFavorite } : c));
    this.saveFlashcards(updated);
    return updated;
  },

  // Add XP and update level/achievements
  addXP(amount: number): UserProfile {
    const user = this.getUserProfile();
    const oldXp = user.xp;
    user.xp += amount;
    this.checkStreak(user);
    this.checkAchievements(user);
    this.saveUserProfile(user);
    return user;
  },

  // Record completed lesson
  recordCompletedLesson(lessonId: string, durationMinutes: number, correctAnswers: number, totalQuestions: number): UserProfile {
    const user = this.getUserProfile();
    if (!user.completedLessonIds.includes(lessonId)) {
      user.completedLessonIds.push(lessonId);
    }
    user.todayMinutesStudied += durationMinutes;
    user.weeklyMinutesStudied += durationMinutes;
    user.completedExerciseCount += totalQuestions;

    // Recalculate accuracy rate
    const currentAcc = user.accuracyRate || 90;
    const sessionAcc = totalQuestions > 0 ? (correctAnswers / totalQuestions) * 100 : 100;
    user.accuracyRate = Math.round((currentAcc * 0.7) + (sessionAcc * 0.3));

    this.checkStreak(user);
    this.saveUserProfile(user);
    this.checkAchievements(user);
    return user;
  },

  // Check and maintain study streak
  checkStreak(user: UserProfile) {
    const today = new Date().toISOString().split('T')[0];
    if (user.lastStudiedDate !== today) {
      const last = new Date(user.lastStudiedDate);
      const now = new Date(today);
      const diffDays = Math.round((now.getTime() - last.getTime()) / (1000 * 60 * 60 * 24));

      if (diffDays === 1) {
        user.streak += 1;
      } else if (diffDays > 1) {
        user.streak = 1;
      }
      user.lastStudiedDate = today;
    }
  },

  // Check achievement unlock conditions
  checkAchievements(user: UserProfile): Achievement[] {
    const achs = this.getAchievements();
    let hasNewUnlock = false;

    achs.forEach(ach => {
      if (ach.isUnlocked) return;
      let shouldUnlock = false;

      if (ach.id === 'ach-first-step' && user.completedLessonIds.length >= 1) shouldUnlock = true;
      if (ach.id === 'ach-streak-3' && user.streak >= 3) shouldUnlock = true;
      if (ach.id === 'ach-streak-7' && user.streak >= 7) shouldUnlock = true;
      if (ach.id === 'ach-flashcards-master' && user.completedExerciseCount >= 15) shouldUnlock = true;
      if (ach.id === 'ach-level-up' && user.xp >= 500) shouldUnlock = true;

      if (shouldUnlock) {
        ach.isUnlocked = true;
        ach.unlockedAt = new Date().toISOString();
        user.xp += ach.xpReward;
        hasNewUnlock = true;
      }
    });

    if (hasNewUnlock) {
      this.saveAchievements(achs);
      this.saveUserProfile(user);
      soundService.playLevelUp();
    }
    return achs;
  },

  // Export data as JSON
  exportData(): string {
    const backup = {
      profile: this.getUserProfile(),
      flashcards: this.getFlashcards(),
      achievements: this.getAchievements(),
      exportedAt: new Date().toISOString(),
      appVersion: 'EnglishFlow AI v1.0.0',
    };
    return JSON.stringify(backup, null, 2);
  },

  // Import data from JSON
  importData(jsonString: string): boolean {
    try {
      const data = JSON.parse(jsonString);
      if (data.profile) this.saveUserProfile(data.profile);
      if (data.flashcards) this.saveFlashcards(data.flashcards);
      if (data.achievements) this.saveAchievements(data.achievements);
      return true;
    } catch (e) {
      console.error('Import failed:', e);
      return false;
    }
  },

  // Reset progress back to fresh state
  resetAllData(): void {
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(FLASHCARDS_KEY);
    localStorage.removeItem(ACHIEVEMENTS_KEY);
  }
};
