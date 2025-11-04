// A2E AI Creator ID'lerini listele
const axios = require('axios');
require('dotenv').config();

const A2E_API_KEY = process.env.A2E_API_KEY;
const A2E_BASE_URL = process.env.A2E_BASE_URL;

async function listCreators() {
  try {
    console.log('🔍 A2E Creator\'larını listeliyorum...\n');

    const response = await axios.get(`${A2E_BASE_URL}/api/creators/`, {
      headers: {
        'Authorization': `Bearer ${A2E_API_KEY}`,
      },
    });

    const creators = response.data;

    if (!creators || creators.length === 0) {
      console.log('❌ Hiç creator bulunamadı.');
      console.log('\n💡 A2E Dashboard\'a gidin ve avatarları yükleyin:');
      console.log('   https://app.a2e.ai/creators\n');
      return;
    }

    console.log(`✅ ${creators.length} creator bulundu:\n`);

    creators.forEach((creator, index) => {
      console.log(`[${index + 1}] ${creator.name || 'İsimsiz'}`);
      console.log(`    Creator ID: ${creator.id}`);
      console.log(`    Thumbnail: ${creator.thumbnail_url || 'N/A'}`);
      console.log('');
    });

    console.log('\n📋 Kod için kullanım:');
    console.log('-----------------------------------');
    creators.forEach((creator) => {
      console.log(`a2eCreatorId: '${creator.id}', // ${creator.name || 'İsimsiz'}`);
    });
    console.log('-----------------------------------\n');

  } catch (error) {
    console.error('❌ Hata:', error.response?.data || error.message);
    console.log('\n💡 Olası çözümler:');
    console.log('1. A2E API Key\'in doğru olduğunu kontrol edin (.env dosyasında)');
    console.log('2. A2E Dashboard\'da creator\'ları yüklediğinizden emin olun');
    console.log('3. API endpoint doğru mu: ' + A2E_BASE_URL);
  }
}

listCreators();
