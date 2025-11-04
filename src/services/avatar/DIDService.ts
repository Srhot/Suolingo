import axios from 'axios';
import { DID_API_KEY, DID_BASE_URL } from '@env';
import { Avatar } from '@/types/Avatar';

export interface DIDTalkRequest {
  script: {
    type: 'text' | 'audio';
    input: string; // text or audio URL
    provider?: {
      type: string;
      voice_id: string;
    };
  };
  config?: {
    fluent?: boolean;
    pad_audio?: number;
  };
  source_url?: string; // Avatar image/video URL
}

export interface DIDTalkResponse {
  id: string;
  status: 'created' | 'started' | 'done' | 'error';
  result_url?: string;
  created_at: string;
}

class DIDService {
  private apiKey: string;
  private baseURL: string;

  constructor() {
    // D-ID API key is already in format: base64(email):plainPassword
    // Need to encode the whole thing
    this.apiKey = DID_API_KEY;
    this.baseURL = DID_BASE_URL;

    console.log('D-ID API Key (first 20 chars):', this.apiKey.substring(0, 20) + '...');
  }

  /**
   * List all avatars/presenters in the account
   */
  async listAvatars(): Promise<any> {
    try {
      // Try both endpoints
      console.log('=== CHECKING D-ID AGENTS ===');
      const agentsResponse = await axios.get(`${this.baseURL}/agents`, {
        headers: {
          Authorization: `Basic ${this.apiKey}`,
        },
      });
      console.log('Agents:', JSON.stringify(agentsResponse.data, null, 2));

      console.log('\n=== CHECKING D-ID CLIPS (Presenters) ===');
      const clipsResponse = await axios.get(`${this.baseURL}/clips/presenters`, {
        headers: {
          Authorization: `Basic ${this.apiKey}`,
        },
      });
      console.log('Presenters:', JSON.stringify(clipsResponse.data, null, 2));

      return { agents: agentsResponse.data, presenters: clipsResponse.data };
    } catch (error: any) {
      console.error('List Avatars Error:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Create a D-ID talk (avatar speaks text with lip-sync)
   */
  async createTalk(text: string, voiceId: string, avatarUrl?: string, useElevenLabs = true): Promise<DIDTalkResponse> {
    try {
      const requestBody: DIDTalkRequest = {
        script: {
          type: 'text',
          input: text,
          provider: useElevenLabs ? {
            type: 'elevenlabs',
            voice_id: voiceId, // ElevenLabs voice ID
          } : {
            type: 'microsoft',
            voice_id: voiceId, // Microsoft voice ID
          },
          ssml: false,
        },
        config: {
          fluent: true,
          pad_audio: 0,
          stitch: true,
        },
      };

      // If user provides custom avatar URL, use it
      if (avatarUrl) {
        requestBody.source_url = avatarUrl;
      }
      // Don't set source_url if not provided - let D-ID use default

      console.log('D-ID Request:', JSON.stringify(requestBody, null, 2));

      const response = await axios.post(`${this.baseURL}/talks`, requestBody, {
        headers: {
          Authorization: `Basic ${this.apiKey}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      });

      console.log('D-ID Response:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('D-ID Create Talk Error:', error.response?.data || error.message);
      console.error('Full error:', error);
      throw new Error('Failed to create avatar talk');
    }
  }

  /**
   * Get talk status and result URL
   */
  async getTalkStatus(talkId: string): Promise<DIDTalkResponse> {
    try {
      const response = await axios.get(`${this.baseURL}/talks/${talkId}`, {
        headers: {
          Authorization: `Basic ${this.apiKey}`,
        },
      });

      return response.data;
    } catch (error: any) {
      console.error('D-ID Get Talk Error:', error.response?.data || error.message);
      throw new Error('Failed to get talk status');
    }
  }

  /**
   * Poll talk until it's done (with timeout)
   */
  async waitForTalkCompletion(talkId: string, maxAttempts = 30): Promise<string> {
    for (let i = 0; i < maxAttempts; i++) {
      const status = await this.getTalkStatus(talkId);

      if (status.status === 'done' && status.result_url) {
        return status.result_url;
      }

      if (status.status === 'error') {
        throw new Error('Avatar video generation failed');
      }

      // Wait 2 seconds before next attempt
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }

    throw new Error('Avatar video generation timeout');
  }

  /**
   * Generate avatar video from text (all-in-one method)
   */
  async generateAvatarVideo(text: string, avatar: Avatar, voiceId: string, useElevenLabs = false): Promise<string> {
    try {
      // Custom avatar thumbnail URL'sini kullan (imgbb hosting)
      const avatarImageUrl = typeof avatar.thumbnailUrl === 'string'
        ? avatar.thumbnailUrl
        : undefined;

      console.log('Using avatar image:', avatarImageUrl || 'D-ID default');
      console.log('Avatar name:', avatar.name, '| Gender:', avatar.gender);
      console.log('Voice provider:', useElevenLabs ? 'ElevenLabs' : 'Microsoft TTS');

      // Step 1: Create talk
      const talk = await this.createTalk(text, voiceId, avatarImageUrl, useElevenLabs);

      console.log('Talk created, waiting for completion. Talk ID:', talk.id);

      // Step 2: Wait for completion (longer timeout for ElevenLabs)
      const videoUrl = await this.waitForTalkCompletion(talk.id, useElevenLabs ? 60 : 30);

      console.log('Video ready:', videoUrl);
      return videoUrl;
    } catch (error) {
      console.error('Generate Avatar Video Error:', error);
      throw error;
    }
  }
}

export default new DIDService();
