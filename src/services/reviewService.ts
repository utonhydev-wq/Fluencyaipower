import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  getDocs,
  writeBatch
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { handleFirestoreError, OperationType } from '../lib/firestoreErrors';
import { Flashcard } from '../types';
import { INITIAL_FLASHCARDS } from '../data/flashcards';

export const reviewService = {
  // Get all vocabulary items for user (or seed defaults if empty)
  async getUserVocabulary(uid: string): Promise<Flashcard[]> {
    const path = `users/${uid}/vocabulary`;
    try {
      const snap = await getDocs(collection(db, 'users', uid, 'vocabulary'));
      if (snap.empty) {
        // Seed initial flashcards for user
        await this.seedInitialFlashcards(uid);
        return INITIAL_FLASHCARDS;
      }

      const cards: Flashcard[] = [];
      snap.forEach(d => cards.push(d.data() as Flashcard));
      return cards;
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, path);
    }
  },

  // Seed default flashcards into user's Firestore subcollection
  async seedInitialFlashcards(uid: string): Promise<void> {
    const path = `users/${uid}/vocabulary`;
    try {
      const batch = writeBatch(db);
      INITIAL_FLASHCARDS.forEach(card => {
        const cardRef = doc(db, 'users', uid, 'vocabulary', card.id);
        batch.set(cardRef, {
          ...card,
          updatedAt: new Date().toISOString()
        });
      });
      await batch.commit();
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  },

  // Update card rating with SRS spaced repetition algorithm
  async rateCard(uid: string, cardId: string, currentCard: Flashcard, rating: 'facil' | 'bom' | 'dificil' | 'repetir'): Promise<Flashcard> {
    const path = `users/${uid}/vocabulary/${cardId}`;
    const now = new Date();
    let daysToAdd = 1;
    let newInterval = currentCard.intervalDays || 1;
    let newEase = currentCard.easeFactor || 2.5;
    let mistakes = currentCard.mistakeCount || 0;
    let reps = currentCard.repetitionCount || 0;

    if (rating === 'facil') {
      reps += 1;
      newInterval = Math.max(3, Math.round(newInterval * 2.5));
      newEase = Math.min(3.0, newEase + 0.15);
      daysToAdd = newInterval;
    } else if (rating === 'bom') {
      reps += 1;
      newInterval = Math.max(2, Math.round(newInterval * 1.8));
      daysToAdd = newInterval;
    } else if (rating === 'dificil') {
      newInterval = 1;
      mistakes += 1;
      newEase = Math.max(1.3, newEase - 0.2);
      daysToAdd = 1;
    } else { // repetir
      newInterval = 0.5;
      mistakes += 1;
      daysToAdd = 0;
    }

    const nextDate = new Date(now.getTime() + daysToAdd * 24 * 60 * 60 * 1000);

    const updatedCard: Flashcard = {
      ...currentCard,
      repetitionCount: reps,
      intervalDays: newInterval,
      easeFactor: newEase,
      mistakeCount: mistakes,
      difficultyScore: rating,
      lastReviewedDate: now.toISOString(),
      nextReviewDate: nextDate.toISOString(),
    };

    try {
      await setDoc(doc(db, 'users', uid, 'vocabulary', cardId), {
        ...updatedCard,
        updatedAt: now.toISOString()
      }, { merge: true });

      return updatedCard;
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
    }
  },

  // Toggle favorite on card
  async toggleFavorite(uid: string, cardId: string, currentFavorite: boolean): Promise<void> {
    const path = `users/${uid}/vocabulary/${cardId}`;
    try {
      await updateDoc(doc(db, 'users', uid, 'vocabulary', cardId), {
        isFavorite: !currentFavorite,
        updatedAt: new Date().toISOString()
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
    }
  },

  // Add custom card to Firestore
  async addCustomCard(uid: string, cardData: {
    english: string;
    portuguese: string;
    phonetic?: string;
    category?: Flashcard['category'];
    exampleSentence?: string;
    exampleTranslation?: string;
  }): Promise<Flashcard> {
    const id = `custom_${Date.now()}`;
    const path = `users/${uid}/vocabulary/${id}`;
    const newCard: Flashcard = {
      id,
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
    try {
      await setDoc(doc(db, 'users', uid, 'vocabulary', id), {
        ...newCard,
        updatedAt: new Date().toISOString()
      });
      return newCard;
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, path);
    }
  }
};
