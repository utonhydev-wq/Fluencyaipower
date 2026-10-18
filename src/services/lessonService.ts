import {
  doc,
  getDoc,
  setDoc,
  collection,
  getDocs,
  arrayUnion,
  updateDoc
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { handleFirestoreError, OperationType } from '../lib/firestoreErrors';

export interface LessonProgressDoc {
  lessonId: string;
  status: 'not_started' | 'in_progress' | 'completed';
  score: number;
  maxScore: number;
  timeSpentMinutes: number;
  attemptsCount: number;
  startedAt: string;
  completedAt: string;
  updatedAt: string;
}

export interface ActivityHistoryDoc {
  id: string;
  type: 'lesson' | 'review' | 'roleplay' | 'pronunciation' | 'placement';
  title: string;
  relatedId?: string;
  durationMinutes: number;
  score: number;
  xpEarned: number;
  skillPracticed: string;
  timestamp: string;
}

export const lessonService = {
  // Get all completed lesson IDs for user
  async getUserCompletedLessons(uid: string): Promise<string[]> {
    const path = `users/${uid}/lessonProgress`;
    try {
      const snap = await getDocs(collection(db, 'users', uid, 'lessonProgress'));
      const completed: string[] = [];
      snap.forEach(d => {
        const data = d.data() as LessonProgressDoc;
        if (data.status === 'completed') {
          completed.push(data.lessonId);
        }
      });
      return completed;
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, path);
    }
  },

  // Record completed lesson
  async completeLesson(uid: string, params: {
    lessonId: string;
    score: number;
    maxScore: number;
    durationMinutes: number;
    lessonTitle: string;
    xpEarned: number;
  }): Promise<void> {
    const path = `users/${uid}/lessonProgress/${params.lessonId}`;
    const now = new Date().toISOString();

    try {
      // 1. Save lesson progress document
      await setDoc(doc(db, 'users', uid, 'lessonProgress', params.lessonId), {
        lessonId: params.lessonId,
        status: 'completed',
        score: params.score,
        maxScore: params.maxScore,
        timeSpentMinutes: params.durationMinutes,
        attemptsCount: 1,
        completedAt: now,
        updatedAt: now
      }, { merge: true });

      // 2. Add to user's completedLessonIds array on user doc
      await updateDoc(doc(db, 'users', uid), {
        completedLessonIds: arrayUnion(params.lessonId),
        lastActivity: now
      });

      // 3. Log activity in activityHistory
      const activityId = `act_${Date.now()}`;
      await setDoc(doc(db, 'users', uid, 'activityHistory', activityId), {
        id: activityId,
        type: 'lesson',
        title: params.lessonTitle,
        relatedId: params.lessonId,
        durationMinutes: params.durationMinutes,
        score: params.score,
        xpEarned: params.xpEarned,
        skillPracticed: 'Compreensão & Gramática',
        timestamp: now
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  },

  // Get recent activities
  async getRecentActivities(uid: string): Promise<ActivityHistoryDoc[]> {
    const path = `users/${uid}/activityHistory`;
    try {
      const snap = await getDocs(collection(db, 'users', uid, 'activityHistory'));
      const items: ActivityHistoryDoc[] = [];
      snap.forEach(d => items.push(d.data() as ActivityHistoryDoc));
      return items.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, 10);
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, path);
    }
  }
};
