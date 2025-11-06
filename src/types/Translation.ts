export interface TranslationRequest {
  text: string;
  sourceLang: 'tr' | 'en';
  targetLang: 'tr' | 'en';
}

export interface TranslationResponse {
  translatedText: string;
  sourceLang: string;
  targetLang: string;
  confidence?: number;
}

export type LanguageCode = 'tr' | 'en';
