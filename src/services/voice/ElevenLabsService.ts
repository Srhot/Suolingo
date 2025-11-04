import axios from 'axios';
import { ELEVENLABS_API_KEY, ELEVENLABS_BASE_URL } from '@env';

export interface ElevenLabsVoice {
  voice_id: string;
  name: string;
  gender: 'male' | 'female';
}

class ElevenLabsService {
  private apiKey: string;
  private baseURL: string;

  // Popüler ElevenLabs sesleri
  public readonly VOICES = {
    male: {
      voice_id: 'pNInz6obpgDQGcFmaJgB', // Adam - deep, mature
      name: 'Adam',
      gender: 'male' as const,
    },
    female: {
      voice_id: '21m00Tcm4TlvDq8ikWAM', // Rachel - warm, friendly
      name: 'Rachel',
      gender: 'female' as const,
    },
  };

  constructor() {
    this.apiKey = ELEVENLABS_API_KEY;
    this.baseURL = ELEVENLABS_BASE_URL;
  }

  /**
   * Text-to-Speech: Convert text to natural voice audio
   */
  async textToSpeech(text: string, voiceId: string): Promise<string> {
    try {
      console.log('🎤 ElevenLabs TTS:', text.substring(0, 50) + '...');
      console.log('Voice ID:', voiceId);

      const response = await axios.post(
        `${this.baseURL}/v1/text-to-speech/${voiceId}`,
        {
          text,
          model_id: 'eleven_monolingual_v1',
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

      return audioDataUri;
    } catch (error: any) {
      console.error('❌ ElevenLabs TTS Error:', error.response?.data || error.message);
      throw new Error('Failed to generate speech');
    }
  }

  /**
   * Get voice for avatar gender
   */
  getVoiceForGender(gender: 'male' | 'female'): ElevenLabsVoice {
    return this.VOICES[gender];
  }
}

export default new ElevenLabsService();
