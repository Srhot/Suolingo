# 🎯 SUOLINGO MVP - Step-by-Step Implementation Plan

**Goal**: Complete all 12 learning modes + face/voice cloning for university assignment
**Target**: 275+ points
**Timeline**: Progressive implementation, step by step

---

## 📋 IMPLEMENTATION ROADMAP

### ✅ **STEP 1: Dual Text Area + Bi-directional Translation** (HIGHEST PRIORITY)

**Objective**: Create Google Translate-style interface with two text areas and translation

**Tasks**:
- [ ] Create TranslationService.ts (Google Translate API integration)
- [ ] Modify AvatarScreen.tsx to add second text area
- [ ] Add "Translate ↔️" button between text areas
- [ ] Implement bi-directional translation (Turkish → English, English → Turkish)
- [ ] Add [Speak 🔊] button for each text area
- [ ] Test: Type Turkish → Translate → Get English → Speak both

**Files to Create/Modify**:
- `src/services/translation/TranslationService.ts` (NEW)
- `src/screens/AvatarScreen.tsx` (MODIFY)
- `src/types/Translation.ts` (NEW)

**Success Criteria**:
- User can type in either text area
- Translation works both directions (TR↔EN)
- Both areas can trigger TTS with avatar lip-sync
- Clean, intuitive UI

**Estimated Time**: 2-3 hours

---

### ✅ **STEP 2: STT Integration (Microphone Button)** (HIGH PRIORITY)

**Objective**: Enable voice input that auto-fills text areas

**Tasks**:
- [ ] Verify DeepgramService.ts is working
- [ ] Add microphone button (🎤) to each text area
- [ ] Implement voice recording → STT transcription
- [ ] Auto-fill transcribed text into the respective text area
- [ ] Add recording indicator (red dot/animation)
- [ ] Handle permissions properly
- [ ] Test: Speak Turkish → Auto-fills Turkish area → Translate → Speak English

**Files to Modify**:
- `src/screens/AvatarScreen.tsx` (add mic buttons)
- `src/services/voice/DeepgramService.ts` (verify/fix)

**Success Criteria**:
- Microphone button works on both text areas
- STT transcription completes in ~2 seconds
- Transcribed text appears in correct text area
- Works for both Turkish and English

**Estimated Time**: 2-3 hours

---

### ✅ **STEP 3: Custom Avatar Upload** (VERY HIGH PRIORITY - BIG POINTS!)

**Objective**: Allow users to upload their own avatar images/videos

**Tasks**:
- [ ] Add "Upload Custom Avatar" button to avatar selection menu
- [ ] Implement image/video picker (expo-image-picker)
- [ ] Save uploaded avatar to local storage
- [ ] Integrate custom avatar with A2E Service
- [ ] Display uploaded avatar in idle state
- [ ] Test: Upload image → Select → Avatar uses uploaded image for lip-sync

**Files to Create/Modify**:
- `src/screens/AvatarScreen.tsx` (add upload button)
- `src/services/avatar/A2EService.ts` (support custom uploads)
- `src/utils/storage.ts` (save uploaded avatars)
- `src/types/Avatar.ts` (add custom avatar type)

**Success Criteria**:
- User can upload image/video from gallery
- Custom avatar appears in avatar selection menu
- Custom avatar works with TTS + lip-sync
- Uploaded avatars persist across app restarts

**Estimated Time**: 3-4 hours

---

### ✅ **STEP 4: Mode Selection Screen (12 Modes)** (HIGH PRIORITY)

**Objective**: Create main navigation screen to select between 12 learning modes

**Tasks**:
- [ ] Create ModeSelectionScreen.tsx
- [ ] Design 12 mode cards/buttons with icons
- [ ] Add navigation to each mode screen
- [ ] Implement mode descriptions
- [ ] Add "Practice History" indicator (which modes used recently)
- [ ] Test: Tap mode → Navigate to respective screen

**Files to Create/Modify**:
- `src/screens/ModeSelectionScreen.tsx` (NEW)
- `src/types/LearningMode.ts` (NEW)
- `src/navigation/AppNavigator.tsx` (NEW or modify existing)

**Modes to List**:
1. Basic Text Translation
2. Voice Input Translation
3. Direct Practice
4. Conversation Mode ⭐
5. Sentence Correction
6. Word of the Day
7. Role-Play Mode ⭐
8. Listening Comprehension
9. Pronunciation Practice ⭐
10. Flashcard Mode
11. Video Subtitle Practice
12. Grammar Quiz

**Success Criteria**:
- All 12 modes visible with descriptions
- Smooth navigation between screens
- Visual indicators for completed/in-progress modes
- Intuitive UI/UX

**Estimated Time**: 3-4 hours

---

### ✅ **STEP 5: Conversation Mode (Mode 4)** (VERY HIGH PRIORITY)

**Objective**: Free-flowing conversation with AI avatar

**Tasks**:
- [ ] Create ConversationModeScreen.tsx
- [ ] Integrate GeminiService.ts for AI responses
- [ ] Implement conversation flow: Avatar asks → User answers → Avatar responds
- [ ] Add conversation history display (chat bubbles)
- [ ] Implement context-aware responses (AI remembers conversation)
- [ ] Add "End Conversation" button
- [ ] Test: Start conversation → Answer questions → Get natural responses

**Files to Create/Modify**:
- `src/screens/ConversationModeScreen.tsx` (NEW)
- `src/services/ai/GeminiService.ts` (enhance for conversation)
- `src/types/Conversation.ts` (NEW)

**Success Criteria**:
- Avatar initiates conversation with a question
- User can respond via text or voice
- AI generates contextually appropriate follow-up questions
- Conversation feels natural and engaging
- Avatar speaks responses with lip-sync

**Estimated Time**: 4-5 hours

---

### ✅ **STEP 6: Face/Voice Cloning** (MAXIMUM PRIORITY - HUGE POINTS! 🔥)

**Objective**: Allow users to clone their face/voice for custom avatars

**Tasks**:

#### Face Cloning:
- [ ] Create FaceCloneService.ts
- [ ] Integrate with A2E face cloning API (or alternative)
- [ ] Add "Clone My Face" button
- [ ] Implement video recording (10 seconds, multiple angles prompt)
- [ ] Upload to cloning service
- [ ] Poll for completion (progress bar)
- [ ] Save cloned avatar to user profile
- [ ] Test: Record face video → Process → Use cloned avatar

#### Voice Cloning:
- [ ] Create VoiceCloneService.ts
- [ ] Integrate with ElevenLabs voice cloning or A2E
- [ ] Add "Clone My Voice" button
- [ ] Record 30-second audio sample
- [ ] Upload to cloning service
- [ ] Poll for completion
- [ ] Attach cloned voice to avatar
- [ ] Test: Record voice → Process → Avatar speaks in your voice

**Files to Create**:
- `src/services/avatar/FaceCloneService.ts` (NEW)
- `src/services/avatar/VoiceCloneService.ts` (NEW)
- `src/screens/CloneAvatarScreen.tsx` (NEW)

**Success Criteria**:
- User can record face video (10s) and voice audio (30s)
- Processing happens with progress indicator
- Cloned face avatar displays correctly
- Cloned voice sounds like user
- Works seamlessly with TTS + lip-sync

**Estimated Time**: 6-8 hours (most complex feature!)

---

### ✅ **STEP 7: Role-Play Scenarios (Mode 7)** (HIGH PRIORITY)

**Objective**: Practice real-world scenarios with assigned roles

**Tasks**:
- [ ] Create RolePlayScreen.tsx
- [ ] Define 6 scenarios in scenarios.ts:
  - Restaurant (avatar = waiter, user = customer)
  - Job Interview (avatar = interviewer, user = candidate)
  - Shopping (avatar = salesperson, user = buyer)
  - Doctor Visit (avatar = doctor, user = patient)
  - Hotel Check-in (avatar = receptionist, user = guest)
  - Airport (avatar = staff, user = traveler)
- [ ] Implement scenario selection screen
- [ ] Create scenario-specific conversation prompts
- [ ] Add objective tracking (e.g., "Order food", "Ask about ingredients")
- [ ] Display completion status
- [ ] Test each scenario

**Files to Create/Modify**:
- `src/screens/RolePlayScreen.tsx` (NEW)
- `src/data/scenarios.ts` (NEW)
- `src/types/Scenario.ts` (NEW)

**Success Criteria**:
- All 6 scenarios are playable
- Avatar stays in character (waiter, doctor, etc.)
- User can complete scenario objectives
- Natural conversation flow
- Feedback after scenario completion

**Estimated Time**: 5-6 hours

---

### ✅ **STEP 8: Pronunciation Coaching (Mode 9)** (HIGH PRIORITY)

**Objective**: Practice difficult words with waveform analysis and scoring

**Tasks**:
- [ ] Create PronunciationScreen.tsx
- [ ] Implement PronunciationService.ts (waveform analysis)
- [ ] Add word selection (common difficult words list)
- [ ] Avatar pronounces word slowly
- [ ] User repeats → Record audio
- [ ] AI scores pronunciation (0-100)
- [ ] Display waveform comparison (avatar vs user)
- [ ] Loop until satisfactory score
- [ ] Test: Select "entrepreneur" → Practice → Get 80+ score

**Files to Create**:
- `src/screens/PronunciationScreen.tsx` (NEW)
- `src/services/pronunciation/PronunciationService.ts` (NEW)
- `src/data/difficult-words.ts` (NEW)
- `src/components/WaveformDisplay.tsx` (NEW)

**Success Criteria**:
- User can select difficult words
- Avatar demonstrates pronunciation slowly
- Waveform visualizes pronunciation
- AI provides accurate pronunciation score
- User can retry until improvement

**Estimated Time**: 5-6 hours

---

### ✅ **STEP 9: Remaining Modes (5, 6, 8, 10, 11, 12)** (MEDIUM PRIORITY)

**Objective**: Implement remaining 6 learning modes

#### Mode 5: Sentence Correction
- [ ] Create SentenceCorrectionScreen.tsx
- [ ] User types/speaks incorrect sentence
- [ ] AI detects errors → Provides correction + explanation (Turkish)
- [ ] Display before/after comparison

#### Mode 6: Word of the Day
- [ ] Create WordOfTheDayScreen.tsx
- [ ] Display daily vocabulary word
- [ ] Avatar uses word in example sentences
- [ ] User creates own sentences with the word
- [ ] AI provides feedback

#### Mode 8: Listening Comprehension
- [ ] Create ListeningComprehensionScreen.tsx
- [ ] Avatar tells a story/paragraph
- [ ] User listens without transcript
- [ ] Multiple-choice questions appear
- [ ] Score and feedback

#### Mode 10: Flashcard Mode
- [ ] Create FlashcardScreen.tsx
- [ ] Display word in one language (TR or EN)
- [ ] User responds with translation
- [ ] Swipe cards (correct/incorrect)
- [ ] Track accuracy

#### Mode 11: Video Subtitle Practice
- [ ] Create VideoSubtitleScreen.tsx
- [ ] Load pre-recorded video (Nano Banana)
- [ ] Play without subtitles first
- [ ] Test comprehension
- [ ] Replay with subtitles

#### Mode 12: Grammar Quiz
- [ ] Create GrammarQuizScreen.tsx
- [ ] Define grammar topics in grammar-topics.ts
- [ ] Multiple-choice questions
- [ ] Instant feedback with explanations
- [ ] Track scores

**Files to Create**:
- `src/screens/SentenceCorrectionScreen.tsx`
- `src/screens/WordOfTheDayScreen.tsx`
- `src/screens/ListeningComprehensionScreen.tsx`
- `src/screens/FlashcardScreen.tsx`
- `src/screens/VideoSubtitleScreen.tsx`
- `src/screens/GrammarQuizScreen.tsx`
- `src/data/grammar-topics.ts`
- `src/data/daily-words.ts`

**Success Criteria**:
- All 6 modes functional
- Each provides educational value
- Smooth UX in all modes
- Consistent design language

**Estimated Time**: 8-10 hours (2 hours per mode average)

---

### ✅ **STEP 10: CEFR Levels Integration** (MEDIUM PRIORITY)

**Objective**: Implement proficiency level selection (A1-C2) with adaptive content

**Tasks**:
- [ ] Create level selection screen
- [ ] Define vocabulary/grammar complexity for each level:
  - A1: Basic phrases (100 words)
  - A2: Everyday expressions (500 words)
  - B1: Standard language (1000 words)
  - B2: Complex texts (2000 words)
  - C1: Flexible use (3000+ words)
  - C2: Near-native (5000+ words)
- [ ] Implement adaptive AI responses based on level
- [ ] Adjust avatar speaking speed per level
- [ ] Store user's selected level
- [ ] Test: Select A1 → Simple vocabulary, Select C2 → Complex

**Files to Create/Modify**:
- `src/screens/LevelSelectionScreen.tsx` (NEW)
- `src/data/cefr-levels.ts` (NEW)
- `src/services/ai/GeminiService.ts` (modify for level awareness)

**Success Criteria**:
- User can select CEFR level
- AI adjusts vocabulary complexity appropriately
- Avatar speaking speed adapts
- Level persists across sessions

**Estimated Time**: 3-4 hours

---

### ✅ **STEP 11: Gamification & Progress Tracking** (MEDIUM PRIORITY)

**Objective**: Local storage-based progress tracking with XP, badges, streaks

**Tasks**:
- [ ] Create ProgressScreen.tsx (dashboard)
- [ ] Implement local storage utilities (storage.ts)
- [ ] Track metrics:
  - Total conversations
  - Modes used (frequency)
  - Pronunciation scores
  - Daily streak counter
  - XP earned
- [ ] Define badges:
  - "First Conversation"
  - "3-Day Streak", "7-Day Streak", "30-Day Streak"
  - "Grammar Master" (complete all grammar quizzes)
  - "Pronunciation Pro" (80+ scores 10 times)
  - "Polyglot" (use all 12 modes)
- [ ] Display progress charts (simple bar/line charts)
- [ ] Test: Complete activities → Check dashboard → See progress

**Files to Create**:
- `src/screens/ProgressScreen.tsx` (NEW)
- `src/utils/storage.ts` (NEW)
- `src/utils/scoring.ts` (NEW)
- `src/types/Progress.ts` (NEW)
- `src/data/badges.ts` (NEW)

**Success Criteria**:
- Dashboard shows all metrics
- Badges unlock automatically
- Streak tracking works daily
- Data persists across app restarts
- No database required (local storage only)

**Estimated Time**: 4-5 hours

---

### ✅ **STEP 12: Testing & Bug Fixes** (CRITICAL BEFORE SUBMISSION)

**Objective**: Comprehensive testing of all features

**Testing Checklist**:
- [ ] Test on iOS simulator
- [ ] Test on Android emulator
- [ ] Test on real device (if possible)
- [ ] Test all 12 modes individually
- [ ] Test translation (TR→EN, EN→TR)
- [ ] Test STT (microphone in all relevant screens)
- [ ] Test TTS (avatar speaks correctly)
- [ ] Test custom avatar upload
- [ ] Test face/voice cloning (if implemented)
- [ ] Test CEFR level switching
- [ ] Test progress tracking (XP, badges, streaks)
- [ ] Test navigation between screens
- [ ] Test error handling (API failures, no internet)
- [ ] Test permissions (microphone, camera, storage)
- [ ] Fix all critical bugs
- [ ] Polish UI/UX
- [ ] Optimize performance

**Success Criteria**:
- Zero critical bugs
- All features work smoothly
- No crashes during demo
- Professional appearance
- Ready for professor evaluation

**Estimated Time**: 6-8 hours

---

## 📊 TOTAL ESTIMATED TIME

| Step | Feature | Hours |
|------|---------|-------|
| 1 | Dual Text Area + Translation | 2-3 |
| 2 | STT Integration | 2-3 |
| 3 | Custom Avatar Upload | 3-4 |
| 4 | Mode Selection Screen | 3-4 |
| 5 | Conversation Mode | 4-5 |
| 6 | Face/Voice Cloning | 6-8 |
| 7 | Role-Play Scenarios | 5-6 |
| 8 | Pronunciation Coaching | 5-6 |
| 9 | Remaining 6 Modes | 8-10 |
| 10 | CEFR Levels | 3-4 |
| 11 | Gamification | 4-5 |
| 12 | Testing & Fixes | 6-8 |
| **TOTAL** | | **51-68 hours** |

**Realistic Timeline**: 2-3 weeks of focused development

---

## 🎯 PRIORITY RANKING

### **MUST HAVE (Critical for passing)**:
1. ✅ Dual Text Area + Translation
2. ✅ STT Integration
3. ✅ Custom Avatar Upload
4. ✅ Mode Selection Screen
5. ✅ Conversation Mode
6. ✅ Face/Voice Cloning (BIG POINTS!)

### **SHOULD HAVE (High value)**:
7. ✅ Role-Play Scenarios
8. ✅ Pronunciation Coaching
9. ✅ Sentence Correction (Mode 5)
10. ✅ Grammar Quiz (Mode 12)

### **NICE TO HAVE (Bonus points)**:
11. Word of the Day (Mode 6)
12. Flashcard Mode (Mode 10)
13. Listening Comprehension (Mode 8)
14. Video Subtitle Practice (Mode 11)
15. CEFR Levels
16. Gamification

---

## 🚀 LET'S START!

**Next Action**: Begin with STEP 1 - Dual Text Area + Translation

When you're ready, I'll start implementing Step 1!

---

**Last Updated**: 2025-11-04
**Status**: Ready to begin implementation
