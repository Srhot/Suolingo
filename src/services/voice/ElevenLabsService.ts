import axios from 'axios';
import { ELEVENLABS_API_KEY, ELEVENLABS_BASE_URL } from '@env';
import AudioStorageService from '@/services/storage/AudioStorageService';

export interface ElevenLabsVoice {
  voice_id: string;
  name: string;
  displayName: string;
  gender: 'male' | 'female';
  description: string;
}

class ElevenLabsService {
  private apiKey: string;
  private baseURL: string;

  // 🆕 MULTILINGUAL VOICES - Native pronunciation for 40+ languages including Turkish & English
  public readonly VOICES: { [key: string]: ElevenLabsVoice } = {
    // Male Voices
    adam: {
      voice_id: 'pNInz6obpgDQGcFmaJgB',
      name: 'Adam',
      displayName: '🇺🇸 Adam (Deep & Mature)',
      gender: 'male',
      description: 'Deep, authoritative voice',
    },
    callum: {
      voice_id: 'N2lVS1w4EtoT3dr4eOWO',
      name: 'Callum',
      displayName: '🇬🇧 Callum (British)',
      gender: 'male',
      description: 'British accent, professional',
    },
    charlie: {
      voice_id: 'IKne3meq5aSn9XLyUdCD',
      name: 'Charlie',
      displayName: '🇦🇺 Charlie (Australian)',
      gender: 'male',
      description: 'Australian accent, casual',
    },

    // Female Voices
    rachel: {
      voice_id: '21m00Tcm4TlvDq8ikWAM',
      name: 'Rachel',
      displayName: '🇺🇸 Rachel (Warm & Friendly)',
      gender: 'female',
      description: 'Warm, friendly voice',
    },
    bella: {
      voice_id: 'EXAVITQu4vr4xnSDxMaL',
      name: 'Bella',
      displayName: '🇺🇸 Bella (Soft & Sweet)',
      gender: 'female',
      description: 'Soft, gentle voice',
    },
    elli: {
      voice_id: 'MF3mGyEYCl7XYWbV9V6O',
      name: 'Elli',
      displayName: '🇬🇧 Elli (British)',
      gender: 'female',
      description: 'British accent, elegant',
    },
  };

  constructor() {
    this.apiKey = ELEVENLABS_API_KEY;
    this.baseURL = ELEVENLABS_BASE_URL;
  }

  /**
   * 🆕 Text-to-Speech with MULTILINGUAL support + Public URL for A2E
   * Uses eleven_multilingual_v2 for native Turkish & English pronunciation
   * @param text - Text to speak
   * @param voiceId - ElevenLabs voice ID
   * @param uploadToStorage - If true, uploads to temporary storage and returns public URL (for A2E)
   * @returns Audio data URI or public URL
   */
  async textToSpeech(
    text: string,
    voiceId: string,
    uploadToStorage: boolean = false
  ): Promise<string> {
    try {
      console.log('🎤 ElevenLabs Multilingual TTS:', text.substring(0, 50) + '...');
      console.log('Voice ID:', voiceId);
      console.log('Upload to storage:', uploadToStorage);

      const response = await axios.post(
        `${this.baseURL}/v1/text-to-speech/${voiceId}`,
        {
          text,
          model_id: 'eleven_turbo_v2', // 🆕 TURBO V2 - Faster, multilingual, works with free tier
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.75,
          },
        },
        {
          headers: {
            'xi-api-key': this.apiKey,
            'Content-Type': 'application/json',
          },
          responseType: 'arraybuffer',
        }
      );

      // Convert audio buffer to base64
      const base64Audio = Buffer.from(response.data, 'binary').toString('base64');
      const audioDataUri = `data:audio/mpeg;base64,${base64Audio}`;

      console.log('✅ ElevenLabs TTS success! Audio length:', base64Audio.length);

      // If A2E needs it, upload to temporary storage and return public URL
      if (uploadToStorage) {
        console.log('📤 Uploading audio to temporary storage for A2E...');
        const publicUrl = await AudioStorageService.uploadAudio(audioDataUri);
        return publicUrl;
      }

      return audioDataUri;
    } catch (error: any) {
      console.error('❌ ElevenLabs TTS Error - Full error:', error);
      console.error('❌ Response data:', error.response?.data);
      console.error('❌ Response status:', error.response?.status);
      console.error('❌ Error message:', error.message);
      throw new Error(`Failed to generate speech: ${error.response?.data?.detail?.message || error.message}`);
    }
  }

  /**
   * Get voice by ID
   */
  getVoiceById(voiceId: string): ElevenLabsVoice | undefined {
    return Object.values(this.VOICES).find((voice) => voice.voice_id === voiceId);
  }

  /**
   * Get all voices for gender
   */
  getVoicesForGender(gender: 'male' | 'female'): ElevenLabsVoice[] {
    return Object.values(this.VOICES).filter((voice) => voice.gender === gender);
  }

  /**
   * Get voice for avatar gender (returns first match)
   */
  getVoiceForGender(gender: 'male' | 'female'): ElevenLabsVoice {
    const voices = this.getVoicesForGender(gender);
    return voices[0]; // Return first voice for that gender
  }
}

export default new ElevenLabsService();
