import axios from 'axios';
import * as FileSystem from 'expo-file-system';
import { DEEPGRAM_API_KEY, DEEPGRAM_BASE_URL } from '@env';

class DeepgramService {
  private apiKey: string;
  private baseURL: string;

  constructor() {
    this.apiKey = DEEPGRAM_API_KEY;
    this.baseURL = DEEPGRAM_BASE_URL;
  }

  /**
   * Transcribe audio to text using Deepgram
   * @param audioFileUri - Local file URI from expo-av recording
   * @returns Transcribed text
   */
  async transcribeAudio(audioFileUri: string): Promise<string> {
    try {
      console.log('🎤 Deepgram STT starting...');
      console.log('Audio URI:', audioFileUri);

      // Read file as base64
      const base64Audio = await FileSystem.readAsStringAsync(audioFileUri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      console.log('Audio base64 length:', base64Audio.length);

      // Convert base64 to binary buffer
      const binaryAudio = Uint8Array.from(atob(base64Audio), c => c.charCodeAt(0));

      console.log('Audio binary size:', binaryAudio.length);

      const response = await axios.post(
        `${this.baseURL}/v1/listen?model=nova-2&language=tr`,
        binaryAudio,
        {
          headers: {
            'Authorization': `Token ${this.apiKey}`,
            'Content-Type': 'audio/wav',
          },
        }
      );

      const transcript = response.data?.results?.channels?.[0]?.alternatives?.[0]?.transcript;

      if (!transcript) {
        throw new Error('No transcription returned');
      }

      console.log('✅ Deepgram transcription:', transcript);
      return transcript;
    } catch (error: any) {
      console.error('❌ Deepgram STT Error:', error.response?.data || error.message);
      throw new Error('Failed to transcribe audio');
    }
  }
}

export default new DeepgramService();
