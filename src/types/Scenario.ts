export type ScenarioDifficulty = 'beginner' | 'intermediate' | 'advanced';

export type ScenarioCategory = 'restaurant' | 'travel' | 'shopping' | 'business' | 'healthcare';

export interface Scenario {
  id: string;
  title: string;
  category: ScenarioCategory;
  difficulty: ScenarioDifficulty;
  description: string;
  estimatedDuration: number; // minutes
  xpReward: number;
  objectives: string[];
  avatarVideoUrl?: string; // User will provide from Google Flow/Nano Banana
  thumbnailUrl?: string;
  isCompleted: boolean;
  isLocked: boolean;
}

export interface Message {
  id: string;
  role: 'user' | 'avatar';
  content: string;
  timestamp: Date;
  audioUrl?: string; // TTS audio URL
  videoUrl?: string; // D-ID lip-sync video URL
}

export interface ConversationSession {
  scenarioId: string;
  messages: Message[];
  startedAt: Date;
  completedAt?: Date;
  xpEarned: number;
  objectivesCompleted: string[];
}
