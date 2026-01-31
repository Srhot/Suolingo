// Test Tavus AI Service
const axios = require('axios');
require('dotenv').config();

const TAVUS_API_KEY = process.env.TAVUS_API_KEY;
const TAVUS_BASE_URL = 'https://tavusapi.com/v2';

async function testTavus() {
  console.log('🎭 Testing Tavus AI...');
  console.log('API Key:', TAVUS_API_KEY ? '✅ Present' : '❌ Missing');

  if (!TAVUS_API_KEY) {
    console.error('❌ TAVUS_API_KEY not found in .env');
    return;
  }

  try {
    // Test 1: Check API authentication
    console.log('\n📡 Test 1: Checking authentication...');
    const authTest = await axios.get(`${TAVUS_BASE_URL}/replicas`, {
      headers: {
        'x-api-key': TAVUS_API_KEY
      },
      timeout: 10000
    });
    console.log('✅ Authentication successful!');
    console.log('📊 Available replicas:', authTest.data.length || 0);

    // Test 2: Create a simple video
    console.log('\n🎬 Test 2: Creating test video...');
    const scriptText = "Hello! Welcome to SUOLINGO. This is a test of Tavus AI integration.";

    const videoResponse = await axios.post(`${TAVUS_BASE_URL}/videos`, {
      replica_id: 'r79e1c033f', // Default replica
      script: scriptText
    }, {
      headers: {
        'x-api-key': TAVUS_API_KEY,
        'Content-Type': 'application/json'
      },
      timeout: 30000
    });

    const videoId = videoResponse.data.video_id;
    console.log('✅ Video creation initiated!');
    console.log('📹 Video ID:', videoId);

    // Test 3: Poll for video completion
    console.log('\n⏳ Test 3: Waiting for video to be ready...');
    let attempts = 0;
    const maxAttempts = 20; // 40 seconds max

    while (attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds
      attempts++;

      const statusResponse = await axios.get(`${TAVUS_BASE_URL}/videos/${videoId}`, {
        headers: {
          'x-api-key': TAVUS_API_KEY
        },
        timeout: 10000
      });

      const status = statusResponse.data.status;
      console.log(`   Attempt ${attempts}/${maxAttempts}: Status = ${status}`);

      if (status === 'completed' || status === 'ready') {
        console.log('✅ Video is ready!');
        const videoUrl = statusResponse.data.download_url || statusResponse.data.hosted_url || statusResponse.data.stream_url;
        console.log('📹 Video URL:', videoUrl);
        console.log('\n🎉 TAVUS TEST SUCCESSFUL!');
        return;
      } else if (status === 'failed' || status === 'error') {
        console.error('❌ Video generation failed');
        console.error('Details:', statusResponse.data);
        return;
      }
    }

    console.warn('⚠️ Timeout: Video took too long to generate');

  } catch (error) {
    console.error('\n❌ Tavus Test Failed:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', JSON.stringify(error.response.data, null, 2));
    } else {
      console.error('Error:', error.message);
    }
  }
}

testTavus();
