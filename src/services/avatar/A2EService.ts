import axios from 'axios';
import { A2E_API_KEY, A2E_BASE_URL } from '@env';
import { Avatar } from '@/types/Avatar';

export interface A2ELipsyncRequest {
  text: string;
  audio_url?: string;
  creator_id?: string;
  aspect_ratio?: '9:16' | '16:9' | '1:1';
}

export interface A2ELipsyncResponse {
  id: string;
  status: 'queued' | 'processing' | 'done' | 'error';
  output?: string;
  error?: string;
}

class A2EService {
  private apiKey: string;
  private baseURL: string;

  constructor() {
    this.apiKey = A2E_API_KEY;
    this.baseURL = A2E_BASE_URL;
  }

  /**
   * Create lip-sync video from text
   */
  async createLipsync(text: string, avatar: Avatar): Promise<string> {
    try {
      console.log('🎬 A2E Lip-sync starting...');
      console.log('Text:', text.substring(0, 50) + '...');
      console.log('Avatar:', avatar.name);
      console.log('Creator ID:', avatar.a2eCreatorId);

      if (!avatar.a2eCreatorId) {
        throw new Error('A2E creator ID not found for avatar');
      }

      // Step 1: Generate TTS audio using A2E's built-in TTS
      console.log('📢 Generating TTS audio...');
      const ttsResponse = await axios.post(
        `${this.baseURL}/api/v1/video/send_tts`, // Correct endpoint from network analysis
        {
          msg: text,
          tts_id: avatar.ttsVoiceId || '63a549c1ad2a27fe43d966e1', // Use avatar's voice ID
          speech_rate: 1,
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
          },
        }
      );

      console.log('TTS Response:', JSON.stringify(ttsResponse.data));

      // API returns { code: 0, data: "https://...", trace_id: "..." }
      const audioUrl = ttsResponse.data?.data;
      const traceId = ttsResponse.data?.trace_id;

      if (!audioUrl || ttsResponse.data?.code !== 0) {
        throw new Error('Failed to generate TTS audio - no URL returned');
      }

      console.log('✅ TTS audio generated:', audioUrl);

      // Step 2: Create video generation task with audio URL
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').substring(0, 19);

      console.log('🎬 Creating lip-sync video...');
      const response = await axios.post(
        `${this.baseURL}/api/v1/video/generate`,
        {
          title: `Suolingo-${timestamp}`,
          anchor_id: avatar.a2eCreatorId,
          anchor_type: 1, // 1 = custom avatar
          audioSrc: audioUrl, // Use the TTS audio URL
          isSkipRs: true,
          isAliendPreview: true,
          resolution: 1080,
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
          },
        }
      );

      console.log('Video Generate Response:', JSON.stringify(response.data));

      // API returns { code: 0, data: { _id: "..." } }
      const lipsyncId = response.data?.data?._id || response.data?.data?.id;
      console.log('✅ Lipsync task created:', lipsyncId);

      // Step 2: Wait for completion
      const videoUrl = await this.waitForCompletion(lipsyncId);

      console.log('✅ A2E Lip-sync video ready!');
      return videoUrl;
    } catch (error: any) {
      console.error('❌ A2E Lipsync Error:', error.response?.data || error.message);
      throw new Error('Failed to create lip-sync video');
    }
  }

  /**
   * Create lip-sync from audio file
   */
  async createLipsyncFromAudio(audioDataUri: string, avatar: Avatar): Promise<string> {
    try {
      console.log('🎬 A2E Lip-sync from audio starting...');
      console.log('Avatar:', avatar.name);

      // Convert base64 audio to URL (you may need to upload to a CDN first)
      // For now, using text-based lip-sync
      throw new Error('Audio-based lip-sync not implemented yet. Use text-based for now.');
    } catch (error: any) {
      console.error('❌ A2E Audio Lipsync Error:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Wait for lip-sync video to be ready
   */
  private async waitForCompletion(lipsyncId: string, maxAttempts = 60): Promise<string> {
    for (let i = 0; i < maxAttempts; i++) {
      try {
        // FIXED: Use POST instead of GET
        const response = await axios.post(
          `${this.baseURL}/api/v1/video/awsResult`,
          {
            _id: lipsyncId,
          },
          {
            headers: {
              'Authorization': `Bearer ${this.apiKey}`,
              'Content-Type': 'application/json',
            },
          }
        );

        const result = response.data;

        // API returns { code: 0, data: [{ result: "url", status: "success", process: 100 }] }
        if (result.code === 0 && result.data && result.data.length > 0) {
          const videoData = result.data[0];

          if (videoData.status === 'success' && videoData.result) {
            return videoData.result;
          }

          if (videoData.status === 'error') {
            throw new Error('Video generation failed');
          }

          // Still processing, log progress
          console.log(`⏳ Video processing: ${videoData.process || 0}%`);
        }

        // Wait 5 seconds before next check
        await new Promise((resolve) => setTimeout(resolve, 5000));
      } catch (error: any) {
        console.error('Status check error:', error.response?.data || error.message);
        throw error;
      }
    }

    throw new Error('Video generation timeout (5 minutes)');
  }
}

export default new A2EService();
