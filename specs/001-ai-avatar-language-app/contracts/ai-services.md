# AI Services Integration Contract

**Feature**: 001-ai-avatar-language-app
**Date**: 2025-10-27
**Purpose**: Define external AI service integration specs, cost calculations, and fallback strategies

## Integrated AI Services

### 1. Deepgram (Speech-to-Text)

**Provider**: Deepgram
**Endpoint**: `https://api.deepgram.com/v1/listen`
**Authentication**: API Key (stored in Firebase Cloud Functions env)
**Pricing**: $0.0043 per minute

**Supported Languages** (MVP):
- Spanish (`es`)
- French (`fr`)
- German (`de`)
- Mandarin Chinese (`zh`)

**Request Format**:
```typescript
POST https://api.deepgram.com/v1/listen?model=nova-2&language={lang}
Headers:
  Authorization: Token {DEEPGRAM_API_KEY}
  Content-Type: audio/mp3
Body: <audio binary>
```

**Response Format**:
```json
{
  "results": {
    "channels": [{
      "alternatives": [{
        "transcript": "string",
        "confidence": 0.98,
        "words": [...]
      }]
    }]
  },
  "metadata": {
    "duration": 5.2
  }
}
```

**Cost Calculation**:
```typescript
const deepgramCost = (durationSeconds: number) => {
  return (durationSeconds / 60) * 0.0043;
};
```

**Retry Strategy**:
- Max retries: 3
- Backoff: Exponential (1s, 2s, 4s)
- Retriable errors: 5xx, network timeout
- Non-retriable: 4xx (bad audio format)

**Fallback**: If all retries fail, show user "Transcription unavailable, please try again" and allow manual text input

---

### 2. ElevenLabs (Text-to-Speech)

**Provider**: ElevenLabs
**Endpoint**: `https://api.elevenlabs.io/v1/text-to-speech/{voice_id}`
**Authentication**: API Key (header: `xi-api-key`)
**Pricing**: $0.18 per 1,000 characters

**Voice IDs** (per language):
- Spanish: `ErXwobaYiN019PkySvjV` (Antoni)
- French: `pNInz6obpgDQGcFmaJgB` (Bella)
- German: `N2lVS1w4EtoT3dr4eOWO` (Freya)
- Mandarin: `XrExE9yKIg1WjnnlVkGX` (Li)

**Request Format**:
```typescript
POST https://api.elevenlabs.io/v1/text-to-speech/{voice_id}
Headers:
  xi-api-key: {ELEVENLABS_API_KEY}
  Content-Type: application/json
Body:
{
  "text": "string (max 500 chars)",
  "model_id": "eleven_turbo_v2",
  "voice_settings": {
    "stability": 0.75,
    "similarity_boost": 0.75
  }
}
```

**Response**: Binary audio (MP3)

**Cost Calculation**:
```typescript
const elevenlabsCost = (text: string) => {
  return (text.length / 1000) * 0.18;
};
```

**Caching Strategy**:
- Cache key: `tts_${voiceId}_${md5(text)}_${language}`
- Storage: Firebase Storage + Cloudflare R2 CDN
- TTL: Permanent (pre-generated content)

**Fallback**: If generation fails, use device-native TTS (lower quality but functional)

---

### 3. D-ID (Avatar Video Generation)

**Provider**: D-ID
**Endpoint**: `https://api.d-id.com/talks`
**Authentication**: API Key (header: `x-api-key-external`)
**Pricing**: $0.30 per minute of video

**Video Quality Tiers**:
- Free users: 360p (512x288)
- Premium users: 720p (1280x720)

**Request Format** (Create Talk):
```typescript
POST https://api.d-id.com/talks
Headers:
  x-api-key-external: {DID_API_KEY}
  Content-Type: application/json
Body:
{
  "script": {
    "type": "audio",
    "audio_url": "https://storage.googleapis.com/.../audio.mp3"
  },
  "source_url": "https://storage.googleapis.com/.../avatar.jpg",
  "config": {
    "fluent": true,
    "pad_audio": 0.0,
    "result_format": "mp4"
  },
  "driver_url": "bank://lively"
}
```

**Response**:
```json
{
  "id": "talk-id-12345",
  "status": "created",
  "result_url": null
}
```

**Polling for Completion**:
```typescript
GET https://api.d-id.com/talks/{id}
// Poll every 2 seconds, max 15 seconds
// When status === "done", result_url available
```

**Cost Calculation**:
```typescript
const didCost = (audioDurationSeconds: number) => {
  return (audioDurationSeconds / 60) * 0.30;
};
```

**Caching Strategy**:
- Pre-generate 100 common responses per scenario
- Cache key: `avatar_${avatarId}_${md5(audioUrl)}_${quality}`
- 80% cache hit rate target

**Fallback Chain**:
1. If timeout (>15s): Show audio + static avatar image
2. If API failure: Show text + audio only
3. If audio also fails: Show text only with typing animation

---

### 4. OpenAI GPT-4o-mini (Conversation AI)

**Provider**: OpenAI
**Endpoint**: `https://api.openai.com/v1/chat/completions`
**Authentication**: Bearer token
**Pricing**: $0.15 per 1M input tokens, $0.60 per 1M output tokens

**Model**: `gpt-4o-mini`

**Request Format**:
```typescript
POST https://api.openai.com/v1/chat/completions
Headers:
  Authorization: Bearer {OPENAI_API_KEY}
  Content-Type: application/json
Body:
{
  "model": "gpt-4o-mini",
  "messages": [
    {
      "role": "system",
      "content": "You are a friendly language tutor teaching {targetLanguage} at {difficultyLevel} level. Current scenario: {scenarioDescription}. Provide gentle corrections and encourage the learner."
    },
    {
      "role": "user",
      "content": "User said: {transcribedText}"
    }
  ],
  "max_tokens": 150,
  "temperature": 0.7
}
```

**Response**:
```json
{
  "choices": [{
    "message": {
      "role": "assistant",
      "content": "Avatar response text"
    }
  }],
  "usage": {
    "prompt_tokens": 120,
    "completion_tokens": 45
  }
}
```

**Cost Calculation**:
```typescript
const gptCost = (promptTokens: number, completionTokens: number) => {
  return (promptTokens / 1_000_000) * 0.15 + (completionTokens / 1_000_000) * 0.60;
};
```

**Context Management**:
- Keep last 5 conversation turns in context
- Scenario context injected in system prompt
- Max tokens: 150 (keeps responses concise and cost-effective)

**Fallback**: If GPT fails, use pre-generated generic responses ("I didn't quite catch that, could you repeat?")

---

### 5. Google Veo 3 / Akool (Premium Custom Avatars)

**Provider**: Google Veo 3 (primary), Akool (fallback)
**Purpose**: Face cloning for premium users
**Pricing**: ~$2-5 per custom avatar creation (one-time)

**Veo 3 Integration** (via Google Cloud AI):
```typescript
// Simplified - actual integration via Google Cloud Vertex AI
POST https://aiplatform.googleapis.com/v1/projects/{project}/locations/{location}/endpoints/{endpoint}:predict
Headers:
  Authorization: Bearer {GOOGLE_CLOUD_ACCESS_TOKEN}
Body:
{
  "instances": [{
    "video_url": "gs://bucket/user_face_video.mp4",
    "duration": 10
  }]
}
```

**Akool Fallback**:
```typescript
POST https://api.akool.com/api/v1/face-swap
Headers:
  Authorization: Bearer {AKOOL_API_KEY}
Body:
{
  "source_video": "user_upload_url",
  "target_face": "avatar_template_id"
}
```

**Processing Time**: 3-5 minutes
**Validation**: Requires clear face visibility, proper lighting, 10-second minimum

**Status Polling**: Similar to D-ID, poll every 5 seconds for up to 5 minutes

---

## Cost Optimization Summary

### Pre-Generation Strategy

**Target**: 900 cached avatar videos (100 responses × 9 scenarios)

**Batch Processing Script** (Cloud Function, runs every 30 seconds):
```typescript
export const batchGenerateVideos = functions.pubsub.schedule('*/30 * * * *')
  .onRun(async () => {
    const pendingResponses = await firestore
      .collection('pregenQueue')
      .where('status', '==', 'pending')
      .limit(10)
      .get();

    for (const doc of pendingResponses.docs) {
      const { text, voiceId, avatarImageUrl } = doc.data();

      // Generate TTS
      const audioUrl = await elevenlabs.generate(text, voiceId);

      // Generate avatar video
      const videoUrl = await did.createTalk(audioUrl, avatarImageUrl);

      // Update cache
      await firestore.collection('scenarios').doc(doc.data().scenarioId).update({
        [`preGeneratedResponses.${text}`]: videoUrl
      });

      // Mark as complete
      await doc.ref.update({ status: 'complete' });
    }
  });
```

### Cache Hit Rate Monitoring

```typescript
const trackCacheHit = async (userId: string, fromCache: boolean) => {
  await firestore.collection('costLogs').add({
    userId,
    service: 'd-id',
    estimatedCost: fromCache ? 0 : 0.05, // Avg 10-sec video
    fromCache,
    timestamp: FieldValue.serverTimestamp()
  });
};
```

**Target**: 80% of responses served from cache
**Monitoring**: Daily reports via Cloud Function analyzing `costLogs`

---

## Circuit Breaker Implementation

To prevent cascading failures and cost spikes:

```typescript
class ServiceCircuitBreaker {
  private failures = new Map<string, number>();
  private lastFailure = new Map<string, number>();
  private readonly THRESHOLD = 5;
  private readonly TIMEOUT_MS = 60000; // 1 minute

  async call<T>(service: string, fn: () => Promise<T>): Promise<T> {
    const failures = this.failures.get(service) || 0;

    if (failures >= this.THRESHOLD) {
      const lastFail = this.lastFailure.get(service) || 0;
      if (Date.now() - lastFail < this.TIMEOUT_MS) {
        throw new Error(`Circuit breaker open for ${service}`);
      }
      // Reset after timeout
      this.failures.set(service, 0);
    }

    try {
      const result = await fn();
      this.failures.set(service, 0); // Success - reset
      return result;
    } catch (error) {
      this.failures.set(service, failures + 1);
      this.lastFailure.set(service, Date.now());
      throw error;
    }
  }
}

// Usage
const breaker = new ServiceCircuitBreaker();
const result = await breaker.call('deepgram', () => deepgram.transcribe(audioUrl));
```

---

## AI Services Contract Summary

✅ All 5 AI services integrated with specs
✅ Cost calculations defined per service
✅ Caching strategies documented
✅ Fallback chains specified
✅ Circuit breaker pattern for resilience
✅ Batch pre-generation strategy detailed

**Estimated Monthly Cost** (1000 users, 80% cache hit):
- Deepgram STT: ~$50/month
- ElevenLabs TTS: ~$100/month (20% not cached)
- D-ID Videos: ~$450/month (20% not cached)
- GPT-4o-mini: ~$80/month
- **Total**: ~$680/month = **$0.68 per user**

**Status**: AI services contract complete
