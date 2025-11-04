import { Audio } from 'expo-av';
import * as Speech from 'expo-speech';

class AudioService {
  private recording: Audio.Recording | null = null;
  private isRecording: boolean = false;

  async requestPermissions(): Promise<boolean> {
    try {
      const { status } = await Audio.requestPermissionsAsync();
      return status === 'granted';
    } catch (error) {
      console.error('Permission Error:', error);
      return false;
    }
  }

  async startRecording(): Promise<void> {
    try {
      // Request permissions first
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) {
        throw new Error('Microphone permission denied');
      }

      // Set audio mode
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      // Create and start recording
      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );

      this.recording = recording;
      this.isRecording = true;
    } catch (error) {
      console.error('Start Recording Error:', error);
      throw error;
    }
  }

  async stopRecording(): Promise<string | null> {
    try {
      if (!this.recording) {
        return null;
      }

      await this.recording.stopAndUnloadAsync();
      const uri = this.recording.getURI();

      this.recording = null;
      this.isRecording = false;

      return uri;
    } catch (error) {
      console.error('Stop Recording Error:', error);
      return null;
    }
  }

  getIsRecording(): boolean {
    return this.isRecording;
  }

  /**
   * Text-to-Speech using device TTS
   */
  async speak(text: string, language: string = 'en-US'): Promise<void> {
    try {
      await Speech.speak(text, {
        language,
        pitch: 1.0,
        rate: 0.9,
      });
    } catch (error) {
      console.error('TTS Error:', error);
    }
  }

  /**
   * Stop any ongoing speech
   */
  async stopSpeaking(): Promise<void> {
    try {
      await Speech.stop();
    } catch (error) {
      console.error('Stop Speaking Error:', error);
    }
  }
}

export default new AudioService();
