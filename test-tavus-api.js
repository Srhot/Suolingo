/**
 * Tavus API Test Script
 *
 * Tests Tavus Conversational API:
 * 1. List replicas
 * 2. List personas
 * 3. Create IELTS persona
 * 4. Create conversation
 */

const axios = require('axios');
require('dotenv').config();

const TAVUS_API_KEY = process.env.TAVUS_API_KEY;
const BASE_URL = 'https://tavusapi.com/v2';

const headers = {
  'x-api-key': TAVUS_API_KEY,
  'Content-Type': 'application/json',
};

async function testTavusAPI() {
  console.log('🧪 Testing Tavus Conversational API...\n');
  console.log('API Key:', TAVUS_API_KEY ? '✅ Found' : '❌ Missing');

  if (!TAVUS_API_KEY) {
    console.error('❌ TAVUS_API_KEY not found in .env file');
    process.exit(1);
  }

  try {
    // Test 1: List Replicas
    console.log('\n📋 Test 1: List Replicas');
    const replicasResponse = await axios.get(`${BASE_URL}/replicas`, { headers });
    const replicas = replicasResponse.data.data || [];
    console.log(`✅ Found ${replicas.length} replica(s)`);

    if (replicas.length > 0) {
      console.log('First replica:');
      console.log('  - ID:', replicas[0].replica_id);
      console.log('  - Name:', replicas[0].replica_name || 'Unnamed');
    } else {
      console.log('⚠️  No replicas found. You need to create a replica first.');
      console.log('   Visit: https://platform.tavus.io/replicas');
    }

    // Test 2: List Personas
    console.log('\n📋 Test 2: List Personas');
    const personasResponse = await axios.get(`${BASE_URL}/personas`, { headers });
    const personas = personasResponse.data.data || [];
    console.log(`✅ Found ${personas.length} persona(s)`);

    if (personas.length > 0) {
      console.log('Existing personas:');
      personas.forEach((p, i) => {
        console.log(`  ${i + 1}. ${p.persona_name} (ID: ${p.persona_id})`);
      });
    }

    // Test 3: Create IELTS Examiner Persona
    console.log('\n🎭 Test 3: Create IELTS Examiner Persona');

    // Check if IELTS persona already exists
    const ieltsPersona = personas.find(p => p.persona_name.includes('IELTS'));

    if (ieltsPersona) {
      console.log('✅ IELTS persona already exists:', ieltsPersona.persona_id);
    } else {
      console.log('Creating new IELTS persona...');
      const createPersonaResponse = await axios.post(
        `${BASE_URL}/personas`,
        {
          persona_name: 'IELTS Speaking Examiner - SUOLINGO',
          system_prompt: `You are an IELTS Speaking Test examiner. Your role is to:

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
        },
        { headers }
      );

      console.log('✅ IELTS persona created:', createPersonaResponse.data.persona_id);
    }

    // Test 4: Create Conversation (if we have a replica)
    if (replicas.length > 0) {
      console.log('\n💬 Test 4: Create Sample Conversation');

      const personaId = ieltsPersona
        ? ieltsPersona.persona_id
        : personas.find(p => p.persona_name.includes('IELTS'))?.persona_id;

      if (!personaId) {
        console.log('⚠️  No IELTS persona available for conversation test');
      } else {
        const conversationResponse = await axios.post(
          `${BASE_URL}/conversations`,
          {
            replica_id: replicas[0].replica_id,
            persona_id: personaId,
            conversation_name: 'SUOLINGO IELTS Test',
            conversational_context: 'IELTS Speaking examination practice session',
          },
          { headers }
        );

        console.log('✅ Conversation created!');
        console.log('   Conversation ID:', conversationResponse.data.conversation_id);
        console.log('   Conversation URL:', conversationResponse.data.conversation_url);
        console.log('\n🔗 Open this URL in browser to test real-time conversation:');
        console.log('   ', conversationResponse.data.conversation_url);
      }
    }

    console.log('\n✅ All tests passed!');
    console.log('\n📝 Next steps:');
    console.log('1. If you don\'t have a replica, create one at: https://platform.tavus.io/replicas');
    console.log('2. Open the conversation URL in a browser to test');
    console.log('3. Integrate into React Native using WebView');

  } catch (error) {
    console.error('\n❌ Test failed:', error.response?.data || error.message);

    if (error.response?.status === 401) {
      console.error('   API key is invalid or expired');
    } else if (error.response?.status === 404) {
      console.error('   Endpoint not found - check API version');
    }
  }
}

testTavusAPI();
