// Avatar Service Interface
// Allows switching between A2E (pre-recorded) and real-time streaming (Tavus, HeyGen, etc.)

import { Avatar } from '@/types/Avatar';

/**
 * Interface for avatar services
 * Implementations: A2EService (pre-recorded), TavusService (real-time), etc.
 */
export interface IAvatarService {
  /**
   * Create avatar response (video URL or stream)
   * @param text - Text to be spoken by the avatar
   * @param avatar - Avatar configuration
   * @param language - ISO 639-1 language code (e.g., 'en', 'tr', 'de')
   * @returns Promise<string> - Video URL or stream URL
   */
  createResponse(text: string, avatar: Avatar, language: string): Promise<string>;

  /**
   * Check if this service supports real-time streaming
   * @returns boolean - true for real-time, false for pre-recorded
   */
  isRealtime(): boolean;

  /**
   * Get service name for debugging/logging
   * @returns string - Service name (e.g., 'A2E', 'Tavus', 'HeyGen')
   */
  getServiceName(): string;

  /**
   * Optional: Initialize the service (e.g., establish WebRTC connection)
   * @returns Promise<void>
   */
  initialize?(): Promise<void>;

  /**
   * Optional: Cleanup resources (e.g., close WebRTC connection)
   * @returns Promise<void>
   */
  cleanup?(): Promise<void>;
}

/**
 * Factory function to create appropriate avatar service
 * @param useRealtime - true for real-time service, false for A2E
 * @returns IAvatarService instance
 */
export async function createAvatarService(useRealtime: boolean): Promise<IAvatarService> {
  if (useRealtime) {
    // 🔜 Future: Import and return TavusService or other real-time service
    // const { TavusService } = await import('./TavusService');
    // return new TavusService();

    console.warn('Real-time avatar service not yet implemented. Falling back to A2E.');
    const { default: A2EService } = await import('./A2EService');
    return A2EService;
  } else {
    // Default: A2E pre-recorded service
    const { default: A2EService } = await import('./A2EService');
    return A2EService;
  }
}
