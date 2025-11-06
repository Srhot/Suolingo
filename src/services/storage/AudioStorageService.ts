import axios from 'axios';
import * as FileSystem from 'expo-file-system';

/**
 * AudioStorageService - Temporary audio file storage
 * Uses tmpfiles.org for free temporary file hosting
 * Perfect for A2E lip-sync audio URLs
 */
class AudioStorageService {
  private readonly uploadURL = 'https://tmpfiles.org/api/v1/upload';

  /**
   * Upload base64 audio to temporary storage
   * @param audioDataUri - Base64 audio data URI (e.g., "data:audio/mpeg;base64,...")
   * @returns Public URL for the audio file
   */
  async uploadAudio(audioDataUri: string): Promise<string> {
    try {
      console.log('📤 Uploading audio to temporary storage...');

      // Extract base64 data
      const base64Data = audioDataUri.replace(/^data:audio\/\w+;base64,/, '');

      // Create temporary file
      const tempFilePath = `${FileSystem.cacheDirectory}temp_audio_${Date.now()}.mp3`;
      await FileSystem.writeAsStringAsync(tempFilePath, base64Data, {
        encoding: FileSystem.EncodingType.Base64,
      });

      console.log('💾 Temporary file created:', tempFilePath);

      // Upload to tmpfiles.org
      const formData = new FormData();
      formData.append('file', {
        uri: tempFilePath,
        type: 'audio/mpeg',
        name: 'audio.mp3',
      } as any);

      const response = await axios.post(this.uploadURL, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      console.log('📤 Upload response:', JSON.stringify(response.data));

      // tmpfiles.org returns: { status: "success", data: { url: "https://tmpfiles.org/123/audio.mp3" } }
      const uploadedUrl = response.data?.data?.url;

      if (!uploadedUrl) {
        throw new Error('Failed to get upload URL from tmpfiles.org');
      }

      // IMPORTANT: tmpfiles.org returns URLs in format https://tmpfiles.org/123/file.mp3
      // But the DIRECT download URL is https://tmpfiles.org/dl/123/file.mp3
      // A2E needs the direct download URL
      const directUrl = uploadedUrl.replace('tmpfiles.org/', 'tmpfiles.org/dl/');

      console.log('✅ Audio uploaded successfully!');
      console.log('🔗 Direct URL:', directUrl);

      // Clean up temporary file
      await FileSystem.deleteAsync(tempFilePath, { idempotent: true });

      return directUrl;
    } catch (error: any) {
      console.error('❌ Audio upload error:', error.response?.data || error.message);
      throw new Error('Failed to upload audio to temporary storage');
    }
  }

  /**
   * Alternative: Upload from file URI (e.g., from recording)
   */
  async uploadAudioFromFile(fileUri: string): Promise<string> {
    try {
      console.log('📤 Uploading audio file to temporary storage...');
      console.log('📁 File URI:', fileUri);

      const formData = new FormData();
      formData.append('file', {
        uri: fileUri,
        type: 'audio/mpeg',
        name: 'audio.mp3',
      } as any);

      const response = await axios.post(this.uploadURL, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const uploadedUrl = response.data?.data?.url;

      if (!uploadedUrl) {
        throw new Error('Failed to get upload URL from tmpfiles.org');
      }

      // Convert to direct download URL
      const directUrl = uploadedUrl.replace('tmpfiles.org/', 'tmpfiles.org/dl/');

      console.log('✅ Audio file uploaded successfully!');
      console.log('🔗 Direct URL:', directUrl);

      return directUrl;
    } catch (error: any) {
      console.error('❌ Audio file upload error:', error.response?.data || error.message);
      throw new Error('Failed to upload audio file to temporary storage');
    }
  }
}

export default new AudioStorageService();
