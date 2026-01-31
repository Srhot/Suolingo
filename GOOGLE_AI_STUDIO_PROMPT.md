# Google AI Studio Web App Prompt - Suolingo

## 🎯 Project Context

**Project Name:** Suolingo
**Current Platform:** React Native Mobile App (Expo)
**Target:** Web Application using Google AI Studio (December 2025)
**Goal:** Create an AI-powered language learning web app with avatar-based conversations and pronunciation assessment

---

## 📋 Prompt for Google AI Studio (Gemini 3 with Vibe Coding)

```
Create a modern, responsive web application for AI-powered language learning called "Suolingo". Use the latest web technologies and Google AI APIs.

## Core Features

### 1. AI Avatar Language Learning System
Build an interactive language learning platform where users practice conversations with AI avatars in real-world scenarios.

**Key Components:**
- Avatar selection interface with 6+ diverse characters (male/female, different personalities)
- 7 learning modes:
  1. Translation Mode (bidirectional Turkish ↔ English)
  2. Conversation Mode (free-form AI chat)
  3. Grammar Correction Mode (real-time feedback)
  4. Word of the Day (vocabulary building)
  5. Flashcard Mode (interactive learning)
  6. Grammar Quiz Mode (multiple choice)
  7. Role-Play Mode (6 real-world scenarios)

**Role-Play Scenarios:**
- 🍽️ Restaurant Ordering
- 💼 Job Interview
- 🛒 Shopping
- 🏥 Doctor Visit
- 🏨 Hotel Check-in
- ✈️ Airport Travel

### 2. Pronunciation Assessment System
**Use Google Cloud Speech-to-Text API for:**
- Real-time pronunciation scoring (0-100%)
- Three metrics: Accuracy, Fluency, Completeness
- Word-level pronunciation analysis
- Visual feedback with color-coded scores (green/yellow/red)
- XP rewards based on performance

**Implementation:**
- Microphone recording (Web Audio API)
- Audio format: WAV, 16kHz, mono
- Hybrid approach:
  - Fast transcription (use any available STT)
  - Detailed pronunciation assessment (Google Cloud Speech-to-Text)

### 3. Progress Tracking Dashboard
**Track and display:**
- Total role-play sessions completed
- Completed scenarios (visual progress: X/6)
- Pronunciation statistics:
  - Total assessments
  - Average score
  - Best score
- Practice time (minutes/hours)
- XP and leveling system
- Daily streak counter

**Visual Elements:**
- Progress bars with animations
- Achievement badges
- Statistics cards with charts
- Last practice date tracking

### 4. User Interface Requirements

**Design System:**
- Material Design 3 principles
- Responsive layout (mobile-first, tablet, desktop)
- Color scheme: Purple primary (#6750A4), complementary colors
- Dark mode support
- Smooth animations and transitions

**Key Screens:**
1. Home Dashboard
   - Quick stats overview
   - Daily goals
   - Continue learning CTA
2. Avatar Learning Screen
   - Mode selector (dropdown/tabs)
   - Avatar video/image display
   - Dual text input areas (for translation mode)
   - Microphone recording button
   - Send/Submit buttons
3. Role-Play Interface
   - Scenario selection grid
   - Conversation history (chat bubbles)
   - Microphone input
   - "Assess My Pronunciation" button
   - Real-time pronunciation feedback card
4. Progress Screen
   - Multiple stat cards
   - Visual progress bars
   - Achievement display
   - Practice history

### 5. Technical Stack & Google AI Studio Tools (December 2025)

**CORE: Gemini 2.5 Flash/Pro with Native Audio** ⭐ PRIMARY
- **Text Generation**: AI conversations, grammar correction, content generation
- **Native Audio TTS**: 30+ high-quality voices for avatars
  - Multi-speaker dialog (role-play scenarios)
  - Custom voice style, accent, pace control
  - Multilingual support (English, Turkish, etc.)
- **Audio Understanding**: Transcribe user speech, analyze pronunciation
- **Live API**: Real-time bidirectional audio/video streaming
  - Low-latency conversational AI
  - Proactive audio (background noise filtering)
  - Screen sharing & video feed support
- **Context Window**: Up to 1 million tokens

**AVATAR SYSTEM: Nano Banana + Veo 3 Pipeline** ⭐ RECOMMENDED
- **Nano Banana (Gemini 2.5 Flash Image)**:
  - Generate avatar character images
  - Edit/customize avatar appearances
  - Create scenario backgrounds
- **Veo 3**:
  - Animate Nano Banana images into videos
  - Text-to-video with synchronized native audio
  - 9:16 aspect ratio (mobile-friendly)
  - SynthID watermarking
  - 50% price reduction (more accessible)
- **Google Flow**: Pipeline Nano Banana → Veo 3

**SPEECH & PRONUNCIATION:**
- **Primary**: Gemini 2.5 Audio Understanding
  - Real-time transcription
  - Audio analysis & comprehension
  - Multi-turn audio conversations
- **Fallback**: Google Cloud Speech-to-Text API
  - Word-level confidence scores (for detailed pronunciation)
  - ONLY if Gemini audio doesn't provide confidence metrics

**MULTIMODAL FEATURES:**
- **Video Understanding**: Real-time screen/camera analysis
- **Image Generation**: Gemini native image gen (bonus feature)

**GOOGLE AI STUDIO TOOLS (Projen için Ekstra Özellikler):**

1. **Grounding with Google Search** ⭐ PRIORITY
   - Real-time web info + citations
   - Use cases:
     - Word of the Day: Get current usage examples
     - Cultural context for scenarios (e.g., restaurant etiquette)
     - Idioms and modern slang
     - Grammar rule explanations with sources
   - Cost: FREE for testing, $35/1000 queries in production

2. **Function Calling** ⭐ PRIORITY
   - Connect external APIs:
     - Dictionary API (word definitions, pronunciation guides)
     - Translation services (fallback/comparison)
     - User progress database (Firebase, Supabase)
     - Payment systems (if premium features)
   - 3 use cases: Augment Knowledge, Extend Capabilities, Take Actions

3. **Model Context Protocol (MCP)** ⭐ RECOMMENDED
   - Integrate external tools natively:
     - Google Maps (for location-based scenarios)
     - Databases (user data, vocab lists)
     - File systems (offline scenario caching)
   - Native support in Google Gen AI SDK
   - Example: MCP + Google Maps for realistic "Airport" role-play

4. **Code Execution**
   - Run Python scripts for:
     - Progress charts/graphs generation
     - Statistical analysis (pronunciation trends)
     - Data visualization (learning curves)
   - Generate charts directly in responses

5. **Multi-Tool Use (Live API)**
   - Combine multiple tools simultaneously:
     - Grounding + Function Calling + Code Execution
   - Example: Fetch word definition (Grounding) → Store in DB (Function) → Generate chart (Code)

6. **Prompt Gallery**
   - Use pre-built templates:
     - "Educational tutor" template for base AI personality
     - "Multi-turn conversation" for role-play
     - "JSON output" for structured data (flashcards, quiz)

7. **Model Comparison**
   - Test Gemini 2.5 Flash vs Pro side-by-side
   - Optimize for cost/latency vs quality

8. **Google Colab Integration**
   - Export code snippets (Python/Node.js/REST)
   - Build backend services from prototypes

**Frontend Technologies:**
- React 18+ with TypeScript
- State Management: Redux Toolkit or Zustand
- UI Framework: Material-UI (MUI) or Tailwind CSS
- Animations: Framer Motion
- Audio Recording: Web Audio API / MediaRecorder
- Storage: IndexedDB (for offline progress) + LocalStorage

**Backend (Optional - Can be serverless):**
- Firebase (Authentication, Firestore for user data)
- Or use Gemini API directly from frontend with API key management

### 6. Core User Flow

1. **Onboarding:**
   - Language selection (native → target language)
   - Avatar preference selection
   - Permissions (microphone access)

2. **Main Learning Flow:**
   - Select learning mode
   - Choose avatar
   - Select CEFR level (A1-C2 for difficulty)
   - Start conversation/exercise
   - Receive AI feedback
   - Track progress

3. **Role-Play Flow:**
   - Choose scenario (e.g., Restaurant)
   - Avatar starts conversation
   - User responds (text or voice)
   - Option to assess pronunciation
   - View detailed feedback
   - Earn XP
   - Continue or end scenario

### 7. AI Integration Details (Updated for Gemini 2.5 + Tools)

**A. Gemini 2.5 Conversation Architecture:**
```javascript
// Role-play with multi-turn context
const conversationConfig = {
  model: 'gemini-2.5-flash', // or gemini-2.5-pro
  systemInstruction: `You are a ${avatarPersonality} in a ${scenario}.
    User CEFR level: ${cefrLevel}
    Target language: ${targetLanguage}
    Keep responses 2-3 sentences, adjust difficulty accordingly.`,
  generationConfig: {
    temperature: 0.9, // More natural conversation
    topK: 40,
    topP: 0.95,
    maxOutputTokens: 200,
  }
};
```

**B. Gemini Native Audio TTS (Avatar Voice):**
```javascript
// Generate avatar speech with custom voice
const audioConfig = {
  model: 'gemini-2.5-flash',
  generateAudio: true,
  audioConfig: {
    voiceId: 'avatar-voice-01', // Choose from 30+ voices
    style: 'friendly', // conversational, professional, encouraging
    pace: 0.9, // Slightly slower for language learning
    languageCode: targetLanguage === 'en' ? 'en-US' : 'tr-TR'
  }
};

// Response includes both text and audio
const response = await model.generateContent({
  contents: [{ role: 'user', parts: [{ text: userMessage }] }],
  ...audioConfig
});
// response.audio contains MP3/WAV data
```

**C. Gemini Audio Understanding (Pronunciation Assessment):**
```javascript
// Transcribe & analyze user speech
const audioAnalysisConfig = {
  model: 'gemini-2.5-flash',
  contents: [{
    role: 'user',
    parts: [{
      inlineData: {
        mimeType: 'audio/wav',
        data: base64AudioData // User's recorded speech
      }
    }, {
      text: `Transcribe this audio and analyze pronunciation quality.
        Expected text: "${referenceText}"
        Provide: transcript, word-level accuracy, overall score (0-100).`
    }]
  }]
};

// Gemini returns structured analysis
const analysis = await model.generateContent(audioAnalysisConfig);
// Parse JSON response for scores
```

**D. Gemini Live API (Real-time Conversation):**
```javascript
// WebSocket-like streaming for voice chat
const liveSession = await gemini.startLiveSession({
  model: 'gemini-2.5-flash',
  audioInput: true,
  audioOutput: true,
  videoInput: false, // Can enable for camera
});

liveSession.on('audio', (audioChunk) => {
  // Play avatar's response in real-time
  audioElement.src = URL.createObjectURL(audioChunk);
});

// Stream user microphone
navigator.mediaDevices.getUserMedia({ audio: true })
  .then(stream => liveSession.sendAudio(stream));
```

**E. Nano Banana + Veo 3 Avatar Pipeline:**
```javascript
// Step 1: Generate avatar image with Nano Banana
const avatarImage = await nanoBanana.generate({
  prompt: `Professional ${avatarGender} language teacher, ${personality},
    waist-up portrait, neutral background, friendly expression`,
  style: 'photorealistic'
});

// Step 2: Animate with Veo 3 + sync audio
const avatarVideo = await veo3.animate({
  image: avatarImage.url,
  audio: geminiAudioResponse, // From Gemini TTS above
  duration: '2-3s',
  aspectRatio: '9:16', // Mobile-friendly
  motion: 'subtle_talking' // Lip-sync + natural gestures
});

// Cache video for common responses
localStorage.setItem(`avatar_${responseHash}`, avatarVideo.url);
```

**F. Grounding with Google Search (Word of the Day):**
```javascript
// Get current usage examples for vocabulary
const groundedResponse = await model.generateContent({
  contents: [{
    role: 'user',
    parts: [{ text: `Explain the word "${wordOfTheDay}" with current usage examples.` }]
  }],
  tools: [{
    googleSearchRetrieval: {
      dynamicRetrievalConfig: {
        mode: 'MODE_DYNAMIC', // Auto-decide when to search
        dynamicThreshold: 0.7
      }
    }
  }]
});

// Response includes citations from web
const { text, groundingMetadata } = groundedResponse.response;
// groundingMetadata.searchEntryPoint.renderedContent has sources
```

**G. Function Calling (External Dictionary API):**
```javascript
// Define function for dictionary lookup
const dictionaryFunction = {
  name: 'getDictionaryDefinition',
  description: 'Get word definition, pronunciation, examples from external dictionary',
  parameters: {
    type: 'object',
    properties: {
      word: { type: 'string', description: 'The word to look up' },
      language: { type: 'string', description: 'Language code (en, tr)' }
    },
    required: ['word', 'language']
  }
};

// Use in Gemini conversation
const response = await model.generateContent({
  contents: [{ role: 'user', parts: [{ text: 'What does "serendipity" mean?' }] }],
  tools: [{ functionDeclarations: [dictionaryFunction] }]
});

// Gemini decides to call the function
if (response.functionCalls) {
  const call = response.functionCalls[0];
  // Make actual API call to dictionary
  const definition = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/${call.args.language}/${call.args.word}`);

  // Send result back to Gemini
  const finalResponse = await model.generateContent({
    contents: [...previousMessages, {
      role: 'function',
      parts: [{ functionResponse: { name: call.name, response: definition } }]
    }]
  });
}
```

**H. MCP Integration (Google Maps for Scenarios):**
```javascript
// Connect Google Maps MCP for realistic scenarios
import { MCPClient } from '@google/mcp-client';

const mcpClient = new MCPClient({
  servers: {
    googleMaps: {
      command: 'google-maps-mcp-server',
      args: ['--api-key', process.env.GOOGLE_MAPS_API_KEY]
    }
  }
});

// Use in Airport scenario
const scenarioContext = await mcpClient.callTool('googleMaps', 'searchNearby', {
  location: 'Istanbul Airport',
  type: 'restaurant'
});

// Inject into Gemini prompt
const prompt = `You're at ${scenarioContext.results[0].name}.
  Help the user practice ordering food in English.`;
```

**I. Multi-Tool Use (Combined Powers):**
```javascript
// Combine Grounding + Function Calling + Code Execution
const multiToolResponse = await model.generateContent({
  contents: [{
    role: 'user',
    parts: [{ text: 'Create a vocabulary quiz about "travel" and show my progress chart.' }]
  }],
  tools: [
    { googleSearchRetrieval: {} }, // Get current travel vocab
    { functionDeclarations: [getUserProgressFunction] }, // Fetch user data
    { codeExecution: { language: 'PYTHON' } } // Generate chart
  ]
});

// Gemini orchestrates all tools automatically
```

**J. Fallback: Google Cloud STT (if word confidence needed):**
```javascript
// ONLY use if Gemini doesn't provide word-level scores
const sttConfig = {
  encoding: 'LINEAR16',
  sampleRateHertz: 16000,
  languageCode: targetLanguage === 'en' ? 'en-US' : 'tr-TR',
  enableWordTimeOffsets: true,
  enableWordConfidence: true, // For detailed pronunciation
  model: 'default'
};
```

### 8. Gamification & Rewards

**XP System:**
- Role-play completion: +25 XP
- Pronunciation score ≥90%: +50 XP
- Pronunciation score 80-89%: +40 XP
- Pronunciation score 70-79%: +30 XP
- Pronunciation score 60-69%: +20 XP
- Pronunciation score <60%: +10 XP

**Achievements:**
- First Assessment (1 pronunciation test)
- Perfect Score (95%+ pronunciation)
- Dedicated Learner (10 role-play sessions)
- Scenario Master (complete all 6 scenarios)

### 9. Accessibility & Best Practices

- WCAG 2.1 AA compliance
- Keyboard navigation support
- Screen reader compatibility
- Error handling with user-friendly messages
- Loading states and skeletons
- Offline capability (cache progress locally)
- API rate limit handling
- Cost optimization (free tier awareness)

### 10. Security & Privacy

- No API keys in frontend code (use environment variables)
- Secure authentication (Firebase Auth or similar)
- User data encryption
- GDPR compliance for voice recordings
- Clear consent for microphone usage
- Option to delete voice data

---

## Implementation Instructions

**Using Gemini 3 "Vibe Coding" in Google AI Studio:**

1. Use single-prompt app generation capability
2. Leverage Build Mode for rapid prototyping
3. Use native code generation for components
4. Implement MCP (Model Context Protocol) for API connections
5. Test iteratively with annotations feature

**Suggested Project Structure:**
```
src/
├── components/
│   ├── Avatar/
│   ├── PronunciationFeedback/
│   ├── ProgressCards/
│   └── common/
├── services/
│   ├── gemini.ts (AI conversations)
│   ├── pronunciation.ts (Speech-to-Text)
│   ├── progress.ts (tracking)
│   └── audio.ts (recording)
├── pages/
│   ├── Home.tsx
│   ├── Learning.tsx
│   ├── RolePlay.tsx
│   └── Progress.tsx
├── store/
│   └── slices/
└── utils/
```

**Prioritize:**
1. Core role-play functionality with text input
2. Gemini API integration for AI responses
3. Pronunciation assessment with Google Cloud STT
4. Progress tracking and persistence
5. UI polish and animations
6. (Optional) Veo 3 avatar videos if available

---

## Success Metrics

- User can complete a role-play scenario end-to-end
- Pronunciation assessment returns accurate scores
- Progress persists across sessions
- Responsive UI works on all devices
- API costs stay within free tier limits
- App loads in <3 seconds
- Smooth 60fps animations

---

## Additional Context from Current Mobile App

**Current Tech Stack (for reference):**
- React Native with Expo
- TypeScript 5.3+
- Gemini API for AI conversations
- Google Cloud Speech-to-Text for pronunciation
- Deepgram for fast transcription
- AsyncStorage for local data
- Redux Toolkit for state management

**Proven Features (migrate to web):**
- Hybrid STT approach (Deepgram + Google Cloud) works well
- CEFR-based difficulty adjustment is effective
- Role-play scenarios drive engagement
- Real-time pronunciation feedback is valuable
- XP system motivates users

**Known Challenges:**
- Google Cloud STT requires API to be enabled
- Long audio files may exceed rate limits
- Free tier: 60 min/month for pronunciation assessment
- Need clear user guidance for microphone permissions

---

## Output Format Request

Generate a complete, production-ready web application with:
1. Clean, commented code
2. Responsive UI components
3. Working API integrations (with placeholders for keys)
4. Error handling and loading states
5. Type-safe TypeScript throughout
6. README with setup instructions
7. Environment variables template (.env.example)

Build this as a modern, professional language learning platform that leverages the full power of Google's AI ecosystem.
```

---

## 🔧 Customization Notes for Your Submission

**Before submitting to Google AI Studio:**

1. **Add your specific requirements:**
   - Desired color scheme/branding
   - Specific CEFR levels to support
   - Languages beyond Turkish-English
   - Any additional features

2. **API Credentials Section:**
   ```
   I will provide:
   - Gemini API Key: [your key]
   - Google Cloud Project ID: [your project]
   ```

3. **Deployment preferences:**
   - Vercel, Netlify, Firebase Hosting, etc.

4. **Optional Veo 3 integration:**
   If you want to test Veo 3 for avatar videos, add:
   ```
   Integrate Veo 3 for avatar video responses:
   - Generate 2-3 second avatar reaction videos
   - Synchronize with TTS audio
   - Cache common responses
   - Fallback to static images if quota exceeded
   ```

---

## 📊 Expected Google AI Studio Output

Given Gemini 3's "vibe coding" capabilities, you should receive:
- ✅ Complete React/TypeScript web app
- ✅ Component library with Material Design
- ✅ Working Gemini API integration
- ✅ Pronunciation assessment setup
- ✅ Responsive layouts
- ✅ State management
- ✅ Routing (React Router)
- ✅ Build configuration (Vite or Next.js)

---

## 🚀 Post-Generation Steps

1. **Test locally:**
   ```bash
   npm install
   npm run dev
   ```

2. **Add API keys to `.env`:**
   ```
   VITE_GEMINI_API_KEY=your_key
   VITE_GOOGLE_CLOUD_API_KEY=your_key
   ```

3. **Enable Google Cloud APIs:**
   - Cloud Speech-to-Text API
   - Generative Language API (Gemini)

4. **Deploy:**
   ```bash
   npm run build
   # Deploy to your preferred platform
   ```

---

## 📚 Resources & Documentation (December 2025)

### Google AI Studio Core
- **AI Studio Overview**: [Google AI Studio Review 2025](https://skywork.ai/blog/google-ai-studio-review-2025/)
- **Beginner's Guide**: [How to Use Google AI Studio 2025](https://www.geeky-gadgets.com/google-ai-studio-beginner-guide-2025/)
- **Latest Updates**: [AI Studio Update April 2025](https://www.geeky-gadgets.com/ai-studio-update-april-2025/)

### Gemini Models & APIs
- **Gemini 3**: [Gemini 3 for Developers](https://blog.google/technology/developers/gemini-3-developers/)
- **Gemini 2.5 Flash/Pro**: [Gemini 2.5 Flash - DeepMind](https://deepmind.google/models/gemini/flash/)
- **Gemini API Docs**: [Gemini API](https://ai.google.dev/gemini-api/docs/models)
- **Vibe Coding**: [Native Code Generation in AI Studio](https://developers.googleblog.com/en/google-ai-studio-native-code-generation-agentic-tools-upgrade/)

### Audio & Speech
- **Native Audio**: [Gemini 2.5 Native Audio](https://blog.google/technology/google-deepmind/gemini-2-5-native-audio/)
- **Audio Understanding**: [Gemini Audio Understanding](https://ai.google.dev/gemini-api/docs/audio)
- **Live API**: [Gemini 2.0 Flash Multimodal Live API](https://simonwillison.net/2024/Dec/11/gemini-2/)

### Video & Images
- **Veo 3**: [Veo 3 Documentation](https://cloud.google.com/vertex-ai/generative-ai/docs/models/veo/3-0-generate-preview)
- **Veo 3 in Gemini API**: [Build with Veo 3](https://developers.googleblog.com/en/veo-3-now-available-gemini-api/)
- **Nano Banana**: [Nano Banana Pro](https://blog.google/technology/ai/nano-banana-pro/)
- **Nano Banana Guide**: [How to Access Nano Banana](https://www.glbgpt.com/hub/how-to-access-google-nano-banana-4-tested-ways/)

### Google AI Studio Tools
- **Grounding with Search**: [Grounding with Google Search](https://developers.googleblog.com/en/gemini-api-and-ai-studio-now-offer-grounding-with-google-search/)
- **Function Calling**: [Function Calling Docs](https://ai.google.dev/gemini-api/docs/function-calling)
- **Tool Use**: [Using Tools with Gemini](https://ai.google.dev/gemini-api/docs/tools)
- **Live API Tools**: [Tool Use with Live API](https://ai.google.dev/gemini-api/docs/live-tools)

### Model Context Protocol (MCP)
- **MCP Overview**: [Model Context Protocol with Gemini](https://medium.com/google-cloud/model-context-protocol-mcp-with-google-gemini-llm-a-deep-dive-full-code-ea16e3fac9a3)
- **AI Studio MCP Server**: [Google AI Studio MCP Server](https://playbooks.com/mcp/eternnoir-google-ai-studio)
- **MCP Toolbox**: [MCP Toolbox for Databases](https://cloud.google.com/blog/products/ai-machine-learning/mcp-toolbox-for-databases-now-supports-model-context-protocol)

### Additional Resources
- **Google Antigravity**: [Google I/O 2025 Updates](https://blog.google/technology/developers/google-ai-developer-updates-io-2025/)
- **Cloud Speech-to-Text**: [Speech-to-Text API](https://cloud.google.com/speech-to-text)
- **Vibe Coding Examples**: [17 Creative Builds](https://www.tomsguide.com/ai/googles-ai-studio-just-dropped-17-new-ways-to-vibe-code-with-gemini-heres-what-they-can-do)

---

**Good luck with your Google AI Studio web app! 🚀🎓**

This prompt is optimized for Gemini 3's capabilities as of December 2025, including vibe coding, native code generation, and single-prompt app creation.
