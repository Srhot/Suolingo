# SUOLINGO - Development Log

## 📅 Development Timeline

### December 14, 2024 - Real-time Avatar Service Integration (Current Session)

#### 🎯 Goal
Integrate real-time avatar services (Simli, NavTalk, Tavus) to reduce avatar video generation latency from ~10-30 seconds to ~5-6 seconds.

#### 🧪 Services Tested

**1. Simli AI - Fast Audio-to-Video**
- **API Key**: `SIMLI_API_KEY=gzhmpcgawe3lczscf7vtg`
- **Approach**: Audio-to-video conversion with TTS + base64 upload
- **Expected**: ~5-6 seconds
- **Actual**: ~20+ seconds

**Issues Encountered:**
1. ❌ **HTTP vs HTTPS**: Initial MP4 URL was HTTP, React Native blocked it
   - **Fix**: Convert HTTP → HTTPS in `SimliService.ts`

2. ❌ **Video playback error -1100**: File not found
   - **Root cause**: Video URL returned immediately but file not ready
   - **Fix**: Added `waitForVideoReady()` polling mechanism

3. ❌ **Video playback error -11850**: Codec/format incompatible
   - **Root cause**: MP4 format not compatible with AVPlayer
   - **Fix**: Switched to HLS format (`hls_url` instead of `mp4_url`)

4. ❌ **Video playback error -1008** + **Status 405**: HLS endpoint issues
   - **Root cause**: HLS endpoint doesn't accept HEAD requests for polling
   - **Result**: Polling timeout (20/20 attempts failed)

5. ❌ **Voice mismatch**: Avatar shows female face but speaks with male voice
   - **Root cause**: Using A2E TTS (male voice ID) but Simli avatar (female face ID)
   - **Solution needed**: Sync voice and face selection

**Conclusion**: Simli not production-ready for our use case

---

**2. NavTalk AI - Real-time WebSocket**
- **API Key**: `NAVTALK_API_KEY=sk_navtalk_QXKej5g2HG5CyfDg3Us1E0P9N94jWx5T`
- **Approach**: WebSocket-based real-time audio-to-audio
- **Expected**: <500ms latency

**Issues Encountered:**
1. ❌ **API Key authentication failed**
2. ❌ **Connection limit exceeded** errors during testing

**Status**: Not tested successfully, API key issues

---

**3. Tavus AI - Real-time Conversational Video**
- **API Key**: `TAVUS_API_KEY=6d0584bf48a04c20afb83941f2653884`
- **Status**: Service code written but not tested
- **Implementation**: Polling-based video generation similar to Simli

---

#### ✅ Fixes Applied

**1. SimliService.ts**
```typescript
// HTTP → HTTPS conversion
const secureVideoUrl = videoUrl.replace(/^http:\/\//i, 'https://');

// HLS format preference
const videoUrl = response.data.hls_url || response.data.mp4_url;

// Video polling mechanism
private async waitForVideoReady(videoUrl: string): Promise<void> {
  // Poll every 1 second, max 20 attempts
  // Check video availability with HEAD request
}
```

**2. ExamModeScreen.tsx**
```typescript
// Added error handlers to video player
<Video
  onError={(error) => console.error('Video playback error:', error)}
  onLoad={() => console.log('Video loaded successfully')}
/>
```

**3. app.json**
```json
// Enable HTTP traffic (fallback)
{
  "ios": {
    "infoPlist": {
      "NSAppTransportSecurity": { "NSAllowsArbitraryLoads": true }
    }
  },
  "android": {
    "usesCleartextTraffic": true
  }
}
```

---

#### 📊 Performance Comparison

| Service | Expected | Actual | Issues | Status |
|---------|----------|--------|--------|--------|
| **A2E** (Current) | 10-30s | 10-30s | None | ✅ Production |
| **Simli** | 5-6s | 20+s | Codec, polling, voice mismatch | ❌ Not ready |
| **NavTalk** | <500ms | N/A | API key auth failed | ❌ Not tested |
| **Tavus** | ~10s | N/A | Not tested | 🧪 Pending |

---

#### 🎯 Decision
**Continue with A2E for production** - It's slower but reliable and works consistently.

**Simli/NavTalk/Tavus**: Keep as experimental branches for future optimization when issues are resolved.

---

### December 10-13, 2024 - IELTS/TOEFL Exam Mode Development

#### ✅ Features Implemented

**IELTS Speaking Test (3 Parts)**
1. **Part 1**: Introduction and interview (4-5 minutes)
   - Personal questions about self, family, work, studies, interests
   - Gemini generates personalized questions based on user profile

2. **Part 2**: Individual long turn (3-4 minutes)
   - Topic card with prompts
   - 1 minute preparation time
   - 1-2 minutes speaking time

3. **Part 3**: Two-way discussion (4-5 minutes)
   - Abstract questions related to Part 2 topic
   - Opinion-based discussion

**TOEFL Speaking Test (4 Tasks)**
1. **Task 1**: Independent speaking (personal preference)
2. **Task 2**: Independent speaking (choice between options)
3. **Task 3**: Integrated task (read + listen + speak)
4. **Task 4**: Integrated task (lecture summary)

**Features:**
- Real-time recording with Expo AV
- Deepgram transcription
- Gemini AI band score estimation (IELTS: 0-9, TOEFL: 0-30)
- Avatar examiner with lip-sync video

**Files Created:**
- `src/screens/ExamModeScreen.tsx`
- Enhanced `GeminiService.ts` with exam generation methods

---

### December 7-9, 2024 - Role-Play Mode & Scenarios

#### ✅ Features Implemented

**6 Real-World Scenarios:**
1. 🍽️ **Restaurant**: User = customer, Avatar = waiter
2. 💼 **Job Interview**: User = candidate, Avatar = interviewer
3. 🛍️ **Shopping**: User = buyer, Avatar = salesperson
4. 🏥 **Doctor Visit**: User = patient, Avatar = doctor
5. 🏨 **Hotel Check-in**: User = guest, Avatar = receptionist
6. ✈️ **Airport**: User = traveler, Avatar = staff

**Features:**
- CEFR-based difficulty adaptation
- Context-aware conversation flow
- Turn-based interaction
- Gemini AI maintains role consistency

**Files Created:**
- `src/screens/ScenarioListScreen.tsx`
- `src/screens/ScenarioPlayScreen.tsx` (planned)
- `src/data/scenarios.ts`

---

### December 5-6, 2024 - Pronunciation Feedback System

#### ✅ Features Implemented

**PronunciationService.ts**
- Waveform analysis using Deepgram
- Word-level pronunciation scoring (0-100)
- Visual feedback with color coding (red, yellow, green)
- Pronunciation suggestions

**PronunciationFeedback.tsx Component**
- Word-by-word score display
- Overall accuracy percentage
- Retry mechanism for low scores

---

### December 1-4, 2024 - Core Features Development

#### ✅ Features Implemented

**AvatarScreen.tsx - Main Conversation Screen**
- 12 learning modes integration
- Dual-language translation interface
- Voice input/output
- Avatar video playback with loop animations
- CEFR level selection
- Learning mode switching UI

**Services Implemented:**
1. **A2EService.ts** - Avatar lip-sync video generation
2. **GeminiService.ts** - Conversational AI
3. **DeepgramService.ts** - Speech-to-Text
4. **ElevenLabsService.ts** - Text-to-Speech (alternative to A2E TTS)
5. **TranslationService.ts** - Turkish ↔ English translation
6. **ProgressTrackingService.ts** - User statistics and progress

**Learning Modes Config:**
- Created `/src/config/learningModes.ts`
- Dynamic mode configuration system
- Language-specific mode filtering

---

### November 25-30, 2024 - Project Setup & Foundation

#### ✅ Initial Setup

**Project Initialization:**
```bash
npx create-expo-app suolingo --template blank-typescript
cd suolingo
npm install @react-navigation/native @react-navigation/stack @react-navigation/bottom-tabs
npm install react-native-paper expo-av axios
npm install @google/generative-ai
npm install react-native-dotenv
```

**TypeScript Configuration:**
- Strict mode enabled
- Path aliases configured (`@/` → `src/`)
- ESLint + Prettier setup

**Environment Variables:**
- Created `.env.example` template
- Configured API keys for A2E, Gemini, Deepgram

**Git Repository:**
- Repository: [github.com/Srhot/Suolingo](https://github.com/Srhot/Suolingo)
- Initial commit with README

---

## 🐛 Known Issues & Workarounds

### Current Issues

1. **Real-time avatar services not production-ready**
   - Simli: Codec issues, polling timeout, voice mismatch
   - NavTalk: API key authentication failed
   - **Workaround**: Continue using A2E

2. **A2E video generation latency (10-30 seconds)**
   - **Impact**: User waits for avatar response
   - **Workaround**: Show loading indicator with progress feedback
   - **Future**: Implement caching for common phrases

3. **No caching mechanism**
   - **Impact**: Same avatar videos generated multiple times
   - **Future**: Implement video URL caching based on text hash

4. **Limited error handling for API failures**
   - **Future**: Implement retry logic, fallback mechanisms

---

## 🚀 Upcoming Development

### This Week (December 15-21, 2024)

**Priority 1: NotebookLM Integration**
- [ ] Upload all documentation to NotebookLM
- [ ] Setup NotebookLM MCP connection
- [ ] Test MCP-based context-aware development
- [ ] Complete professor's assignment using NotebookLM context

**Priority 2: A2E Optimization**
- [ ] Implement video caching system
- [ ] Prefetch common avatar responses
- [ ] Add loading progress indicator

**Priority 3: Bug Fixes**
- [ ] Fix Simli voice mismatch (if time permits)
- [ ] Improve error messages
- [ ] Add retry logic for failed API calls

### Next Week (December 22-28, 2024)

**Exam Mode Enhancements:**
- [ ] Add timer for each exam section
- [ ] Improve band score accuracy
- [ ] Add detailed feedback for each answer

**Role-Play Scenarios:**
- [ ] Complete ScenarioPlayScreen.tsx implementation
- [ ] Test all 6 scenarios end-to-end
- [ ] Add scenario completion tracking

### January 2025

**Assignment Submission:**
- [ ] Record demo video
- [ ] Prepare presentation slides
- [ ] Final testing on iOS and Android
- [ ] Submit to course platform

---

## 📝 Notes & Lessons Learned

### Technical Insights

1. **Avatar services are complex**: Real-time video generation is challenging
   - Codecs matter (MP4 vs HLS)
   - Polling mechanisms needed for async generation
   - Voice-face synchronization critical

2. **React Native video playback quirks**:
   - HTTP blocked by default (security)
   - AVPlayer codec requirements strict
   - Error handling essential for debugging

3. **AI service reliability**: Gemini very reliable, avatar services experimental

### Development Best Practices

1. **Always add error handlers** to Video components
2. **Poll asynchronous resources** before using them
3. **Log extensively** during debugging
4. **Use TypeScript strict mode** to catch errors early
5. **Keep experimental features isolated** from production code

---

**Last Updated:** December 14, 2024
**Next Update:** December 15, 2024 (Post-NotebookLM integration)
