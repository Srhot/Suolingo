import axios from 'axios';
import { HEYGEN_API_KEY } from '@env';
import { Avatar } from '@/types/Avatar';
import { IAvatarService } from './IAvatarService';

/**
 * HeyGen Streaming Avatar Service
 * Real-time avatar service using HeyGen Streaming API + LiveKit
 *
 * Latency: <3 seconds (800ms-1.2s typical)
 * Technology: WebRTC via LiveKit
 *
 * @see https://docs.heygen.com/docs/streaming-api
 * @see https://docs.heygen.com/docs/react-native-integration-guide-with-streaming-api-livekit
 */

export interface HeyGenSessionResponse {
  session_id: string;
  access_token: string;
  url: string; // LiveKit server URL
  expires_at: number;
}

export interface HeyGenAvatarConfig {
  avatar_id: string;
  voice: {
    voice_id: string;
    language?: string;
  };
  quality?: 'low' | 'medium' | 'high';
}

class HeyGenService implements IAvatarService {
  private apiKey: string;
  private baseURL: string = 'https://api.heygen.com/v1';
  private currentSessionId?: string;
  private currentAccessToken?: string;

  constructor() {
    this.apiKey = HEYGEN_API_KEY;
    if (!this.apiKey) {
      throw new Error('HEYGEN_API_KEY not found in environment variables');
    }
  }

  // ============================================
  // IAvatarService Interface Implementation
  // ============================================

  /**
   * Create avatar response (real-time streaming)
   * For HeyGen, this creates a streaming session and returns the LiveKit URL
   *
   * @param text - Text to be spoken by avatar
   * @param avatar - Avatar configuration
   * @param language - Language code (e.g., 'en', 'tr')
   * @returns Promise<string> - LiveKit streaming URL
   */
  async createResponse(text: string, avatar: Avatar, language: string): Promise<string> {
    try {
      console.log('🎬 HeyGen Streaming Avatar starting...');
      console.log('Text:', text);
      console.log('Avatar:', avatar.name);
      console.log('Language:', language);

      // Create new session if not exists
      if (!this.currentSessionId) {
        await this.createSession(avatar, language);
      }

      // Send text to avatar for speaking (via LiveKit data channel)
      // Note: In React Native, this will be handled by LiveKit SDK
      // For now, return the session info
      return JSON.stringify({
        sessionId: this.currentSessionId,
        accessToken: this.currentAccessToken,
        text: text,
      });
    } catch (error) {
      console.error('❌ HeyGen createResponse error:', error);
      throw error;
    }
  }

  /**
   * Check if this service supports real-time
   * @returns true - HeyGen supports real-time streaming
   */
  isRealtime(): boolean {
    return true;
  }

  /**
   * Get service name
   * @returns 'HeyGen'
   */
  getServiceName(): string {
    return 'HeyGen';
  }

  /**
   * Initialize HeyGen session
   * Creates a new streaming session with LiveKit
   */
  async initialize(): Promise<void> {
    console.log('🚀 Initializing HeyGen session...');
    // Session creation is handled in createResponse
    // This can be called explicitly if needed
  }

  /**
   * Cleanup resources
   * Closes the current session
   */
  async cleanup(): Promise<void> {
    if (this.currentSessionId) {
      console.log('🧹 Cleaning up HeyGen session...');
      await this.closeSession();
    }
  }

  // ============================================
  // HeyGen-Specific Methods
  // ============================================

  /**
   * Create a new HeyGen streaming session
   * @param avatar - Avatar configuration
   * @param language - Language code
   * @returns Session info
   */
  private async createSession(avatar: Avatar, language: string): Promise<HeyGenSessionResponse> {
    try {
      console.log('📞 Creating HeyGen session...');

      const response = await axios.post<HeyGenSessionResponse>(
        `${this.baseURL}/streaming.new`,
        {
          avatar_id: this.getHeyGenAvatarId(avatar),
          voice: {
            voice_id: this.getHeyGenVoiceId(avatar, language),
            language: language === 'tr' ? 'Turkish' : 'English',
          },
          quality: 'medium', // low, medium, high
          version: 'v2', // Use Streaming API v2 with LiveKit
        },
        {
          headers: {
            'X-Api-Key': this.apiKey,
            'Content-Type': 'application/json',
          },
        }
      );

      this.currentSessionId = response.data.session_id;
      this.currentAccessToken = response.data.access_token;

      console.log('✅ HeyGen session created:', this.currentSessionId);
      return response.data;
    } catch (error) {
      console.error('❌ HeyGen createSession error:', error);
      if (axios.isAxiosError(error)) {
        console.error('Response:', error.response?.data);
      }
      throw new Error(`Failed to create HeyGen session: ${error}`);
    }
  }

  /**
   * Close the current session
   */
  private async closeSession(): Promise<void> {
    if (!this.currentSessionId) {
      return;
    }

    try {
      await axios.delete(
        `${this.baseURL}/streaming.stop`,
        {
          headers: {
            'X-Api-Key': this.apiKey,
          },
          data: {
            session_id: this.currentSessionId,
          },
        }
      );

      console.log('✅ HeyGen session closed');
      this.currentSessionId = undefined;
      this.currentAccessToken = undefined;
    } catch (error) {
      console.error('❌ HeyGen closeSession error:', error);
    }
  }

  /**
   * Get HeyGen avatar ID for SUOLINGO avatar
   * Maps SUOLINGO avatars to HeyGen avatar IDs
   */
  private getHeyGenAvatarId(avatar: Avatar): string {
    // HeyGen provides public avatars
    // You can get avatar IDs from: https://docs.heygen.com/reference/list-avatars-v2
    // For now, using default HeyGen avatars

    if (avatar.gender === 'male') {
      return 'Wayne_20240711'; // Default male avatar
    } else {
      return 'Susan_public_3_20240328'; // Default female avatar
    }
  }

  /**
   * Get HeyGen voice ID for language
   * Maps language codes to HeyGen voice IDs
   */
  private getHeyGenVoiceId(avatar: Avatar, language: string): string {
    // HeyGen voice IDs can be found at: https://docs.heygen.com/reference/list-voices-v2

    if (language === 'tr') {
      // Turkish voices
      return avatar.gender === 'male'
        ? 'e9fff81db2754f1398ee7ee3a0b8fae1' // Turkish male
        : 'a45e92b8a6064a46a2dca3ebd5e28d02'; // Turkish female
    } else {
      // English voices
      return avatar.gender === 'male'
        ? '1bd001e7e50f421d891986aad5158bc8' // English male
        : '2d5b0e6cf36f4c71b1dd77aa707ba350'; // English female
    }
  }

  /**
   * Send text to avatar for speaking (via LiveKit)
   * This will be used by the React Native component
   */
  async speakText(text: string): Promise<void> {
    if (!this.currentSessionId) {
      throw new Error('No active session. Call createResponse first.');
    }

    try {
      await axios.post(
        `${this.baseURL}/streaming.task`,
        {
          session_id: this.currentSessionId,
          text: text,
        },
        {
          headers: {
            'X-Api-Key': this.apiKey,
            'Content-Type': 'application/json',
          },
        }
      );

      console.log('✅ Text sent to avatar');
    } catch (error) {
      console.error('❌ HeyGen speakText error:', error);
      throw error;
    }
  }

  /**
   * Get current session info
   * Used by React Native component to connect via LiveKit
   */
  getSessionInfo(): { sessionId?: string; accessToken?: string } {
    return {
      sessionId: this.currentSessionId,
      accessToken: this.currentAccessToken,
    };
  }
}

// Export singleton instance
export default new HeyGenService();
