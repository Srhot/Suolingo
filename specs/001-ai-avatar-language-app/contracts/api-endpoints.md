# API Endpoints Contract

**Feature**: 001-ai-avatar-language-app
**Date**: 2025-10-27
**Purpose**: Define Firebase Cloud Functions callable endpoints

## Overview

All API endpoints are implemented as Firebase Cloud Functions (`https.onCall`) for automatic authentication, CORS handling, and request validation. Client apps invoke these functions using the Firebase SDK.

---

## Authentication Endpoints

### `signUp`

Creates new user account with consent collection.

**Request**:
```typescript
{
  email: string;
  password: string;
  displayName?: string;
  nativeLanguage: string; // ISO 639-1
  targetLanguages: string[]; // ISO 639-1 codes
  consentVoiceRecording: boolean; // Must be true
}
```

**Response**:
```typescript
{
  userId: string;
  token: string; // Firebase Auth ID token
}
```

**Errors**:
- `already-exists`: Email already registered
- `invalid-argument`: Missing required fields or invalid language codes
- `failed-precondition`: Voice recording consent not granted

---

## Speech Processing Endpoints

### `sttTranscribe`

Proxies speech-to-text to Deepgram API.

**Request**:
```typescript
{
  audioUrl: string; // Firebase Storage URL or base64 audio
  targetLanguage: string; // ISO 639-1
}
```

**Response**:
```typescript
{
  transcript: string;
  confidence: number; // 0.0-1.0
  duration: number; // seconds
  cost: number; // USD
}
```

**Errors**:
- `resource-exhausted`: Daily limit reached (free users)
- `invalid-argument`: Unsupported language or invalid audio
- `unavailable`: Deepgram API down (triggers fallback)

---

### `ttsGenerate`

Generates avatar speech audio via ElevenLabs.

**Request**:
```typescript
{
  text: string; // max 500 characters
  voiceId: string; // ElevenLabs voice ID
  targetLanguage: string;
}
```

**Response**:
```typescript
{
  audioUrl: string; // Firebase Storage URL
  duration: number;
  cost: number;
  fromCache: boolean;
}
```

---

## Avatar Endpoints

### `avatarGenerateVideo`

Creates lip-synced avatar video via D-ID.

**Request**:
```typescript
{
  audioUrl: string;
  avatarImageUrl: string;
  quality: '360p' | '720p'; // Based on user tier
}
```

**Response**:
```typescript
{
  videoUrl: string;
  duration: number;
  cost: number;
  fromCache: boolean;
}
```

**Errors**:
- `deadline-exceeded`: Generation timeout (15s), triggers fallback
- `resource-exhausted`: Daily limit reached

---

### `createCustomAvatar` (Premium Only)

Creates custom avatar from user face/voice.

**Request**:
```typescript
{
  type: 'face' | 'voice' | 'both';
  faceVideoUrl?: string; // Storage URL for 10s video
  voiceAudioUrl?: string; // Storage URL for 30s audio
}
```

**Response**:
```typescript
{
  avatarId: string;
  status: 'processing' | 'ready';
  estimatedCompletionTime?: number; // seconds
}
```

**Errors**:
- `permission-denied`: User not premium tier
- `invalid-argument`: Invalid video/audio format or duration

---

## Conversation Endpoints

### `startConversation`

Initializes new learning session.

**Request**:
```typescript
{
  scenarioId: string;
  avatarId: string;
  targetLanguage: string;
}
```

**Response**:
```typescript
{
  conversationId: string;
  initialMessage: {
    text: string;
    audioUrl: string;
    videoUrl: string;
  };
}
```

**Errors**:
- `resource-exhausted`: Daily usage limit reached
- `failed-precondition`: Scenario prerequisites not met

---

### `sendMessage`

Processes user input and generates avatar response.

**Request**:
```typescript
{
  conversationId: string;
  userMessage: string; // Transcribed text from STT
  audioUrl: string; // User's speech recording
}
```

**Response**:
```typescript
{
  avatarResponse: {
    text: string;
    audioUrl: string;
    videoUrl: string;
    fromCache: boolean;
  };
  feedback: {
    pronunciationScore: number;
    grammarCorrections?: string[];
    suggestions?: string[];
  };
}
```

**Rate Limiting**: Max 1 request per 5 seconds per conversation

---

## Progress Endpoints

### `completeScenario`

Records scenario completion and awards XP.

**Request**:
```typescript
{
  conversationId: string;
  scenarioId: string;
}
```

**Response**:
```typescript
{
  xpEarned: number;
  totalXP: number;
  newLevel?: number; // If level up occurred
  unlockedBadges: BadgeInfo[];
  performanceScores: {
    overall: number;
    pronunciation: number;
    grammar: number;
    vocabulary: number;
  };
}
```

---

## Cost Reporting Endpoints

### `getCostReport` (Internal/Admin Only)

Retrieves cost analytics for time period.

**Request**:
```typescript
{
  startDate: string; // ISO 8601
  endDate: string;
  userId?: string; // Optional: specific user
  service?: string; // Optional: specific AI service
}
```

**Response**:
```typescript
{
  totalCost: number;
  breakdown: {
    service: string;
    cost: number;
    callCount: number;
    cacheHitRate: number;
  }[];
  topUsers: {
    userId: string;
    cost: number;
  }[];
}
```

**Auth**: Requires Firebase Admin SDK or special `admin` custom claim

---

## Offline Sync Endpoints

### `syncOfflineProgress`

Syncs locally-stored progress when back online.

**Request**:
```typescript
{
  completedScenarios: {
    scenarioId: string;
    completedAt: string; // ISO 8601
    performanceScores: object;
  }[];
  xpGained: number;
}
```

**Response**:
```typescript
{
  syncedCount: number;
  conflicts: {
    scenarioId: string;
    serverVersion: object;
    clientVersion: object;
  }[];
  resolvedTotalXP: number;
}
```

**Conflict Resolution**: Server timestamp wins (last-write-wins)

---

## Rate Limiting

All endpoints implement rate limiting via Firebase Security Rules and Cloud Functions middleware:

```typescript
const rateLimiter = new Map<string, number[]>();

function checkRateLimit(userId: string, maxRequests: number, windowMs: number): boolean {
  const now = Date.now();
  const userRequests = rateLimiter.get(userId) || [];

  // Remove requests outside time window
  const recentRequests = userRequests.filter(timestamp => now - timestamp < windowMs);

  if (recentRequests.length >= maxRequests) {
    return false; // Rate limit exceeded
  }

  recentRequests.push(now);
  rateLimiter.set(userId, recentRequests);
  return true;
}
```

**Rate Limits**:
- `sttTranscribe`, `ttsGenerate`, `avatarGenerateVideo`: 10 requests/minute per user
- `sendMessage`: 1 request/5 seconds per conversation
- `completeScenario`: 5 requests/hour per user (prevent XP farming)

---

## Error Handling

All endpoints follow Firebase Functions error codes:

| Code | HTTP Status | When to Use |
|------|-------------|-------------|
| `unauthenticated` | 401 | User not logged in |
| `permission-denied` | 403 | User lacks required tier or access |
| `invalid-argument` | 400 | Request validation failed |
| `not-found` | 404 | Resource doesn't exist |
| `already-exists` | 409 | Duplicate resource creation |
| `resource-exhausted` | 429 | Rate limit or quota exceeded |
| `failed-precondition` | 400 | Prerequisites not met |
| `unavailable` | 503 | External service down |
| `deadline-exceeded` | 504 | Timeout occurred |
| `internal` | 500 | Unexpected error |

---

## API Contract Summary

✅ All endpoints defined with request/response schemas
✅ Authentication and authorization specified
✅ Error codes documented
✅ Rate limiting strategy defined
✅ Offline sync conflict resolution specified

**Status**: API endpoints contract complete
