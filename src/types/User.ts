// User tier type
export type UserTier = 'free' | 'premium';

// User interface for SUOLINGO
export interface User {
  userId: string;
  email: string;
  displayName?: string;
  nativeLanguage: string; // ISO 639-1 code (e.g., 'en', 'tr')
  targetLanguages: string[]; // Learning languages
  tier: UserTier;
  totalXP: number;
  currentLevel: number;
  streakDays: number;
  consentVoiceRecording: boolean;
  createdAt: Date;
  lastActivityDate: Date;
}

// Auth state
export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}
