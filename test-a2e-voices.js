/**
 * A2E Voice List Test Script
 *
 * Bu script A2E API'den mevcut voice'ları çeker.
 *
 * Kullanım:
 * 1. Terminal'de proje klasöründe: node test-a2e-voices.js
 * 2. Çıktıda İngilizce ve Türkçe voice ID'lerini göreceksiniz
 */

const axios = require('axios');

const A2E_API_KEY = 'sk_eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhcHBfaWQiOiI2NzJhZTEyZjYyZWQyNGM0ZTFjNzg0NDMiLCJhcHBfbmFtZSI6InN1b2xpbmdvIiwiYWNjb3VudF9pZCI6IjY3MmFlMTJlNjJlZDI0YzRlMWM3ODM5YiIsInJvbGVzIjpbInVzZXIiXSwiaWF0IjoxNzMwODQ4MDQ4fQ.3z-gElMXPEsHBGp0UWqnJWYjRGXQ7T2sEp6vxJLnOjE';
const A2E_BASE_URL = 'https://video.a2e.ai';

async function testA2EVoices() {
  try {
    console.log('🎤 A2E Voice List API Test\n');
    console.log('Fetching available voices...\n');

    // Call voice list API
    const response = await axios.get(
      `${A2E_BASE_URL}/api/v1/anchor/voice_list`,
      {
        headers: {
          'Authorization': `Bearer ${A2E_API_KEY}`,
        },
      }
    );

    console.log('✅ API Response:\n');
    console.log(JSON.stringify(response.data, null, 2));

    // Parse and categorize voices
    if (response.data?.code === 0 && response.data?.data) {
      const voices = response.data.data;

      console.log('\n\n📋 VOICE SUMMARY:\n');
      console.log(`Total voices available: ${voices.length}\n`);

      // Turkish voices
      const turkishVoices = voices.filter(v =>
        v.name?.includes('TR') ||
        v.name?.includes('Turkish') ||
        v.name?.includes('Türk')
      );

      console.log('🇹🇷 TURKISH VOICES:');
      turkishVoices.forEach(v => {
        console.log(`  - ${v.name || 'Unknown'}`);
        console.log(`    ID: ${v._id || v.id}`);
        console.log(`    Gender: ${v.gender || 'Unknown'}\n`);
      });

      // English voices
      const englishVoices = voices.filter(v =>
        v.name?.includes('EN') ||
        v.name?.includes('US') ||
        v.name?.includes('GB') ||
        v.name?.includes('English')
      );

      console.log('\n🇬🇧 ENGLISH VOICES:');
      englishVoices.forEach(v => {
        console.log(`  - ${v.name || 'Unknown'}`);
        console.log(`    ID: ${v._id || v.id}`);
        console.log(`    Gender: ${v.gender || 'Unknown'}\n`);
      });

      // Save to file for reference
      const fs = require('fs');
      fs.writeFileSync(
        'a2e-voices.json',
        JSON.stringify(response.data, null, 2)
      );
      console.log('\n💾 Full response saved to: a2e-voices.json');

    } else {
      console.error('❌ Unexpected API response format');
    }

  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);

    if (error.response?.status === 401) {
      console.error('\n⚠️  API Key might be invalid or expired');
    }
  }
}

testA2EVoices();
