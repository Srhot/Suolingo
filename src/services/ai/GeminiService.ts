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

  // 🆕 MODE 4: Conversation Mode - Free-flowing natural conversation
  async generateConversationResponse(
    userMessage: string,
    conversationHistory: Array<{ role: string; content: string }>,
    language: 'tr' | 'en' = 'en'
  ): Promise<string> {
    try {
      const historyText = conversationHistory
        .map((msg) => `${msg.role === 'user' ? 'Student' : 'Teacher'}: ${msg.content}`)
        .join('\n');

      const languageName = language === 'tr' ? 'Turkish' : 'English';

      const prompt = `You are a friendly ${languageName} language teacher having a natural conversation with a student.

Conversation history:
${historyText}

Student just said: "${userMessage}"

Respond naturally in ${languageName}:
- Ask follow-up questions to keep conversation flowing
- Show genuine interest in student's answers
- Keep responses conversational and friendly
- Use simple vocabulary appropriate for language learners
- Maximum 40 words

Your response:`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      return text.trim();
    } catch (error) {
      console.error('Gemini Conversation Error:', error);
      throw new Error('Failed to generate conversation response');
    }
  }

  // 🆕 MODE 5: Sentence Correction - Grammar correction with explanations
  async correctSentence(
    sentence: string,
    targetLanguage: 'tr' | 'en' = 'en',
    explanationLanguage: 'tr' | 'en' = 'tr'
  ): Promise<{ corrected: string; hasError: boolean; explanation: string }> {
    try {
      const targetLangName = targetLanguage === 'tr' ? 'Turkish' : 'English';
      const explainLangName = explanationLanguage === 'tr' ? 'Turkish' : 'English';

      const prompt = `You are a ${targetLangName} language teacher. Check this sentence for grammar, spelling, and usage errors:

Sentence: "${sentence}"

Instructions:
1. If there are errors, provide the corrected version
2. Explain the mistakes in ${explainLangName}
3. Keep explanation simple and clear (max 60 words)

Format your response EXACTLY like this:
CORRECTED: [corrected sentence or "No errors" if perfect]
EXPLANATION: [explanation in ${explainLangName} or "Perfect!" if no errors]

Your analysis:`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      // Parse response
      const correctedMatch = text.match(/CORRECTED:\s*(.+?)(?=\n|$)/i);
      const explanationMatch = text.match(/EXPLANATION:\s*(.+?)$/is);

      const correctedText = correctedMatch ? correctedMatch[1].trim() : sentence;
      const explanation = explanationMatch ? explanationMatch[1].trim() : 'Could not analyze sentence.';

      const hasError = !correctedText.toLowerCase().includes('no error') && correctedText !== sentence;

      return {
        corrected: hasError ? correctedText : sentence,
        hasError,
        explanation,
      };
    } catch (error) {
      console.error('Gemini Correction Error:', error);
      return {
        corrected: sentence,
        hasError: false,
        explanation: 'Could not analyze sentence at this time.',
      };
    }
  }

  // 🆕 MODE 6: Word of the Day - Daily vocabulary building
  async generateWordOfTheDay(
    language: 'tr' | 'en' = 'en',
    difficulty: 'beginner' | 'intermediate' | 'advanced' = 'intermediate'
  ): Promise<{ word: string; definition: string; examples: string[]; translation: string }> {
    try {
      const languageName = language === 'tr' ? 'Turkish' : 'English';
      const oppositeLanguage = language === 'tr' ? 'English' : 'Turkish';

      const prompt = `You are a ${languageName} language teacher. Provide a useful "${difficulty}" level word for daily vocabulary building.

Choose a practical word that ${difficulty} learners should know.

Format your response EXACTLY like this:
WORD: [the word]
DEFINITION: [definition in ${languageName}, max 30 words]
EXAMPLE1: [example sentence using the word]
EXAMPLE2: [another example sentence]
EXAMPLE3: [third example sentence]
TRANSLATION: [translation to ${oppositeLanguage}]

Your word of the day:`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      // Parse response
      const wordMatch = text.match(/WORD:\s*(.+?)(?=\n|$)/i);
      const definitionMatch = text.match(/DEFINITION:\s*(.+?)(?=\n|$)/i);
      const example1Match = text.match(/EXAMPLE1:\s*(.+?)(?=\n|$)/i);
      const example2Match = text.match(/EXAMPLE2:\s*(.+?)(?=\n|$)/i);
      const example3Match = text.match(/EXAMPLE3:\s*(.+?)(?=\n|$)/i);
      const translationMatch = text.match(/TRANSLATION:\s*(.+?)$/is);

      const word = wordMatch ? wordMatch[1].trim() : 'practice';
      const definition = definitionMatch ? definitionMatch[1].trim() : 'To do something repeatedly to improve.';
      const examples = [
        example1Match ? example1Match[1].trim() : `I ${word} every day.`,
        example2Match ? example2Match[1].trim() : `${word} is important.`,
        example3Match ? example3Match[1].trim() : `Let's ${word} together.`,
      ];
      const translation = translationMatch ? translationMatch[1].trim() : 'pratik yapmak';

      return {
        word,
        definition,
        examples,
        translation,
      };
    } catch (error) {
      console.error('Gemini Word of the Day Error:', error);
      return {
        word: 'practice',
        definition: 'To do something repeatedly to improve your skills.',
        examples: [
          'I practice English every day.',
          'Practice makes perfect.',
          "Let's practice speaking together.",
        ],
        translation: 'pratik yapmak',
      };
    }
  }

  // 🆕 Conversation Starter - Generate opening question for conversation mode
  async generateConversationStarter(language: 'tr' | 'en' = 'en'): Promise<string> {
    try {
      const languageName = language === 'tr' ? 'Turkish' : 'English';

      const prompt = `You are a friendly ${languageName} language teacher starting a casual conversation with a student.

Ask an interesting, open-ended question to start the conversation. Topics can include:
- Hobbies, interests, daily activities
- Food, travel, family, friends
- Movies, music, books, sports
- Dreams, goals, experiences

Keep it simple, friendly, and conversational. Maximum 25 words. Speak in ${languageName}.

Your opening question:`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      return text.trim();
    } catch (error) {
      console.error('Gemini Conversation Starter Error:', error);
      const fallback = language === 'en'
        ? "Hello! What's your favorite hobby? Tell me about it!"
        : 'Merhaba! En sevdiğin hobi nedir? Bana anlat!';
      return fallback;
    }
  }
}

export default new GeminiService();
