# SUOLINGO - API Keys & Environment Setup Guide

## 🔑 Required API Keys

This document provides comprehensive instructions for obtaining and configuring all API keys required for SUOLINGO.

---

## 1️⃣ A2E AI (Primary Avatar Service)

**Purpose:** Avatar lip-sync video generation, TTS, face/voice cloning

**Website:** [video.a2e.ai](https://video.a2e.ai)

**Setup Steps:**
1. Visit [video.a2e.ai](https://video.a2e.ai)
2. Create account (email + password)
3. Navigate to API Settings
4. Copy API Key (format: `sk_eyJhbGc...`)

**Environment Variable:**
```env
A2E_API_KEY=sk_eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
A2E_BASE_URL=https://video.a2e.ai
```

**Configuration:**
- **Anchor ID** (Face): Find in A2E dashboard → My Anchors
- **TTS ID** (Voice): Find in A2E dashboard → Voice Library

**Current Configuration:**
```typescript
// Male Avatar (Prof. Dr. Ahmet Yılmaz)
anchorId: "6908ef13162a96003b2893cc"
ttsId: "66d3fb1bc051cfb134c60f20"  // Andrew Multilingual

// Female Avatar (Dr. Ayşe Kaya)
anchorId: "[To be configured]"
ttsId: "[To be configured]"
```

**Pricing:** ~$0.10 per video (pay-as-you-go)

---

## 2️⃣ Google Gemini (Conversational AI)

**Purpose:** AI conversations, grammar correction, exam generation

**Website:** [ai.google.dev](https://ai.google.dev)

**Setup Steps:**
1. Visit [Google AI Studio](https://aistudio.google.com)
2. Sign in with Google account
3. Click "Get API Key"
4. Create new API key or use existing
5. Copy API key (format: `AIzaSy...`)

**Environment Variable:**
```env
GEMINI_API_KEY=AIzaSyBqB9T_Cg08CdhXZ78kf6j0O56TGSHJ-xA
```

**Model Used:** `gemini-1.5-pro-002` (latest stable version)

**Free Tier:**
- 60 requests per minute
- 1500 requests per day
- Sufficient for development and testing

**Pricing:** Free tier available, paid tier if needed

---

## 3️⃣ Deepgram (Speech-to-Text)

**Purpose:** Voice transcription (Turkish + English)

**Website:** [deepgram.com](https://deepgram.com)

**Setup Steps:**
1. Visit [console.deepgram.com](https://console.deepgram.com)
2. Create account
3. Navigate to API Keys section
4. Create new API key
5. Copy key (format: alphanumeric)

**Environment Variable:**
```env
DEEPGRAM_API_KEY=aa71f394812980e79b05c92567ac538443c00e36
DEEPGRAM_BASE_URL=https://api.deepgram.com
```

**Configuration:**
```typescript
// DeepgramService.ts settings
model: 'nova-2'  // Latest model
language: 'multi'  // Auto-detect Turkish/English
smart_format: true  // Auto punctuation
```

**Free Tier:**
- $200 credits on signup
- ~45,000 minutes of audio
- Sufficient for entire project

**Pricing:** $0.0043/minute after free credits

---

## 4️⃣ Google Cloud (Translation API)

**Purpose:** Turkish ↔ English translation

**Website:** [console.cloud.google.com](https://console.cloud.google.com)

**Setup Steps:**
1. Create Google Cloud account
2. Create new project
3. Enable Cloud Translation API
4. Create credentials (API key)
5. Copy API key

**Environment Variable:**
```env
GOOGLE_CLOUD_API_KEY=AIzaSyBqB9T_Cg08CdhXZ78kf6j0O56TGSHJ-xA
GOOGLE_CLOUD_SPEECH_URL=https://speech.googleapis.com
```

**Note:** Can reuse Gemini API key if both are in same Google Cloud project

**Free Tier:**
- $300 credits for 90 days
- 500,000 characters/month free

**Pricing:** $20 per 1M characters after free tier

---

## 5️⃣ ElevenLabs (Text-to-Speech - Optional)

**Purpose:** Alternative TTS (A2E TTS is primary)

**Website:** [elevenlabs.io](https://elevenlabs.io)

**Setup Steps:**
1. Visit [elevenlabs.io](https://elevenlabs.io)
2. Create account
3. Navigate to Profile → API Keys
4. Generate new API key
5. Copy key (format: `sk_...`)

**Environment Variable:**
```env
ELEVENLABS_API_KEY=sk_b7fad2c9254399a6197dc8f0d5cb1a9593780200347e7a3c
ELEVENLABS_BASE_URL=https://api.elevenlabs.io
```

**Configuration:**
```typescript
// Male voice
voice_id: "pNInz6obpgDQGcFmaJgB"  // Adam

// Female voice
voice_id: "21m00Tcm4TlvDq8ikWAM"  // Rachel
```

**Free Tier:**
- 10,000 characters/month
- ~5-7 minutes of audio

**Pricing:** $5/month for 30,000 characters

**Status:** Optional - A2E TTS is primary

---

## 6️⃣ Simli (Experimental - Fast Avatar)

**Purpose:** Fast audio-to-video avatar (experimental)

**Website:** [simli.com](https://www.simli.com)

**Setup Steps:**
1. Visit [app.simli.com](https://app.simli.com)
2. Create account
3. Navigate to Settings → API Keys
4. Copy API key

**Environment Variable:**
```env
SIMLI_API_KEY=gzhmpcgawe3lczscf7vtg
```

**Configuration:**
```typescript
// Default face ID
faceId: "0c2b8b04-5274-41f1-a21c-d5c98322efa9"
```

**Status:** ⚠️ Experimental - Not production-ready (see AVATAR_SERVICES_ANALYSIS.md)

**Issues:** Codec problems, polling timeout, voice mismatch

---

## 7️⃣ NavTalk (Experimental - Real-time)

**Purpose:** Real-time WebSocket avatar (experimental)

**Website:** [navtalk.ai](https://navtalk.ai)

**Setup Steps:**
1. Visit [docs.navtalk.ai](https://docs.navtalk.ai)
2. Request API access
3. Receive API key

**Environment Variable:**
```env
NAVTALK_API_KEY=sk_navtalk_QXKej5g2HG5CyfDg3Us1E0P9N94jWx5T
```

**Status:** ❌ API key authentication failed

**Issues:** Connection errors, not working

---

## 8️⃣ Tavus (Experimental - Conversational Video)

**Purpose:** Real-time conversational video (experimental)

**Website:** [tavus.io](https://www.tavus.io)

**Setup Steps:**
1. Visit [platform.tavus.io](https://platform.tavus.io)
2. Create account
3. Navigate to API section
4. Generate API key

**Environment Variable:**
```env
TAVUS_API_KEY=6d0584bf48a04c20afb83941f2653884
```

**Configuration:**
```typescript
// Default replica ID
replica_id: "r79e1c033f"
```

**Status:** 🧪 Not tested yet

---

## 📝 Complete .env File Template

```env
# ========================================
# SUOLINGO - Environment Variables
# ========================================

# =====================================
# CORE SERVICES (Required)
# =====================================

# A2E AI - Primary avatar service
A2E_API_KEY=your_a2e_api_key_here
A2E_BASE_URL=https://video.a2e.ai

# Google Gemini - Conversational AI
GEMINI_API_KEY=your_gemini_api_key_here

# Deepgram - Speech-to-Text
DEEPGRAM_API_KEY=your_deepgram_api_key_here
DEEPGRAM_BASE_URL=https://api.deepgram.com

# Google Cloud - Translation API
GOOGLE_CLOUD_API_KEY=your_google_cloud_api_key_here
GOOGLE_CLOUD_SPEECH_URL=https://speech.googleapis.com

# =====================================
# OPTIONAL SERVICES
# =====================================

# ElevenLabs - Alternative TTS
ELEVENLABS_API_KEY=your_elevenlabs_api_key_here
ELEVENLABS_BASE_URL=https://api.elevenlabs.io

# =====================================
# EXPERIMENTAL SERVICES (Not Production Ready)
# =====================================

# Simli - Fast audio-to-video
SIMLI_API_KEY=your_simli_api_key_here

# NavTalk - Real-time WebSocket avatar
NAVTALK_API_KEY=your_navtalk_api_key_here

# Tavus - Real-time conversational video
TAVUS_API_KEY=your_tavus_api_key_here

# =====================================
# DEPRECATED SERVICES
# =====================================

# D-ID (deprecated, not used)
DID_API_KEY=deprecated
DID_BASE_URL=https://api.d-id.com

# =====================================
# AVATAR CONFIGURATION
# =====================================

# A2E Avatar IDs (reference only, not used in .env)
# Male Avatar: anchor_id="6908ef13162a96003b2893cc", tts_id="66d3fb1bc051cfb134c60f20"
# Female Avatar: [To be configured]
```

---

## 🔐 Security Best Practices

### DO ✅
1. **Never commit .env to Git**
   - Add `.env` to `.gitignore`
   - Only commit `.env.example` with placeholder values

2. **Use environment variables**
   - Never hardcode API keys in source code
   - Use `react-native-dotenv` for environment variables

3. **Rotate keys periodically**
   - Generate new keys every 90 days
   - Revoke old keys after rotation

4. **Limit API key permissions**
   - Only enable required API features
   - Use read-only keys when possible

5. **Monitor API usage**
   - Set up billing alerts
   - Track daily/monthly usage

### DON'T ❌
1. Never share API keys publicly
2. Never commit API keys to GitHub
3. Never use production keys in development
4. Never log API keys to console
5. Never send API keys over unencrypted connections

---

## 🧪 Testing API Keys

**Test Script: `test-api-keys.js`** (Create this file for testing)

```javascript
// Test A2E API
async function testA2E() {
  const response = await fetch('https://video.a2e.ai/api/v1/user/info', {
    headers: { Authorization: `Bearer ${process.env.A2E_API_KEY}` }
  });
  console.log('A2E:', response.ok ? '✅ Valid' : '❌ Invalid');
}

// Test Gemini API
async function testGemini() {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${process.env.GEMINI_API_KEY}`;
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ contents: [{ parts: [{ text: 'Hello' }] }] })
  });
  console.log('Gemini:', response.ok ? '✅ Valid' : '❌ Invalid');
}

// Test Deepgram API
async function testDeepgram() {
  const response = await fetch('https://api.deepgram.com/v1/projects', {
    headers: { Authorization: `Token ${process.env.DEEPGRAM_API_KEY}` }
  });
  console.log('Deepgram:', response.ok ? '✅ Valid' : '❌ Invalid');
}

// Run all tests
testA2E();
testGemini();
testDeepgram();
```

**Run tests:**
```bash
node test-api-keys.js
```

---

## 💰 Cost Estimation

### Development (3 months)
| Service | Usage | Cost |
|---------|-------|------|
| **A2E** | ~200 videos | $20 |
| **Gemini** | Free tier | $0 |
| **Deepgram** | Free credits | $0 |
| **Translation** | Free tier | $0 |
| **ElevenLabs** | Optional | $0-15 |
| **Total** | | **~$20-35** |

### Production (Per 1000 users/month)
| Service | Usage | Cost |
|---------|-------|------|
| **A2E** | ~5000 videos | $500 |
| **Gemini** | ~10,000 requests | $50 |
| **Deepgram** | ~2000 minutes | $8.60 |
| **Translation** | ~1M characters | $20 |
| **Total** | | **~$578.60** |

**Note:** Prices are estimates and may vary

---

## 📞 Support & Troubleshooting

### Common Issues

**Issue: API key not working**
- ✅ Check key format (no extra spaces)
- ✅ Verify key is active in service dashboard
- ✅ Check billing/credits remaining
- ✅ Ensure service is enabled in project

**Issue: "Invalid API key" error**
- ✅ Restart Expo server after changing .env
- ✅ Clear Metro bundler cache: `npx expo start --clear`
- ✅ Verify environment variable is loaded: `console.log(process.env.A2E_API_KEY)`

**Issue: API rate limit exceeded**
- ✅ Check service dashboard for quota
- ✅ Implement request throttling
- ✅ Upgrade to paid tier if needed

### Getting Help

**A2E Support:**
- Email: support@a2e.ai
- Docs: [video.a2e.ai/docs](https://video.a2e.ai/docs)

**Gemini Support:**
- Forum: [ai.google.dev/forum](https://ai.google.dev/forum)
- Docs: [ai.google.dev/docs](https://ai.google.dev/docs)

**Deepgram Support:**
- Discord: [discord.gg/deepgram](https://discord.gg/deepgram)
- Docs: [developers.deepgram.com](https://developers.deepgram.com)

---

**Last Updated:** December 14, 2024
**Document Version:** 1.0
