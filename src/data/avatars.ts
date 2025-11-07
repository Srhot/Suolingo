import { Avatar } from '@/types/Avatar';

// ✅ MULTILINGUAL AVATARLAR - Her dili doğal telaffuz ile konuşabilir!

export const AVATARS: Avatar[] = [
  {
    id: 'male-multilingual',
    name: 'Andrew',
    title: 'Prof. Andrew',
    gender: 'male',
    idleVideoUrl: require('../../assets/avatars/male-idle.mp4'),
    thumbnailUrl: require('../../assets/avatars/Erkek Düz Profil.png'),
    isStaticImage: false,
    // A2E Multilingual Avatar (verified working - Jan 2025)
    a2eCreatorId: '6908ef13162a96003b2893cc', // Andrew anchor
    ttsVoiceId: '66d3fb1bc051cfb134c60f20',   // en-US-AndrewMultilingualNeural
    // ✅ Supports: Turkish, English, German, French, Spanish, Italian, Portuguese, Japanese, Korean, Chinese, and 40+ languages
  },
  {
    id: 'female-multilingual',
    name: 'Ava',
    title: 'Prof. Ava',
    gender: 'female',
    idleVideoUrl: require('../../assets/avatars/female-idle.mp4'),
    thumbnailUrl: require('../../assets/avatars/Kadın Düz Profil.png'),
    isStaticImage: false,
    // A2E Multilingual Avatar (verified working - Jan 2025)
    a2eCreatorId: '6908ef67d6429600479385e9', // Ava anchor
    ttsVoiceId: '66d3fa4ab76478b1272f2249',   // en-US-AvaMultilingualNeural
    // ✅ Supports: Turkish, English, German, French, Spanish, Italian, Portuguese, Japanese, Korean, Chinese, and 40+ languages
  },
];

/*
✅ MULTILINGUAL AVATARLAR BAŞARIYLA EKLENDİ! (Jan 2025)

Andrew (Male - Multilingual):
- A2E Creator ID: 6908ef13162a96003b2893cc
- Voice: en-US-AndrewMultilingualNeural
- TTS ID: 66d3fb1bc051cfb134c60f20
- Test: "Hi, we are not real. it is just a test." ✅

Ava (Female - Multilingual):
- A2E Creator ID: 6908ef67d6429600479385e9
- Voice: en-US-AvaMultilingualNeural
- TTS ID: 66d3fa4ab76478b1272f2249
- Test: "Hi, this is a test for female voice" ✅

BENEFITS:
✅ Single avatar speaks all languages with native pronunciation
✅ Turkish text → Turkish accent
✅ English text → English accent
✅ German text → German accent (ready for future)
✅ No need to switch avatars based on language
✅ Simplified code and maintenance
✅ Professional multilingual teacher experience

SUPPORTED LANGUAGES (40+):
Turkish (tr), English (en), German (de), French (fr), Spanish (es),
Italian (it), Portuguese (pt), Japanese (ja), Korean (ko), Chinese (zh),
Dutch (nl), Polish (pl), Russian (ru), Arabic (ar), Hindi (hi), and more!
*/
