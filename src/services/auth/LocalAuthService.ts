import AsyncStorage from '@react-native-async-storage/async-storage';
import { User } from '@/types/User';

const STORAGE_KEY = '@suolingo_user';

export class LocalAuthService {
  // Sign up - sadece email'i kaydet
  static async signUp(email: string, password: string): Promise<User> {
    // Mock user oluştur
    const user: User = {
      userId: `user_${Date.now()}`,
      email,
      displayName: email.split('@')[0],
      nativeLanguage: 'en',
      targetLanguages: ['es'], // Default Spanish
      tier: 'free',
      totalXP: 0,
      currentLevel: 1,
      streakDays: 0,
      consentVoiceRecording: true,
      createdAt: new Date(),
      lastActivityDate: new Date(),
    };

    // AsyncStorage'a kaydet
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    return user;
  }

  // Sign in - email varsa giriş yap
  static async signIn(email: string, password: string): Promise<User> {
    const userJson = await AsyncStorage.getItem(STORAGE_KEY);

    if (userJson) {
      const user = JSON.parse(userJson);
      if (user.email === email) {
        // Email eşleşiyor, başarılı giriş
        return user;
      }
    }

    // Kullanıcı bulunamadı - yeni hesap oluştur
    return this.signUp(email, password);
  }

  // Sign out - local storage'ı temizle
  static async signOut(): Promise<void> {
    await AsyncStorage.removeItem(STORAGE_KEY);
  }

  // Mevcut kullanıcıyı al
  static async getCurrentUser(): Promise<User | null> {
    const userJson = await AsyncStorage.getItem(STORAGE_KEY);
    if (userJson) {
      return JSON.parse(userJson);
    }
    return null;
  }

  // Kullanıcıyı güncelle
  static async updateUser(user: Partial<User>): Promise<void> {
    const userJson = await AsyncStorage.getItem(STORAGE_KEY);
    if (userJson) {
      const currentUser = JSON.parse(userJson);
      const updatedUser = { ...currentUser, ...user };
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedUser));
    }
  }
}
