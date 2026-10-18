import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  increment,
  collection,
  getDocs,
  query,
  orderBy,
  limit
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { handleFirestoreError, OperationType } from '../lib/firestoreErrors';
import { CEFRLevel } from '../types';

export interface ProgressSummaryData {
  level: CEFRLevel;
  completedLessonsCount: number;
  totalMinutesStudied: number;
  activeDaysCount: number;
  currentStreak: number;
  highestStreak: number;
  xp: number;
  accuracyRate: number;
  readingScore: number;
  writingScore: number;
  speakingScore: number;
  listeningScore: number;
  grammarScore: number;
  vocabularyScore: number;
  lastReviewDate: string;
  updatedAt: string;
}

export interface DailyStatData {
  date: string;
  minutesStudied: number;
  lessonsCompleted: number;
  exercisesCompleted: number;
  correctCount: number;
  mistakeCount: number;
  xpEarned: number;
  goalReached: boolean;
}

export const progressService = {
  // Get summary
  async getSummary(uid: string): Promise<ProgressSummaryData | null> {
    const path = `users/${uid}/progress/summary`;
    try {
      const snap = await getDoc(doc(db, 'users', uid, 'progress', 'summary'));
      if (!snap.exists()) return null;
      return snap.data() as ProgressSummaryData;
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, path);
    }
  },

  // Save or update summary
  async saveSummary(uid: string, data: Partial<ProgressSummaryData>): Promise<void> {
    const path = `users/${uid}/progress/summary`;
    try {
      await setDoc(doc(db, 'users', uid, 'progress', 'summary'), {
        ...data,
        updatedAt: new Date().toISOString()
      }, { merge: true });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  },

  // Record daily study session
  async recordDailyStudy(uid: string, params: {
    minutesToAdd: number;
    exercisesToAdd: number;
    correctToAdd: number;
    mistakesToAdd: number;
    xpToAdd: number;
    dailyGoalMinutes: number;
  }): Promise<void> {
    const today = new Date().toISOString().split('T')[0];
    const path = `users/${uid}/dailyStats/${today}`;

    try {
      const statRef = doc(db, 'users', uid, 'dailyStats', today);
      const existingSnap = await getDoc(statRef);

      let currentMins = 0;
      if (existingSnap.exists()) {
        currentMins = (existingSnap.data().minutesStudied || 0) + params.minutesToAdd;
      } else {
        currentMins = params.minutesToAdd;
      }

      await setDoc(statRef, {
        date: today,
        minutesStudied: increment(params.minutesToAdd),
        exercisesCompleted: increment(params.exercisesToAdd),
        correctCount: increment(params.correctToAdd),
        mistakeCount: increment(params.mistakesToAdd),
        xpEarned: increment(params.xpToAdd),
        goalReached: currentMins >= params.dailyGoalMinutes
      }, { merge: true });

      // Update root summary and profile counters atomically
      await updateDoc(doc(db, 'users', uid), {
        xp: increment(params.xpToAdd),
        todayMinutesStudied: increment(params.minutesToAdd),
        weeklyMinutesStudied: increment(params.minutesToAdd),
        completedExerciseCount: increment(params.exercisesToAdd),
        lastActivity: new Date().toISOString()
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  },

  // Get recent daily stats for charting
  async getRecentDailyStats(uid: string, days = 7): Promise<DailyStatData[]> {
    const path = `users/${uid}/dailyStats`;
    try {
      const q = query(
        collection(db, 'users', uid, 'dailyStats'),
        orderBy('date', 'desc'),
        limit(days)
      );
      const snap = await getDocs(q);
      const results: DailyStatData[] = [];
      snap.forEach(d => results.push(d.data() as DailyStatData));
      return results.reverse();
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, path);
    }
  }
};
