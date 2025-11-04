# Research: AI Avatar Language Learning Application

**Feature**: 001-ai-avatar-language-app
**Date**: 2025-10-27
**Status**: Complete

## Overview

This document consolidates research findings for the SUOLINGO AI avatar-based language learning application, covering AI service integration patterns, cost optimization strategies, React Native best practices for offline-first architectures, and Firebase Cloud Functions patterns for AI API orchestration.

---

## 1. AI Service Integration Architecture

### Decision: Serverless Proxy Pattern with Firebase Cloud Functions

**Rationale**:
- **Security**: All AI service API keys (Deepgram, ElevenLabs, D-ID, OpenAI) must remain server-side per constitution principle IV
- **Cost Control**: Centralized logging and rate limiting enforced at Cloud Functions layer before external API calls
- **Flexibility**: Easy to swap AI providers without mobile app updates
- **Monitoring**: Single point for cost tracking, error handling, and retry logic

**Implementation Pattern**:

```typescript
// Firebase Cloud Functions structure
export const sttProxy = functions.https.onCall(async (data, context) => {
  // 1. Authenticate user
  if (!context.auth) throw new functions.https.HttpsError('unauthenticated', 'User must be logged in');

  // 2. Check usage limits
  const user = await firestore.collection('users').doc(context.auth.uid).get();
  if (user.data().dailyUsage >= 5 && user.data().tier === 'free') {
    throw new functions.https.HttpsError('resource-exhausted', 'Daily limit reached');
  }

  // 3. Call external AI service with retry logic
  const result = await retryWithExponentialBackoff(() =>
    deepgramClient.transcribe(data.audioUrl)
  );

  // 4. Log cost
  await logCost({
    userId: context.auth.uid,
    service: 'deepgram',
    cost: calculateDeepgramCost(result.duration),
    timestamp: FieldValue.serverTimestamp()
  });

  // 5. Return result
  return result;
});
```

**Alternatives Considered**:
- **Direct client integration**: Rejected due to API key exposure risk
- **Dedicated Node.js backend**: Rejected due to higher operational complexity vs serverless
- **AWS Lambda**: Rejected due to existing Firebase integration and Firestore synergy

---

## 2. Cost Optimization Strategy

### Decision: Pre-Generation + Multi-Tier Caching + Smart Fallbacks

**Rationale**:
- **80% cache hit rate target**: Most language learning conversations follow predictable patterns at beginner/intermediate levels
- **Cost breakdown**: Avatar video generation ($0.30/min with D-ID) is most expensive; TTS ($0.18/1K chars) and STT ($0.0043/min) are cheaper
- **User experience**: Pre-generated content loads instantly vs 5-15 second wait for real-time generation

**Pre-Generation Strategy**:

For each of 9 scenarios (3 categories × 3 levels), generate top 100 most common avatar responses:
- **Common greetings**: "Hello!", "How can I help you?", "What would you like to order?"
- **Common follow-ups**: "Can you repeat that?", "Great! What else?", "Perfect pronunciation!"
- **Common corrections**: "Try saying it like this...", "Almost! The accent is on..."

**Total pre-generated content**: 900 videos × 10 seconds avg = 9,000 seconds = 150 minutes
**Cost**: 150 minutes × $0.30/min = $45 one-time generation cost
**Monthly savings** (assuming 80% cache hit, 1000 users, 5 scenarios/day avg):
- Without cache: 1000 users × 5 scenarios × 30 days × 3 responses/scenario × 10 sec avg × $0.30/min ÷ 60 = $2,250/month
- With 80% cache: $2,250 × 0.20 = $450/month (saves $1,800/month)

**Caching Tiers**:

1. **Level 1 - Device (AsyncStorage)**: Recently used videos, up to 100MB limit
2. **Level 2 - Firebase Storage**: All pre-generated content + recent custom generations
3. **Level 3 - Cloudflare R2 CDN**: Global edge caching for sub-second delivery

**Smart Fallback Chain**:

```
Avatar Video Generation Timeout (15s)
  ↓ FAIL
Audio + Static Avatar Image (no lip-sync)
  ↓ FAIL (audio generation timeout)
Text-Only with Animated Typing Effect
```

**Alternatives Considered**:
- **Real-time only**: Rejected due to 5-15 second wait times and high costs
- **On-device TTS**: Evaluated but quality significantly worse than ElevenLabs for non-English
- **Single CDN tier**: Rejected due to global latency concerns (target users in US, EU, Asia)

---

## 3. React Native Offline-First Architecture

### Decision: Redux Toolkit + AsyncStorage + Sync Queue Pattern

**Rationale**:
- **Constitution requirement**: Offline mode for core features mandatory (principle V)
- **Use case**: Language learners practice during commutes, flights, areas with poor connectivity
- **Data synchronization**: Progress, XP, completed scenarios must sync when online

**Implementation Pattern**:

```typescript
// Offline detection hook
export const useOffline = () => {
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsOffline(!state.isConnected);
    });
    return unsubscribe;
  }, []);

  return isOffline;
};

// Sync manager pattern
class SyncManager {
  private queue: OfflineAction[] = [];

  async enqueueAction(action: OfflineAction) {
    this.queue.push(action);
    await AsyncStorage.setItem('syncQueue', JSON.stringify(this.queue));
  }

  async syncWhenOnline() {
    const isOnline = await NetInfo.fetch().then(state => state.isConnected);
    if (!isOnline) return;

    while (this.queue.length > 0) {
      const action = this.queue[0];
      try {
        await this.executeAction(action);
        this.queue.shift(); // Remove from queue after success
      } catch (error) {
        console.error('Sync failed, will retry:', error);
        break; // Stop syncing, will retry later
      }
    }

    await AsyncStorage.setItem('syncQueue', JSON.stringify(this.queue));
  }
}
```

**Offline Capabilities**:
- ✅ Browse downloaded scenarios
- ✅ Practice with pre-generated avatar responses
- ✅ Track progress locally (XP, completed scenarios)
- ❌ Real-time speech analysis (requires STT API)
- ❌ Custom AI responses (requires GPT API)
- ❌ Premium avatar features (requires video generation APIs)

**Sync Strategy**:
- On app launch: Check for pending sync queue
- On network restore: Auto-sync queued actions
- Conflicts: Server timestamp wins (last-write-wins for XP/progress)

**Alternatives Considered**:
- **PouchDB/CouchDB**: Rejected due to overhead for simple sync needs
- **Realm**: Rejected due to added dependency and Firebase Firestore compatibility
- **WatermelonDB**: Evaluated but Redux + AsyncStorage simpler for this use case

---

## 4. Firebase Firestore Schema Design

### Decision: Denormalized User-Centric Collections

**Rationale**:
- **Query patterns**: Most queries are user-scoped ("get my progress", "get my conversations")
- **Real-time sync**: Firestore listeners on user-specific documents for instant UI updates
- **Cost control**: Denormalization reduces document reads (0.06¢ per read adds up at scale)

**Schema Structure**:

```
users/{userId}
  - nativeLanguage: string
  - targetLanguages: string[]
  - tier: 'free' | 'premium'
  - dailyUsageCount: number
  - dailyUsageResetAt: timestamp
  - monthlyUsageCount: number
  - totalXP: number
  - currentLevel: number
  - streakDays: number
  - lastActivityDate: timestamp
  - createdAt: timestamp

progress/{userId}/skills/{skillId}
  - skillName: 'vocabulary' | 'grammar' | 'pronunciation' | 'listening'
  - proficiencyScore: number (0-100)
  - lastAssessedAt: timestamp

scenarios/{scenarioId}
  - category: 'restaurant' | 'travel' | 'business'
  - difficulty: 'beginner' | 'intermediate' | 'advanced'
  - title: string
  - objectives: string[]
  - estimatedDuration: number
  - preGeneratedResponses: { [key: string]: string } // key = response text, value = video URL

userScenarios/{userId}/completed/{scenarioId}
  - completedAt: timestamp
  - performanceScore: number
  - pronunciationScore: number
  - xpEarned: number

conversations/{conversationId}
  - userId: string
  - scenarioId: string
  - avatarId: string
  - startedAt: timestamp
  - endedAt: timestamp | null
  - messages: Message[]
    - speaker: 'user' | 'avatar'
    - text: string
    - audioUrl?: string
    - videoUrl?: string
    - timestamp: timestamp

achievements/{userId}/badges/{badgeId}
  - badgeName: string
  - unlockedAt: timestamp
  - xpBonus: number

costLogs/{logId}
  - userId: string
  - service: 'deepgram' | 'elevenlabs' | 'd-id' | 'openai'
  - estimatedCost: number
  - tokenCount?: number
  - duration?: number
  - timestamp: timestamp
```

**Security Rules**:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only read/write their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }

    // Prevent usage limit bypass
    match /users/{userId} {
      allow update: if request.auth.uid == userId
        && (!request.resource.data.keys().hasAny(['dailyUsageCount', 'tier']));
    }

    // Scenarios are read-only for clients
    match /scenarios/{scenarioId} {
      allow read: if request.auth != null;
      allow write: if false; // Only backend can write
    }
  }
}
```

**Alternatives Considered**:
- **Normalized relational structure**: Rejected due to query complexity and read costs
- **Single users collection with subcollections**: Evaluated but flat structure simpler for this scale
- **PostgreSQL**: Rejected due to Firebase integration benefits (auth, real-time, serverless functions)

---

## 5. Testing Strategy

### Decision: Jest + React Native Testing Library + Detox E2E

**Rationale**:
- **Constitution requirement**: 70% minimum test coverage (principle I)
- **React Native ecosystem**: Jest + Testing Library are standard tools with best community support
- **E2E coverage**: Detox supports iOS/Android testing critical user flows

**Test Coverage Targets**:

| Layer | Tool | Coverage Target | Example Tests |
|-------|------|-----------------|---------------|
| Unit | Jest | 80%+ | Service functions, utility functions, Redux reducers |
| Integration | Testing Library | 60%+ | Component interactions, hook behavior, API mocking |
| E2E | Detox | Critical paths | Onboarding → Scenario selection → Conversation → Progress view |

**Key Test Scenarios**:

1. **Offline Mode Tests** (`tests/integration/offline-sync.test.ts`):
   - Complete scenario offline → Verify queued for sync
   - Go online → Verify sync completes → Check Firestore updated

2. **Cost Tracking Tests** (`tests/integration/cost-tracking.test.ts`):
   - Make AI API call → Verify cost logged with correct calculation
   - Approach daily limit → Verify warning shown
   - Hit daily limit → Verify API calls blocked

3. **Conversation Flow Tests** (`tests/integration/conversation-flow.test.ts`):
   - User speaks → Mock STT response → Verify transcription shown
   - Avatar responds → Mock video URL → Verify video plays
   - Fallback test: Video timeout → Verify audio-only fallback activated

4. **E2E Happy Path** (`tests/e2e/main-flow.e2e.ts`):
   - Launch app → Login → Select Spanish language
   - Choose Restaurant-Beginner scenario → Complete 3-turn conversation
   - Navigate to Progress tab → Verify XP earned, scenario marked complete

**Mock Strategy**:
- Mock all AI services (Deepgram, ElevenLabs, D-ID, OpenAI) with fixtures
- Mock Firebase with `@testing-library/react-native` utilities
- Use Detox mocking for E2E network requests

**Alternatives Considered**:
- **Cypress**: Rejected, does not support React Native
- **Appium**: Evaluated but Detox has better React Native integration
- **Manual testing only**: Rejected due to constitution 70% coverage requirement

---

## 6. Performance Optimization Strategies

### Decision: Lazy Loading + Memoization + Image/Video Optimization

**Rationale**:
- **Constitution requirement**: 3-second initial load time (principle V)
- **Bundle size**: React Native apps bloat easily; need aggressive code splitting
- **Video performance**: Avatar videos are 5-15 MB each; need quality tiers + progressive loading

**Implementation Strategies**:

1. **Lazy Loading with React.lazy + Suspense**:

```typescript
// Instead of importing all screens upfront
import ConversationScreen from './screens/ConversationScreen'; // ❌ Loads immediately

// Use lazy loading for non-critical screens
const ProgressScreen = React.lazy(() => import('./screens/ProgressScreen')); // ✅ Loads on demand

<Suspense fallback={<LoadingSpinner />}>
  <ProgressScreen />
</Suspense>
```

2. **Memo

ization with useMemo and React.memo**:

```typescript
// Expensive avatar video rendering
const AvatarPlayer = React.memo(({ videoUrl, onComplete }) => {
  // Only re-render if videoUrl changes
  return <Video source={{ uri: videoUrl }} onEnd={onComplete} />;
});

// Expensive cost calculation
const totalCost = useMemo(() => {
  return costLogs.reduce((sum, log) => sum + log.estimatedCost, 0);
}, [costLogs]); // Only recalculate when costLogs changes
```

3. **Video Quality Tiers**:

```typescript
const getVideoUrl = (responseId: string, userTier: UserTier): string => {
  const quality = userTier === 'premium' ? '720p' : '360p';
  return `https://cdn.suolingo.com/videos/${responseId}_${quality}.mp4`;
};
```

4. **Progressive Image Loading with react-native-fast-image**:

```typescript
<FastImage
  source={{
    uri: avatarImageUrl,
    priority: FastImage.priority.high,
    cache: FastImage.cacheControl.immutable
  }}
  resizeMode="cover"
/>
```

**Performance Monitoring**:
- Use Expo's `Performance.now()` for measuring critical paths
- Firebase Performance Monitoring for real-world metrics
- Target metrics tracked:
  - Time to first avatar display: <3s
  - STT processing time: <2s
  - Video generation wait time: <15s (with progress indicator)

**Alternatives Considered**:
- **No lazy loading**: Rejected, initial bundle would exceed 3-second load target
- **Single video quality**: Rejected, 720p videos too large for free users with limited data plans
- **CDN-free architecture**: Rejected, latency from Firebase Storage alone too high for global users

---

## 7. Retry Logic and Error Handling

### Decision: Exponential Backoff with Circuit Breaker Pattern

**Rationale**:
- **AI service reliability**: External APIs (Deepgram, ElevenLabs, D-ID) have occasional failures
- **User experience**: Automatic retries reduce perceived errors
- **Cost control**: Circuit breaker prevents runaway costs during service outages

**Implementation**:

```typescript
async function retryWithExponentialBackoff<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  baseDelayMs: number = 1000
): Promise<T> {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      if (attempt === maxRetries - 1) throw error; // Last attempt, give up

      const delayMs = baseDelayMs * Math.pow(2, attempt); // Exponential: 1s, 2s, 4s
      await new Promise(resolve => setTimeout(resolve, delayMs));
    }
  }
  throw new Error('Unreachable');
}

// Circuit breaker pattern
class CircuitBreaker {
  private failureCount = 0;
  private lastFailureTime = 0;
  private readonly FAILURE_THRESHOLD = 5;
  private readonly RESET_TIMEOUT_MS = 60000; // 1 minute

  async execute<T>(operation: () => Promise<T>): Promise<T> {
    // Check if circuit is open (too many recent failures)
    if (this.failureCount >= this.FAILURE_THRESHOLD) {
      const timeSinceFailure = Date.now() - this.lastFailureTime;
      if (timeSinceFailure < this.RESET_TIMEOUT_MS) {
        throw new Error('Circuit breaker open - service temporarily unavailable');
      }
      // Reset circuit after timeout
      this.failureCount = 0;
    }

    try {
      const result = await operation();
      this.failureCount = 0; // Success - reset counter
      return result;
    } catch (error) {
      this.failureCount++;
      this.lastFailureTime = Date.now();
      throw error;
    }
  }
}

// Usage in Cloud Functions
const deepgramCircuit = new CircuitBreaker();
export const sttProxy = functions.https.onCall(async (data) => {
  return await deepgramCircuit.execute(() =>
    retryWithExponentialBackoff(() => deepgramClient.transcribe(data.audioUrl))
  );
});
```

**Error Classification**:
- **Retriable errors**: Network timeouts, 5xx server errors, rate limit 429
- **Non-retriable errors**: 4xx client errors (bad request, authentication), quota exceeded
- **Fallback triggers**: After max retries OR circuit breaker open

**Alternatives Considered**:
- **Simple retry without exponential backoff**: Rejected, can overwhelm failing service
- **No circuit breaker**: Rejected, could cause cascading failures and cost spikes
- **Third-party retry libraries**: Evaluated (p-retry) but custom solution simpler for this use case

---

## 8. GDPR Compliance Implementation

### Decision: Consent-First Architecture + Auto-Deletion + Audit Logs

**Rationale**:
- **Constitution requirement**: GDPR compliance for voice/face data (principle IV)
- **Legal requirement**: Mandatory for EU users, good practice globally
- **User trust**: Transparent data handling builds confidence in sensitive app (voice recordings)

**Consent Flow**:

```typescript
// On first app launch
const onboardingSteps = [
  {
    title: 'Voice Recording',
    description: 'We record your voice to provide pronunciation feedback. Your recordings are:',
    bullets: [
      'Stored securely and encrypted',
      'Used only for your learning progress',
      'Automatically deleted after 30 days of inactivity',
      'Deletable by you at any time in Settings'
    ],
    required: true // Cannot use app without consent
  },
  {
    title: 'Face Data (Premium)',
    description: 'Custom avatars require face video upload. Your face data:',
    bullets: [
      'Never shared with third parties',
      'Processed securely by our partners (D-ID, Google Veo)',
      'Can be deleted from Settings at any time'
    ],
    required: false // Only for premium users
  }
];
```

**Data Retention Policy**:
- Voice recordings: Auto-delete after 30 days of user inactivity
- Face videos (premium): Auto-delete after 90 days of inactivity OR when user downgrades to free
- Transcriptions: Retained indefinitely (non-PII, used for learning progress)
- Progress data: Retained until user requests deletion

**User Data Deletion Endpoint**:

```typescript
export const deleteUserData = functions.https.onCall(async (data, context) => {
  if (!context.auth) throw new functions.https.HttpsError('unauthenticated');

  const userId = context.auth.uid;

  // Delete all user data
  await Promise.all([
    firestore.collection('users').doc(userId).delete(),
    firestore.collection('progress').doc(userId).delete(),
    firestore.collection('conversations').where('userId', '==', userId).get()
      .then(snapshot => Promise.all(snapshot.docs.map(doc => doc.ref.delete()))),
    storage.bucket().deleteFiles({ prefix: `users/${userId}/` })
  ]);

  // Log deletion for audit
  await firestore.collection('auditLogs').add({
    action: 'USER_DATA_DELETED',
    userId,
    timestamp: FieldValue.serverTimestamp(),
    deletedCollections: ['users', 'progress', 'conversations', 'storage']
  });

  return { success: true };
});
```

**Alternatives Considered**:
- **No auto-deletion**: Rejected, violates GDPR data minimization principle
- **Manual deletion only**: Rejected, most users won't actively delete even if inactive
- **Third-party GDPR tools**: Evaluated but custom implementation simpler with Firebase

---

## Research Summary

All technical decisions align with constitution principles:
- ✅ React Native + TypeScript + Offline-first
- ✅ Modular AI services with fallbacks
- ✅ Comprehensive cost tracking and caching
- ✅ Backend-only API keys with GDPR compliance
- ✅ Performance targets met with optimization strategies

**Next Steps**: Proceed to Phase 1 (data-model.md, contracts/, quickstart.md generation)
