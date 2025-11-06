import { Avatar } from '@/types/Avatar';

// Kullanıcının nano banana loop videoları (Google Flow ile oluşturulmuş)

export const AVATARS: Avatar[] = [
  {
    id: 'male-professor',
    name: 'Ahmet',
    title: 'Prof. Dr. Ahmet Yılmaz',
    gender: 'male',
    idleVideoUrl: require('../../assets/avatars/male-idle.mp4'),
    thumbnailUrl: require('../../assets/avatars/Erkek Düz Profil.png'),
    isStaticImage: false,
    // A2E AI custom avatar ID (verified working - Nov 3 2025)
    a2eCreatorId: '6908f1152897cb003ad5b739',
    // A2E TTS voice ID - Turkish Male (TR-TR-AhmetNeural)
    // TODO: Add English voice IDs when available from A2E API
    ttsVoiceId: '63a549c1ad2a27fe43d966e1',
  },
  {
    id: 'female-teacher',
    name: 'Ayşe',
    title: 'Dr. Ayşe Kaya',
    gender: 'female',
    idleVideoUrl: require('../../assets/avatars/female-idle.mp4'),
    thumbnailUrl: require('../../assets/avatars/Kadın Düz Profil.png'),
    isStaticImage: false,
    // A2E AI custom avatar ID (verified working - Nov 3 2025)
    a2eCreatorId: '6909359a769b46003b650dc5',
    // A2E TTS voice ID - Turkish Female (TR-TR-EmelNeural)
    // TODO: Add English voice IDs when available from A2E API
    ttsVoiceId: '63a549dcad2a27fe43d96732',
  },
];

/*
LOOP VİDEOLARI BAŞARIYLA EKLENDİ! ✅

Dosyalar:
- assets/avatars/male-idle.mp4 → Prof. Dr. Ahmet Yılmaz
- assets/avatars/female-idle.mp4 → Dr. Ayşe Kaya

D-ID lip-sync aktif edilecek!
*/
