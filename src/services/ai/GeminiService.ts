import { GoogleGenerativeAI } from '@google/generative-ai';
import { GEMINI_API_KEY } from '@env';

class GeminiService {
  private genAI: GoogleGenerativeAI;
  private model: any;

  constructor() {
    this.genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    this.model = this.genAI.getGenerativeModel({ model: 'gemini-pro' });
  }

  async generateScenarioResponse(
    scenarioContext: string,
    userMessage: string,
    conversationHistory: Array<{ role: string; content: string }>
  ): Promise<string> {
    try {
      // Build conversation history for context
      const historyText = conversationHistory
        .map((msg) => `${msg.role === 'user' ? 'Student' : 'Teacher'}: ${msg.content}`)
        .join('\n');

      const prompt = `You are a language learning teacher in a real-world scenario: ${scenarioContext}

Conversation so far:
${historyText}

Student just said: "${userMessage}"

As the teacher, respond naturally in the target language. Keep it conversational, correct any mistakes gently, and help the student progress through the scenario. Keep responses under 50 words.

Your response:`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      return text.trim();
    } catch (error) {
      console.error('Gemini API Error:', error);
      throw new Error('Failed to generate AI response');
    }
  }

  async generateInitialGreeting(scenarioContext: string, language: string): Promise<string> {
    try {
      const prompt = `You are a ${language} language teacher starting a role-play scenario: ${scenarioContext}

Greet the student and start the scenario naturally. Speak in ${language}. Keep it under 30 words.

Your greeting:`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      return text.trim();
    } catch (error) {
      console.error('Gemini API Error:', error);
      return "Hello! Welcome. Let's practice together!";
    }
  }
}

export default new GeminiService();
