/**
 * HeyGen Streaming Avatar Service
 *
 * Real-time avatar conversation with WebRTC
 * - Low latency (<500ms)
 * - Streaming video + audio
 * - Integration with Gemini AI for conversation
 */

import { Platform } from 'react-native';

// HeyGen SDK types (we'll import from @heygen/streaming-avatar)
// Note: React Native WebRTC compatibility may need adjustments

interface StreamingAvatarConfig {
  token: string;
  avatarId?: string;
  voice?: {
    voiceId: string;
    rate?: number;
  };
}

interface StreamingMessage {
  text: string;
  taskId?: string;
}

class HeyGenStreamingService {
  private apiKey: string;
  private avatarInstance: any = null;
  private isInitialized: boolean = false;
  private sessionId: string | null = null;

  // Default avatar configuration
  private static readonly DEFAULT_AVATAR_ID = 'default';
  private static readonly DEFAULT_VOICE_ID = 'en-US-Standard-A';

  constructor() {
    this.apiKey = process.env.HEYGEN_API_KEY || '';
    if (!this.apiKey) {
      console.warn('⚠️ HeyGen API key not found in environment variables');
    }
  }

  /**
   * Initialize streaming session
   * This creates a WebRTC connection with HeyGen
   */
  async initializeSession(config?: Partial<StreamingAvatarConfig>): Promise<boolean> {
    try {
      console.log('🎬 Initializing HeyGen streaming session...');

      // Check platform compatibility
      if (Platform.OS === 'web') {
        // Web platform - use HeyGen SDK directly
        const { StreamingAvatar } = await import('@heygen/streaming-avatar');

        this.avatarInstance = new StreamingAvatar({
          token: this.apiKey,
          ...config,
        });

        // Create new session
        const sessionData = await this.avatarInstance.createStartAvatar({
          quality: 'high',
          avatarName: config?.avatarId || HeyGenStreamingService.DEFAULT_AVATAR_ID,
          voice: {
            voiceId: config?.voice?.voiceId || HeyGenStreamingService.DEFAULT_VOICE_ID,
          },
        });

        this.sessionId = sessionData.sessionId;
        this.isInitialized = true;

        console.log('✅ HeyGen session initialized:', this.sessionId);
        return true;

      } else {
        // React Native - needs WebRTC bridge
        console.warn('⚠️ HeyGen streaming not fully supported on React Native yet');
        console.log('💡 Alternative: Use backend proxy server for WebRTC relay');

        // TODO: Implement backend proxy approach
        // For now, fallback to A2E
        return false;
      }

    } catch (error) {
      console.error('❌ HeyGen initialization error:', error);
      this.isInitialized = false;
      return false;
    }
  }

  /**
   * Send message to avatar (text-to-speech + lip-sync)
   * Avatar will speak immediately with real-time streaming
   */
  async speak(text: string): Promise<void> {
    if (!this.isInitialized || !this.avatarInstance) {
      throw new Error('HeyGen session not initialized. Call initializeSession() first.');
    }

    try {
      console.log('🗣️ HeyGen avatar speaking:', text.substring(0, 50) + '...');

      await this.avatarInstance.speak({
        text: text,
        taskType: 'talk',
      });

      console.log('✅ Avatar speech started (streaming)');
    } catch (error) {
      console.error('❌ HeyGen speak error:', error);
      throw error;
    }
  }

  /**
   * Start conversation mode with AI integration
   * This enables turn-taking conversation with Gemini AI
   */
  async startConversation(systemPrompt?: string): Promise<void> {
    if (!this.isInitialized || !this.avatarInstance) {
      throw new Error('HeyGen session not initialized');
    }

    try {
      console.log('💬 Starting conversation mode...');

      // Enable voice mode (real-time audio input/output)
      await this.avatarInstance.startVoiceChat({
        useSilencePrompt: true, // Auto-detect when user stops speaking
      });

      console.log('✅ Conversation mode active (voice chat enabled)');
    } catch (error) {
      console.error('❌ Conversation mode error:', error);
      throw error;
    }
  }

  /**
   * Stop avatar and close session
   */
  async stopSession(): Promise<void> {
    if (!this.avatarInstance) {
      console.log('ℹ️ No active session to stop');
      return;
    }

    try {
      console.log('⏹️ Stopping HeyGen session...');

      await this.avatarInstance.stopAvatar();

      this.avatarInstance = null;
      this.isInitialized = false;
      this.sessionId = null;

      console.log('✅ HeyGen session stopped');
    } catch (error) {
      console.error('❌ Stop session error:', error);
    }
  }

  /**
   * Get video stream element (for web platform)
   * Returns the video element that displays the avatar
   */
  getVideoElement(): HTMLVideoElement | null {
    if (Platform.OS !== 'web' || !this.avatarInstance) {
      return null;
    }

    return this.avatarInstance.mediaStream?.videoElement || null;
  }

  /**
   * Check if service is available on current platform
   */
  static isSupported(): boolean {
    return Platform.OS === 'web';
  }

  /**
   * Get current session status
   */
  getStatus(): {
    isInitialized: boolean;
    sessionId: string | null;
    platform: string;
    supported: boolean;
  } {
    return {
      isInitialized: this.isInitialized,
      sessionId: this.sessionId,
      platform: Platform.OS,
      supported: HeyGenStreamingService.isSupported(),
    };
  }
}

// Singleton instance
export default new HeyGenStreamingService();
