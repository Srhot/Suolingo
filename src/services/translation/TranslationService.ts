import axios from 'axios';
import { TranslationRequest, TranslationResponse, LanguageCode } from '@/types/Translation';

/**
 * Translation Service - Bi-directional Turkish ↔ English translation
 * Uses Google Translate API (or can use alternatives like DeepL, Azure, etc.)
 */
class TranslationService {
  private apiKey: string;
  private baseURL: string;

  constructor() {
    // Using Google Cloud Translation API
    // Alternative: Can use free APIs like MyMemory, LibreTranslate
    this.apiKey = process.env.TRANSLATION_API_KEY || '';
    this.baseURL = 'https://translation.googleapis.com/language/translate/v2';
  }

  /**
   * Translate text between Turkish and English (bi-directional)
   */
  async translate(
    text: string,
    sourceLang: LanguageCode,
    targetLang: LanguageCode
  ): Promise<string> {
    try {
      console.log(`🌐 Translating from ${sourceLang} to ${targetLang}...`);
      console.log('Text:', text.substring(0, 50) + '...');

      if (!text.trim()) {
        throw new Error('Empty text cannot be translated');
      }

      if (sourceLang === targetLang) {
        console.log('⚠️ Source and target languages are the same, returning original text');
        return text;
      }

      // If no API key, use fallback method (MyMemory API - free)
      if (!this.apiKey) {
        console.log('🌐 Using free MyMemory Translation API');
        return await this.fallbackTranslation(text, sourceLang, targetLang);
      }

      // Google Cloud Translation API request
      const response = await axios.post(
        this.baseURL,
        {},
        {
          params: {
            q: text,
            source: sourceLang,
            target: targetLang,
            format: 'text',
            key: this.apiKey,
          },
        }
      );

      const translatedText = response.data.data.translations[0].translatedText;
      console.log('✅ Translation successful');
      return translatedText;

    } catch (error: any) {
      console.error('❌ Translation Error:', error.response?.data || error.message);

      // Fallback to alternative free API
      try {
        console.log('🔄 Attempting fallback translation...');
        return await this.fallbackTranslation(text, sourceLang, targetLang);
      } catch (fallbackError) {
        console.error('❌ Fallback translation also failed');
        throw new Error('Translation failed. Please check your internet connection.');
      }
    }
  }

  /**
   * Fallback translation using free MyMemory API
   * Limit: 100 requests/day for anonymous users
   */
  private async fallbackTranslation(
    text: string,
    sourceLang: LanguageCode,
    targetLang: LanguageCode
  ): Promise<string> {
    try {
      const langPair = `${sourceLang}|${targetLang}`;
      const response = await axios.get('https://api.mymemory.translated.net/get', {
        params: {
          q: text,
          langpair: langPair,
        },
      });

      if (response.data.responseStatus === 200) {
        return response.data.responseData.translatedText;
      } else {
        throw new Error('MyMemory API failed');
      }
    } catch (error) {
      console.error('MyMemory fallback error:', error);
      throw error;
    }
  }

  /**
   * Detect language of given text
   */
  async detectLanguage(text: string): Promise<LanguageCode> {
    try {
      // Simple heuristic: Check for Turkish-specific characters
      const turkishChars = /[çğıöşü]/i;
      if (turkishChars.test(text)) {
        return 'tr';
      }

      // If API key available, use Google's language detection
      if (this.apiKey) {
        const response = await axios.post(
          'https://translation.googleapis.com/language/translate/v2/detect',
          {},
          {
            params: {
              q: text,
              key: this.apiKey,
            },
          }
        );

        const detectedLang = response.data.data.detections[0][0].language;
        return detectedLang === 'tr' ? 'tr' : 'en';
      }

      // Default to English if no Turkish chars found
      return 'en';

    } catch (error) {
      console.error('Language detection error:', error);
      return 'en'; // Default to English
    }
  }

  /**
   * Quick translate with auto-detection
   */
  async autoTranslate(text: string): Promise<{ translatedText: string; detectedLang: LanguageCode }> {
    const detectedLang = await this.detectLanguage(text);
    const targetLang: LanguageCode = detectedLang === 'tr' ? 'en' : 'tr';
    const translatedText = await this.translate(text, detectedLang, targetLang);

    return {
      translatedText,
      detectedLang,
    };
  }
}

export default new TranslationService();
