# 🎓 SUOLINGO - AI Avatar Foreign Language Learning App

> **University Assignment**: Comprehensive English learning platform with AI avatars, real-time lip-sync, speech recognition, translation, and interactive learning modes

AI-powered **foreign language learning application** where users practice English through multiple interactive modes with AI avatar teachers. Features dual-language translation (Turkish ↔ English), speech-to-text, text-to-speech, custom avatar upload with voice/face cloning, scenario-based learning, pronunciation coaching, and CEFR proficiency levels (A1-C2).

---

## ✨ MVP Features (For Assignment Submission)

### 🎬 **Core Avatar Technology**

#### Custom Avatar System
- **Upload Your Own Avatar**: Import custom avatar images/videos
- **🆕 Face Cloning**: Upload 10-second video → AI creates your digital twin
- **🆕 Voice Cloning**: Upload 30-second audio → Avatar speaks in your voice
- **Pre-configured Avatars**: Male (Prof. Dr. Ahmet Yılmaz) and Female (Dr. Ayşe Kaya)
- **Real-time Lip-Sync**: A2E AI integration for realistic mouth movements
- **Loop Animations**: Smooth idle animations when avatar is not speaking
- **Multi-language Voice**: Natural Turkish and English pronunciation

### 💬 **Dual-Language Translation Interface**

```
┌─────────────────────────────────────┐
│  Text Area 1 (Turkish/English)     │
│  [🔊 Speak] [🎤 Voice Input]        │
└─────────────────────────────────────┘
         ⬇️⬆️ [Translate ↔️]
┌─────────────────────────────────────┐
│  Text Area 2 (English/Turkish)     │
│  [🔊 Speak] [🎤 Voice Input]        │
└─────────────────────────────────────┘
```

**Features**:
- **Bi-directional Translation**: Turkish → English OR English → Turkish
- **Flexible Input**: Type or speak in either language
- **Both Speakable**: TTS works for both areas
- **Instant Transcription**: ~2 seconds STT processing

---

## 🎯 **12 Interactive Learning Modes**

### **Mode 1: Basic Text Translation**
**What**: Type text in one language, translate to other, hear avatar speak
**Workflow**:
1. Type Turkish or English in text area 1
2. Press [Translate] → Translation appears in area 2
3. Press [Speak] → Avatar speaks with lip-sync

---

### **Mode 2: Voice Input Translation**
**What**: Speak in one language, get translation, hear avatar speak
**Workflow**:
1. Press 🎤 Microphone
2. Speak in Turkish or English
3. STT auto-fills text area
4. Press [Translate] → Get translation
5. Press [Speak] → Avatar speaks

---

### **Mode 3: Direct Practice**
**What**: Practice target language directly without translation
**Workflow**:
1. Type/speak English directly
2. Avatar repeats it back
3. Listen and practice pronunciation

---

### **Mode 4: Conversation Mode** 🆕
**What**: Free-flowing conversation with AI avatar
**Workflow**:
1. Avatar asks a question: "What's your favorite food?"
2. User answers via voice/text
3. Avatar responds naturally: "Oh interesting! Why do you like it?"
4. Conversation continues naturally
**Benefit**: Real-world conversational practice

---

### **Mode 5: Sentence Correction & Explanation** 🆕
**What**: Get grammar corrections with explanations
**Workflow**:
1. User says/types: "I goed to school"
2. AI detects error
3. Avatar explains: "❌ Correction: I **went** to school"
4. Explanation (in Turkish): "go fiilinin geçmiş hali irregular: went"
**Benefit**: Learn from mistakes

---

### **Mode 6: Word of the Day** 🆕
**What**: Daily vocabulary building
**Workflow**:
1. App shows daily word: "entrepreneur"
2. Avatar uses it in sentences
3. User creates own sentences with the word
4. Avatar provides feedback
**Benefit**: Systematic vocabulary growth

---

### **Mode 7: Role-Play Mode** 🆕
**What**: Practice real-world scenarios with assigned roles
**Scenarios**:
- **Job Interview**: Avatar = interviewer, User = candidate
- **Restaurant**: Avatar = waiter, User = customer
- **Shopping**: Avatar = salesperson, User = buyer
- **Doctor Visit**: Avatar = doctor, User = patient
- **Hotel Check-in**: Avatar = receptionist, User = guest
- **Airport**: Avatar = staff, User = traveler
**Benefit**: Contextual learning with real situations

---

### **Mode 8: Listening Comprehension Test** 🆕
**What**: Test understanding of spoken English
**Workflow**:
1. Avatar tells a story/paragraph
2. User listens carefully
3. Avatar asks comprehension questions
4. User answers
5. Score and feedback
**Benefit**: Improve listening skills

---

### **Mode 9: Pronunciation Practice Loop** 🆕
**What**: Master difficult words through repetition
**Workflow**:
1. User selects challenging word: "entrepreneur"
2. Avatar pronounces slowly
3. User repeats
4. AI scores pronunciation (0-100)
5. If low score, repeat
6. Visual waveform comparison
**Benefit**: Perfect pronunciation on difficult words

---

### **Mode 10: Flashcard Mode** 🆕
**What**: Rapid vocabulary testing
**Workflow**:
1. Avatar says Turkish word: "elma"
2. User responds in English: "apple"
3. OR reverse: Avatar says "apple" → User says "elma"
4. Instant feedback
5. Track correct/incorrect
**Benefit**: Reinforce vocabulary memorization

---

### **Mode 11: Video Subtitle Practice** 🆕
**What**: Learn from pre-recorded scenario videos
**Workflow**:
1. Avatar plays video (Nano Banana/Google AI Studio)
2. First play: No subtitles (test comprehension)
3. User tries to understand
4. Second play: With subtitles
5. Discussion with avatar about content
**Benefit**: Adapt to natural speech speed

---

### **Mode 12: Grammar Quiz Mode** 🆕
**What**: Targeted grammar practice
**Topics**:
- Present Perfect vs Simple Past
- Passive Voice
- Conditionals (If clauses)
- Modal verbs (can, should, must)
- Articles (a, an, the)
**Workflow**:
1. Select grammar topic
2. Avatar asks questions
3. User answers
4. Instant feedback with explanations
**Benefit**: Fill grammar gaps systematically

---

## 📊 **CEFR Language Proficiency Levels**

### Level Selection
- **A1**: Beginner - Basic phrases, simple sentences
- **A2**: Elementary - Everyday expressions, common topics
- **B1**: Intermediate - Clear standard language, work/school topics
- **B2**: Upper Intermediate - Complex texts, spontaneous conversation
- **C1**: Advanced - Flexible language use, implicit meanings
- **C2**: Proficient - Near-native fluency

**Adaptive System**: Avatar adjusts vocabulary, grammar complexity, and speaking speed based on selected level.

---

## 🎮 **Gamification & Progress Tracking**

### Local Storage Based (No Database Required)
- **Conversation Counter**: Track total conversations completed
- **Mode Progress**: See which modes you've used most
- **Pronunciation Scores**: Historical accuracy tracking
- **Daily Streak**: Days practiced consecutively
- **Simple XP System**: Points for each completed interaction
- **Badges**: "First Conversation", "10-Day Streak", "Grammar Master"

---

## 🛠️ **Installation**

### Prerequisites
- Node.js 18+
- npm or yarn
- Expo CLI
- iOS/Android device or simulator

### 1. Clone Repository
```bash
git clone https://github.com/Srhot/Suolingo.git
cd Suolingo
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment Variables
Create a `.env` file:
```bash
cp .env.example .env
```

Edit `.env` and add your API keys:
```env
# Required API Keys
DEEPGRAM_API_KEY=your_deepgram_api_key
ELEVENLABS_API_KEY=your_elevenlabs_api_key
A2E_API_KEY=your_a2e_api_key
GEMINI_API_KEY=your_gemini_api_key

# Translation API
TRANSLATION_API_KEY=your_translation_api_key

# Voice/Face Cloning (A2E or alternatives)
CLONING_API_KEY=your_cloning_api_key

# Service URLs
DEEPGRAM_BASE_URL=https://api.deepgram.com
ELEVENLABS_BASE_URL=https://api.elevenlabs.io
A2E_BASE_URL=https://video.a2e.ai
```

### 4. Run the App
```bash
npx expo start

# Then press:
# - 'i' for iOS simulator (Mac only)
# - 'a' for Android emulator
# - Scan QR code with Expo Go app
```

---

## 📁 Project Structure

```
suolingo/
├── src/
│   ├── screens/
│   │   ├── AvatarScreen.tsx              # Main conversation screen
│   │   ├── ModeSelectionScreen.tsx       # 12 modes selection
│   │   ├── ConversationModeScreen.tsx    # Mode 4
│   │   ├── RolePlayScreen.tsx            # Mode 7
│   │   ├── PronunciationScreen.tsx       # Mode 9
│   │   └── ProgressScreen.tsx            # Gamification dashboard
│   ├── services/
│   │   ├── avatar/
│   │   │   ├── A2EService.ts             # Lip-sync generation
│   │   │   ├── FaceCloneService.ts       # Face cloning
│   │   │   └── VoiceCloneService.ts      # Voice cloning
│   │   ├── voice/
│   │   │   ├── DeepgramService.ts        # Speech-to-Text
│   │   │   └── ElevenLabsService.ts      # Text-to-Speech
│   │   ├── translation/
│   │   │   └── TranslationService.ts     # Turkish ↔ English
│   │   ├── ai/
│   │   │   └── GeminiService.ts          # Conversation AI
│   │   └── pronunciation/
│   │       └── PronunciationService.ts   # Waveform analysis
│   ├── data/
│   │   ├── avatars.ts                    # Avatar configurations
│   │   ├── scenarios.ts                  # Role-play scenarios
│   │   └── grammar-topics.ts             # Grammar quiz content
│   ├── types/
│   │   ├── Avatar.ts
│   │   ├── LearningMode.ts
│   │   └── Progress.ts
│   └── utils/
│       ├── storage.ts                    # Local storage utilities
│       └── scoring.ts                    # Pronunciation scoring
└── assets/
    ├── avatars/
    │   ├── male-idle.mp4
    │   ├── female-idle.mp4
    │   └── custom/                       # User-uploaded avatars
    └── videos/
        └── scenarios/                    # Nano Banana pre-recorded videos
```

---

## 🎯 Assignment Requirements

### ✅ Comprehensive MVP Features (200+ points!)

#### **Core Functionality** (100 points)
- ✅ TTS + Lip-Sync
- ✅ STT Integration
- ✅ Dual-language translation
- ✅ Navigation controls

#### **Advanced Avatar Features** (+50 points)
- ✅ Custom avatar upload
- ✅ Face cloning
- ✅ Voice cloning

#### **12 Learning Modes** (+75 points)
- ✅ Basic translation modes (1-3)
- ✅ Conversation mode (4)
- ✅ Sentence correction (5)
- ✅ Word of the day (6)
- ✅ Role-play scenarios (7)
- ✅ Listening comprehension (8)
- ✅ Pronunciation practice (9)
- ✅ Flashcard mode (10)
- ✅ Video subtitle practice (11)
- ✅ Grammar quiz (12)

#### **Learning Infrastructure** (+50 points)
- ✅ CEFR proficiency levels (A1-C2)
- ✅ Adaptive difficulty
- ✅ Progress tracking
- ✅ Gamification elements

---

## 🔮 Future Roadmap

### 📅 Mid-Term (Post-Assignment)

#### Multi-Language Expansion
- **German Support**: Second target language
- **Spanish, French, Italian**: Additional languages
- **Japanese, Korean, Mandarin**: Asian language expansion

#### Database Integration
- **User Accounts**: Persistent profiles
- **Cloud Sync**: Progress across devices
- **Analytics Dashboard**: Detailed learning insights

---

### 🚀 Long-Term

#### Advanced Features
- **Multi-avatar Conversations**: Group conversations with 2-3 avatars
- **Real-world Integration**: AR practice in real environments
- **Certification Prep**: TOEFL, IELTS preparation modules

#### Business Features
- **Freemium Model**: Free tier + Premium subscriptions
- **Corporate Training**: B2B packages for companies
- **Marketplace**: Community-created scenarios

#### Social Features (Optional)
- Leaderboards
- Friend challenges
- Community sharing

---

## 🎓 Core Technologies

- **React Native** (0.81.5) + **Expo SDK 54**
- **TypeScript** (5.9.2) - Strict mode
- **A2E AI** - Avatar lip-sync, face/voice cloning
- **Deepgram** - Speech-to-Text (Turkish & English)
- **ElevenLabs** - Natural voice synthesis
- **Google Translate API** - Bi-directional translation
- **Gemini AI** - Conversational intelligence
- **Material Design 3** (React Native Paper)

---

## 📊 Stats

- **Target Language**: English (primary focus)
- **Interface Language**: Turkish (native)
- **Learning Modes**: 12 interactive modes
- **Proficiency Levels**: A1, A2, B1, B2, C1, C2 (CEFR)
- **API Services**: 6 (A2E, Deepgram, ElevenLabs, Gemini, Translation, Cloning)
- **Lines of Code**: ~8,000+ (estimated with all features)

---

## 🎓 Academic Context

**Course**: Mobile Application Development
**Institution**: Sinop University
**Student**: Serhat Hotamışlıgil
**Date**: November 2025

---

## 🙏 Acknowledgments

- **A2E AI** for custom avatar lip-sync and cloning technology
- **Deepgram** for Turkish & English speech recognition
- **ElevenLabs** for natural voice synthesis
- **Google AI Studio / Nano Banana** for pre-recorded scenario videos
- **Expo** for React Native development platform
- Course instructors for guidance and support

---

## 📝 License

This project is created for educational purposes as part of a university assignment.

---

## 🔗 Links

- **GitHub**: [github.com/Srhot/Suolingo](https://github.com/Srhot/Suolingo)
- **LinkedIn**: [linkedin.com/in/serhat-sezgul](https://www.linkedin.com/in/serhat-sezgul/)
- **Demo Video**: [Coming Soon]

---

Made with ❤️ for English language learning education
