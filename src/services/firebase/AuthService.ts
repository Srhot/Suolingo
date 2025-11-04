import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  User,
  onAuthStateChanged,
} from 'firebase/auth';
import { auth } from '@/config/firebase';

export class AuthService {
  // Sign up with email/password
  static async signUp(email: string, password: string): Promise<User> {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      return userCredential.user;
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new Error(`Signup failed: ${error.message}`);
      }
      throw new Error('Signup failed with unknown error');
    }
  }

  // Sign in with email/password
  static async signIn(email: string, password: string): Promise<User> {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return userCredential.user;
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new Error(`Sign in failed: ${error.message}`);
      }
      throw new Error('Sign in failed with unknown error');
    }
  }

  // Sign out
  static async signOut(): Promise<void> {
    try {
      await signOut(auth);
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new Error(`Sign out failed: ${error.message}`);
      }
      throw new Error('Sign out failed with unknown error');
    }
  }

  // Get current user
  static getCurrentUser(): User | null {
    return auth.currentUser;
  }

  // Listen to auth state changes
  static onAuthStateChanged(callback: (user: User | null) => void): () => void {
    return onAuthStateChanged(auth, callback);
  }
}
