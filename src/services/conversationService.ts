import {
  doc,
  setDoc,
  collection,
  getDocs
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { handleFirestoreError, OperationType } from '../lib/firestoreErrors';
import { CEFRLevel } from '../types';

export interface ConversationHistoryDoc {
  id: string;
  scenarioId: string;
  scenarioTitle: string;
  difficultyLevel: CEFRLevel;
  summary: string;
  strengths: string;
  improvements: string;
  timestamp: string;
}

export const conversationService = {
  // Save conversation record
  async saveConversation(uid: string, record: ConversationHistoryDoc): Promise<void> {
    const path = `users/${uid}/conversationHistory/${record.id}`;
    try {
      await setDoc(doc(db, 'users', uid, 'conversationHistory', record.id), record);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, path);
    }
  },

  // Get user conversation history
  async getUserConversations(uid: string): Promise<ConversationHistoryDoc[]> {
    const path = `users/${uid}/conversationHistory`;
    try {
      const snap = await getDocs(collection(db, 'users', uid, 'conversationHistory'));
      const list: ConversationHistoryDoc[] = [];
      snap.forEach(d => list.push(d.data() as ConversationHistoryDoc));
      return list.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, path);
    }
  }
};
