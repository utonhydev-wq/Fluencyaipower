import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
  onAuthStateChanged,
  deleteUser,
  User
} from 'firebase/auth';
import { auth } from '../lib/firebase';

const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

export function translateAuthError(code: string): string {
  switch (code) {
    case 'auth/email-already-in-use':
      return 'Este e-mail já está cadastrado. Faça login ou recupere sua senha.';
    case 'auth/invalid-email':
      return 'O formato de e-mail informado é inválido.';
    case 'auth/weak-password':
      return 'A senha é muito fraca. Digite pelo menos 6 caracteres.';
    case 'auth/user-not-found':
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      return 'E-mail ou senha incorretos.';
    case 'auth/popup-closed-by-user':
      return 'O login com Google foi cancelado antes de concluir.';
    case 'auth/network-request-failed':
      return 'Erro de conexão com a internet. Verifique sua rede.';
    case 'auth/too-many-requests':
      return 'Muitas tentativas sem sucesso. Aguarde alguns minutos antes de tentar novamente.';
    default:
      return 'Ocorreu um erro na autenticação. Tente novamente.';
  }
}

export const authService = {
  // Sign up with name, email and password
  async registerWithEmail(name: string, email: string, pass: string): Promise<User> {
    const credential = await createUserWithEmailAndPassword(auth, email.trim(), pass);
    if (name.trim()) {
      await updateProfile(credential.user, { displayName: name.trim() });
    }
    return credential.user;
  },

  // Login with email and password
  async loginWithEmail(email: string, pass: string): Promise<User> {
    const credential = await signInWithEmailAndPassword(auth, email.trim(), pass);
    return credential.user;
  },

  // Google Sign-In with popup
  async loginWithGoogle(): Promise<User> {
    const credential = await signInWithPopup(auth, googleProvider);
    return credential.user;
  },

  // Password reset email
  async sendPasswordReset(email: string): Promise<void> {
    await sendPasswordResetEmail(auth, email.trim());
  },

  // Sign out
  async logout(): Promise<void> {
    await signOut(auth);
  },

  // Delete authenticated user
  async deleteAccount(): Promise<void> {
    if (auth.currentUser) {
      await deleteUser(auth.currentUser);
    }
  },

  // Auth state listener
  onAuthStateChange(callback: (user: User | null) => void) {
    return onAuthStateChanged(auth, callback);
  },

  // Get current user
  getCurrentUser(): User | null {
    return auth.currentUser;
  }
};
