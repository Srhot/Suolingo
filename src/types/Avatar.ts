export interface Avatar {
  id: string;
  name: string;
  title: string; // "Prof. Dr. Ahmet" gibi
  gender: 'male' | 'female';
  idleVideoUrl: string | number; // URL (string) veya require() (number)
  isStaticImage?: boolean; // Static görsel mi (PNG/JPG) yoksa video mu (MP4)
  thumbnailUrl?: string;
  a2eCreatorId?: string; // A2E AI creator ID (custom avatar için)
  ttsVoiceId?: string; // A2E TTS voice ID (currently Turkish only)
}

export interface ConversationMessage {
  id: string;
  text: string;
  timestamp: Date;
  audioUrl?: string; // TTS audio
  videoUrl?: string; // D-ID lip-sync video (opsiyonel)
  avatarId?: string; // Which avatar spoke this message
}
