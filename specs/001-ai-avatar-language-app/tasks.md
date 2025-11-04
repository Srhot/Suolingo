# Tasks: AI Avatar Language Learning Application

**Feature Branch**: `001-ai-avatar-language-app`
**Input**: Design documents from `/specs/001-ai-avatar-language-app/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/ (all complete)

**Tests**: NOT requested in spec.md - tests are excluded from tasks below

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story?] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, US3, US4)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [X] T001 Initialize React Native project with Expo SDK 51 at suolingo/ root
- [X] T002 [P] Configure TypeScript 5.3+ with strict mode in tsconfig.json
- [X] T003 [P] Install core dependencies: react-native-paper, react-navigation, redux-toolkit, expo-av
- [X] T004 [P] Setup ESLint and Prettier with React Native rules in .eslintrc.js
- [X] T005 [P] Create project directory structure per plan.md (src/components, src/services, src/store, firebase/functions)
- [X] T006 Configure app.json with Expo configuration and permissions (microphone, storage)
- [X] T007 [P] Initialize Firebase project and add firebase configuration files
- [X] T008 [P] Setup Firebase Cloud Functions project structure in firebase/functions/

**Checkpoint**: Project scaffolding complete - foundational work can begin

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

### Firebase Backend Setup

- [ ] T009 Configure Firebase Authentication with email/password provider
- [ ] T010 Create Firestore collections schema from contracts/firebase-schema.md (users, avatars, scenarios, conversations, progress, achievements, costLogs)
- [ ] T011 Deploy Firestore Security Rules from contracts/firebase-schema.md to Firebase
- [ ] T012 [P] Deploy Firebase Storage Security Rules from contracts/firebase-schema.md
- [ ] T013 Create composite indexes in firestore.indexes.json per contracts/firebase-schema.md
- [ ] T014 [P] Setup Firebase Cloud Functions environment variables for AI service API keys (Deepgram, ElevenLabs, D-ID, OpenAI)

### Core Services Layer

- [ ] T015 Implement Firebase AuthService wrapper in src/services/firebase/AuthService.ts
- [ ] T016 [P] Implement FirestoreService for CRUD operations in src/services/firebase/FirestoreService.ts
- [ ] T017 [P] Implement StorageService for file upload/download in src/services/firebase/StorageService.ts
- [ ] T018 Implement retry logic utility with exponential backoff in src/utils/retryLogic.ts
- [ ] T019 [P] Implement circuit breaker pattern in src/utils/circuitBreaker.ts
- [ ] T020 [P] Implement cost calculator utility in src/utils/costCalculator.ts

### State Management Setup

- [ ] T021 Configure Redux Toolkit store in src/store/store.ts
- [ ] T022 [P] Create userSlice for user profile and tier state in src/store/slices/userSlice.ts
- [ ] T023 [P] Create scenarioSlice for scenarios management in src/store/slices/scenarioSlice.ts

### Offline Infrastructure

- [ ] T024 Implement SyncManager for offline-to-online sync in src/services/offline/SyncManager.ts
- [ ] T025 [P] Implement CacheManager for AsyncStorage management in src/services/offline/CacheManager.ts
- [ ] T026 Create useOffline hook for network detection in src/hooks/useOffline.ts

### Navigation Setup

- [ ] T027 Create root navigation structure in src/navigation/AppNavigator.tsx
- [ ] T028 [P] Create AuthNavigator for login/signup flows in src/navigation/AuthNavigator.tsx
- [ ] T029 [P] Create MainNavigator with tab navigation in src/navigation/MainNavigator.tsx

### Common UI Components

- [ ] T030 [P] Create OfflineIndicator component in src/components/Common/OfflineIndicator.tsx
- [ ] T031 [P] Create UsageLimitBanner component in src/components/Common/UsageLimitBanner.tsx
- [ ] T032 [P] Create LoadingIndicator component with progress in src/components/Conversation/LoadingIndicator.tsx

### TypeScript Type Definitions

- [ ] T033 [P] Define User types in src/types/User.ts
- [ ] T034 [P] Define Scenario types in src/types/Scenario.ts
- [ ] T035 [P] Define Progress types in src/types/Progress.ts

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Basic Avatar Conversation (Priority: P1) 🎯 MVP

**Goal**: Enable learners to practice conversation with a randomly assigned AI avatar teacher with speech-to-speech interaction

**Independent Test**: Launch app, select language, speak greeting, receive avatar response with video playback

### Firebase Cloud Functions for User Story 1

- [ ] T036 [P] [US1] Implement sttTranscribe Cloud Function proxy for Deepgram in firebase/functions/src/api/sttProxy.ts
- [ ] T037 [P] [US1] Implement ttsGenerate Cloud Function proxy for ElevenLabs in firebase/functions/src/api/ttsProxy.ts
- [ ] T038 [P] [US1] Implement avatarGenerateVideo Cloud Function proxy for D-ID in firebase/functions/src/api/avatarProxy.ts
- [ ] T039 [P] [US1] Implement aiProxy Cloud Function for GPT-4o-mini conversation in firebase/functions/src/api/aiProxy.ts
- [ ] T040 [US1] Implement costLogger service in firebase/functions/src/cost/costLogger.ts
- [ ] T041 [US1] Implement startConversation Cloud Function in firebase/functions/src/api/conversationFunctions.ts
- [ ] T042 [US1] Implement sendMessage Cloud Function with rate limiting in firebase/functions/src/api/conversationFunctions.ts
- [ ] T043 [US1] Deploy all Cloud Functions to Firebase

### Client Services for User Story 1

- [ ] T044 [P] [US1] Implement DeepgramService client wrapper in src/services/stt/DeepgramService.ts
- [ ] T045 [P] [US1] Implement ElevenLabsService client wrapper in src/services/tts/ElevenLabsService.ts
- [ ] T046 [P] [US1] Implement DIDService client wrapper in src/services/avatar/DIDService.ts
- [ ] T047 [P] [US1] Implement GPTService client wrapper in src/services/ai/GPTService.ts
- [ ] T048 [US1] Implement VideoCache with multi-tier caching in src/services/avatar/VideoCache.ts
- [ ] T049 [US1] Implement TTSCache for audio caching in src/services/tts/TTSCache.ts
- [ ] T050 [US1] Implement ResponseCache for pre-generated responses in src/services/ai/ResponseCache.ts
- [ ] T051 [US1] Implement fallbackManager for smart fallback logic in src/utils/fallbackManager.ts

### State Management for User Story 1

- [ ] T052 [US1] Create conversationSlice for active conversation state in src/store/slices/conversationSlice.ts

### Custom Hooks for User Story 1

- [ ] T053 [P] [US1] Create useSTT hook for speech-to-text in src/hooks/useSTT.ts
- [ ] T054 [P] [US1] Create useTTS hook for text-to-speech in src/hooks/useTTS.ts
- [ ] T055 [P] [US1] Create useAvatar hook for video management in src/hooks/useAvatar.ts

### Avatar Components for User Story 1

- [ ] T056 [P] [US1] Create AvatarPlayer component with video/audio playback and fallbacks in src/components/Avatar/AvatarPlayer.tsx
- [ ] T057 [P] [US1] Create AvatarSelector component for random selection in src/components/Avatar/AvatarSelector.tsx

### Conversation Components for User Story 1

- [ ] T058 [P] [US1] Create MessageBubble component for chat UI in src/components/Conversation/MessageBubble.tsx
- [ ] T059 [US1] Create SpeechInput component with microphone and STT feedback in src/components/Conversation/SpeechInput.tsx

### Screen Implementation for User Story 1

- [ ] T060 [US1] Create ConversationScreen with full speech-to-speech flow in src/screens/ConversationScreen.tsx
- [ ] T061 [US1] Implement onboarding flow with language selection in ConversationScreen
- [ ] T062 [US1] Integrate all services (STT, AI, TTS, Avatar) with error handling and fallbacks in ConversationScreen

### Data Seeding for User Story 1

- [ ] T063 [US1] Seed 10 default avatars to Firestore avatars collection with diverse characteristics
- [ ] T064 [US1] Upload default avatar images to Firebase Storage

**Checkpoint**: User Story 1 complete - users can have basic conversations with AI avatars

---

## Phase 4: User Story 2 - Scenario-Based Learning (Priority: P2)

**Goal**: Enable learners to practice specific real-world situations with structured scenarios and objectives

**Independent Test**: Select "Restaurant-Beginner" scenario, complete simulated ordering, earn XP

### Firebase Cloud Functions for User Story 2

- [ ] T065 [US2] Implement completeScenario Cloud Function with XP awarding in firebase/functions/src/api/scenarioFunctions.ts
- [ ] T066 [US2] Add scenario prerequisite validation logic to startConversation function
- [ ] T067 [US2] Deploy updated Cloud Functions

### State Management for User Story 2

- [ ] T068 [US2] Update scenarioSlice with completion tracking in src/store/slices/scenarioSlice.ts

### Learning Components for User Story 2

- [ ] T069 [P] [US2] Create ScenarioCard component for scenario selection UI in src/components/Learning/ScenarioCard.tsx
- [ ] T070 [US2] Update ConversationScreen to support scenario-based objectives and performance feedback

### Screen Implementation for User Story 2

- [ ] T071 [US2] Create ScenarioListScreen for browsing scenarios in src/screens/ScenarioListScreen.tsx
- [ ] T072 [US2] Implement scenario filtering by category and difficulty in ScenarioListScreen
- [ ] T073 [US2] Add scenario completion checkmark and unlock logic to ScenarioListScreen

### Data Seeding for User Story 2

- [ ] T074 [US2] Seed 9 base scenarios to Firestore (3 categories × 3 difficulty levels)
- [ ] T075 [US2] Generate 100 common responses per scenario for pre-generated cache (900 total) using batch script
- [ ] T076 [US2] Upload pre-generated avatar videos to Firebase Storage and Cloudflare R2 CDN

**Checkpoint**: User Story 2 complete - users can practice structured scenarios with clear objectives

---

## Phase 5: User Story 3 - Progress Tracking and Gamification (Priority: P3)

**Goal**: Enable learners to monitor their learning journey through XP, streaks, badges, and skill assessments

**Independent Test**: Complete 3 scenarios across 3 days, view profile with XP, 3-day streak badge, and skill breakdown

### Firebase Cloud Functions for User Story 3

- [ ] T077 [US3] Implement achievement trigger Cloud Function to award badges in firebase/functions/src/achievements/achievementTrigger.ts
- [ ] T078 [US3] Create scheduled function for streak tracking in firebase/functions/src/batch/streakChecker.ts
- [ ] T079 [US3] Deploy achievement and streak tracking functions

### State Management for User Story 3

- [ ] T080 [US3] Create progressSlice for XP, levels, and achievements in src/store/slices/progressSlice.ts

### Learning Components for User Story 3

- [ ] T081 [P] [US3] Create ProgressDashboard component for XP and skills in src/components/Learning/ProgressDashboard.tsx
- [ ] T082 [P] [US3] Create AchievementBadge component for badges display in src/components/Learning/AchievementBadge.tsx

### Screen Implementation for User Story 3

- [ ] T083 [US3] Create ProgressScreen with progress dashboard in src/screens/ProgressScreen.tsx
- [ ] T084 [US3] Add time-series charts for XP and pronunciation scores in ProgressScreen
- [ ] T085 [US3] Implement daily challenges tailored to weak areas in ProgressScreen

### Data Seeding for User Story 3

- [ ] T086 [US3] Seed predefined badge definitions to Firestore (9 badges: First Steps, 3-Day Streak, 7-Day Streak, etc.)
- [ ] T087 [US3] Upload badge icons to Firebase Storage

**Checkpoint**: User Story 3 complete - users can track progress and earn achievements

---

## Phase 6: User Story 4 - Custom Avatar Creation (Priority: P4)

**Goal**: Enable premium users to create personalized avatars using face/voice cloning

**Independent Test**: Premium user uploads 10-second video, system processes it, user practices with custom avatar

### Firebase Cloud Functions for User Story 4

- [ ] T088 [US4] Implement createCustomAvatar Cloud Function for face/voice cloning in firebase/functions/src/api/customAvatarFunctions.ts
- [ ] T089 [US4] Integrate Google Veo 3 API for face cloning in Cloud Function
- [ ] T090 [US4] Add Akool API fallback integration for face cloning
- [ ] T091 [US4] Deploy custom avatar Cloud Functions

### Services for User Story 4

- [ ] T092 [US4] Implement VeoAkoolService for custom avatar creation in src/services/avatar/VeoAkoolService.ts

### Avatar Components for User Story 4

- [ ] T093 [US4] Create CustomAvatarCreator component with upload UI in src/components/Avatar/CustomAvatarCreator.tsx
- [ ] T094 [US4] Add media validation for video quality and duration in CustomAvatarCreator
- [ ] T095 [US4] Implement progress tracking for avatar processing status in CustomAvatarCreator

### Screen Implementation for User Story 4

- [ ] T096 [US4] Create ProfileScreen with premium upgrade and custom avatar access in src/screens/ProfileScreen.tsx
- [ ] T097 [US4] Add premium tier check and paywall logic in ProfileScreen

**Checkpoint**: User Story 4 complete - premium users can create custom avatars

---

## Phase 7: Cost Optimization & Monitoring

**Purpose**: Ensure cost control measures are active and monitored

- [ ] T098 [P] Implement batch pre-generation scheduled function in firebase/functions/src/batch/pregenerate.ts (runs every 30 minutes)
- [ ] T099 [P] Create cost report generator Cloud Function in firebase/functions/src/cost/reportGenerator.ts
- [ ] T100 [P] Implement content moderation filter using Firebase Extensions in firebase/functions/src/moderation/contentFilter.ts
- [ ] T101 Setup daily usage reset scheduled function in firebase/functions/src/batch/dailyReset.ts (midnight UTC)
- [ ] T102 [P] Setup monthly usage reset scheduled function in firebase/functions/src/batch/monthlyReset.ts
- [ ] T103 [P] Setup inactive user data deletion job in firebase/functions/src/batch/cleanupInactive.ts (runs daily at 2am UTC)
- [ ] T104 Deploy all scheduled functions and verify cron execution

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] T105 [P] Add accessibility labels and screen reader support across all components (WCAG 2.1 AA)
- [ ] T106 [P] Implement lazy loading for non-critical screens (ProgressScreen, ProfileScreen)
- [ ] T107 [P] Add React.memo optimization to expensive avatar rendering components
- [ ] T108 [P] Implement progressive image loading with react-native-fast-image
- [ ] T109 [P] Configure video quality tiers (360p free, 720p premium) in VideoCache
- [ ] T110 Add Firebase Performance Monitoring initialization in App.tsx
- [ ] T111 [P] Create GDPR data deletion endpoint in firebase/functions/src/user/deleteUserData.ts
- [ ] T112 Validate quickstart.md instructions by following setup steps
- [ ] T113 [P] Add TypeScript strict type checking across all modules
- [ ] T114 [P] Run ESLint and fix all warnings
- [ ] T115 Create production build and test on iOS and Android devices

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phases 3-6)**: All depend on Foundational phase completion
  - User Story 1 (P1): Can start after Foundational - No dependencies on other stories
  - User Story 2 (P2): Can start after Foundational - Depends on US1 ConversationScreen but adds scenario features independently
  - User Story 3 (P3): Can start after Foundational - Depends on US2 completion tracking but tests independently
  - User Story 4 (P4): Can start after Foundational - Depends on US1 avatar system but extends independently
- **Cost Optimization (Phase 7)**: Can run in parallel with user stories, depends on Cloud Functions structure from US1
- **Polish (Phase 8)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Core MVP - no dependencies on other stories
- **User Story 2 (P2)**: Extends User Story 1 with scenarios - depends on ConversationScreen from US1
- **User Story 3 (P3)**: Adds progress tracking - depends on scenario completion from US2
- **User Story 4 (P4)**: Premium feature - depends on avatar system from US1

### Parallel Opportunities

**Within Setup (Phase 1)**:
- T002, T003, T004, T005, T007, T008 can all run in parallel

**Within Foundational (Phase 2)**:
- T012, T014 can run in parallel after T010, T011
- T016, T017 can run in parallel after T015
- T019, T020 can run in parallel with T018
- T022, T023 can run in parallel after T021
- T025, T026 can run in parallel with T024
- T028, T029 can run in parallel after T027
- T030, T031, T032 can all run in parallel
- T033, T034, T035 can all run in parallel

**Within User Story 1 (Phase 3)**:
- T036, T037, T038, T039 can all run in parallel
- T044, T045, T046, T047 can all run in parallel after Cloud Functions
- T053, T054, T055 can all run in parallel
- T056, T057 can run in parallel
- T058, T059 can run in parallel

**Within User Story 2 (Phase 4)**:
- T069, T070 can run in parallel after T068

**Within User Story 3 (Phase 5)**:
- T081, T082 can run in parallel after T080

**Within Phase 7 (Cost Optimization)**:
- T098, T099, T100 can all run in parallel
- T102, T103 can run in parallel

**Within Phase 8 (Polish)**:
- T105, T106, T107, T108, T109, T111, T113, T114 can all run in parallel

---

## Parallel Example: User Story 1 Cloud Functions

```bash
# Launch all AI proxy Cloud Functions together:
Task T036: "Implement sttTranscribe Cloud Function proxy for Deepgram in firebase/functions/src/api/sttProxy.ts"
Task T037: "Implement ttsGenerate Cloud Function proxy for ElevenLabs in firebase/functions/src/api/ttsProxy.ts"
Task T038: "Implement avatarGenerateVideo Cloud Function proxy for D-ID in firebase/functions/src/api/avatarProxy.ts"
Task T039: "Implement aiProxy Cloud Function for GPT-4o-mini conversation in firebase/functions/src/api/aiProxy.ts"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup → Project structure ready
2. Complete Phase 2: Foundational → Core infrastructure ready (CRITICAL)
3. Complete Phase 3: User Story 1 → Basic conversation works
4. **STOP and VALIDATE**: Test speech-to-speech conversation independently
5. Deploy/demo MVP

**MVP Delivery**: Users can have basic conversations with AI avatars (P1 complete)

### Incremental Delivery

1. MVP (Phases 1-3) → Basic conversation → Deploy
2. Add User Story 2 (Phase 4) → Scenario-based learning → Deploy
3. Add User Story 3 (Phase 5) → Progress tracking → Deploy
4. Add User Story 4 (Phase 6) → Custom avatars → Deploy
5. Add Cost Optimization (Phase 7) → Monitoring → Deploy
6. Polish (Phase 8) → Production-ready → Final Deploy

### Parallel Team Strategy

With multiple developers after Foundational phase:

1. **Developer A**: User Story 1 (T036-T064) - Core conversation
2. **Developer B**: User Story 2 (T065-T076) - Scenarios (can start after US1 T060-T062)
3. **Developer C**: Cost Optimization (T098-T104) - Monitoring (can start after US1 Cloud Functions)

After all user stories complete, entire team works on Phase 8 (Polish) in parallel.

---

## Task Summary

- **Total Tasks**: 115 tasks
- **Phase 1 (Setup)**: 8 tasks
- **Phase 2 (Foundational)**: 27 tasks (CRITICAL - blocks all stories)
- **Phase 3 (User Story 1 - MVP)**: 29 tasks
- **Phase 4 (User Story 2)**: 12 tasks
- **Phase 5 (User Story 3)**: 11 tasks
- **Phase 6 (User Story 4)**: 10 tasks
- **Phase 7 (Cost Optimization)**: 7 tasks
- **Phase 8 (Polish)**: 11 tasks

**Parallel Opportunities**: 45 tasks marked [P] can run in parallel within their phase

**Independent Stories**: Each user story (US1-US4) can be tested independently after its phase completes

**MVP Scope**: Phases 1-3 (64 tasks) deliver core conversation feature (User Story 1)

---

## Notes

- All tasks include exact file paths for clarity
- [P] tasks have no dependencies within their group
- [Story] labels enable tracking of user story implementation
- Tests NOT included (not requested in spec.md)
- Each user story delivers independently testable functionality
- Constitution compliance validated throughout (TypeScript strict, offline-first, cost tracking, security)
- Estimated cost per user: $0.68/month with 80% cache hit rate (per contracts/ai-services.md)
