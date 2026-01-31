/**
 * Create Tavus Conversation and get URL
 */

const axios = require('axios');
require('dotenv').config();

const TAVUS_API_KEY = process.env.TAVUS_API_KEY;
const BASE_URL = 'https://tavusapi.com/v2';

const headers = {
  'x-api-key': TAVUS_API_KEY,
  'Content-Type': 'application/json',
};

async function createConversation() {
  try {
    console.log('💬 Creating Tavus IELTS Conversation...\n');

    // Use existing IELTS persona
    const personaId = 'p47fdaf4e9de'; // Created in previous test

    // Use first replica
    const replicaId = 'rfcc944ac6'; // From test results

    console.log('Using:');
    console.log('  Persona ID:', personaId);
    console.log('  Replica ID:', replicaId);

    const response = await axios.post(
      `${BASE_URL}/conversations`,
      {
        replica_id: replicaId,
        persona_id: personaId,
        conversation_name: 'SUOLINGO IELTS Speaking Test',
        conversational_context: 'IELTS Speaking examination practice session',
      },
      { headers }
    );

    console.log('\n✅ Conversation Created!');
    console.log('\n📋 Details:');
    console.log('  Conversation ID:', response.data.conversation_id);
    console.log('  Status:', response.data.status);
    console.log('\n🔗 OPEN THIS URL TO TEST:');
    console.log('  ', response.data.conversation_url);
    console.log('\n💡 This URL contains a real-time WebRTC conversation!');
    console.log('   You can embed it in React Native WebView.');

  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

createConversation();
