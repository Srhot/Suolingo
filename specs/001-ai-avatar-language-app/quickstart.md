# Quickstart Guide: SUOLINGO Development

**Feature**: 001-ai-avatar-language-app
**Date**: 2025-10-27
**Purpose**: Get developers up and running with the SUOLINGO codebase

## Prerequisites

- Node.js 18+ and npm/yarn
- React Native development environment (see [React Native docs](https://reactnative.dev/docs/environment-setup))
- Firebase CLI: `npm install -g firebase-tools`
- Expo CLI: `npm install -g expo-cli`
- iOS Simulator (Mac only) or Android Emulator
- Git

## Initial Setup

### 1. Clone and Install

```bash
git clone https://github.com/your-org/suolingo.git
cd suolingo
npm install
```

### 2. Firebase Configuration

```bash
# Login to Firebase
firebase login

# Select project
firebase use suolingo-dev

# Deploy Firestore security rules
firebase deploy --only firestore:rules

# Deploy Storage security rules
firebase deploy --only storage

# Set Firebase Functions environment variables
cd firebase/functions
firebase functions:config:set \
  deepgram.api_key="YOUR_DEEPGRAM_KEY" \
  elevenlabs.api_key="YOUR_ELEVENLABS_KEY" \
  did.api_key="YOUR_DID_KEY" \
  openai.api_key="YOUR_OPENAI_KEY"

# Deploy Cloud Functions
firebase deploy --only functions
```

### 3. Environment Variables (Mobile App)

Create `.env` file in project root:

```env
EXPO_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
EXPO_PUBLIC_FIREBASE_APP_ID=1:123456789:ios:abcdef

# Development only
EXPO_PUBLIC_API_MOCK_MODE=false
```

### 4. Start Development Server

```bash
# Start Expo development server
npm start

# iOS Simulator (Mac only)
npm run ios

# Android Emulator
npm run android
```

## Project Structure Overview

```
suolingo/
├── src/                      # React Native app source
│   ├── components/           # Reusable UI components
│   ├── screens/              # App screens
│   ├── services/             # Business logic + AI integrations
│   ├── store/                # Redux Toolkit state management
│   └── navigation/           # React Navigation config
├── firebase/functions/       # Backend Cloud Functions
├── tests/                    # Jest + Detox tests
└── assets/                   # Images, fonts, pre-generated content
```

## Common Development Tasks

### Running Tests

```bash
# Unit tests
npm test

# Integration tests
npm run test:integration

# E2E tests (requires simulator/emulator running)
npm run test:e2e:ios
npm run test:e2e:android

# Test coverage report
npm run test:coverage
```

### Working with Firestore

```bash
# Start local Firestore emulator
firebase emulators:start --only firestore

# View emulator UI
# Open http://localhost:4000 in browser

# Connect app to emulator (update src/services/firebase/config.ts)
if (__DEV__) {
  firestore().useEmulator('localhost', 8080);
}
```

### Testing AI Services Locally

Use mock mode to avoid API costs during development:

```typescript
// src/services/stt/DeepgramService.ts
const USE_MOCK = __DEV__ && process.env.EXPO_PUBLIC_API_MOCK_MODE === 'true';

export const transcribe = async (audioUrl: string) => {
  if (USE_MOCK) {
    return {
      transcript: "Hola, ¿cómo estás?",
      confidence: 0.95,
      duration: 2.5
    };
  }

  // Real API call via Cloud Function
  const result = await functions().httpsCallable('sttTranscribe')({ audioUrl });
  return result.data;
};
```

### Pre-Generating Avatar Content

```bash
# Navigate to scripts directory
cd scripts

# Run pre-generation script
node pregenerate-scenarios.js --scenario restaurant-beginner --count 100
```

## Debugging

### React Native Debugger

1. Install [React Native Debugger](https://github.com/jhen0409/react-native-debugger)
2. Start app with `npm start`
3. In simulator, press `Cmd+D` (iOS) or `Cmd+M` (Android)
4. Select "Debug with Chrome"

### Redux DevTools

Redux Toolkit is configured to work with React Native Debugger automatically.

### Firebase Functions Logs

```bash
# Real-time logs
firebase functions:log --only sttTranscribe

# Last 10 errors
firebase functions:log --only sttTranscribe --limit 10
```

### Network Debugging

Use [Reactotron](https://github.com/infinitered/reactotron) for network request inspection:

```bash
npm install --save-dev reactotron-react-native
```

## Troubleshooting

### "Metro bundler error"
```bash
# Clear cache and restart
npx react-native start --reset-cache
```

### "Firebase Functions timeout"
Check Cloud Functions logs and ensure API keys are set correctly:
```bash
firebase functions:config:get
```

### "Firestore permission denied"
Verify Security Rules are deployed:
```bash
firebase deploy --only firestore:rules
```

### "Unable to resolve module"
```bash
rm -rf node_modules
npm install
cd ios && pod install && cd ..
```

## Next Steps

1. Review [data-model.md](./data-model.md) for database schema
2. Read [api-endpoints.md](./contracts/api-endpoints.md) for Cloud Functions API
3. Check [research.md](./research.md) for architectural decisions
4. Run `/speckit.tasks` to generate implementation task list

## Development Workflow

1. Pull latest from `main` branch
2. Create feature branch: `git checkout -b feature/your-feature`
3. Run tests before committing: `npm test`
4. Commit with conventional format: `feat(scope): description`
5. Push and create pull request
6. Ensure CI passes (tests + linting)
7. Request code review
8. Merge after approval

## Useful Commands

| Command | Purpose |
|---------|---------|
| `npm start` | Start Expo dev server |
| `npm test` | Run Jest unit tests |
| `npm run lint` | Run ESLint |
| `npm run type-check` | Run TypeScript compiler |
| `npm run build` | Create production build |
| `firebase deploy` | Deploy all Firebase resources |
| `expo publish` | Publish OTA update |

## Resources

- [React Native Docs](https://reactnative.dev/docs/getting-started)
- [Expo SDK Reference](https://docs.expo.dev/versions/latest/)
- [Firebase Docs](https://firebase.google.com/docs)
- [Redux Toolkit Docs](https://redux-toolkit.js.org/)
- [React Navigation Docs](https://reactnavigation.org/docs/getting-started)

## Getting Help

- **Technical issues**: Open GitHub issue with `bug` label
- **Architecture questions**: Tag `@tech-lead` in PR discussions
- **Deployment**: Contact DevOps team via Slack #suolingo-deploy

---

**Happy coding! 🚀**
