// NavTalk API WebSocket Connection Test
const WebSocket = require('ws');

const API_KEY = 'sk_navtalk_QXKej5g2HG5CyfDg3Us1E0P9N94jWx5T';
const ENDPOINT = `wss://transfer.navtalk.ai/api/realtime-api?license=${API_KEY}`;

console.log('🔌 Connecting to NavTalk API...\n');
console.log('Endpoint:', ENDPOINT);
console.log('\n---\n');

const ws = new WebSocket(ENDPOINT);

ws.on('open', () => {
  console.log('✅ WebSocket connection SUCCESSFUL!');
  console.log('🎉 NavTalk API is working!\n');

  // Send a test message
  console.log('📤 Sending test session.update...');
  const sessionConfig = {
    type: 'session.update',
    session: {
      turn_detection: {
        type: 'server_vad'
      },
      voice: 'alloy'
    }
  };

  ws.send(JSON.stringify(sessionConfig));
  console.log('✅ Test message sent\n');

  // Keep connection open for a few seconds to receive responses
  setTimeout(() => {
    console.log('🔌 Closing connection...');
    ws.close();
  }, 3000);
});

ws.on('message', (data) => {
  console.log('📥 Received message:');
  try {
    const parsed = JSON.parse(data.toString());
    console.log(JSON.stringify(parsed, null, 2));
  } catch (e) {
    console.log(data.toString());
  }
  console.log('\n---\n');
});

ws.on('error', (error) => {
  console.error('❌ WebSocket ERROR:', error.message);
  console.error('\nPossible reasons:');
  console.error('- API key invalid or expired');
  console.error('- Insufficient balance');
  console.error('- Network connectivity issue');
  console.error('- Rate limit exceeded');
});

ws.on('close', (code, reason) => {
  console.log(`🔌 Connection closed (Code: ${code})`);
  if (reason) {
    console.log('Reason:', reason.toString());
  }
  console.log('\n✅ Test completed!');
});

// Timeout fallback
setTimeout(() => {
  if (ws.readyState === WebSocket.CONNECTING) {
    console.log('⏰ Connection timeout - taking too long');
    ws.close();
  }
}, 10000);
