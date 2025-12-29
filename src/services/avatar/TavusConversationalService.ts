/**
 * Tavus Conversational API Service
 *
 * Real-time video conversation with AI avatars
 * - WebRTC powered (~500ms latency)
 * - Persona-based conversations
 * - Embeddable conversation URLs
 */

import axios from 'axios';

interface TavusPersona {
  persona_id: string;
  persona_name: string;
  system_prompt: string;
  context?: string;
}

interface TavusReplica {
  replica_id: string;
  replica_name: string;
}

interface TavusConversation {
  conversation_id: string;
  conversation_url: string;
  status: string;
}

interface CreateConversationParams {
  replica_id: string;
  persona_id: string;
  conversation_name: string;
  conversational_context?: string;
  callback_url?: string;
}

class TavusConversationalService {
  private apiKey: string;
  private baseURL = 'https://tavusapi.com/v2';

  constructor() {
    this.apiKey = process.env.TAVUS_API_KEY || '';
    if (!this.apiKey) {
      console.warn('⚠️ Tavus API key not found in environment variables');
    }
  }

  /**
   * Create a Persona (AI character)
   * Example: IELTS examiner, TOEFL examiner, etc.
   */
  async createPersona(config: {
    name: string;
    systemPrompt: string;
    context?: string;
  }): Promise<TavusPersona> {
    try {
      console.log('🎭 Creating Tavus persona:', config.name);

      const response = await axios.post(
        `${this.baseURL}/personas`,
        {
          persona_name: config.name,
          system_prompt: config.systemPrompt,
          context: config.context,
        },
        {
          headers: {
            'x-api-key': this.apiKey,
            'Content-Type': 'application/json',
          },
        }
      );

      console.log('✅ Persona created:', response.data.persona_id);
      return response.data;
    } catch (error: any) {
      console.error('❌ Create persona error:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Get existing personas
   */
  async listPersonas(): Promise<TavusPersona[]> {
    try {
      const response = await axios.get(`${this.baseURL}/personas`, {
        headers: { 'x-api-key': this.apiKey },
      });
      return response.data.data || [];
    } catch (error: any) {
      console.error('❌ List personas error:', error.response?.data || error.message);
      return [];
    }
  }

  /**
   * Create a Replica (avatar video)
   * Note: Requires 2-minute video upload (can use default replica for now)
   */
  async listReplicas(): Promise<TavusReplica[]> {
    try {
      const response = await axios.get(`${this.baseURL}/replicas`, {
        headers: { 'x-api-key': this.apiKey },
      });
      return response.data.data || [];
    } catch (error: any) {
      console.error('❌ List replicas error:', error.response?.data || error.message);
      return [];
    }
  }

  /**
   * Start a real-time conversation
   * Returns conversation_url for embedding in WebView
   */
  async createConversation(params: CreateConversationParams): Promise<TavusConversation> {
    try {
      console.log('💬 Creating Tavus conversation...');

      const response = await axios.post(
        `${this.baseURL}/conversations`,
        {
          replica_id: params.replica_id,
          persona_id: params.persona_id,
          conversation_name: params.conversation_name,
          conversational_context: params.conversational_context,
          callback_url: params.callback_url,
        },
        {
          headers: {
            'x-api-key': this.apiKey,
            'Content-Type': 'application/json',
          },
        }
      );

      console.log('✅ Conversation created:', response.data.conversation_id);
      console.log('🔗 Conversation URL:', response.data.conversation_url);

      return response.data;
    } catch (error: any) {
      console.error('❌ Create conversation error:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Get conversation status
   */
  async getConversation(conversationId: string): Promise<any> {
    try {
      const response = await axios.get(
        `${this.baseURL}/conversations/${conversationId}`,
        {
          headers: { 'x-api-key': this.apiKey },
        }
      );
      return response.data;
    } catch (error: any) {
      console.error('❌ Get conversation error:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Predefined IELTS Examiner Persona
   */
  async getOrCreateIELTSPersona(): Promise<string> {
    try {
      // Check if IELTS persona already exists
      const personas = await this.listPersonas();
      const existingPersona = personas.find((p) =>
        p.persona_name.includes('IELTS Examiner')
      );

      if (existingPersona) {
        console.log('✅ Using existing IELTS persona:', existingPersona.persona_id);
        return existingPersona.persona_id;
      }

      // Create new IELTS examiner persona
      const persona = await this.createPersona({
        name: 'IELTS Speaking Examiner',
        systemPrompt: `You are an IELTS Speaking Test examiner. Your role is to:

1. Conduct the IELTS Speaking test professionally
2. Ask questions clearly and naturally
3. Listen attentively to the candidate's responses
4. Maintain a neutral, professional demeanor
5. Follow the standard IELTS Speaking test format:
   - Part 1: Introduction and interview (4-5 minutes)
   - Part 2: Long turn with topic card (3-4 minutes)
   - Part 3: Discussion (4-5 minutes)

Be encouraging but professional. Speak clearly with standard British or American English pronunciation.`,
        context: 'IELTS Speaking Test examination context',
      });

      return persona.persona_id;
    } catch (error) {
      console.error('❌ IELTS persona error:', error);
      throw error;
    }
  }

  /**
   * Predefined TOEFL Examiner Persona
   */
  async getOrCreateTOEFLPersona(): Promise<string> {
    try {
      const personas = await this.listPersonas();
      const existingPersona = personas.find((p) =>
        p.persona_name.includes('TOEFL Examiner')
      );

      if (existingPersona) {
        console.log('✅ Using existing TOEFL persona:', existingPersona.persona_id);
        return existingPersona.persona_id;
      }

      const persona = await this.createPersona({
        name: 'TOEFL Speaking Examiner',
        systemPrompt: `You are a TOEFL Speaking Test examiner. Your role is to:

1. Conduct the TOEFL Speaking section professionally
2. Present tasks clearly with appropriate timing instructions
3. Maintain a neutral, academic tone
4. Follow the standard TOEFL Speaking format:
   - Task 1: Independent task - Personal preference
   - Task 2: Independent task - Opinion
   - Task 3: Integrated task - Campus situation
   - Task 4: Integrated task - Academic lecture

Speak with clear, standard American English pronunciation.`,
        context: 'TOEFL Speaking Test examination context',
      });

      return persona.persona_id;
    } catch (error) {
      console.error('❌ TOEFL persona error:', error);
      throw error;
    }
  }

  /**
   * Quick start: Create IELTS conversation
   */
  async startIELTSConversation(): Promise<string> {
    try {
      console.log('🎓 Starting IELTS conversation...');

      // Get or create IELTS persona
      const personaId = await this.getOrCreateIELTSPersona();

      // Get available replicas
      const replicas = await this.listReplicas();
      if (replicas.length === 0) {
        throw new Error('No replicas available. Please create a replica first.');
      }

      // Use first available replica
      const replicaId = replicas[0].replica_id;

      // Create conversation
      const conversation = await this.createConversation({
        replica_id: replicaId,
        persona_id: personaId,
        conversation_name: 'IELTS Speaking Test',
        conversational_context: 'IELTS Speaking examination session',
      });

      console.log('✅ IELTS conversation ready!');
      console.log('🔗 URL:', conversation.conversation_url);

      return conversation.conversation_url;
    } catch (error) {
      console.error('❌ Start IELTS conversation error:', error);
      throw error;
    }
  }

  /**
   * Quick start: Create TOEFL conversation
   */
  async startTOEFLConversation(): Promise<string> {
    try {
      console.log('📚 Starting TOEFL conversation...');

      const personaId = await this.getOrCreateTOEFLPersona();
      const replicas = await this.listReplicas();

      if (replicas.length === 0) {
        throw new Error('No replicas available. Please create a replica first.');
      }

      const conversation = await this.createConversation({
        replica_id: replicas[0].replica_id,
        persona_id: personaId,
        conversation_name: 'TOEFL Speaking Test',
        conversational_context: 'TOEFL Speaking section',
      });

      console.log('✅ TOEFL conversation ready!');
      return conversation.conversation_url;
    } catch (error) {
      console.error('❌ Start TOEFL conversation error:', error);
      throw error;
    }
  }
}

// Singleton instance
export default new TavusConversationalService();
