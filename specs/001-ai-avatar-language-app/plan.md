# Implementation Plan: AI Avatar Language Learning Application

**Branch**: `001-ai-avatar-language-app` | **Date**: 2025-10-27 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-ai-avatar-language-app/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

SUOLINGO is an AI-powered language learning mobile application that enables users to practice conversational skills with customizable AI avatars. The app provides real-time speech-to-text transcription, AI-generated contextual responses, and synchronized avatar video playback with lip-sync and facial expressions. Core features include scenario-based learning modules (Restaurant, Travel, Business), progress tracking with gamification (XP, badges, streaks), and premium custom avatar creation using face/voice cloning. The system implements aggressive cost optimization through pre-generated response caching (80% cache hit rate target), smart fallback mechanisms (video → audio → text), and tiered video quality (360p free, 720p premium).

## Technical Context

**Language/Version**: TypeScript 5.3+ (strict mode), React Native 0.74 with Expo SDK 51
**Primary Dependencies**:
- State Management: Redux Toolkit
- Navigation: React Navigation 6
- UI Framework: React Native Paper (Material Design 3)
- Media: expo-av (audio/video playback)
- Backend: Firebase (Authentication, Firestore, Cloud Functions, Storage)

**Storage**:
- Primary: Firebase Firestore (user profiles, progress data, scenario metadata)
- Binary: Firebase Storage (audio files, cached avatar videos)
- CDN: Cloudflare R2 for global video distribution
- Local: AsyncStorage for offline caching and pre-downloaded scenarios

**Testing**: Jest + React Native Testing Library for unit/integration tests, Detox for E2E tests, minimum 70% coverage required

**Target Platform**: iOS 13+ and Android 8+ mobile devices (mid-range device performance baseline)

**Project Type**: Mobile application (React Native cross-platform)

**Performance Goals**:
- App launch to first avatar display: ≤3 seconds
- Speech-to-text transcription: ≤2 seconds per utterance
- Avatar video generation: ≤15 seconds (with fallback to audio-only)
- Screen transitions: <300ms
- Offline mode: Support 3+ complete scenarios locally

**Constraints**:
- Cost per free-tier user: <$5/month average
- 80% of responses must be served from pre-generated cache
- 5 scenarios/day limit for free users
- GDPR compliance for voice/face data
- API keys must never be exposed in client code
- Offline-first architecture for core learning features

**Scale/Scope**:
- Initial launch: 1,000 concurrent users capacity
- Target: 4 languages (Spanish, French, German, Mandarin)
- Content: 3 scenario categories × 3 difficulty levels = 9 base scenarios
- Pre-generated content: ~100 common responses per scenario = ~900 cached videos
- Premium features: Custom avatar creation (face/voice cloning)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### I. Technical Standards - ✅ PASS

- ✅ React Native with Expo framework specified
- ✅ TypeScript with strict mode enabled
- ✅ Functional components with hooks (React Native Paper + modern React patterns)
- ✅ Offline-first architecture (AsyncStorage + local scenario caching)
- ✅ 70% test coverage requirement documented (Jest + Detox)

### II. Architecture - ✅ PASS

- ✅ Modular AI service layer planned:
  - `src/services/stt/` (Deepgram speech-to-text)
  - `src/services/tts/` (ElevenLabs text-to-speech)
  - `src/services/avatar/` (D-ID video generation)
  - `src/services/ai/` (GPT-4o-mini conversation)
- ✅ Independent service operation with Firebase Cloud Functions as orchestration layer
- ✅ Fallback mechanisms: video → audio+image → text-only
- ✅ Retry logic with exponential backoff for all AI API calls (configured per service)

### III. Cost Control - ✅ PASS

- ✅ Cost tracking: Firebase Cloud Functions log all API calls with metrics (service, tokens, cost, timestamp, userID)
- ✅ Daily limits: 5 scenarios/day for free users enforced via Firestore rules
- ✅ Monthly limits: Tracked in user profile document
- ✅ Rate limiting: Firebase Security Rules + Cloud Functions middleware
- ✅ Pre-generation: 100 responses per scenario (900 total cached videos)
- ✅ Multi-level caching: AsyncStorage (device) + Firebase Storage + Cloudflare R2 (CDN)
- ✅ Freemium enforcement: User tier tracked in Firestore with validation on all AI operations

### IV. Security - ✅ PASS

- ✅ API keys in backend only: All AI service credentials stored in Firebase Cloud Functions environment variables
- ✅ Client proxies through Firebase: All external AI API calls routed via Cloud Functions
- ✅ GDPR compliance:
  - Explicit consent flow during onboarding
  - Data retention policies enforced (auto-delete after 30 days of inactivity)
  - User data deletion endpoint in Cloud Functions
- ✅ Content moderation: Firebase Extensions for inappropriate content detection on user speech transcriptions

### V. Performance - ✅ PASS

- ✅ Initial load ≤3 seconds: Expo optimized bundle + lazy loading of scenario content
- ✅ Screen transitions <300ms: React Navigation 6 native animations + Redux Toolkit optimized state updates
- ✅ Progress indicators: Custom loading components with percentage for video generation (expo-av progress events)
- ✅ Timeout handling: All network requests have 15-second timeouts with automatic fallback
- ✅ Offline mode: AsyncStorage caching + pre-downloaded scenarios with offline detection

**Constitution Status**: ✅ ALL GATES PASSED - No violations, proceeding to Phase 0

## Project Structure

### Documentation (this feature)

```text
specs/001-ai-avatar-language-app/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
│   ├── api-endpoints.md
│   ├── firebase-schema.md
│   └── ai-services.md
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
suolingo/
├── src/
│   ├── components/
│   │   ├── Avatar/
│   │   │   ├── AvatarPlayer.tsx       # Video/audio playback with fallbacks
│   │   │   ├── AvatarSelector.tsx     # Random/gallery avatar selection
│   │   │   └── CustomAvatarCreator.tsx # Premium: face/voice upload
│   │   ├── Conversation/
│   │   │   ├── MessageBubble.tsx      # Chat UI for user/avatar messages
│   │   │   ├── SpeechInput.tsx        # Microphone button + STT feedback
│   │   │   └── LoadingIndicator.tsx   # Video generation progress
│   │   ├── Learning/
│   │   │   ├── ScenarioCard.tsx       # Scenario selection UI
│   │   │   ├── ProgressDashboard.tsx  # XP, levels, skill breakdown
│   │   │   └── AchievementBadge.tsx   # Gamification badges
│   │   └── Common/
│   │       ├── OfflineIndicator.tsx   # Network status banner
│   │       └── UsageLimitBanner.tsx   # Free tier limit warnings
│   ├── services/
│   │   ├── stt/
│   │   │   ├── DeepgramService.ts     # Speech-to-text API integration
│   │   │   └── STTFallback.ts         # Local transcription fallback
│   │   ├── tts/
│   │   │   ├── ElevenLabsService.ts   # Text-to-speech API integration
│   │   │   └── TTSCache.ts            # Audio caching logic
│   │   ├── avatar/
│   │   │   ├── DIDService.ts          # D-ID video generation
│   │   │   ├── VeoAkoolService.ts     # Premium: Custom avatar creation
│   │   │   └── VideoCache.ts          # Multi-tier video caching
│   │   ├── ai/
│   │   │   ├── GPTService.ts          # GPT-4o-mini conversation
│   │   │   └── ResponseCache.ts       # Pre-generated response management
│   │   ├── firebase/
│   │   │   ├── AuthService.ts         # Firebase Authentication wrapper
│   │   │   ├── FirestoreService.ts    # Database CRUD operations
│   │   │   └── StorageService.ts      # File upload/download
│   │   ├── cost/
│   │   │   ├── CostTracker.ts         # AI API cost calculation
│   │   │   └── UsageLimiter.ts        # Free tier enforcement
│   │   └── offline/
│   │       ├── SyncManager.ts         # Offline-to-online sync
│   │       └── CacheManager.ts        # AsyncStorage management
│   ├── store/
│   │   ├── slices/
│   │   │   ├── userSlice.ts           # User profile, tier, usage
│   │   │   ├── conversationSlice.ts   # Active conversation state
│   │   │   ├── progressSlice.ts       # XP, levels, achievements
│   │   │   └── scenarioSlice.ts       # Available scenarios, completion
│   │   └── store.ts                   # Redux Toolkit configuration
│   ├── navigation/
│   │   ├── AppNavigator.tsx           # Root navigation structure
│   │   ├── AuthNavigator.tsx          # Login/signup flows
│   │   └── MainNavigator.tsx          # Tab navigation (Learn, Progress, Profile)
│   ├── screens/
│   │   ├── ConversationScreen.tsx     # Main learning interaction
│   │   ├── ScenarioListScreen.tsx     # Browse scenarios
│   │   ├── ProgressScreen.tsx         # Stats, achievements, streaks
│   │   └── ProfileScreen.tsx          # Settings, premium upgrade
│   ├── hooks/
│   │   ├── useSTT.ts                  # Speech-to-text hook
│   │   ├── useTTS.ts                  # Text-to-speech hook
│   │   ├── useAvatar.ts               # Avatar video management
│   │   └── useOffline.ts              # Offline state detection
│   ├── types/
│   │   ├── User.ts                    # User data models
│   │   ├── Scenario.ts                # Scenario/message models
│   │   └── Progress.ts                # Progress tracking models
│   └── utils/
│       ├── costCalculator.ts          # AI cost estimation formulas
│       ├── fallbackManager.ts         # Smart fallback decision logic
│       └── retryLogic.ts              # Exponential backoff implementation
├── firebase/
│   └── functions/
│       ├── src/
│       │   ├── api/
│       │   │   ├── sttProxy.ts        # Deepgram API proxy
│       │   │   ├── ttsProxy.ts        # ElevenLabs API proxy
│       │   │   ├── avatarProxy.ts     # D-ID API proxy
│       │   │   └── aiProxy.ts         # GPT API proxy
│       │   ├── cost/
│       │   │   ├── costLogger.ts      # Log AI costs to Firestore
│       │   │   └── reportGenerator.ts # Daily/monthly cost reports
│       │   ├── moderation/
│       │   │   └── contentFilter.ts   # Inappropriate content detection
│       │   └── batch/
│       │       └── pregenerate.ts     # Batch video generation (every 30s)
│       └── index.ts                   # Cloud Functions entry point
├── tests/
│   ├── unit/
│   │   ├── services/                  # Service layer unit tests
│   │   ├── components/                # Component unit tests
│   │   └── utils/                     # Utility function tests
│   ├── integration/
│   │   ├── conversation-flow.test.ts  # End-to-end conversation tests
│   │   ├── offline-sync.test.ts       # Offline mode tests
│   │   └── cost-tracking.test.ts      # Cost calculation tests
│   └── e2e/
│       └── main-flow.e2e.ts           # Detox E2E tests
├── assets/
│   ├── avatars/                       # Default avatar images
│   ├── icons/                         # App icons, badges
│   └── scenarios/                     # Pre-generated scenario content
├── app.json                           # Expo configuration
├── package.json                       # Dependencies
├── tsconfig.json                      # TypeScript strict configuration
└── jest.config.js                     # Jest testing configuration
```

**Structure Decision**: Mobile application structure selected due to React Native cross-platform target. Frontend code lives in `src/` with feature-based organization (components, services, screens). Backend logic is in `firebase/functions/` for serverless Cloud Functions acting as API proxy and orchestration layer. This structure separates concerns while keeping all AI service credentials server-side per Security principle IV.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

No constitution violations detected - this section intentionally left empty.
