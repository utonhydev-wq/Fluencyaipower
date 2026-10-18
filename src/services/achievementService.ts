import {
  doc,
  getDocs,
  collection,
  setDoc,
  writeBatch
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { handleFirestoreError, OperationType } from '../lib/firestoreErrors';
import { Achievement } from '../types';
import { INITIAL_ACHIEVEMENTS } from '../data/achievements';

export const achievementService = {
  // Get user achievements from Firestore
  async getUserAchievements(uid: string): Promise<Achievement[]> {
    const path = `users/${uid}/achievements`;
    try {
      const snap = await getDocs(collection(db, 'users', uid, 'achievements'));
      if (snap.empty) {
        await this.seedAchievements(uid);
        return INITIAL_ACHIEVEMENTS;
      }
      const list: Achievement[] = [];
      snap.forEach(d => list.push(d.data() as Achievement));
      return list;
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, path);
    }
  },

  // Seed default achievements
  async seedAchievements(uid: string): Promise<void> {
    const path = `users/${uid}/achievements`;
    try {
      const batch = writeBatch(db);
      INITIAL_ACHIEVEMENTS.forEach(ach => {
        const ref = doc(db, 'users', uid, 'achievements', ach.id);
        batch.set(ref, ach);
      });
      await batch.commit();
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  },

  // Unlock achievement
  async unlockAchievement(uid: string, achievementId: string): Promise<void> {
    const path = `users/${uid}/achievements/${achievementId}`;
    try {
      await setDoc(doc(db, 'users', uid, 'achievements', achievementId), {
        isUnlocked: true,
        unlockedAt: new Date().toISOString()
      }, { merge: true });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
    }
  }
};
