# SUOLINGO - System Architecture

## 🏗️ Architecture Overview

SUOLINGO follows a **layered architecture** pattern with clear separation of concerns:

```
┌─────────────────────────────────────────────────────────┐
│                    Presentation Layer                    │
│          (React Native Screens & Components)             │
└─────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────┐
│                   Navigation Layer                       │
│        (React Navigation - Stack + Bottom Tabs)          │
└─────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────┐
│                   Business Logic Layer                   │
│               (Services, State Management)               │
└─────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────┐
│                    Data Layer                            │
│         (AsyncStorage, API Clients, Local Cache)         │
└─────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────┐
│                External Services Layer                   │
│   (A2E, Gemini, Deepgram, ElevenLabs, Simli, etc.)      │
└─────────────────────────────────────────────────────────┘
```

---

## 📂 Directory Structure Deep Dive

### 1. `/src/screens/` - Presentation Layer

All user-facing screens with UI components:

```typescript
screens/
├── AvatarScreen.tsx           // Main conversation screen
│   ├── Features: Translation, Conversation, Correction, Direct Practice
│   ├── Components: Video player, dual text areas, voice input, mode selector
│   ├── State: Avatar selection, learning mode, CEFR level, conversation history
│   └── Services: A2EService, GeminiService, DeepgramService, TranslationService
│
├── ExamModeScreen.tsx         // IELTS/TOEFL exam preparation
│   ├── Features: Full IELTS Speaking (3 parts), TOEFL Speaking (4 tasks)
│   ├── Components: Video player, recording controls, question display
│   ├── State: Exam mode, current part/task, questions, user answers, band score
│   └── Services: SimliService (hybrid), A2EService (fallback), GeminiService, DeepgramService
│
├── ScenarioListScreen.tsx     // Role-play scenario selection
│   ├── Features: 6 scenarios, difficulty filter, CEFR level selection
│   ├── Components: Scenario cards, search/filter, level badges
│   └── Navigation: → ScenarioPlayScreen
│
├── ScenarioPlayScreen.tsx     // Active role-play session
│   ├── Features: Assigned roles, turn-based conversation, context awareness
│   ├── Components: Video player, script hints, turn indicator
│   └── Services: GeminiService, A2EService, DeepgramService
│
├── ProgressScreen.tsx         // User progress dashboard
│   ├── Features: Conversation counter, mode usage stats, pronunciation history
│   ├── Components: Charts, badges, streak tracker, XP display
│   └── Services: ProgressTrackingService
│
└── HomeScreen.tsx             // Landing page
    ├── Features: Quick mode selection, avatar preview
    └── Navigation: → AvatarScreen, ExamModeScreen, ScenarioListScreen
```

---

### 2. `/src/services/` - Business Logic Layer

#### 2.1 AI Services (`/services/ai/`)

**GeminiService.ts** - Google Gemini AI integration
```typescript
class GeminiService {
  // Core Methods:
  generateConversationResponse(history, userInput, cefrLevel): Promise<string>
  correctSentence(sentence, language): Promise<CorrectionResult>
  generateIELTSPart1Questions(): Promise<IELTSQuestion[]>
  generateIELTSPart2Topic(): Promise<IELTSPart2Topic>
  generateIELTSPart3Questions(part2Topic): Promise<IELTSQuestion[]>
  generateTOEFLTask1(): Promise<string>
  scoreIELTSSpeaking(answers): Promise<IELTSScoring>
  scoreTOEFLSpeaking(answers): Promise<TOEFLScoring>

  // Features:
  // - Context-aware conversations
  // - CEFR-adapted responses
  // - Grammar correction with Turkish explanations
  // - Exam question generation
  // - Band score estimation
}
```

#### 2.2 Avatar Services (`/services/avatar/`)

**A2EService.ts** - Primary avatar lip-sync service (Production)
```typescript
class A2EService {
  createLipsync(text, avatar, language): Promise<string>
  // - Generates lip-sync video from text
  // - Uses A2E TTS + video generation
  // - Returns video URL
  // - Processing time: ~10-30 seconds
  // - Status: ✅ Reliable, Production-ready
}
```

**SimliService.ts** - Fast audio-to-video avatar (Experimental)
```typescript
class SimliService implements IAvatarService {
  createResponse(text, avatar, language): Promise<string>
  waitForVideoReady(videoUrl): Promise<void>

  // Process:
  // 1. Generate TTS audio (via A2E)
  // 2. Convert audio to base64
  // 3. Send to Simli API
  // 4. Poll for video readiness (HLS preferred)
  // 5. Return video URL

  // Issues encountered:
  // - Voice mismatch (TTS voice ≠ avatar face)
  // - Polling timeout (20+ seconds)
  // - HLS endpoint returns 405 on HEAD requests
  // - Video playback errors (codec issues)
  // Status: 🧪 Experimental, not production-ready
}
```

**NavTalkService.ts** - Real-time WebSocket avatar (Experimental)
```typescript
class NavTalkService implements IAvatarService {
  initializeConnection(): Promise<void>
  createResponse(text, avatar, language): Promise<string>

  // Features:
  // - Sub-500ms latency
  // - WebSocket-based real-time communication
  // - Audio-to-audio processing
  // - 60+ languages support

  // Issues:
  // - API key authentication failed
  // - Connection limit exceeded errors
  // Status: 🧪 Experimental, authentication issues
}
```

**TavusService.ts** - Real-time conversational video (Experimental)
```typescript
class TavusService implements IAvatarService {
  createResponse(text, avatar, language): Promise<string>
  waitForVideoReady(videoId): Promise<string>

  // Process:
  // 1. Create video with script
  // 2. Poll video status (every 2 seconds, max 15 attempts)
  // 3. Return video URL when ready

  // Features:
  // - Real-time video conversations
  // - AI-powered personas
  // - Low latency streaming
  // Status: 🧪 Experimental, not tested
}
```

**IAvatarService.ts** - Avatar service interface
```typescript
interface IAvatarService {
  createResponse(text, avatar, language): Promise<string>
  isRealtime(): boolean
  getServiceName(): string
  initialize?(): Promise<void>
  cleanup?(): Promise<void>
}

// Factory function for service selection
createAvatarService(useRealtime: boolean): Promise<IAvatarService>
```

#### 2.3 Voice Services (`/services/voice/`)

**DeepgramService.ts** - Speech-to-Text
```typescript
class DeepgramService {
  transcribeAudio(audioUri: string): Promise<string>

  // Features:
  // - Supports Turkish + English
  // - WAV format input
  // - ~2 second processing time
  // - Smart formatting
}
```

**ElevenLabsService.ts** - Text-to-Speech
```typescript
class ElevenLabsService {
  generateSpeech(text, voice, language): Promise<string>
  getVoiceForGender(gender): ElevenLabsVoice

  // Features:
  // - Natural voice synthesis
  // - Multi-voice support (male/female)
  // - Turkish + English
  // - Status: Available but A2E TTS preferred
}
```

**PronunciationService.ts** - Pronunciation analysis
```typescript
class PronunciationService {
  analyzePronunciation(audioUri, targetText, language): Promise<PronunciationResult>

  // Returns:
  // - Accuracy score (0-100)
  // - Word-level scores
  // - Suggestions for improvement
}
```

#### 2.4 Translation Service (`/services/translation/`)

**TranslationService.ts**
```typescript
class TranslationService {
  translate(text, sourceLang, targetLang): Promise<string>
  detectLanguage(text): Promise<string>

  // Supported: Turkish ↔ English
}
```

#### 2.5 Progress Tracking (`/services/progress/`)

**ProgressTrackingService.ts**
```typescript
class ProgressTrackingService {
  trackConversation(mode, cefrLevel, duration): Promise<void>
  trackPronunciation(word, score): Promise<void>
  getStats(): Promise<UserStats>

  // Stores:
  // - Conversation count by mode
  // - Pronunciation history
  // - Daily streaks
  // - XP and badges

  // Storage: AsyncStorage (local)
}
```

---

### 3. `/src/types/` - TypeScript Definitions

**Avatar.ts**
```typescript
interface Avatar {
  id: string;
  name: string;
  gender: 'male' | 'female';
  anchorId: string;  // A2E anchor ID
  ttsId: string;     // A2E TTS voice ID
  image: string;
  loopVideo?: string;
}

interface ConversationMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}
```

**User.ts**
```typescript
interface UserProfile {
  id: string;
  name: string;
  targetLanguage: LanguageCode;
  nativeLanguage: LanguageCode;
  cefrLevel: CEFRLevel;
  createdAt: Date;
}

type CEFRLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
```

**Translation.ts**
```typescript
type LanguageCode = 'en' | 'tr' | 'de' | 'es' | 'fr' | 'it' | 'ja' | 'ko' | 'zh';

interface TranslationRequest {
  text: string;
  sourceLang: LanguageCode;
  targetLang: LanguageCode;
}
```

---

### 4. `/src/config/` - Configuration Files

**learningModes.ts** - Learning mode definitions
```typescript
interface LearningMode {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  supportedLanguages: LanguageCode[];
  requiresCEFR: boolean;
}

// Modes: translation, conversation, correction, role-play, exam, etc.
```

---

### 5. `/src/navigation/` - Navigation Structure

**Navigation Hierarchy:**
```
App
├── BottomTabNavigator
│   ├── HomeStack
│   │   ├── HomeScreen
│   │   └── AvatarScreen
│   ├── ExamStack
│   │   └── ExamModeScreen
│   ├── ScenarioStack
│   │   ├── ScenarioListScreen
│   │   └── ScenarioPlayScreen
│   └── ProgressStack
│       └── ProgressScreen
```

**types.ts** - Navigation type definitions
```typescript
type HomeStackParamList = {
  Home: undefined;
  Avatar: { mode?: string; cefrLevel?: CEFRLevel };
  ScenarioList: undefined;
  ScenarioPlay: { scenario: RolePlayScenario; cefrLevel: CEFRLevel };
};
```

---

## 🔄 Data Flow Architecture

### Example: User sends voice message in Conversation Mode

```
1. User presses 🎤 microphone button
   └─> AvatarScreen.tsx: handleStartRecording()

2. Record audio (WAV format, 16kHz)
   └─> expo-av: Audio.Recording.createAsync()

3. Stop recording, get audio URI
   └─> AvatarScreen.tsx: handleStopRecording()

4. Send audio to Deepgram STT
   └─> DeepgramService.ts: transcribeAudio(audioUri)
   └─> API: POST https://api.deepgram.com/v1/listen
   └─> Returns: "What's your favorite food?"

5. Update UI with transcribed text
   └─> AvatarScreen.tsx: setConversationInput(transcript)

6. Send to Gemini AI for response
   └─> GeminiService.ts: generateConversationResponse(history, userInput, cefrLevel)
   └─> API: POST https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent
   └─> Returns: "That's an interesting question! I love pizza because..."

7. Generate avatar video response
   └─> A2EService.ts: createLipsync(aiResponse, avatar, 'en')
   └─> API: POST https://video.a2e.ai/api/v1/video/send_tts (TTS)
   └─> API: POST https://video.a2e.ai/api/v1/video/send (Video generation)
   └─> Returns: Video URL

8. Play avatar video
   └─> AvatarScreen.tsx: setCurrentVideoUrl(videoUrl)
   └─> expo-av: <Video source={{ uri: videoUrl }} shouldPlay />

9. Track conversation in progress
   └─> ProgressTrackingService.ts: trackConversation('conversation', cefrLevel, duration)
   └─> AsyncStorage: Save stats
```

---

## 🔐 Environment Configuration

**.env file structure:**
```env
# Core Services
GEMINI_API_KEY=AIzaSy...
A2E_API_KEY=sk_eyJhbGc...
DEEPGRAM_API_KEY=aa71f39...

# Optional Services
ELEVENLABS_API_KEY=sk_b7fad...
GOOGLE_CLOUD_API_KEY=AIzaSy...

# Experimental Avatar Services
SIMLI_API_KEY=gzhmpcg...
NAVTALK_API_KEY=sk_navtalk_...
TAVUS_API_KEY=6d0584b...

# Service URLs
DEEPGRAM_BASE_URL=https://api.deepgram.com
ELEVENLABS_BASE_URL=https://api.elevenlabs.io
A2E_BASE_URL=https://video.a2e.ai
```

---

## 📊 State Management

**Local State (React useState):**
- Component-specific UI state
- Form inputs, loading states
- Video playback state

**Global State (Redux Toolkit - if needed):**
- User profile (CEFR level, target language)
- Application settings
- Authentication state (future)

**Persistent Storage (AsyncStorage):**
- User progress statistics
- Conversation history (recent)
- Pronunciation scores
- Badges and achievements

---

## 🧪 Testing Strategy

**Current Status:** Manual testing only

**Planned:**
- Unit tests for services (Jest)
- Integration tests for API calls
- E2E tests for critical flows (Detox)
- Performance testing (avatar generation time)

---

## 🚀 Deployment Architecture

**Current:** Development build (Expo Go)

**Production Plan:**
1. **Expo Application Services (EAS)**
   - Build APK/IPA
   - Over-the-air updates

2. **App Store Distribution**
   - iOS: Apple App Store
   - Android: Google Play Store

3. **Backend Services** (Future)
   - Firebase for authentication
   - Cloud Firestore for user data
   - Cloud Storage for custom avatars

---

## 📈 Performance Considerations

**Current Bottlenecks:**
1. **Avatar video generation**: 10-30 seconds (A2E)
2. **STT processing**: ~2 seconds (Deepgram)
3. **AI response**: ~3-5 seconds (Gemini)

**Optimization Strategies:**
1. **Caching**: Cache frequently used avatar videos
2. **Prefetching**: Generate avatar intro videos on app start
3. **Streaming**: Use HLS streaming for faster video playback
4. **Real-time services**: Migrate to NavTalk/Tavus when stable

---

**Last Updated:** December 14, 2024
**Document Version:** 1.0
