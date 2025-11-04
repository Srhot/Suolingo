import GeminiService from '../ai/GeminiService';
import DIDService from '../avatar/DIDService';
import { Message } from '@/types/Scenario';

export interface ConversationState {
  messages: Message[];
  isAvatarSpeaking: boolean;
  currentAvatarVideoUrl: string | null;
}

class ConversationManager {
  /**
   * Initialize conversation with AI greeting
   */
  async startConversation(
    scenarioTitle: string,
    scenarioDescription: string,
    language: string
  ): Promise<Message> {
    try {
      const scenarioContext = `${scenarioTitle}: ${scenarioDescription}`;

      // Get AI greeting
      const greeting = await GeminiService.generateInitialGreeting(scenarioContext, language);

      // Generate avatar video for greeting
      const videoUrl = await DIDService.generateAvatarVideo(greeting);

      const message: Message = {
        id: Date.now().toString(),
        role: 'avatar',
        content: greeting,
        timestamp: new Date(),
        videoUrl,
      };

      return message;
    } catch (error) {
      console.error('Start Conversation Error:', error);

      // Fallback message without video
      return {
        id: Date.now().toString(),
        role: 'avatar',
        content: "Hello! Let's practice together!",
        timestamp: new Date(),
      };
    }
  }

  /**
   * Process user input and generate AI response with avatar video
   */
  async processUserMessage(
    userMessage: string,
    scenarioTitle: string,
    scenarioDescription: string,
    conversationHistory: Message[]
  ): Promise<Message> {
    try {
      const scenarioContext = `${scenarioTitle}: ${scenarioDescription}`;

      // Convert messages to history format
      const history = conversationHistory.map((msg) => ({
        role: msg.role,
        content: msg.content,
      }));

      // Get AI response
      const aiResponse = await GeminiService.generateScenarioResponse(
        scenarioContext,
        userMessage,
        history
      );

      // Generate avatar video for response
      const videoUrl = await DIDService.generateAvatarVideo(aiResponse);

      const message: Message = {
        id: Date.now().toString(),
        role: 'avatar',
        content: aiResponse,
        timestamp: new Date(),
        videoUrl,
      };

      return message;
    } catch (error) {
      console.error('Process Message Error:', error);

      // Fallback response
      return {
        id: Date.now().toString(),
        role: 'avatar',
        content: "I understand. Please continue.",
        timestamp: new Date(),
      };
    }
  }

  /**
   * Generate avatar video for existing text (for retries)
   */
  async generateVideoForMessage(text: string): Promise<string> {
    try {
      return await DIDService.generateAvatarVideo(text);
    } catch (error) {
      console.error('Generate Video Error:', error);
      throw error;
    }
  }
}

export default new ConversationManager();
