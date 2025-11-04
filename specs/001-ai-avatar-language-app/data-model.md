# Data Model: AI Avatar Language Learning Application

**Feature**: 001-ai-avatar-language-app
**Date**: 2025-10-27
**Storage**: Firebase Firestore + Firebase Storage + AsyncStorage (local)

## Overview

This document defines the data entities, relationships, validation rules, and state transitions for the SUOLINGO application. The model is optimized for Firebase Firestore's document-oriented structure with denormalization for query performance and real-time sync capabilities.

---

## Core Entities

### 1. User

Represents a language learner with profile, preferences, progress tracking, and usage limits.

**Firestore Collection**: `users/{userId}`

**Fields**:

| Field | Type | Required | Description | Validation |
|-------|------|----------|-------------|------------|
| userId | string | Yes | Firebase Auth UID | Auto-generated |
| email | string | Yes | User's email address | Valid email format |
| displayName | string | No | User's chosen display name | 1-50 characters |
| nativeLanguage | string | Yes | User's native language code | ISO 639-1 (e.g., 'en', 'tr') |
| targetLanguages | string[] | Yes | Languages user is learning | Array of ISO 639-1 codes |
| tier | enum | Yes | Subscription tier | 'free' \| 'premium' |
| totalXP | number | Yes | Cumulative experience points | ≥0, integer |
| currentLevel | number | Yes | Derived from totalXP | ≥1, integer |
| streakDays | number | Yes | Consecutive days of practice | ≥0, integer |
| lastActivityDate | timestamp | Yes | Last app usage date | Firestore timestamp |
| dailyUsageCount | number | Yes | Scenarios completed today | 0-5 for free, unlimited for premium |
| dailyUsageResetAt | timestamp | Yes | Next midnight UTC | Firestore timestamp |
| monthlyUsageCount | number | Yes | Total scenarios this month | ≥0, integer |
| consentVoiceRecording | boolean | Yes | GDPR voice consent | true required to use app |
| consentFaceData | boolean | No | GDPR face consent | true required for custom avatars |
| dataRetentionDays | number | Yes | Auto-delete inactive data after | Default: 30 days |
| createdAt | timestamp | Yes | Account creation date | Firestore timestamp |
| updatedAt | timestamp | Yes | Last profile update | Firestore timestamp |

**Relationships**:
- One-to-many with `Progress` (user has multiple skill assessments)
- One-to-many with `UserScenario` (user completes multiple scenarios)
- One-to-many with `Conversation` (user has multiple conversation sessions)
- One-to-many with `Achievement` (user unlocks multiple badges)

**State Transitions**:

```
[New User]
  ↓ (onboarding complete)
[Active Free User] (dailyUsageCount < 5)
  ↓ (dailyUsageCount >= 5)
[Limited Free User] (blocked until reset)
  ↓ (midnight UTC)
[Active Free User] (dailyUsageCount reset to 0)

[Active Free User]
  ↓ (upgrade to premium)
[Active Premium User] (unlimited usage)
  ↓ (downgrade or expire)
[Active Free User]

[Active User]
  ↓ (30 days no activity)
[Inactive User] (data scheduled for deletion)
  ↓ (returns before deletion)
[Active User] (data deletion canceled)
```

**Indexes** (Firestore):
- `tier` (for tier-specific queries)
- `lastActivityDate` (for inactive user cleanup)

---

### 2. Avatar

Represents a virtual teacher with visual appearance, voice profile, and personality traits.

**Firestore Collection**: `avatars/{avatarId}`

**Fields**:

| Field | Type | Required | Description | Validation |
|-------|------|----------|-------------|------------|
| avatarId | string | Yes | Unique identifier | Auto-generated |
| name | string | Yes | Avatar display name | 2-30 characters |
| description | string | No | Short bio or personality | Max 200 characters |
| imageUrl | string | Yes | Profile image (static) | Valid HTTPS URL |
| gender | enum | No | For diversity tracking | 'male' \| 'female' \| 'non-binary' |
| ethnicity | enum | No | For diversity representation | 'asian' \| 'black' \| 'latino' \| 'white' \| 'middle-eastern' |
| ageRange | enum | No | Visual age representation | 'young' \| 'middle-aged' \| 'senior' |
| voiceId | string | Yes | ElevenLabs voice ID | Alphanumeric |
| specialization | string[] | No | Scenario categories | Array of 'restaurant' \| 'travel' \| 'business' |
| availability | enum | Yes | Free vs Premium | 'free' \| 'premium' |
| isCustom | boolean | Yes | User-created avatar | Default: false |
| customOwnerId | string | No | User ID if custom | Valid userId, required if isCustom=true |
| createdAt | timestamp | Yes | Creation date | Firestore timestamp |

**Relationships**:
- One-to-many with `Conversation` (avatar used in multiple sessions)
- One-to-one with `User` (if custom avatar)

**Validation Rules**:
- If `isCustom === true`, `customOwnerId` must be valid `userId`
- If `availability === 'free'`, at least 10 avatars must exist for diversity
- `voiceId` must match an active ElevenLabs voice in the backend configuration

---

### 3. Scenario

Represents a structured learning conversation with objectives, difficulty, and category.

**Firestore Collection**: `scenarios/{scenarioId}`

**Fields**:

| Field | Type | Required | Description | Validation |
|-------|------|----------|-------------|------------|
| scenarioId | string | Yes | Unique identifier | Auto-generated |
| category | enum | Yes | Learning context | 'restaurant' \| 'travel' \| 'business' |
| difficulty | enum | Yes | Skill level | 'beginner' \| 'intermediate' \| 'advanced' |
| title | string | Yes | Display name | 5-50 characters |
| description | string | Yes | What user will learn | Max 300 characters |
| objectives | string[] | Yes | Learning goals | Min 3, max 5 objectives |
| estimatedDuration | number | Yes | Minutes to complete | 5-15 minutes |
| prerequisiteScenarios | string[] | No | Must complete before | Array of scenarioIds |
| xpReward | number | Yes | XP earned on completion | 50-500 based on difficulty |
| preGeneratedResponses | map | Yes | Common cached videos | { responseText: videoUrl } |
| targetLanguages | string[] | Yes | Supported languages | ISO 639-1 codes |
| createdAt | timestamp | Yes | Creation date | Firestore timestamp |
| updatedAt | timestamp | Yes | Last modified | Firestore timestamp |

**Relationships**:
- One-to-many with `UserScenario` (scenario completed by multiple users)
- One-to-many with `Conversation` (scenario used in multiple sessions)
- Many-to-many with self (prerequisites)

**Derived Rules**:
- `estimatedDuration`:
  - Beginner: 5-7 minutes
  - Intermediate: 8-12 minutes
  - Advanced: 12-15 minutes

- `xpReward`:
  - Beginner: 50 XP
  - Intermediate: 100 XP
  - Advanced: 200 XP

**Validation Rules**:
- At least 3 scenarios per `(category, difficulty)` combination
- `preGeneratedResponses` must contain at least 50 entries for cache effectiveness
- `prerequisiteScenarios` cannot create circular dependencies

---

### 4. UserScenario

Tracks a user's completion and performance for a specific scenario.

**Firestore Collection**: `userScenarios/{userId}/completed/{scenarioId}`

**Fields**:

| Field | Type | Required | Description | Validation |
|-------|------|----------|-------------|------------|
| userId | string | Yes | User reference | Valid userId |
| scenarioId | string | Yes | Scenario reference | Valid scenarioId |
| completedAt | timestamp | Yes | Completion timestamp | Firestore timestamp |
| performanceScore | number | Yes | Overall score (0-100) | 0-100, integer |
| pronunciationScore | number | Yes | Pronunciation quality | 0-100, integer |
| grammarScore | number | Yes | Grammar correctness | 0-100, integer |
| vocabularyScore | number | Yes | Vocabulary usage | 0-100, integer |
| xpEarned | number | Yes | XP awarded | Must match scenario.xpReward |
| attempts | number | Yes | Number of attempts | ≥1, integer |
| objectivesCompleted | string[] | Yes | Achieved objectives | Subset of scenario.objectives |

**Relationships**:
- Many-to-one with `User`
- Many-to-one with `Scenario`

**State Transitions**:

```
[Scenario Not Started]
  ↓ (user selects scenario)
[Scenario In Progress] (conversation active)
  ↓ (all objectives met)
[Scenario Completed] (record created)
  ↓ (user retries)
[Scenario In Progress] (attempts++)
  ↓ (completes again)
[Scenario Completed] (updated scores if better)
```

**Validation Rules**:
- `completedAt` must be after user's `createdAt`
- Scores must sum appropriately (weighted average)
- Can only complete if prerequisites are met (checked by Cloud Functions)

---

### 5. Conversation

Represents a specific learning session between user and avatar.

**Firestore Collection**: `conversations/{conversationId}`

**Fields**:

| Field | Type | Required | Description | Validation |
|-------|------|----------|-------------|------------|
| conversationId | string | Yes | Unique identifier | Auto-generated |
| userId | string | Yes | User reference | Valid userId |
| scenarioId | string | Yes | Scenario reference | Valid scenarioId |
| avatarId | string | Yes | Avatar reference | Valid avatarId |
| startedAt | timestamp | Yes | Session start time | Firestore timestamp |
| endedAt | timestamp | No | Session end time | Firestore timestamp, null if active |
| messages | Message[] | Yes | Conversation history | Min 1 message |
| totalDuration | number | No | Total time in seconds | ≥0, calculated on end |
| status | enum | Yes | Session state | 'active' \| 'completed' \| 'abandoned' |

**Nested Entity: Message**:

| Field | Type | Required | Description | Validation |
|-------|------|----------|-------------|------------|
| messageId | string | Yes | Unique message ID | Auto-generated |
| speaker | enum | Yes | Who sent message | 'user' \| 'avatar' |
| text | string | Yes | Message content | 1-500 characters |
| audioUrl | string | No | Speech audio file | Valid HTTPS URL |
| videoUrl | string | No | Avatar video (avatar only) | Valid HTTPS URL |
| transcriptionConfidence | number | No | STT confidence (user only) | 0.0-1.0 |
| timestamp | timestamp | Yes | Message sent time | Firestore timestamp |
| fromCache | boolean | No | Pre-generated response | Default: false |

**Relationships**:
- Many-to-one with `User`
- Many-to-one with `Scenario`
- Many-to-one with `Avatar`

**State Transitions**:

```
[No Conversation]
  ↓ (user starts scenario)
[Active Conversation] (status='active', endedAt=null)
  ↓ (messages exchanged)
[Active Conversation] (messages appended)
  ↓ (all objectives met)
[Completed Conversation] (status='completed', endedAt set)

[Active Conversation]
  ↓ (user exits before completion)
[Abandoned Conversation] (status='abandoned', endedAt set)
```

**Validation Rules**:
- Messages must alternate between 'user' and 'avatar' (enforced by app logic)
- First message must be from 'avatar' (greeting)
- `endedAt` must be after `startedAt`
- If `speaker === 'user'`, `videoUrl` must be null
- If `speaker === 'avatar'`, `transcriptionConfidence` must be null

---

### 6. Progress

Tracks skill-level proficiency across different language competencies.

**Firestore Collection**: `progress/{userId}/skills/{skillId}`

**Fields**:

| Field | Type | Required | Description | Validation |
|-------|------|----------|-------------|------------|
| userId | string | Yes | User reference | Valid userId |
| skillId | string | Yes | Skill identifier | Auto-generated |
| skillName | enum | Yes | Skill category | 'vocabulary' \| 'grammar' \| 'pronunciation' \| 'listening' |
| proficiencyScore | number | Yes | Current skill level | 0-100, integer |
| assessmentHistory | Assessment[] | Yes | Score over time | Min 1 assessment |
| lastAssessedAt | timestamp | Yes | Most recent update | Firestore timestamp |

**Nested Entity: Assessment**:

| Field | Type | Required | Description | Validation |
|-------|------|----------|-------------|------------|
| score | number | Yes | Proficiency at time | 0-100, integer |
| assessedAt | timestamp | Yes | Assessment date | Firestore timestamp |
| scenarioId | string | Yes | Source scenario | Valid scenarioId |

**Relationships**:
- Many-to-one with `User`

**Derived Calculations**:
- `proficiencyScore` = weighted average of last 5 assessments (recent weighted higher)
- Skill trend (improving/declining) = linear regression over `assessmentHistory`

**Validation Rules**:
- Each user must have exactly 4 skill documents (one per skillName)
- `assessmentHistory` must be sorted by `assessedAt` (ascending)
- New assessments append to history (never delete old data)

---

### 7. Achievement

Represents badges and milestones earned by users.

**Firestore Collection**: `achievements/{userId}/badges/{badgeId}`

**Fields**:

| Field | Type | Required | Description | Validation |
|-------|------|----------|-------------|------------|
| userId | string | Yes | User reference | Valid userId |
| badgeId | string | Yes | Badge identifier | Auto-generated |
| badgeName | string | Yes | Display name | E.g., "3-Day Streak", "Restaurant Master" |
| description | string | Yes | How to earn | Max 200 characters |
| iconUrl | string | Yes | Badge icon image | Valid HTTPS URL |
| unlockedAt | timestamp | Yes | When earned | Firestore timestamp |
| xpBonus | number | Yes | XP reward for unlocking | 10-100 XP |
| category | enum | Yes | Badge type | 'streak' \| 'mastery' \| 'milestone' |
| rarity | enum | Yes | How special it is | 'common' \| 'rare' \| 'epic' \| 'legendary' |

**Relationships**:
- Many-to-one with `User`

**Predefined Badges**:

| Badge Name | Category | Unlock Criteria | XP Bonus | Rarity |
|------------|----------|-----------------|----------|--------|
| First Steps | milestone | Complete first scenario | 10 XP | common |
| 3-Day Streak | streak | Practice 3 consecutive days | 20 XP | common |
| 7-Day Streak | streak | Practice 7 consecutive days | 50 XP | rare |
| 30-Day Streak | streak | Practice 30 consecutive days | 200 XP | epic |
| Restaurant Master | mastery | Complete all Restaurant scenarios | 100 XP | rare |
| Travel Master | mastery | Complete all Travel scenarios | 100 XP | rare |
| Business Master | mastery | Complete all Business scenarios | 100 XP | rare |
| Perfect Pronunciation | milestone | Score 100 on pronunciation 5 times | 150 XP | epic |
| Polyglot | milestone | Learn 3+ languages | 300 XP | legendary |

**Validation Rules**:
- Badge can only be unlocked once per user
- `unlockedAt` must be after user's `createdAt`
- Badge criteria must be met (verified by Cloud Functions trigger)

---

### 8. CostLog

Tracks AI API usage and costs for monitoring and reporting.

**Firestore Collection**: `costLogs/{logId}`

**Fields**:

| Field | Type | Required | Description | Validation |
|-------|------|----------|-------------|------------|
| logId | string | Yes | Unique log entry | Auto-generated |
| userId | string | Yes | User who triggered call | Valid userId |
| service | enum | Yes | AI service used | 'deepgram' \| 'elevenlabs' \| 'd-id' \| 'openai' \| 'veo' \| 'akool' |
| operation | string | Yes | Specific API call | E.g., 'stt_transcribe', 'tts_generate', 'avatar_video' |
| estimatedCost | number | Yes | Cost in USD | ≥0, decimal (2 places) |
| tokenCount | number | No | API tokens used | For GPT, ElevenLabs |
| duration | number | No | Duration in seconds | For Deepgram, D-ID |
| fromCache | boolean | Yes | Served from cache | Default: false |
| timestamp | timestamp | Yes | When call occurred | Firestore timestamp |
| responseTime | number | No | API latency in ms | ≥0, integer |

**Relationships**:
- Many-to-one with `User`

**Cost Calculation Formulas**:

```typescript
// Deepgram STT
const deepgramCost = (durationSeconds: number) => {
  return (durationSeconds / 60) * 0.0043; // $0.0043 per minute
};

// ElevenLabs TTS
const elevenlabsCost = (charCount: number) => {
  return (charCount / 1000) * 0.18; // $0.18 per 1K characters
};

// D-ID Avatar Video
const didCost = (durationSeconds: number) => {
  return (durationSeconds / 60) * 0.30; // $0.30 per minute
};

// OpenAI GPT-4o-mini
const openaiCost = (tokens: number) => {
  return (tokens / 1000000) * 0.15; // $0.15 per 1M tokens (input)
};
```

**Indexes** (Firestore):
- Composite: `(userId, timestamp)` for per-user cost reports
- `timestamp` for daily/monthly aggregations
- `service` for service-specific cost tracking

---

## Entity Relationships Diagram

```
User (1) ──────< (M) Progress (skills)
  │
  ├──────< (M) UserScenario (completions)
  │
  ├──────< (M) Conversation (sessions)
  │
  ├──────< (M) Achievement (badges)
  │
  ├──────< (M) CostLog (API usage)
  │
  └──────< (1) Avatar (custom, optional)

Scenario (1) ──────< (M) UserScenario
  │
  └──────< (M) Conversation

Avatar (1) ──────< (M) Conversation
```

---

## Caching Strategy

### Local Cache (AsyncStorage)

**Cached Data**:
- User profile (read on every app launch)
- Recent conversations (last 10)
- Downloaded scenarios (up to 5 for offline mode)
- Progress snapshot (updated daily)

**Cache Keys**:
```typescript
const CACHE_KEYS = {
  USER_PROFILE: `user_${userId}`,
  CONVERSATIONS: `conversations_${userId}_recent`,
  SCENARIOS_OFFLINE: `scenarios_offline_${userId}`,
  PROGRESS_SNAPSHOT: `progress_${userId}`
};
```

**Cache Invalidation**:
- User profile: On logout or profile update
- Conversations: After 7 days
- Scenarios: When scenario updated in Firestore
- Progress: After 24 hours

### Firebase Storage Cache (Videos)

**Cached Content**:
- Pre-generated avatar videos (900 videos × 10 sec avg)
- User-uploaded audio files (STT input)
- Custom avatar assets (premium users)

**Storage Structure**:
```
/videos/
  /pregenerated/
    /{scenarioId}/
      /{responseId}_360p.mp4
      /{responseId}_720p.mp4
  /custom/
    /{userId}/
      /avatar_{avatarId}.mp4

/audio/
  /user-recordings/
    /{userId}/
      /{conversationId}_{messageId}.mp3
```

**Retention**:
- Pre-generated videos: Permanent (until scenario updated)
- User recordings: Auto-delete after 30 days per GDPR
- Custom avatars: Delete when user downgrades or requests deletion

---

## Data Consistency Rules

### Eventual Consistency

Firestore is eventually consistent across regions. Handle cases where:
- User's `dailyUsageCount` may briefly be stale during concurrent updates
- Solution: Use Firestore transactions for critical updates

### Strong Consistency Requirements

Use Firestore transactions for:
- Incrementing `dailyUsageCount` (prevent bypass of free tier limits)
- Awarding XP and levels (prevent duplicate rewards)
- Unlocking achievements (prevent double-unlocks)

**Example Transaction** (dailyUsageCount):

```typescript
await firestore.runTransaction(async (transaction) => {
  const userRef = firestore.collection('users').doc(userId);
  const userDoc = await transaction.get(userRef);
  const currentUsage = userDoc.data().dailyUsageCount;

  if (currentUsage >= 5 && userDoc.data().tier === 'free') {
    throw new Error('Daily limit reached');
  }

  transaction.update(userRef, {
    dailyUsageCount: currentUsage + 1
  });
});
```

---

## Validation Summary

| Entity | Key Validation | Enforced By |
|--------|----------------|-------------|
| User | `dailyUsageCount` ≤ 5 for free users | Firestore Security Rules + Cloud Functions |
| Scenario | At least 50 pre-generated responses | Backend validation script |
| UserScenario | Prerequisites completed | Cloud Functions (onCreate trigger) |
| Conversation | Messages alternate user/avatar | Client-side logic + unit tests |
| CostLog | Accurate cost calculations | Cloud Functions (cost tracking service) |
| Achievement | Unlock criteria met | Cloud Functions (achievement trigger) |

---

## Data Model Status

✅ All entities defined with fields, types, and validation rules
✅ Relationships documented with cardinality
✅ State transitions specified for stateful entities
✅ Firestore collections and indexes identified
✅ Caching strategy documented for performance
✅ Consistency rules defined for critical operations

**Next**: Generate API contracts for Firebase Cloud Functions and client-app interactions.
