/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { UserProfile, Lesson, Flashcard } from './types';
import { storageService } from './services/storageService';
import { soundService } from './services/soundService';
import { lessonService } from './services/lessonService';
import { progressService } from './services/progressService';
import { AuthProvider, useAuth } from './contexts/AuthContext';

// Layout Components
import { Navbar } from './components/layout/Navbar';
import { BottomNav } from './components/layout/BottomNav';
import { OfflineIndicator } from './components/pwa/OfflineIndicator';
import { AuthModal } from './components/auth/AuthModal';

// Feature Views
import { OnboardingModal } from './components/onboarding/OnboardingModal';
import { DashboardView } from './components/dashboard/DashboardView';
import { CurriculumTrackView } from './components/curriculum/CurriculumTrackView';
import { LessonPlayer } from './components/lesson/LessonPlayer';
import { DailyRoutineSession } from './components/routine/DailyRoutineSession';
import { AITutorView } from './components/tutor/AITutorView';
import { RoleplayView } from './components/roleplay/RoleplayView';
import { PronunciationStudio } from './components/pronunciation/PronunciationStudio';
import { VocabularySRSView } from './components/vocabulary/VocabularySRSView';
import { ProgressAnalyticsView } from './components/progress/ProgressAnalyticsView';
import { AchievementsView } from './components/achievements/AchievementsView';
import { ProfileSettingsView } from './components/profile/ProfileSettingsView';

function MainApp() {
  const { currentUser, userProfile: firestoreProfile, updateProfile: updateFirestoreProfile, isLoading: isAuthLoading } = useAuth();

  const [localProfile, setLocalProfile] = useState<UserProfile>(() => storageService.getUserProfile());
  const [flashcards, setFlashcards] = useState<Flashcard[]>(() => storageService.getFlashcards());
  const [activeTab, setActiveTab] = useState<string>('dashboard');

  // Active overlays
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);
  const [isRoutineActive, setIsRoutineActive] = useState(false);
  const [showPlacementModal, setShowPlacementModal] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);

  // Active profile precedence: Firestore document if logged in, else local
  const effectiveProfile: UserProfile = firestoreProfile || localProfile;

  useEffect(() => {
    // Check daily streak on load
    const updated = storageService.getUserProfile();
    storageService.checkStreak(updated);
    storageService.checkAchievements(updated);
    setLocalProfile(updated);
  }, []);

  // Update profile handler (persists to Firestore if authenticated, plus local backup)
  const handleUpdateProfile = async (updated: UserProfile) => {
    setLocalProfile(updated);
    storageService.saveUserProfile(updated);
    if (currentUser?.uid) {
      await updateFirestoreProfile(updated);
    }
  };

  // Complete onboarding
  const handleOnboardingComplete = async (data: Partial<UserProfile>) => {
    const updated = {
      ...effectiveProfile,
      ...data,
      onboardingCompleted: true,
    };
    await handleUpdateProfile(updated as UserProfile);
    setShowPlacementModal(false);
  };

  // Lesson player completion
  const handleLessonComplete = async (correctCount: number, totalQuestions: number) => {
    if (!activeLesson) return;

    // 1. Update local storage mirror
    const updated = storageService.recordCompletedLesson(
      activeLesson.id,
      activeLesson.durationMinutes,
      correctCount,
      totalQuestions
    );
    storageService.addXP(50);
    setLocalProfile(updated);

    // 2. Persist to Firestore if authenticated
    if (currentUser?.uid) {
      try {
        await lessonService.completeLesson(currentUser.uid, {
          lessonId: activeLesson.id,
          score: correctCount,
          maxScore: totalQuestions,
          durationMinutes: activeLesson.durationMinutes,
          lessonTitle: activeLesson.title,
          xpEarned: 50
        });

        await progressService.recordDailyStudy(currentUser.uid, {
          minutesToAdd: activeLesson.durationMinutes,
          exercisesToAdd: totalQuestions,
          correctToAdd: correctCount,
          mistakesToAdd: Math.max(0, totalQuestions - correctCount),
          xpToAdd: 50,
          dailyGoalMinutes: effectiveProfile.preferences.dailyMinutes || 15
        });
      } catch (err) {
        console.warn('Error saving lesson to Firestore:', err);
      }
    }

    setActiveLesson(null);
  };

  const isDarkMode = effectiveProfile.preferences?.theme !== 'light';

  return (
    <div className={`min-h-screen flex flex-col font-sans transition-colors duration-200 ${
      isDarkMode ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'
    }`}>
      
      {/* Onboarding Flow if not completed */}
      {(!effectiveProfile.onboardingCompleted || showPlacementModal) && (
        <OnboardingModal onComplete={handleOnboardingComplete} />
      )}

      {/* Interactive Lesson Player Overlay */}
      {activeLesson && (
        <LessonPlayer
          lesson={activeLesson}
          onClose={() => setActiveLesson(null)}
          onComplete={handleLessonComplete}
        />
      )}

      {/* Authentication Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />

      {/* Top Navbar */}
      <Navbar
        userProfile={effectiveProfile}
        activeTab={activeTab}
        onNavigate={(tab) => {
          soundService.playClick();
          setActiveTab(tab);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onOpenSettings={() => {
          soundService.playClick();
          setActiveTab('profile');
        }}
        onOpenAuth={() => {
          soundService.playClick();
          setShowAuthModal(true);
        }}
      />

      {/* Main Content Area */}
      <main className="flex-1 pb-20 md:pb-8">
        
        {/* Daily Routine Guided Runner */}
        {isRoutineActive ? (
          <DailyRoutineSession
            userProfile={effectiveProfile}
            onNavigateToTab={(tab) => {
              setIsRoutineActive(false);
              setActiveTab(tab);
            }}
            onClose={() => setIsRoutineActive(false)}
          />
        ) : (
          <>
            {activeTab === 'dashboard' && (
              <DashboardView
                userProfile={effectiveProfile}
                flashcards={flashcards}
                onStartLesson={(lesson) => setActiveLesson(lesson)}
                onStartRoutine={() => setIsRoutineActive(true)}
                onNavigate={(tab) => {
                  soundService.playClick();
                  setActiveTab(tab);
                }}
              />
            )}

            {activeTab === 'track' && (
              <CurriculumTrackView
                userProfile={effectiveProfile}
                onSelectLesson={(lesson) => setActiveLesson(lesson)}
              />
            )}

            {activeTab === 'tutor' && (
              <AITutorView userProfile={effectiveProfile} />
            )}

            {activeTab === 'roleplay' && (
              <RoleplayView userProfile={effectiveProfile} />
            )}

            {activeTab === 'vocab' && (
              <VocabularySRSView userProfile={effectiveProfile} />
            )}

            {activeTab === 'pronunciation' && (
              <PronunciationStudio userProfile={effectiveProfile} />
            )}

            {activeTab === 'progress' && (
              <ProgressAnalyticsView userProfile={effectiveProfile} />
            )}

            {activeTab === 'achievements' && (
              <AchievementsView userProfile={effectiveProfile} />
            )}

            {activeTab === 'profile' && (
              <ProfileSettingsView
                userProfile={effectiveProfile}
                onUpdateProfile={handleUpdateProfile}
                onRetakePlacement={() => setShowPlacementModal(true)}
                onOpenAuth={() => setShowAuthModal(true)}
              />
            )}
          </>
        )}

      </main>

      {/* Mobile Bottom Navigation Bar */}
      {!activeLesson && (
        <BottomNav
          activeTab={activeTab}
          onNavigate={(tab) => {
            soundService.playClick();
            setIsRoutineActive(false);
            setActiveTab(tab);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
        />
      )}

      {/* PWA Offline Connectivity Indicator */}
      <OfflineIndicator />

    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
