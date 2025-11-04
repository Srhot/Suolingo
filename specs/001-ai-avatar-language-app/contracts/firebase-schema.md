# Firebase Schema Contract

**Feature**: 001-ai-avatar-language-app
**Date**: 2025-10-27
**Purpose**: Define Firestore collections, Security Rules, and indexes

## Firestore Collections

### Collection: `users`

**Path**: `/users/{userId}`

**Document Structure**:
```json
{
  "userId": "string (UID from Firebase Auth)",
  "email": "string",
  "displayName": "string | null",
  "nativeLanguage": "string (ISO 639-1)",
  "targetLanguages": ["string (ISO 639-1)"],
  "tier": "'free' | 'premium'",
  "totalXP": "number (integer, ≥0)",
  "currentLevel": "number (integer, ≥1)",
  "streakDays": "number (integer, ≥0)",
  "lastActivityDate": "timestamp",
  "dailyUsageCount": "number (integer, 0-5 for free)",
  "dailyUsageResetAt": "timestamp",
  "monthlyUsageCount": "number (integer, ≥0)",
  "consentVoiceRecording": "boolean",
  "consentFaceData": "boolean | null",
  "dataRetentionDays": "number (default: 30)",
  "createdAt": "timestamp",
  "updatedAt": "timestamp"
}
```

**Indexes**:
- Single field: `tier` (ascending)
- Single field: `lastActivityDate` (ascending) - for cleanup jobs

---

### Collection: `avatars`

**Path**: `/avatars/{avatarId}`

**Document Structure**:
```json
{
  "avatarId": "string",
  "name": "string",
  "description": "string | null",
  "imageUrl": "string (HTTPS)",
  "gender": "'male' | 'female' | 'non-binary' | null",
  "ethnicity": "'asian' | 'black' | 'latino' | 'white' | 'middle-eastern' | null",
  "ageRange": "'young' | 'middle-aged' | 'senior' | null",
  "voiceId": "string (ElevenLabs ID)",
  "specialization": ["'restaurant' | 'travel' | 'business'"],
  "availability": "'free' | 'premium'",
  "isCustom": "boolean",
  "customOwnerId": "string (userId) | null",
  "createdAt": "timestamp"
}
```

**Indexes**:
- Single field: `availability` (ascending)
- Single field: `customOwnerId` (ascending)

---

### Collection: `scenarios`

**Path**: `/scenarios/{scenarioId}`

**Document Structure**:
```json
{
  "scenarioId": "string",
  "category": "'restaurant' | 'travel' | 'business'",
  "difficulty": "'beginner' | 'intermediate' | 'advanced'",
  "title": "string",
  "description": "string",
  "objectives": ["string"],
  "estimatedDuration": "number (5-15 minutes)",
  "prerequisiteScenarios": ["string (scenarioIds)"],
  "xpReward": "number (50-500)",
  "preGeneratedResponses": {
    "response_text_key": "string (video URL)"
  },
  "targetLanguages": ["string (ISO 639-1)"],
  "createdAt": "timestamp",
  "updatedAt": "timestamp"
}
```

**Indexes**:
- Composite: `(category, difficulty)` (both ascending)

---

### Collection: `userScenarios`

**Path**: `/userScenarios/{userId}/completed/{scenarioId}`

**Document Structure**:
```json
{
  "userId": "string",
  "scenarioId": "string",
  "completedAt": "timestamp",
  "performanceScore": "number (0-100)",
  "pronunciationScore": "number (0-100)",
  "grammarScore": "number (0-100)",
  "vocabularyScore": "number (0-100)",
  "xpEarned": "number",
  "attempts": "number (≥1)",
  "objectivesCompleted": ["string"]
}
```

**Indexes**:
- Composite: `(userId, completedAt)` (both descending) - for recent completions

---

### Collection: `conversations`

**Path**: `/conversations/{conversationId}`

**Document Structure**:
```json
{
  "conversationId": "string",
  "userId": "string",
  "scenarioId": "string",
  "avatarId": "string",
  "startedAt": "timestamp",
  "endedAt": "timestamp | null",
  "messages": [
    {
      "messageId": "string",
      "speaker": "'user' | 'avatar'",
      "text": "string",
      "audioUrl": "string (HTTPS) | null",
      "videoUrl": "string (HTTPS) | null",
      "transcriptionConfidence": "number (0.0-1.0) | null",
      "timestamp": "timestamp",
      "fromCache": "boolean"
    }
  ],
  "totalDuration": "number (seconds) | null",
  "status": "'active' | 'completed' | 'abandoned'"
}
```

**Indexes**:
- Composite: `(userId, startedAt)` (userId ascending, startedAt descending)

---

### Collection: `progress`

**Path**: `/progress/{userId}/skills/{skillId}`

**Document Structure**:
```json
{
  "userId": "string",
  "skillId": "string",
  "skillName": "'vocabulary' | 'grammar' | 'pronunciation' | 'listening'",
  "proficiencyScore": "number (0-100)",
  "assessmentHistory": [
    {
      "score": "number (0-100)",
      "assessedAt": "timestamp",
      "scenarioId": "string"
    }
  ],
  "lastAssessedAt": "timestamp"
}
```

**No additional indexes needed** (subcollection queries are scoped to userId)

---

### Collection: `achievements`

**Path**: `/achievements/{userId}/badges/{badgeId}`

**Document Structure**:
```json
{
  "userId": "string",
  "badgeId": "string",
  "badgeName": "string",
  "description": "string",
  "iconUrl": "string (HTTPS)",
  "unlockedAt": "timestamp",
  "xpBonus": "number (10-100)",
  "category": "'streak' | 'mastery' | 'milestone'",
  "rarity": "'common' | 'rare' | 'epic' | 'legendary'"
}
```

**No additional indexes needed** (subcollection queries are scoped to userId)

---

### Collection: `costLogs`

**Path**: `/costLogs/{logId}`

**Document Structure**:
```json
{
  "logId": "string",
  "userId": "string",
  "service": "'deepgram' | 'elevenlabs' | 'd-id' | 'openai' | 'veo' | 'akool'",
  "operation": "string",
  "estimatedCost": "number (USD, 2 decimals)",
  "tokenCount": "number | null",
  "duration": "number (seconds) | null",
  "fromCache": "boolean",
  "timestamp": "timestamp",
  "responseTime": "number (ms) | null"
}
```

**Indexes**:
- Composite: `(userId, timestamp)` (both descending) - for user cost reports
- Single field: `timestamp` (descending) - for global cost reports
- Single field: `service` (ascending) - for service-specific analytics

---

## Firestore Security Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Helper function: Check if user is authenticated
    function isAuthenticated() {
      return request.auth != null;
    }

    // Helper function: Check if user owns the resource
    function isOwner(userId) {
      return isAuthenticated() && request.auth.uid == userId;
    }

    // Helper function: Check if user is premium
    function isPremium(userId) {
      return isAuthenticated()
        && get(/databases/$(database)/documents/users/$(userId)).data.tier == 'premium';
    }

    // Users collection
    match /users/{userId} {
      // Users can read their own profile
      allow read: if isOwner(userId);

      // Users can create their own profile (during signup)
      allow create: if isOwner(userId)
        && request.resource.data.consentVoiceRecording == true;

      // Users can update their own profile, but NOT tier or usage counts
      allow update: if isOwner(userId)
        && !request.resource.data.diff(resource.data).affectedKeys().hasAny([
          'tier', 'dailyUsageCount', 'monthlyUsageCount', 'totalXP', 'currentLevel'
        ]);
    }

    // Avatars collection
    match /avatars/{avatarId} {
      // All authenticated users can read non-custom avatars
      allow read: if isAuthenticated()
        && (!resource.data.isCustom || resource.data.customOwnerId == request.auth.uid);

      // Only backend (Cloud Functions) can create/update avatars
      allow create, update, delete: if false;
    }

    // Scenarios collection
    match /scenarios/{scenarioId} {
      // All authenticated users can read scenarios
      allow read: if isAuthenticated();

      // Only backend can write scenarios
      allow create, update, delete: if false;
    }

    // UserScenarios subcollection
    match /userScenarios/{userId}/completed/{scenarioId} {
      // Users can read their own completions
      allow read: if isOwner(userId);

      // Only backend can create completion records (after validation)
      allow create, update, delete: if false;
    }

    // Conversations collection
    match /conversations/{conversationId} {
      // Users can read their own conversations
      allow read: if isAuthenticated()
        && resource.data.userId == request.auth.uid;

      // Users can create conversations (validated by backend)
      allow create: if isAuthenticated()
        && request.resource.data.userId == request.auth.uid
        && request.resource.data.status == 'active';

      // Users can update their own active conversations (append messages)
      allow update: if isAuthenticated()
        && resource.data.userId == request.auth.uid
        && resource.data.status == 'active';

      // Users cannot delete conversations
      allow delete: if false;
    }

    // Progress subcollection
    match /progress/{userId}/skills/{skillId} {
      // Users can read their own progress
      allow read: if isOwner(userId);

      // Only backend can update progress
      allow create, update, delete: if false;
    }

    // Achievements subcollection
    match /achievements/{userId}/badges/{badgeId} {
      // Users can read their own achievements
      allow read: if isOwner(userId);

      // Only backend can award achievements
      allow create, update, delete: if false;
    }

    // CostLogs collection
    match /costLogs/{logId} {
      // Only backend can read/write cost logs (no user access)
      allow read, write: if false;
    }
  }
}
```

---

## Firebase Storage Rules

**Storage Buckets**:
- `gs://{project-id}.appspot.com` (default bucket)

**Structure**:
```
/videos/
  /pregenerated/{scenarioId}/{responseId}_{quality}.mp4
  /custom/{userId}/avatar_{avatarId}.mp4

/audio/
  /user-recordings/{userId}/{conversationId}_{messageId}.mp3

/avatars/
  /default/{avatarId}_profile.jpg
  /custom/{userId}/upload_{timestamp}.mp4
```

**Storage Security Rules**:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {

    // Helper: Check if user is authenticated
    function isAuthenticated() {
      return request.auth != null;
    }

    // Helper: Check file size limit
    function isUnderSizeLimit(sizeInMB) {
      return request.resource.size < sizeInMB * 1024 * 1024;
    }

    // Pre-generated videos (public read)
    match /videos/pregenerated/{allPaths=**} {
      allow read: if isAuthenticated();
      allow write: if false; // Only backend
    }

    // Custom avatar videos (owner only)
    match /videos/custom/{userId}/{avatarFile} {
      allow read: if isAuthenticated() && request.auth.uid == userId;
      allow write: if false; // Only backend
    }

    // User audio recordings (owner only, auto-delete after 30 days)
    match /audio/user-recordings/{userId}/{audioFile} {
      allow read: if isAuthenticated() && request.auth.uid == userId;
      allow write: if isAuthenticated()
        && request.auth.uid == userId
        && isUnderSizeLimit(10); // 10MB max per audio file
    }

    // Avatar profile images (public read)
    match /avatars/default/{avatarImage} {
      allow read: if isAuthenticated();
      allow write: if false; // Only backend
    }

    // Custom avatar uploads (owner only, premium users)
    match /avatars/custom/{userId}/{uploadFile} {
      allow read: if isAuthenticated() && request.auth.uid == userId;
      allow write: if isAuthenticated()
        && request.auth.uid == userId
        && isUnderSizeLimit(50) // 50MB max for video uploads
        && firestore.get(/databases/(default)/documents/users/$(request.auth.uid)).data.tier == 'premium';
    }
  }
}
```

---

## Data Retention and Cleanup

### Automated Cleanup Jobs (Cloud Functions Scheduled)

**1. Daily Usage Reset** (runs at midnight UTC):
```typescript
export const resetDailyUsage = functions.pubsub.schedule('0 0 * * *')
  .timeZone('UTC')
  .onRun(async () => {
    const batch = firestore.batch();
    const usersSnapshot = await firestore.collection('users').get();

    usersSnapshot.forEach(doc => {
      batch.update(doc.ref, {
        dailyUsageCount: 0,
        dailyUsageResetAt: admin.firestore.Timestamp.fromDate(
          new Date(Date.now() + 24 * 60 * 60 * 1000)
        )
      });
    });

    await batch.commit();
  });
```

**2. Inactive User Data Deletion** (runs daily):
```typescript
export const deleteInactiveUserData = functions.pubsub.schedule('0 2 * * *')
  .timeZone('UTC')
  .onRun(async () => {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const inactiveUsers = await firestore.collection('users')
      .where('lastActivityDate', '<', thirtyDaysAgo)
      .get();

    for (const userDoc of inactiveUsers.docs) {
      const userId = userDoc.id;

      // Delete user audio recordings from Storage
      await storage.bucket().deleteFiles({
        prefix: `audio/user-recordings/${userId}/`
      });

      // User profile remains (for potential reactivation)
      // But audio is deleted per GDPR
    }
  });
```

**3. Monthly Usage Reset** (runs on 1st of each month):
```typescript
export const resetMonthlyUsage = functions.pubsub.schedule('0 0 1 * *')
  .timeZone('UTC')
  .onRun(async () => {
    const batch = firestore.batch();
    const usersSnapshot = await firestore.collection('users').get();

    usersSnapshot.forEach(doc => {
      batch.update(doc.ref, {
        monthlyUsageCount: 0
      });
    });

    await batch.commit();
  });
```

---

## Firestore Composite Indexes

**Required Composite Indexes** (add to `firestore.indexes.json`):

```json
{
  "indexes": [
    {
      "collectionGroup": "scenarios",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "category", "order": "ASCENDING" },
        { "fieldPath": "difficulty", "order": "ASCENDING" }
      ]
    },
    {
      "collectionGroup": "userScenarios",
      "queryScope": "COLLECTION_GROUP",
      "fields": [
        { "fieldPath": "userId", "order": "ASCENDING" },
        { "fieldPath": "completedAt", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "conversations",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "userId", "order": "ASCENDING" },
        { "fieldPath": "startedAt", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "costLogs",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "userId", "order": "ASCENDING" },
        { "fieldPath": "timestamp", "order": "DESCENDING" }
      ]
    }
  ]
}
```

---

## Schema Validation Summary

✅ All collections defined with document structures
✅ Security Rules enforce authentication and ownership
✅ Storage Rules enforce file size limits and permissions
✅ Indexes optimized for common query patterns
✅ Automated cleanup jobs for GDPR compliance
✅ Data retention policies documented

**Status**: Firebase schema contract complete
