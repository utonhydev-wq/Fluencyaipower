import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { handleFirestoreError, OperationType } from '../lib/firestoreErrors';
import { UserProfile, UserPreferences, CEFRLevel } from '../types';

export const userService = {
  // Get user profile document from Firestore
  async getUserProfile(uid: string): Promise<UserProfile | null> {
    const path = `users/${uid}`;
    try {
      const snap = await getDoc(doc(db, 'users', uid));
      if (!snap.exists()) {
        return null;
      }
      return snap.data() as UserProfile;
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, path);
    }
  },

  // Create initial profile for a new user
  async createInitialProfile(uid: string, data: {
    name: string;
    email: string;
    avatarUrl?: string;
    level?: CEFRLevel;
    levelTitle?: string;
    preferences?: Partial<UserPreferences>;
  }): Promise<UserProfile> {
    const path = `users/${uid}`;
    const now = new Date().toISOString();

    const profile: UserProfile = {
      id: uid,
      name: data.name || 'Estudante',
      email: data.email,
      avatarUrl: data.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80',
      level: data.level || 'A1',
      levelTitle: data.levelTitle || 'Iniciante (A1) — Primeiros Passos',
      preferences: {
        dailyMinutes: data.preferences?.dailyMinutes || 15,
        learningStyle: data.preferences?.learningStyle || 'combinacao',
        primaryGoal: data.preferences?.primaryGoal || 'conversas_gerais',
        mainDifficulty: data.preferences?.mainDifficulty || 'falar',
        soundEffects: data.preferences?.soundEffects ?? true,
        voicePlaybackSpeed: data.preferences?.voicePlaybackSpeed ?? 1.0,
        preferredAccent: data.preferences?.preferredAccent || 'US',
        theme: data.preferences?.theme || 'dark',
        autoPlayAudio: data.preferences?.autoPlayAudio ?? true,
      },
      xp: 120,
      streak: 1,
      lastStudiedDate: now.split('T')[0],
      todayMinutesStudied: 0,
      weeklyMinutesStudied: 0,
      completedLessonIds: [],
      completedExerciseCount: 0,
      accuracyRate: 95,
      onboardingCompleted: true,
      createdAt: now,
    };

    try {
      await setDoc(doc(db, 'users', uid), {
        ...profile,
        uid,
        interfaceLanguage: 'pt-BR',
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'America/Sao_Paulo',
        updatedAt: now,
        lastActivity: now
      });
      return profile;
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, path);
    }
  },

  // Update user profile fields
  async updateUserProfile(uid: string, updates: Partial<UserProfile>): Promise<void> {
    const path = `users/${uid}`;
    try {
      await updateDoc(doc(db, 'users', uid), {
        ...updates,
        updatedAt: new Date().toISOString(),
        lastActivity: new Date().toISOString()
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
    }
  },

  // Delete profile document
  async deleteUserProfile(uid: string): Promise<void> {
    const path = `users/${uid}`;
    try {
      await deleteDoc(doc(db, 'users', uid));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, path);
    }
  }
};
