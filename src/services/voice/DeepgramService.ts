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
   * Transcribe audio to text using Deepgram with multi-language support
   * @param audioFileUri - File URI of audio (e.g., "file:///...")
   * @returns Transcribed text
   */
  async transcribeAudio(audioFileUri: string): Promise<string> {
    try {
      console.log('🎤 Deepgram STT starting...');
      console.log('Audio URI:', audioFileUri.substring(0, 50) + '...');

      if (!this.apiKey) {
        throw new Error('Deepgram API key not configured');
      }

      // Read file as blob
      const fileResponse = await fetch(audioFileUri);
      const audioBlob = await fileResponse.blob();

      console.log('Audio blob size:', audioBlob.size);

      if (audioBlob.size === 0) {
        throw new Error('Audio file is empty');
      }

      // Use multi-language model (detects Turkish and English automatically)
      const response = await axios.post(
        `${this.baseURL}/v1/listen?model=nova-2&detect_language=true&punctuate=true`,
        audioBlob,
        {
          headers: {
            'Authorization': `Token ${this.apiKey}`,
            'Content-Type': 'audio/wav',
          },
          timeout: 30000, // 30 second timeout
        }
      );

      const transcript = response.data?.results?.channels?.[0]?.alternatives?.[0]?.transcript;
      const detectedLanguage = response.data?.results?.channels?.[0]?.detected_language;

      if (!transcript || transcript.trim() === '') {
        throw new Error('No speech detected in audio');
      }

      console.log('✅ Deepgram transcription:', transcript);
      console.log('🌐 Detected language:', detectedLanguage);

      return transcript;
    } catch (error: any) {
      console.error('❌ Deepgram STT Error:', error.response?.data || error.message);

      if (error.response?.status === 401) {
        throw new Error('Deepgram API key is invalid');
      } else if (error.response?.status === 429) {
        throw new Error('Deepgram API rate limit exceeded');
      } else if (error.message?.includes('timeout')) {
        throw new Error('Transcription timeout - audio too long');
      }

      throw new Error('Failed to transcribe audio. Please try again.');
    }
  }
}

export default new DeepgramService();
