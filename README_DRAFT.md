# 🎓 SUOLINGO - AI Avatar Foreign Language Learning App

> **University Assignment**: Interactive English learning application with AI avatars, real-time lip-sync, speech recognition, and translation

AI-powered **foreign language learning application** where users practice English by conversing with AI avatar teachers. Features dual-language text interface (Turkish ↔ English), speech-to-text, text-to-speech, custom avatar upload, and proficiency-level based conversations (A1-C2).

---

## ✨ Current Features (Implemented)

### 🎬 AI Avatar Technology
- **Custom Avatar Support**: Upload your own avatar image
- **Pre-configured Avatars**: Male (Prof. Dr. Ahmet Yılmaz) and Female (Dr. Ayşe Kaya)
- **Real-time Lip-Sync**: A2E AI integration for realistic mouth movements
- **Loop Animations**: Smooth idle animations when avatar is not speaking
- **Multi-language Voice**: Natural Turkish and English pronunciation

### 💬 Text-to-Speech (TTS)
- **Turkish TTS**: ElevenLabs + A2E built-in TTS
- **English TTS**: Speak any text in target language
- **Video Generation**: Avatar lip-sync video created in ~15 seconds
- **Conversation History**: Navigate through messages with ◀️ ▶️ buttons

---

## 🚀 MVP Features (In Development - For Assignment Submission)

### 🎤 Speech-to-Text (STT)
- **Microphone Button**: Speak and auto-transcribe to text
- **Turkish Recognition**: Deepgram STT for native language input
- **Instant Transcription**: ~2 seconds processing time

### 🔄 Dual-Language Translation Interface
```
┌─────────────────────────────────────┐
│  Turkish Text Area         [🔊 Speak]│
│  (Türkçe metin buraya)              │
└─────────────────────────────────────┘
              ⬇️ [Translate]
┌─────────────────────────────────────┐
│  English Text Area         [🔊 Speak]│
│  (Translated English text)          │
└─────────────────────────────────────┘
```
- **Google Translate Style UI**: Two text areas with translation button
- **Both Speakable**: TTS works for both Turkish and English
- **Workflow**:
  1. Speak Turkish → auto-fills top text area (STT)
  2. Press "Translate" → English appears in bottom area
  3. Press "Speak" on either area → Avatar speaks with lip-sync

### 👤 Custom Avatar Upload
- **Upload Your Own Avatar**: Users can upload custom avatar images/videos
- **Instant Integration**: Uploaded avatar immediately usable with TTS + lip-sync
- **Personalization**: Learn with an avatar that resonates with you

### 📊 Language Proficiency Levels
- **CEFR Levels**: A1, A2, B1, B2, C1, C2
- **Adaptive Conversations**: Avatar adjusts vocabulary/grammar complexity based on selected level
- **Level Selection**: Choose your proficiency before starting conversation

### 🎮 Basic Gamification (Local Storage)
- **Conversation Counter**: Track number of conversations completed
- **Simple Scoring**: Points for completed interactions
- **Progress Indicators**: Visual feedback on practice frequency
- **No Database Required**: All data stored locally on device

---

## 🎯 How to Use (MVP Workflow)

### Option 1: Text Input → Translation → TTS
1. Type Turkish text in top text area
2. Press **[Translate]** → English appears in bottom area
3. Press **[Speak]** button → Avatar speaks English with lip-sync

### Option 2: Voice Input → Translation → TTS
1. Press **🎤 Microphone** → Speak in Turkish
2. STT auto-fills top text area
3. Press **[Translate]** → English translation appears below
4. Press **[Speak]** → Avatar speaks English with lip-sync

### Option 3: Direct English Practice
1. Type English directly in bottom text area
2. Press **[Speak]** → Avatar speaks it back
3. Listen and practice pronunciation

---

## 📁 Project Structure

```
suolingo/
├── src/
│   ├── screens/
│   │   └── AvatarScreen.tsx          # Main conversation screen
│   ├── services/
│   │   ├── avatar/
│   │   │   └── A2EService.ts         # Lip-sync generation
│   │   ├── voice/
│   │   │   ├── DeepgramService.ts    # Speech-to-Text
│   │   │   └── ElevenLabsService.ts  # Text-to-Speech
│   │   └── translation/
│   │       └── TranslationService.ts # Turkish ↔ English translation
│   ├── data/
│   │   └── avatars.ts                # Avatar configurations
│   └── types/
│       └── Avatar.ts                 # TypeScript definitions
└── assets/
    └── avatars/
        ├── male-idle.mp4             # Male avatar loop
        ├── female-idle.mp4           # Female avatar loop
        └── custom/                   # User-uploaded avatars
```

---

## 🛠️ Installation

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

# Translation API (Google Translate or alternatives)
TRANSLATION_API_KEY=your_translation_api_key

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

## 🎯 Assignment Requirements

### ✅ Completed MVP Features (100+ points)

- ✅ **Basic TTS + Lip-Sync** (85 points)
  - Avatar speaks text with synchronized lip movements
  - Smooth idle loop animations
  - Forward/Back navigation (◀️ ▶️)

- ✅ **STT Integration** (+15 points)
  - Microphone input
  - Real-time speech recognition

- ✅ **Dual-Language System** (+20 points)
  - Turkish ↔ English translation interface
  - Both languages speakable by avatar

- ✅ **Custom Avatar Upload** (+25 bonus points!)
  - User personalization
  - Instant avatar switching

- ✅ **Proficiency Levels** (+15 points)
  - CEFR-based (A1-C2)
  - Adaptive conversations

---

## 🔮 Future Roadmap

### 📅 Mid-Term (Post-Assignment)

#### Real-time Pronunciation Coaching
- **Waveform Analysis**: Visual feedback on pronunciation
- **AI Correction**: Instant feedback on mistakes
- **Repeat Practice**: Loop difficult words/phrases

#### Voice Chat Mode
- **Text-Free Conversations**: Pure speech-to-speech interaction
- **Natural Flow**: No typing, just talking

#### Scenario-Based Learning
- **Restaurant**: Ordering food, asking questions
- **Travel**: Directions, hotel check-in, airport
- **Business**: Meetings, emails, presentations
- **Pre-recorded Videos**: Nano Banana/Google AI Studio scenarios
- **Context Practice**: Real-world vocabulary in context

#### German Language Support
- **Second Target Language**: After English is polished
- **Same Architecture**: Easy to add more languages later

---

### 🚀 Long-Term (Personal Development)

#### Database Integration
- **User Profiles**: Persistent account system
- **Cloud Sync**: Progress saved across devices
- **Analytics Dashboard**: Detailed learning insights

#### Advanced Gamification
- **XP & Leveling System**: Earn points, unlock content
- **Badges & Achievements**: Milestones and streaks
- **Daily Challenges**: Personalized practice goals

#### Freemium Model
- **Free Tier**: Limited daily conversations
- **Premium Tier**: Unlimited access, HD avatars, exclusive features

#### Additional Languages
- **Spanish, French, Italian**: European language expansion
- **Japanese, Korean, Mandarin**: Asian language market

---

## 🎓 Core Technologies

- **React Native** (0.81.5) + **Expo SDK 54**
- **TypeScript** (5.9.2) - Strict mode
- **A2E AI** - Custom avatar lip-sync generation
- **Deepgram** - Speech-to-Text (Turkish & English)
- **ElevenLabs** - Natural voice synthesis
- **Google Translate API** - Turkish ↔ English translation
- **Material Design 3** (React Native Paper)

---

## 📊 Stats

- **Target Language (MVP)**: English (primary focus)
- **Interface Language**: Turkish (native)
- **Proficiency Levels**: A1, A2, B1, B2, C1, C2
- **API Services**: 5 (A2E, Deepgram, ElevenLabs, Gemini, Translation)
- **Lines of Code**: ~4,500+ (growing)

---

## 🎓 Academic Context

**Course**: Mobile Application Development
**Institution**: Sinop University
**Student**: Serhat Hotamışlıgil
**Date**: November 2025

---

## 🙏 Acknowledgments

- **A2E AI** for custom avatar lip-sync technology
- **Deepgram** for Turkish & English speech recognition
- **ElevenLabs** for natural voice synthesis
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
