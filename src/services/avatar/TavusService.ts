import { TAVUS_API_KEY } from '@env';
import { Avatar } from '@/types/Avatar';
import { IAvatarService } from './IAvatarService';
import axios from 'axios';

/**
 * Tavus AI Service - Real-time Conversational Video
 *
 * Features:
 * - Real-time video conversations
 * - AI-powered personas
 * - Low latency streaming
 * - Multi-language support
 */
class TavusService implements IAvatarService {
  private apiKey: string;
  private baseURL: string;

  constructor() {
    this.apiKey = TAVUS_API_KEY || '';
    this.baseURL = 'https://tavusapi.com/v2';
  }

  /**
   * Create a conversational video response using Tavus
   */
  async createResponse(text: string, avatar: Avatar, language: string): Promise<string> {
    try {
      console.log('🎭 Tavus: Creating conversational video...');
      console.log('Text:', text.substring(0, 50) + '...');
      console.log('Language:', language);

      if (!this.apiKey) {
        throw new Error('Tavus API key not configured');
      }

      // Create a video with the given text
      // Using /v2/videos endpoint for quick video generation
      const response = await axios.post(
        `${this.baseURL}/videos`,
        {
          replica_id: this.getReplicaId(avatar),
          script: text,
          // background: {
          //   type: 'color',
          //   value: '#F5F5F5',
          // },
        },
        {
          headers: {
            'x-api-key': this.apiKey,
            'Content-Type': 'application/json',
          },
          timeout: 30000,
        }
      );

      const videoId = response.data.video_id;
      console.log('✅ Tavus video created, ID:', videoId);
      console.log('⏳ Waiting for video to be ready...');

      // Poll for video completion
      const videoUrl = await this.waitForVideoReady(videoId);

      console.log('📹 Video ready! URL:', videoUrl);
      return videoUrl;

    } catch (error: any) {
      console.error('❌ Tavus Error:', error.response?.data || error.message);

      if (error.response?.status === 401) {
        throw new Error('Tavus API key is invalid');
      } else if (error.response?.status === 429) {
        throw new Error('Tavus API rate limit exceeded');
      } else if (error.response?.status === 402) {
        throw new Error('Tavus API: Insufficient credits');
      }

      throw new Error('Failed to create Tavus video: ' + (error.response?.data?.message || error.message));
    }
  }

  /**
   * Wait for video to be ready by polling the status
   */
  private async waitForVideoReady(videoId: string): Promise<string> {
    const maxAttempts = 15; // 15 attempts = 30 seconds max (fast fallback)
    const pollInterval = 2000; // Check every 2 seconds

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      try {
        const statusResponse = await axios.get(
          `${this.baseURL}/videos/${videoId}`,
          {
            headers: {
              'x-api-key': this.apiKey,
            },
            timeout: 10000,
          }
        );

        const status = statusResponse.data.status;
        console.log(`📊 Video status (${attempt + 1}/${maxAttempts}):`, status);

        if (status === 'completed' || status === 'ready') {
          // Video is ready!
          const videoUrl = statusResponse.data.download_url || statusResponse.data.hosted_url || statusResponse.data.stream_url;
          if (!videoUrl) {
            throw new Error('Video completed but no URL available');
          }
          return videoUrl;
        } else if (status === 'failed' || status === 'error') {
          throw new Error('Video generation failed');
        }

        // Wait before next poll
        await new Promise(resolve => setTimeout(resolve, pollInterval));
      } catch (error: any) {
        if (error.message === 'Video generation failed') {
          throw error;
        }
        console.warn('⚠️ Status check error, retrying...', error.message);
        await new Promise(resolve => setTimeout(resolve, pollInterval));
      }
    }

    throw new Error('Video generation timeout - took too long');
  }

  /**
   * Get Tavus replica ID for avatar
   * TODO: Map app avatars to Tavus replica IDs
   */
  private getReplicaId(avatar: Avatar): string {
    // For now, use a default replica ID
    // You'll need to create replicas in Tavus dashboard and map them here
    return 'r79e1c033f'; // Default Tavus replica
  }

  /**
   * Check if this service supports real-time
   */
  isRealtime(): boolean {
    return true; // Tavus supports real-time conversations
  }

  /**
   * Get service name
   */
  getServiceName(): string {
    return 'Tavus';
  }
}

export default new TavusService();
