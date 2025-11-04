import axios from 'axios';
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
   * @param audioUri - Base64 encoded audio data URI (e.g., "data:audio/wav;base64,...")
   * @returns Transcribed text
   */
  async transcribeAudio(audioFileUri: string): Promise<string> {
    try {
      console.log('🎤 Deepgram STT starting...');
      console.log('Audio URI:', audioFileUri);

      // Read file as blob
      const fileResponse = await fetch(audioFileUri);
      const audioBlob = await fileResponse.blob();

      console.log('Audio blob size:', audioBlob.size);

      const response = await axios.post(
        `${this.baseURL}/v1/listen?model=nova-2&language=tr`,
        audioBlob,
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
