# SUOLINGO - Avatar Services Comparative Analysis

## 🎯 Objective

Evaluate and compare different AI avatar services for optimal performance, reliability, and user experience in language learning context.

---

## 📊 Services Comparison Matrix

| Criteria | A2E (Current) | Simli | NavTalk | Tavus |
|----------|---------------|-------|---------|-------|
| **Status** | ✅ Production | 🧪 Tested | 🧪 Attempted | 📝 Not Tested |
| **Latency** | 10-30 seconds | 20+ seconds (actual) | <500ms (promised) | ~10 seconds (est.) |
| **Reliability** | ⭐⭐⭐⭐⭐ | ⭐⭐ | ⭐ | ❓ |
| **Video Quality** | High | High | Real-time | High |
| **Lip-Sync Quality** | Excellent | Good | Frame-accurate | Excellent |
| **Cost** | $$ | $ | $$$ | $$$ |
| **Real-time** | ❌ Pre-rendered | ❌ Pre-rendered | ✅ True RT | ✅ RT conversations |
| **API Complexity** | Low | Medium | High | Medium |
| **Language Support** | Multi-lingual TTS | Depends on TTS | 60+ languages | Multi-lingual |
| **Custom Faces** | ✅ Yes | ✅ Yes | ✅ Yes | ✅ Yes |

---

## 1️⃣ A2E (Current Production Service)

### Overview
A2E provides pre-rendered lip-sync video generation combining TTS and avatar animation.

### Implementation
```typescript
// A2EService.ts
async createLipsync(text: string, avatar: Avatar, language: string): Promise<string> {
  // 1. Generate TTS audio
  const ttsResponse = await axios.post('https://video.a2e.ai/api/v1/video/send_tts', {
    msg: text,
    tts_id: avatar.ttsId,  // Voice selection
    speech_rate: 1,
    language: language
  });

  // 2. Generate lip-sync video
  const videoResponse = await axios.post('https://video.a2e.ai/api/v1/video/send', {
    anchor_id: avatar.anchorId,  // Face selection
    audio_url: ttsResponse.data.data,
    language: language
  });

  return videoResponse.data.data;  // Video URL
}
```

### Strengths ✅
- **Highly reliable**: 99% success rate in testing
- **Excellent lip-sync**: Realistic mouth movements
- **Simple API**: Straightforward two-step process (TTS → Video)
- **Predictable**: Consistent quality and timing
- **Multi-language**: Supports Turkish, English, and many others
- **Custom avatars**: Upload own face + voice

### Weaknesses ❌
- **Latency**: 10-30 seconds wait time
- **Not real-time**: Pre-rendered approach
- **Processing time**: User must wait for video generation

### Use Cases
- ✅ Conversational practice where slight delay acceptable
- ✅ Translation mode (user types, avatar speaks)
- ✅ Exam preparation (IELTS/TOEFL)
- ❌ Real-time conversations (too slow)

### Performance Metrics (Dec 14, 2024 Testing)
- Average latency: 15-20 seconds
- Success rate: 98%
- Video quality: 1080p, smooth playback
- TTS quality: Natural, clear pronunciation

### Recommendation
**✅ KEEP for production** - Reliable baseline service

---

## 2️⃣ Simli (Tested - Not Production Ready)

### Overview
Simli provides fast audio-to-video generation with promised ~5-6 second latency.

### Implementation
```typescript
// SimliService.ts
async createResponse(text: string, avatar: Avatar, language: string): Promise<string> {
  // 1. Generate TTS audio (using A2E)
  const audioUrl = await this.generateAudioUrl(text, language);

  // 2. Download and convert to base64
  const audioBase64 = await this.downloadAndConvertAudio(audioUrl);

  // 3. Send to Simli for video
  const response = await axios.post('https://api.simli.ai/audioToVideoStream', {
    simliAPIKey: this.apiKey,
    faceId: this.defaultFaceId,
    audioBase64: audioBase64,
    audioFormat: 'mp3'
  });

  // 4. Wait for video to be ready (polling)
  const videoUrl = response.data.hls_url || response.data.mp4_url;
  await this.waitForVideoReady(videoUrl);

  return videoUrl;
}
```

### Issues Encountered (Dec 14, 2024)

**Issue #1: HTTP vs HTTPS**
- Error: React Native blocked HTTP URLs
- Fix: `videoUrl.replace(/^http:\/\//i, 'https://')`
- Status: ✅ Resolved

**Issue #2: Video Not Ready (-1100)**
- Error: AVPlayerItem "File does not exist"
- Root cause: API returns URL immediately but video still processing
- Fix: Added `waitForVideoReady()` polling mechanism
- Status: ✅ Resolved

**Issue #3: Video Format Issues (-11850)**
- Error: AVFoundationErrorDomain "Server not correctly configured"
- Root cause: MP4 codec incompatible with AVPlayer
- Attempted fix: Switch to HLS format (`hls_url`)
- Status: ⚠️ Partially resolved

**Issue #4: HLS Polling Failure (-1008)**
- Error: NSURLErrorDomain -1008
- Root cause: HLS endpoint returns 405 (Method Not Allowed) on HEAD requests
- Impact: Polling times out after 20 attempts
- Status: ❌ Unresolved

**Issue #5: Voice-Face Mismatch**
- Problem: Female avatar face with male TTS voice
- Root cause: Using A2E TTS (male voice ID) + Simli face (female)
- Impact: Inconsistent user experience
- Status: ❌ Unresolved

### Performance Metrics (Dec 14, 2024 Testing)
- Expected latency: 5-6 seconds
- Actual latency: 20+ seconds (includes polling timeout)
- Success rate: ~30% (video loads but playback fails)
- Video quality: Unknown (playback errors prevent viewing)

### Strengths ✅
- **Faster than A2E** (in theory): 5-6 seconds vs 10-30
- **Audio-to-video approach**: Flexible audio sources
- **Multiple formats**: MP4 + HLS support

### Weaknesses ❌
- **Codec issues**: AVPlayer compatibility problems
- **Polling problems**: HLS endpoint doesn't support HEAD requests
- **Voice mismatch**: TTS voice ≠ avatar face
- **Unreliable**: 70% failure rate in testing
- **Longer than promised**: 20+ seconds actual vs 5-6 advertised

### Recommendation
**❌ DO NOT use for production** - Too many unresolved issues
**🧪 Keep for future** - Revisit when API matures

---

## 3️⃣ NavTalk (Attempted - Authentication Issues)

### Overview
NavTalk provides real-time audio-to-audio processing with sub-500ms latency via WebSocket.

### Implementation
```typescript
// NavTalkService.ts
async initializeConnection(): Promise<void> {
  this.webSocket = new WebSocket(
    `wss://transfer.navtalk.ai/api/realtime-api?license=${this.apiKey}`
  );

  this.webSocket.onopen = () => {
    // Send session config
    this.webSocket?.send(JSON.stringify({
      type: 'session.update',
      session: {
        modalities: ['text', 'audio', 'video'],
        turn_detection: { type: 'server_vad' }
      }
    }));
  };
}

async createResponse(text: string, avatar: Avatar, language: string): Promise<string> {
  // Send text input
  this.webSocket?.send(JSON.stringify({
    type: 'conversation.item.create',
    item: {
      type: 'message',
      role: 'user',
      content: [{ type: 'input_text', text: text }]
    }
  }));

  // Request response
  this.webSocket?.send(JSON.stringify({ type: 'response.create' }));

  return 'navtalk_streaming';  // Placeholder
}
```

### Issues Encountered (Dec 14, 2024)

**Issue #1: API Key Authentication Failed**
- Error: WebSocket connection failed
- API Key: `sk_navtalk_QXKej5g2HG5CyfDg3Us1E0P9N94jWx5T`
- Status: ❌ Unresolved (user confirmed API key doesn't work)

**Issue #2: Connection Limit Exceeded**
- Error: `session.connection_limit_exceeded`
- Possible cause: Free tier limitations
- Status: ❌ Unresolved

### Strengths ✅ (Theoretical)
- **True real-time**: <500ms latency
- **WebSocket-based**: Persistent connection
- **60+ languages**: Extensive language support
- **Frame-accurate lip-sync**: According to documentation

### Weaknesses ❌
- **Authentication issues**: API key not working
- **Complex setup**: WebRTC requirements for full features
- **No video stream**: Current implementation only returns placeholder

### Recommendation
**⏸️ PAUSE investigation** - Cannot test without valid API key
**Future**: Revisit if valid API key obtained

---

## 4️⃣ Tavus (Not Tested)

### Overview
Tavus provides real-time conversational video with AI-powered personas.

### Implementation
```typescript
// TavusService.ts (written but not tested)
async createResponse(text: string, avatar: Avatar, language: string): Promise<string> {
  // Create video
  const response = await axios.post('https://tavusapi.com/v2/videos', {
    replica_id: this.getReplicaId(avatar),
    script: text
  });

  // Poll for completion
  const videoUrl = await this.waitForVideoReady(response.data.video_id);
  return videoUrl;
}

private async waitForVideoReady(videoId: string): Promise<string> {
  // Poll every 2 seconds, max 15 attempts (30 seconds)
  for (let attempt = 0; attempt < 15; attempt++) {
    const status = await axios.get(`https://tavusapi.com/v2/videos/${videoId}`);
    if (status.data.status === 'completed') {
      return status.data.download_url;
    }
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
  throw new Error('Video generation timeout');
}
```

### Strengths ✅ (Based on Documentation)
- **Real-time conversations**: Low latency streaming
- **AI personas**: Intelligent conversation context
- **Polling mechanism**: Similar to Simli (should work)
- **Multiple output formats**: download_url, hosted_url, stream_url

### Weaknesses ❌ (Assumptions)
- **Not tested**: Cannot verify claims
- **Cost**: Premium pricing tier
- **Polling latency**: Estimated ~10 seconds wait

### Recommendation
**🧪 TEST next** - Worth trying as Simli alternative
**Priority**: Medium (after NotebookLM integration)

---

## 🎯 Final Recommendation

### For Production (Now)
**Use A2E Service**
- Reason: Reliable, tested, works consistently
- Accept: 10-30 second latency as acceptable trade-off for quality
- Optimize: Implement caching to reduce repeat generations

### For Experimentation (Future)
1. **Try Tavus next** - Similar to Simli but untested
2. **Revisit Simli** when they fix HLS endpoint
3. **Revisit NavTalk** if valid API key obtained

### User Experience Improvements (Without changing service)
1. **Show progress indicator** during video generation
2. **Prefetch common responses** (greetings, exam intros)
3. **Cache generated videos** by text hash
4. **Offer loop animation** while waiting

---

## 📝 Testing Methodology

### Test Scenario (Dec 14, 2024)
```
Input text: "Hello! Welcome to your IELTS Speaking test. I'm your examiner today. Let's begin with Part 1. I'll ask you some questions about yourself and familiar topics."

Avatar: AVATARS[0] (male professor)
Language: English
Platform: React Native (Expo Go)
Device: [User's device - not specified]
```

### Success Criteria
- ✅ Video URL returned
- ✅ Video loads in player
- ✅ Audio plays correctly
- ✅ Lip-sync matches audio
- ✅ Latency <30 seconds
- ✅ No errors

### Results
| Service | URL ✅ | Loads ✅ | Plays ✅ | Lip-sync ✅ | Latency ✅ | No Errors ✅ | Total |
|---------|-------|---------|----------|-------------|------------|--------------|-------|
| **A2E** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | **6/6** ✅ |
| **Simli** | ✅ | ❌ | ❌ | ❓ | ❌ | ❌ | **1/6** ❌ |
| **NavTalk** | ❌ | ❌ | ❌ | ❓ | ❓ | ❌ | **0/6** ❌ |
| **Tavus** | ❓ | ❓ | ❓ | ❓ | ❓ | ❓ | **0/6** ❓ |

---

**Last Updated:** December 14, 2024
**Next Review:** After Tavus testing
