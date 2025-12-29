import { NAVTALK_API_KEY } from '@env';
import { Avatar } from '@/types/Avatar';
import { IAvatarService } from './IAvatarService';

/**
 * NavTalk AI Service - Real-time Avatar with WebSocket/WebRTC
 *
 * Features:
 * - Sub-500ms latency
 * - Real-time audio-to-audio processing
 * - Frame-accurate lip-sync
 * - 60+ languages support
 *
 * Note: This is a simplified implementation for React Native.
 * Full WebRTC support requires react-native-webrtc library.
 */
class NavTalkService implements IAvatarService {
  private apiKey: string;
  private wsEndpoint: string;
  private webSocket: WebSocket | null = null;

  constructor() {
    this.apiKey = NAVTALK_API_KEY || 'sk_navtalk_6z5t0vTWf1hh5roE2Y3P4FxYpWvdWJBH';
    this.wsEndpoint = `wss://transfer.navtalk.ai/api/realtime-api?license=${this.apiKey}`;
  }

  /**
   * Create avatar response using NavTalk real-time API
   *
   * Current implementation uses WebSocket for text-based communication.
   * Full WebRTC video streaming is available but requires react-native-webrtc library.
   */
  async createResponse(text: string, avatar: Avatar, language: string): Promise<string> {
    try {
      console.log('🔵 NavTalk: Creating real-time response...');
      console.log('Text:', text);
      console.log('Language:', language);

      // Ensure WebSocket connection is established
      if (!this.webSocket || this.webSocket.readyState !== WebSocket.OPEN) {
        console.log('🔌 Initializing NavTalk connection...');
        await this.initializeConnection();
      }

      // Check if connection had errors
      if (this.connectionError) {
        throw this.connectionError;
      }

      // Send text input to NavTalk
      const textMessage = {
        type: 'conversation.item.create',
        item: {
          type: 'message',
          role: 'user',
          content: [
            {
              type: 'input_text',
              text: text,
            },
          ],
        },
      };

      console.log('📤 Sending text to NavTalk:', text.substring(0, 50) + '...');
      this.webSocket?.send(JSON.stringify(textMessage));

      // Request response generation
      const responseRequest = {
        type: 'response.create',
      };
      this.webSocket?.send(JSON.stringify(responseRequest));

      // Wait for response and check for errors
      await new Promise((resolve, reject) => {
        setTimeout(() => {
          if (this.connectionError) {
            reject(this.connectionError);
          } else {
            resolve(undefined);
          }
        }, 1500);
      });

      console.log('✅ NavTalk: Message sent successfully');
      console.log('💡 Audio response will be streamed in real-time');

      // For now, return a success indicator
      // In full WebRTC implementation, this would return video stream URL
      return 'navtalk_streaming';

    } catch (error) {
      console.error('❌ NavTalk Error:', error);
      throw error;
    }
  }

  private connectionError: Error | null = null;

  /**
   * Initialize WebSocket connection to NavTalk
   * @private
   */
  private async initializeConnection(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        console.log('🔌 Connecting to NavTalk WebSocket...');
        this.connectionError = null;

        // Note: React Native uses global WebSocket
        this.webSocket = new WebSocket(this.wsEndpoint);

        this.webSocket.onopen = () => {
          console.log('✅ NavTalk WebSocket connected');

          // Send session configuration
          const sessionConfig = {
            type: 'session.update',
            session: {
              modalities: ['text', 'audio', 'video'],
              turn_detection: {
                type: 'server_vad',
              },
            },
          };

          this.webSocket?.send(JSON.stringify(sessionConfig));
          resolve();
        };

        this.webSocket.onerror = (error) => {
          console.error('❌ NavTalk WebSocket error:', error);
          this.connectionError = new Error('WebSocket connection failed');
          reject(error);
        };

        this.webSocket.onclose = (event) => {
          console.log('🔌 NavTalk WebSocket closed:', event.code, event.reason);
          if (event.code !== 1000) {
            this.connectionError = new Error(`WebSocket closed with code ${event.code}`);
          }
        };

        this.webSocket.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data as string);
            console.log('📥 NavTalk message:', data.type);

            // Handle different message types
            switch (data.type) {
              case 'session.created':
                console.log('✅ Session created:', data.session);
                break;
              case 'session.updated':
                console.log('✅ Session updated');
                break;
              case 'error':
                console.error('❌ NavTalk error:', data.error);
                this.connectionError = new Error(data.error?.message || 'NavTalk API error');
                break;
              case 'session.connection_limit_exceeded':
                console.error('❌ NavTalk connection limit exceeded');
                this.connectionError = new Error('NavTalk connection limit exceeded - upgrade your plan');
                break;
              default:
                console.log('📩 Unhandled message type:', data.type);
            }
          } catch (err) {
            console.error('Failed to parse message:', err);
          }
        };

      } catch (error) {
        console.error('❌ Failed to initialize NavTalk connection:', error);
        this.connectionError = error as Error;
        reject(error);
      }
    });
  }

  /**
   * Close WebSocket connection
   */
  async cleanup(): Promise<void> {
    if (this.webSocket) {
      this.webSocket.close();
      this.webSocket = null;
      console.log('🔌 NavTalk connection closed');
    }
  }

  /**
   * Check if this service supports real-time
   * @returns true - NavTalk is real-time
   */
  isRealtime(): boolean {
    return true;
  }

  /**
   * Get service name
   * @returns 'NavTalk'
   */
  getServiceName(): string {
    return 'NavTalk';
  }
}

export default new NavTalkService();
