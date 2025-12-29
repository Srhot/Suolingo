import { SIMLI_API_KEY, A2E_API_KEY } from '@env';
import { Avatar } from '@/types/Avatar';
import { IAvatarService } from './IAvatarService';
import axios from 'axios';

/**
 * Simli AI Service - Fast Audio-to-Video Avatar
 *
 * Features:
 * - Fast video generation (~5-6 seconds)
 * - Audio-to-video streaming
 * - Multiple avatar faces
 * - High quality lip-sync
 */
class SimliService implements IAvatarService {
  private apiKey: string;
  private baseURL: string;
  private defaultFaceId: string;

  constructor() {
    this.apiKey = SIMLI_API_KEY || '';
    this.baseURL = 'https://api.simli.ai';
    this.defaultFaceId = '0c2b8b04-5274-41f1-a21c-d5c98322efa9'; // Default Simli face
  }

  /**
   * Create avatar video response using Simli audio-to-video
   */
  async createResponse(text: string, avatar: Avatar, language: string): Promise<string> {
    try {
      console.log('🎭 Simli: Creating audio-to-video...');
      console.log('Text:', text.substring(0, 50) + '...');
      console.log('Language:', language);

      if (!this.apiKey) {
        throw new Error('Simli API key not configured');
      }

      // Step 1: Generate TTS audio (using existing TTS service would be better)
      // For now, we'll assume we have audio URL from previous TTS generation
      // In real implementation, this should be coordinated with the calling code

      // Step 2: Download audio and convert to base64
      const audioUrl = await this.generateAudioUrl(text, language);
      const audioBase64 = await this.downloadAndConvertAudio(audioUrl);

      // Step 3: Send to Simli for video generation
      const response = await axios.post(
        `${this.baseURL}/audioToVideoStream`,
        {
          simliAPIKey: this.apiKey,
          faceId: this.getFaceId(avatar),
          audioBase64: audioBase64,
          audioFormat: 'mp3',
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
          timeout: 30000,
        }
      );

      // Prefer HLS stream for better iOS/Android compatibility
      const videoUrl = response.data.hls_url || response.data.mp4_url;
      const videoFormat = response.data.hls_url ? 'HLS (.m3u8)' : 'MP4';

      if (!videoUrl) {
        throw new Error('No video URL returned from Simli');
      }

      // Fix: Convert HTTP to HTTPS for React Native security
      const secureVideoUrl = videoUrl.replace(/^http:\/\//i, 'https://');

      console.log(`✅ Simli video URL received (${videoFormat}):`, secureVideoUrl);
      console.log('⏳ Waiting for video to be ready...');

      // Wait for video to be actually available (Simli generates video asynchronously)
      await this.waitForVideoReady(secureVideoUrl);

      console.log('✅ Simli video ready!');
      console.log('📹 Video URL:', secureVideoUrl);
      return secureVideoUrl;

    } catch (error: any) {
      console.error('❌ Simli Error:', error.response?.data || error.message);

      if (error.response?.status === 401) {
        throw new Error('Simli API key is invalid');
      } else if (error.response?.status === 429) {
        throw new Error('Simli API rate limit exceeded');
      } else if (error.response?.status === 400) {
        throw new Error('Simli API: Invalid request - ' + (error.response?.data?.detail || ''));
      }

      throw new Error('Failed to create Simli video: ' + (error.response?.data?.detail || error.message));
    }
  }

  /**
   * Generate audio URL using A2E TTS
   * TODO: This should be refactored to use a shared TTS service
   */
  private async generateAudioUrl(text: string, language: string): Promise<string> {
    try {
      console.log('🗣️ Generating TTS audio via A2E...');

      const ttsPayload = {
        language: language,
        msg_original: text,
        msg: text,
        tts_id: '66d3fb1bc051cfb134c60f20', // Andrew Multilingual voice
        speech_rate: 1,
      };

      console.log('📤 TTS Request:', JSON.stringify(ttsPayload));

      const response = await axios.post(
        'https://video.a2e.ai/api/v1/video/send_tts',
        {
          msg: text,
          tts_id: ttsPayload.tts_id,
          speech_rate: ttsPayload.speech_rate,
          language: language,
        },
        {
          headers: {
            'Authorization': `Bearer ${A2E_API_KEY}`,
            'Content-Type': 'application/json',
          },
          timeout: 15000,
        }
      );

      console.log('📥 TTS Response:', JSON.stringify(response.data));

      if (response.data.code !== 0) {
        throw new Error('A2E TTS failed: ' + JSON.stringify(response.data));
      }

      const audioUrl = response.data.data;

      if (!audioUrl) {
        throw new Error('No audio URL in response');
      }

      console.log('✅ TTS audio URL:', audioUrl);
      return audioUrl;
    } catch (error: any) {
      console.error('❌ TTS generation error:', error.response?.data || error.message);
      throw new Error('TTS generation failed: ' + (error.response?.data || error.message));
    }
  }

  /**
   * Wait for video to be ready by polling the video URL
   * Simli generates videos asynchronously, so we need to wait until the file is accessible
   */
  private async waitForVideoReady(videoUrl: string): Promise<void> {
    const maxAttempts = 20; // 20 attempts = 20 seconds max
    const pollInterval = 1000; // Check every 1 second

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      try {
        console.log(`🔍 Checking video availability (${attempt + 1}/${maxAttempts})...`);

        // Try to fetch video headers to check if file exists
        const response = await fetch(videoUrl, {
          method: 'HEAD', // Only fetch headers, not the entire video
        });

        if (response.ok) {
          console.log(`✅ Video is ready! (attempt ${attempt + 1})`);
          return; // Video is ready!
        }

        console.log(`⏳ Video not ready yet, status: ${response.status}`);
      } catch (error) {
        console.log(`⏳ Video not ready yet (attempt ${attempt + 1}), waiting...`);
      }

      // Wait before next poll
      await new Promise(resolve => setTimeout(resolve, pollInterval));
    }

    // If we reach here, video is still not ready after max attempts
    console.warn('⚠️ Video polling timeout, returning URL anyway (video might still be processing)');
    // Don't throw error, let the player try - sometimes videos work even if HEAD request fails
  }

  /**
   * Download audio from URL and convert to base64
   */
  private async downloadAndConvertAudio(audioUrl: string): Promise<string> {
    try {
      console.log('📥 Downloading audio from:', audioUrl);

      // Fetch audio as blob/binary
      const response = await fetch(audioUrl);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const blob = await response.blob();

      // Convert blob to base64 using FileReader
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64 = reader.result as string;
          // Remove data URL prefix (e.g., "data:audio/mpeg;base64,")
          const base64Data = base64.split(',')[1];
          console.log('✅ Audio converted to base64, size:', base64Data.length, 'chars');
          resolve(base64Data);
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    } catch (error) {
      console.error('❌ Audio download error:', error);
      throw error;
    }
  }

  /**
   * Get Simli face ID for avatar
   * TODO: Map app avatars to Simli face IDs
   */
  private getFaceId(avatar: Avatar): string {
    // For now, use default face
    // You can create custom faces at app.simli.com
    return this.defaultFaceId;
  }

  /**
   * Check if this service supports real-time
   */
  isRealtime(): boolean {
    return false; // Pre-rendered mode, ~5-6 seconds
  }

  /**
   * Get service name
   */
  getServiceName(): string {
    return 'Simli';
  }
}

export default new SimliService();
