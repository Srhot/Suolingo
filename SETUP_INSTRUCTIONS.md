# 🚀 SUOLINGO - ÖDEV KURULUM TALİMATLARI

## ✅ TAMAMLANAN ÖZELLİKLER

### **85 Puan Özellikleri:**
- ✅ Avatar başlığı ("Prof. Dr. Ahmet Yılmaz" / "Dr. Ayşe Kaya")
- ✅ Text alanı
- ✅ "Konuştur" butonu (TTS ile avatar konuşur)
- ✅ Hareketli avatar (loop video)

### **100 Puan Özellikleri:**
- ✅ İleri/Geri butonları (konuşma geçmişinde gezinme)
- ✅ Konuşma sayacı (1 / 5 gibi)

### **Ekstra 25 Puan:**
- ✅ Loop edilebilir video/gif support

### **Bonus Özellikler:**
- ✅ Avatar seçim menüsü (erkek/kadın)
- ✅ Mikrofon butonu (STT için hazır, entegre edilecek)
- ✅ D-ID lip-sync desteği (opsiyonel)

---

## 📁 NANO BANANA VİDEOLARINI EKLEME

### 1. Klasör Oluştur:
```
suolingo/
  assets/
    avatars/
```

### 2. Videolarını Kopyala:
- **Erkek avatar**: `male-idle.mp4` (loop video)
- **Kadın avatar**: `female-idle.mp4` (loop video)

**Önemli:**
- Videolar MP4 formatında olmalı
- Loop için uygun (başı sonu birleşmeli)
- İdeal süre: 5-10 saniye
- Boyut: Mümkünse 1-5 MB arası

### 3. Dosya İsimleri:
```
assets/avatars/male-idle.mp4
assets/avatars/female-idle.mp4
```

---

## 🔧 KURULUM ADIMLARI

### 1. Paketleri Kur:
```powershell
cd C:\Users\serha\OneDrive\Desktop\suolingo
Remove-Item -Recurse -Force node_modules -ErrorAction SilentlyContinue
Remove-Item -Force package-lock.json -ErrorAction SilentlyContinue
npm install
```

### 2. Uygulamayı Başlat:
```powershell
npx expo start --clear --tunnel
```

---

## 🎮 KULLANIM

### Ana Ekran:
1. **Avatar Seçimi**: Üstteki butona tıkla, erkek/kadın avatar seç
2. **Metin Gir**: Text alanına avatar'ın söylemesini istediğin metni yaz
3. **Konuştur**: "Konuştur" butonuna bas → TTS ile konuşacak
4. **Mikrofon**: (STT için - henüz aktif değil)
5. **İleri/Geri**: Önceki konuşmalara geri dön

---

## 🎯 D-ID LIP-SYNC KULLANIMI (OPSİYONEL)

### Lip-sync'i Aktifleştirmek İçin:

`src/screens/AvatarScreen.tsx` dosyasında, **handleSpeak** fonksiyonunda yorum satırını kaldır:

```typescript
// D-ID ile lip-sync video oluştur (opsiyonel - kredi harcar)
const videoUrl = await DIDService.generateAvatarVideo(newMessage.text);
setMessages((prev) =>
  prev.map((msg) =>
    msg.id === newMessage.id ? { ...msg, videoUrl } : msg
  )
);
setCurrentVideoUrl(videoUrl);
```

**Not:** Bu özellik D-ID API kredisi kullanır (her konuşma 1 kredi).

---

## 🔑 API KEYS

`.env` dosyası zaten hazır:
- ✅ `GEMINI_API_KEY`: Ayarlı
- ✅ `DID_API_KEY`: Ayarlı

---

## 📊 PUANLAMA KRİTERLERİ

| Özellik | Durum | Puan |
|---------|-------|------|
| Avatar başlığı + Text alan + Konuştur butonu | ✅ Hazır | 85 |
| İleri/Geri butonları | ✅ Hazır | +15 (100) |
| Loop video/gif | ✅ Hazır | +25 (Ekstra) |
| **TOPLAM** | | **125 Puan** |

### Ekstra Bonus (Realtime Lip-sync):
- D-ID entegrasyonu hazır
- Kod içinde yorum satırı kaldırılarak aktif edilebilir
- **Sınırsız puan** için kullanılabilir

---

## 🚨 ÖNEMLİ NOTLAR

### Video Yoksa Ne Olur?
- Uygulama hata verecek
- **Çözüm**: Placeholder video ekle veya hata handling yap

### Geçici Çözüm (Video Hazır Değilse):
`src/data/avatars.ts` dosyasında video yerine placeholder kullan:
```typescript
idleVideoUrl: 'https://d-id-public-bucket.s3.amazonaws.com/alice.mp4'
```

---

## 🎬 DEMO SENARYOSU

1. Uygulama açılır → "Prof. Dr. Ahmet Yılmaz" görünür (loop video)
2. Text gir: "Merhaba, nasılsınız?"
3. "Konuştur" bas → TTS konuşur, avatar loop devam eder
4. "İleri/Geri" ile geçmişe bak
5. Avatar değiştir: "Dr. Ayşe Kaya" seç

---

## 📝 TODO (Gelecek Geliştirmeler)

- [ ] STT entegrasyonu (mikrofon butonu)
- [ ] ElevenLabs voice clone
- [ ] Realtime lip-sync (WebRTC)
- [ ] Face clone özelliği

---

**Hazır! Videolarını ekle ve test et!** 🚀
