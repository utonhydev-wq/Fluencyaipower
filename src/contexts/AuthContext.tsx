import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from 'firebase/auth';
import { authService } from '../services/authService';
import { userService } from '../services/userService';
import { UserProfile } from '../types';

interface AuthContextType {
  currentUser: User | null;
  userProfile: UserProfile | null;
  isLoading: boolean;
  loginWithEmail: (email: string, pass: string) => Promise<void>;
  registerWithEmail: (name: string, email: string, pass: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
  deleteAccount: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load user profile from Firestore or create initial
  const loadProfile = async (user: User) => {
    try {
      let profile = await userService.getUserProfile(user.uid);
      if (!profile) {
        // First login or Google sign-in: create initial Firestore document
        profile = await userService.createInitialProfile(user.uid, {
          name: user.displayName || user.email?.split('@')[0] || 'Estudante',
          email: user.email || '',
          avatarUrl: user.photoURL || undefined,
        });
      }
      setUserProfile(profile);
    } catch (err) {
      console.error('Failed to load user profile from Firestore:', err);
    }
  };

  useEffect(() => {
    const unsubscribe = authService.onAuthStateChange(async (user) => {
      setCurrentUser(user);
      if (user) {
        await loadProfile(user);
      } else {
        setUserProfile(null);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const loginWithEmail = async (email: string, pass: string) => {
    setIsLoading(true);
    try {
      const user = await authService.loginWithEmail(email, pass);
      await loadProfile(user);
    } finally {
      setIsLoading(false);
    }
  };

  const registerWithEmail = async (name: string, email: string, pass: string) => {
    setIsLoading(true);
    try {
      const user = await authService.registerWithEmail(name, email, pass);
      const profile = await userService.createInitialProfile(user.uid, {
        name: name.trim() || 'Estudante',
        email: email.trim()
      });
      setUserProfile(profile);
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithGoogle = async () => {
    setIsLoading(true);
    try {
      const user = await authService.loginWithGoogle();
      await loadProfile(user);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    await authService.logout();
    setUserProfile(null);
    setCurrentUser(null);
  };

  const refreshProfile = async () => {
    if (currentUser) {
      await loadProfile(currentUser);
    }
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!currentUser || !userProfile) return;
    const updated = { ...userProfile, ...updates };
    setUserProfile(updated);
    await userService.updateUserProfile(currentUser.uid, updates);
  };

  const deleteAccount = async () => {
    if (!currentUser) return;
    await userService.deleteUserProfile(currentUser.uid);
    await authService.deleteAccount();
    setUserProfile(null);
    setCurrentUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        userProfile,
        isLoading,
        loginWithEmail,
        registerWithEmail,
        loginWithGoogle,
        logout,
        refreshProfile,
        updateProfile,
        deleteAccount
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
