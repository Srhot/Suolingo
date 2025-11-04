# 🎓 SUOLINGO - AI Avatar Language Learning App

> **University Assignment**: Interactive language learning application with real-time AI avatar lip-sync

AI-powered Turkish language learning application featuring **custom AI avatars** with real-time lip-sync technology, text-to-speech, and speech-to-text capabilities.

## ✨ Features

### 🎬 AI Avatar Technology
- **Custom 3D Avatars**: Male (Prof. Dr. Ahmet Yılmaz) and Female (Dr. Ayşe Kaya)
- **Real-time Lip-Sync**: A2E AI integration for realistic lip movements
- **Loop Animations**: Smooth idle animations (Google Flow / Nano Banana)
- **Voice Synthesis**: Turkish TTS with natural pronunciation

### 💬 Interactive Conversation
- **Text Input**: Type messages to practice
- **Voice Recognition**: Speech-to-Text with Deepgram (bonus feature)
- **Conversation History**: Navigate through previous messages with ◀️ ▶️ buttons
- **Video Playback**: Watch avatar speak your messages

### 🎯 Core Technologies
- **React Native** (0.81.5) + **Expo SDK 54**
- **TypeScript** (5.9.2) - Strict mode
- **A2E AI** - Custom avatar lip-sync generation
- **Deepgram** - Speech-to-Text (Turkish support)
- **ElevenLabs** - Natural voice synthesis
- **Material Design 3** (React Native Paper)

## 📋 Prerequisites

- Node.js 18+
- npm or yarn
- Expo CLI
- iOS/Android device or simulator

## 🛠️ Installation

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

Create a `.env` file in the root directory:

```bash
cp .env.example .env
```

Then edit `.env` and add your API keys:

```env
# Required API Keys
DEEPGRAM_API_KEY=your_deepgram_api_key
ELEVENLABS_API_KEY=your_elevenlabs_api_key
A2E_API_KEY=your_a2e_api_key
GEMINI_API_KEY=your_gemini_api_key

# Service URLs (default values)
DEEPGRAM_BASE_URL=https://api.deepgram.com
ELEVENLABS_BASE_URL=https://api.elevenlabs.io
A2E_BASE_URL=https://video.a2e.ai
```

### 4. Run the App

```bash
# Start Expo development server
npx expo start

# Then press:
# - 'i' for iOS simulator (Mac only)
# - 'a' for Android emulator
# - Scan QR code with Expo Go app
```

## 🎮 How to Use

1. **Select Avatar**: Choose between male or female professor
2. **Type Message**: Enter text in Turkish
3. **Press "Konuştur"**: Avatar generates lip-sync video
4. **Watch & Listen**: Video plays with synchronized speech
5. **Navigate**: Use ◀️ ▶️ buttons to replay previous messages
6. **Voice Input** (Optional): Use 🎤 microphone button for speech-to-text

## 📁 Project Structure

```
suolingo/
├── src/
│   ├── screens/
│   │   └── AvatarScreen.tsx          # Main conversation screen
│   ├── services/
│   │   ├── avatar/
│   │   │   └── A2EService.ts         # Lip-sync generation
│   │   └── voice/
│   │       ├── DeepgramService.ts    # Speech-to-Text
│   │       └── ElevenLabsService.ts  # Text-to-Speech
│   ├── data/
│   │   └── avatars.ts                # Avatar configurations
│   └── types/
│       └── Avatar.ts                 # TypeScript definitions
└── assets/
    └── avatars/
        ├── male-idle.mp4             # Male avatar loop
        ├── female-idle.mp4           # Female avatar loop
        ├── Erkek Düz Profil.png      # Male thumbnail
        └── Kadın Düz Profil.png      # Female thumbnail
```

## 🎯 Assignment Requirements

### ✅ Completed Features (100+ points)

- ✅ **Basic Features** (85 points)
  - Single screen app with AI avatar
  - Loop video playing continuously
  - Text input field
  - "Konuştur" (Speak) button

- ✅ **Forward/Back Navigation** (+15 points)
  - ◀️ Previous message button
  - ▶️ Next message button

- ✅ **Loop Video** (+25 bonus points)
  - Smooth idle animations
  - Seamless transitions

- ✅ **Real-time Lip-Sync** (Unlimited bonus!)
  - Custom avatar integration
  - A2E AI lip-sync technology
  - Realistic mouth movements
  - Turkish voice support

## 🚀 Technical Highlights

### A2E AI Integration
- Two-step process: TTS audio generation → Video generation with lip-sync
- Custom avatar training (uploaded to A2E platform)
- Progress tracking during video processing
- Automatic polling for completion

### Voice Services
- **Deepgram STT**: Real-time Turkish speech recognition
- **ElevenLabs TTS**: Natural voice synthesis (fallback)
- **A2E Built-in TTS**: Integrated with lip-sync generation

### Performance
- Async/await for smooth UX
- Error handling with user-friendly alerts
- Loading indicators during processing
- Caching for repeated messages

## 🐛 Known Issues & Fixes

### expo-av Deprecation Warning
```
⚠️ expo-av is deprecated in SDK 54
```
**Status**: Working correctly, will migrate to `expo-video` in future update

### Speech-to-Text Format Issue
**Issue**: WAV format compatibility with Deepgram
**Status**: Under investigation, feature optional

## 📊 Stats

- **Setup Time**: ~5 minutes
- **Total Components**: 15+
- **Lines of Code**: ~3,500+
- **API Services**: 4 (A2E, Deepgram, ElevenLabs, Gemini)
- **Supported Languages**: Turkish (primary)

## 🎓 Academic Context

**Course**: Mobile Application Development
**Institution**: Sinop University
**Instructor**: [Your Instructor's Name]
**Student**: Serhat Hotamışlıgil
**Date**: November 2025

## 🙏 Acknowledgments

- **A2E AI** for custom avatar lip-sync technology
- **Deepgram** for Turkish speech recognition
- **ElevenLabs** for natural voice synthesis
- **Expo** for React Native development platform
- Course instructors for guidance and support

## 📝 License

This project is created for educational purposes as part of a university assignment.

## 🔗 Links

- **GitHub**: [github.com/Srhot/Suolingo](https://github.com/Srhot/Suolingo)
- **LinkedIn**:[ [Your LinkedIn Profile]](https://www.linkedin.com/in/serhat-sezgul/)
- **Demo Video**: [YouTube Link]

---

Made with ❤️ for language learning education
