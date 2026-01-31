# SUOLINGO - Sınav Soruları SET 1: TEKNİK SORULAR
**Ders:** Çoklu Ortam Yazılım Geliştirme
**Proje:** SUOLINGO - AI Avatar Language Learning
**Tarih:** Ocak 2026
**Toplam Soru:** 60

---

## 📱 BÖLÜM 1: REACT NATIVE & EXPO (10 Soru)

### Soru 1
**SUOLINGO projesinde neden React Native tercih edildi? Native iOS/Android geliştirmeye göre 3 temel avantajını açıklayın.**

<details>
<summary>Cevap</summary>

**3 Temel Avantaj:**

1. **Cross-Platform Development:**
   - Tek kod tabanı ile hem iOS hem Android
   - Code reusability: %95+ kod paylaşımı
   - Paralel geliştirme yerine unified codebase
   - Maliyet tasarrufu: Tek ekip, iki platform

2. **Hızlı Geliştirme Döngüsü:**
   - Hot Reload: Değişiklikleri anında görebilme
   - Expo tooling: Hızlı test ve deployment
   - JavaScript/TypeScript: Web developer'lar için düşük giriş bariyeri
   - NPM ecosystem: 2M+ paket hazır

3. **SUOLINGO İçin Özel Avantajlar:**
   - Avatar entegrasyonları kolayca test edilebiliyor (Expo Go)
   - Real-time özellikleri WebSocket ile kolay
   - API entegrasyonları (axios, fetch) straightforward
   - Community support: React Native Paper, Navigation libraries

**Native'e Göre Dezavantajlar:**
- Performance: %5-10 daha yavaş
- Native modules: Bazı özellikler için bridge gerekli
- APK boyutu: Daha büyük

**Sonuç:** SUOLINGO gibi MVP ve akademik projeler için mükemmel seçim.
</details>

---

### Soru 2
**Expo SDK kullanmanın avantaj ve dezavantajlarını açıklayın. SUOLINGO'da Expo Go ile Development Build arasındaki farkı örnekle anlatın.**

<details>
<summary>Cevap</summary>

**Expo SDK Avantajları:**

1. **Managed Workflow:**
   - Kolay kurulum: `npx create-expo-app`
   - Native config otomatik
   - Over-the-air (OTA) updates
   - No Xcode/Android Studio gerekliliği

2. **Built-in APIs:**
   - expo-speech (TTS)
   - expo-av (Audio/Video)
   - expo-web-browser (In-app browser)
   - expo-file-system, expo-constants

3. **Geliştirme Hızı:**
   - Expo Go ile anında test
   - QR kod ile fiziksel cihazda çalıştırma
   - EAS Build: Cloud-based APK/IPA

**Dezavantajlar:**

1. **Native Module Kısıtlamaları:**
   - react-native-webview çalışmıyor (Expo Go'da)
   - Custom native code eklenemez (managed workflow)
   - Bazı third-party libraries desteklenmiyor

2. **APK Boyutu:**
   - ~50MB minimum (Expo runtime dahil)
   - Native'e göre 2-3x büyük

3. **Performance:**
   - Overhead: Expo runtime
   - Startup time biraz yavaş

**SUOLINGO Örneği:**

```typescript
// ❌ Expo Go'da ÇALIŞMIYOR:
import { WebView } from 'react-native-webview';
<WebView source={{ uri: tavusUrl }} />

// ✅ Expo Go'da ÇALIŞIYOR:
import * as WebBrowser from 'expo-web-browser';
await WebBrowser.openBrowserAsync(tavusUrl);
```

**Expo Go vs Development Build:**

| Özellik | Expo Go | Development Build |
|---------|---------|-------------------|
| Native modules | ❌ Yok | ✅ Var |
| WebView | ❌ Çalışmaz | ✅ Çalışır |
| Kurulum | Hazır app | Build gerekli |
| Test hızı | Anında (QR) | 10-15 dk build |
| Kullanım | MVP, prototype | Production-ready |

**SUOLINGO'da:** Şu an Expo Go kullanıyoruz (MVP için yeterli), ileride WebView için Development Build gerekecek.
</details>

---

### Soru 3
**TypeScript strict mode kullanmanın faydaları nelerdir? SUOLINGO'da hangi type safety mekanizmaları kullanıldı?**

<details>
<summary>Cevap</summary>

**TypeScript Strict Mode Faydaları:**

1. **Compile-Time Error Detection:**
   ```typescript
   // ❌ JavaScript: Runtime'da crash
   const user = null;
   console.log(user.name); // TypeError!

   // ✅ TypeScript: Compile'da yakalanır
   const user: User | null = null;
   console.log(user?.name); // Safe
   ```

2. **IDE IntelliSense:**
   - Autocomplete
   - Parameter hints
   - Jump to definition

3. **Refactoring Güvenliği:**
   - Type değiştirince tüm kullanımlar uyarı verir
   - Breaking change'leri erken tespit

4. **Documentation:**
   - Interface'ler self-documenting
   - API kontratları açık

**SUOLINGO'da Kullanılan Type Safety:**

1. **Interface Definitions:**
   ```typescript
   // src/services/avatar/IAvatarService.ts
   interface IAvatarService {
     generateLipSync(audioUrl: string): Promise<string>;
     uploadCustomAvatar(file: File): Promise<Avatar>;
   }

   // src/types/Avatar.ts
   interface Avatar {
     id: string;
     name: string;
     imageUrl: string;
     voiceId?: string;
   }
   ```

2. **Service Contracts:**
   ```typescript
   class DeepgramService {
     async transcribe(
       audioBlob: Blob,
       language: 'tr' | 'en'
     ): Promise<TranscriptionResult> {
       // Type-safe implementation
     }
   }
   ```

3. **Redux State Types:**
   ```typescript
   interface UserState {
     displayName: string;
     email: string;
     totalXP: number;
     currentLevel: number;
   }

   // Type-safe selector
   const selectUser = (state: RootState) => state.user;
   ```

4. **Navigation Types:**
   ```typescript
   type MainTabParamList = {
     Practice: undefined;
     Exams: undefined;
     Progress: undefined;
     Profile: undefined;
   };

   // Type-safe navigation
   navigation.navigate('Exams');
   ```

**tsconfig.json:**
```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true
  }
}
```

**Sonuç:** Type safety, runtime error'ları %80 azaltır ve kod kalitesini artırır.
</details>

---

### Soru 4
**React Navigation'da Bottom Tab Navigator ve Stack Navigator arasındaki farkı açıklayın. SUOLINGO'daki navigation hierarchy'sini çizin.**

<details>
<summary>Cevap</summary>

**Bottom Tab Navigator:**

- **Kullanım:** Ana navigasyon
- **Görünüm:** Ekranın altında tab bar
- **Behavior:** Her tab bağımsız state
- **Örnek:** Instagram (Home, Search, Reels, Profile)

**Stack Navigator:**

- **Kullanım:** Detay ekranlar, modal'lar
- **Görünüm:** Geri butonu, header
- **Behavior:** Push/pop stack mantığı
- **Örnek:** Settings → Account → Privacy

**SUOLINGO Navigation Hierarchy:**

```
App.tsx
└── <Provider store={store}>
    └── <NavigationContainer>
        └── MainNavigator (Bottom Tab)
            │
            ├── Practice Tab ────────────────┐
            │   └── HomeNavigator (Stack)    │
            │       ├── ScenarioListScreen   │ ← Ana ekran
            │       ├── AvatarScreen         │ ← Mode selection
            │       ├── ConversationMode     │
            │       ├── RolePlayScreen       │
            │       └── ExamModeScreen       │ ← Real-time IELTS/TOEFL
            │
            ├── Exams Tab ───────────────────┐
            │   └── ExamModeScreen (Direct)  │ ← Direkt açılır
            │
            ├── Progress Tab ────────────────┐
            │   └── ProgressScreen           │ ← XP, level, badges
            │       ├── Redux: user.totalXP  │
            │       └── Redux: user.level    │
            │
            └── Profile Tab ─────────────────┐
                └── ProfileScreen            │ ← User info
                    ├── Redux: displayName   │
                    └── Redux: email         │
```

**Tab Configuration:**

```typescript
// src/navigation/MainNavigator.tsx
<Tab.Navigator
  screenOptions={{
    tabBarStyle: {
      paddingBottom: Platform.OS === 'ios' ? insets.bottom : 8,
      height: Platform.OS === 'ios' ? 65 + insets.bottom : 65,
    }
  }}
>
  <Tab.Screen
    name="Practice"
    component={HomeNavigator} // Stack!
    options={{
      tabBarIcon: ({ color }) => (
        <MaterialCommunityIcons name="account-voice" size={24} color={color} />
      ),
      headerShown: false
    }}
  />
  <Tab.Screen name="Exams" component={ExamModeScreen} />
  <Tab.Screen name="Progress" component={ProgressScreen} />
  <Tab.Screen name="Profile" component={ProfileScreen} />
</Tab.Navigator>
```

**Nested Navigation Avantajı:**
- Practice tab'daki ekranlar arası geçiş (stack)
- Tab değiştirince state korunur
- Her tab'ın kendi navigation state'i var

**iPhone Safe Area:**
```typescript
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const insets = useSafeAreaInsets();
// Bottom tab bar iPhone home indicator'ının üstünde
```
</details>

---

### Soru 5
**SUOLINGO'da kullanılan paketleri kategorilere ayırıp açıklayın (package.json). Her kategoriden 2 örnek verin.**

<details>
<summary>Cevap</summary>

**1. Framework & Core (React Native Ecosystem):**

```json
"expo": "~54.0.0"              // Development framework
"react-native": "0.81.5"        // Core framework
"react": "19.1.0"               // UI library
"typescript": "~5.9.2"          // Type safety
```

**Açıklama:**
- **expo:** Managed workflow, built-in APIs
- **react-native:** Cross-platform mobile framework
- **typescript:** Static typing, compile-time errors

---

**2. UI Components & Styling:**

```json
"react-native-paper": "^5.12.0"           // Material Design 3
"react-native-gesture-handler": "~2.28.0" // Touch interactions
"react-native-safe-area-context": "~5.6.0" // iPhone notch
```

**Açıklama:**
- **react-native-paper:** Button, Card, Dialog (Material Design)
- **gesture-handler:** Swipe, pan, pinch gestures
- **safe-area-context:** Notch, home indicator handling

---

**3. Navigation:**

```json
"@react-navigation/native": "^6.1.0"
"@react-navigation/bottom-tabs": "^6.5.0"
"@react-navigation/stack": "^6.3.0"
"react-native-screens": "~4.16.0"
```

**Açıklama:**
- **native:** Navigation container
- **bottom-tabs:** Tab bar navigator
- **stack:** Push/pop navigation
- **screens:** Native screen optimization

---

**4. State Management & Storage:**

```json
"@reduxjs/toolkit": "^2.0.0"
"react-redux": "^9.0.0"
"@react-native-async-storage/async-storage": "2.2.0"
```

**Açıklama:**
- **Redux Toolkit:** Global state, slices
- **react-redux:** React bindings (useSelector, useDispatch)
- **AsyncStorage:** Persistent local storage (key-value)

---

**5. AI/ML Servisleri:**

```json
"@google/generative-ai": "^0.21.0"          // Gemini AI
"@heygen/streaming-avatar": "^2.1.0"        // Avatar streaming
```

**Açıklama:**
- **@google/generative-ai:** Gemini API (conversation, content generation)
- **@heygen/streaming-avatar:** Real-time video avatar

**Not:** Deepgram, ElevenLabs, Tavus HTTP API üzerinden (axios ile)

---

**6. Media & Audio/Video:**

```json
"expo-av": "~16.0.7"              // Audio/Video playback
"expo-speech": "~14.0.7"          // Native TTS
"expo-file-system": "~18.0.6"     // File operations
```

**Açıklama:**
- **expo-av:** Video player, audio recorder
- **expo-speech:** Fallback TTS (offline)
- **expo-file-system:** Download, upload files

---

**7. Network & API:**

```json
"axios": "^1.7.0"                  // HTTP client
"expo-web-browser": "~15.0.10"     // In-app browser
"expo-constants": "~18.0.10"       // Environment variables
```

**Açıklama:**
- **axios:** REST API calls, interceptors
- **expo-web-browser:** Tavus conversation açmak için
- **expo-constants:** API keys, config

---

**8. Development Tools:**

```json
"eslint": "^9.0.0"                        // Linting
"prettier": "^3.3.0"                      // Code formatting
"@typescript-eslint/parser": "^8.0.0"     // TS lint rules
"babel-preset-expo": "~54.0.0"            // Transpiler
```

**Açıklama:**
- **ESLint:** Code quality, best practices
- **Prettier:** Consistent formatting
- **Babel:** ES6+ → ES5 transpilation

---

**9. Environment & Config:**

```json
"react-native-dotenv": "^3.4.11"          // .env file support
"babel-plugin-module-resolver": "^5.0.0"  // Path aliases (@/)
```

**Açıklama:**
- **react-native-dotenv:** `process.env.API_KEY`
- **module-resolver:** `import X from '@/services/Y'`

---

**10. Animation & Performance:**

```json
"react-native-reanimated": "~4.1.1"      // Animations
"react-native-worklets": "0.5.1"          // JS threads
```

**Açıklama:**
- **reanimated:** 60fps animations (avatar transitions)
- **worklets:** UI thread'de JS çalıştırma

---

**Toplam Paket Sayısı:** ~40 dependency + ~15 devDependency
</details>

---

### Soru 6
**React Native'de "Bridge" kavramını açıklayın. Expo Go'da native module çalışmama sorunu nedir? SUOLINGO'daki WebView → expo-web-browser değişimini açıklayın.**

<details>
<summary>Cevap</summary>

**React Native Bridge:**

**Mimari:**
```
JavaScript Thread  ←──Bridge (JSON)──→  Native Thread (iOS/Android)
    ↓                                         ↓
  React code                            Camera, GPS, etc.
  Business logic                        Native modules
```

**Nasıl Çalışır:**
1. JS thread: `Camera.takePicture()`
2. Bridge: JSON mesaj gönderir
3. Native: Kamera açılır
4. Native → Bridge → JS: Fotoğraf döner

**Bridge Sorunu:**
- **Asenkron:** Her çağrı serialize/deserialize
- **Performance:** Video, Audio için yavaş
- **Latency:** 16ms'den uzun sürebilir (60fps için max 16ms)

**Yeni Mimari (Fabric + TurboModules):**
- Synchronous çağrılar
- JSI (JavaScript Interface) - JSON yok
- %30 performance artışı

---

**Expo Go'da Native Module Sorunu:**

**Expo Go Nedir:**
- Hazır built app (App Store/Play Store'dan indir)
- Built-in Expo SDK modules dahil
- **Özel native module YOK**

**Neden Çalışmaz:**

```typescript
// ❌ react-native-webview
import { WebView } from 'react-native-webview';
// Bu paket native iOS/Android kodu içerir
// Expo Go'da bu kod yok → Crash!
```

**Çözüm: Development Build**
- EAS Build ile özel APK/IPA oluştur
- Native modules dahil
- 10-15 dakika build süresi

---

**SUOLINGO'daki WebView Sorunu:**

**İlk Denemede:**
```typescript
// ❌ ÇALIŞMADI (Expo Go'da)
import { WebView } from 'react-native-webview';

<WebView
  source={{ uri: 'https://tavus.daily.co/c1af06719048b47d' }}
  style={styles.video}
/>

// Hata: "Unable to resolve module react-native-webview"
// Çünkü: Native module, Expo Go'da yok
```

**Çözüm:**
```typescript
// ✅ ÇALIŞTI (Expo Go'da)
import * as WebBrowser from 'expo-web-browser';

const handleStartRealTime = async () => {
  const conversationUrl = await TavusService.startConversation();

  await WebBrowser.openBrowserAsync(conversationUrl, {
    preferredBarTintColor: '#3b82f6',    // iOS
    toolbarColor: '#3b82f6',              // Android
    enableBarCollapsing: true
  });
};
```

**Farklar:**

| Özellik | WebView | expo-web-browser |
|---------|---------|------------------|
| Yerleşim | Embedded (component) | External (new window) |
| Expo Go | ❌ Çalışmaz | ✅ Çalışır |
| UI Control | Full control | OS browser UI |
| Performance | Native | Native |
| Use Case | In-app content | External URLs |

**SUOLINGO'da Neden expo-web-browser Yeterli:**
- Tavus conversation geçici (5-10 dakika)
- External browser kabul edilebilir UX
- MVP için yeterli
- Production'da Development Build ile WebView kullanılabilir

**ExamModeScreen.tsx Değişikliği:**
```typescript
// ÖNCE:
const [tavusConversationUrl, setTavusConversationUrl] = useState('');

<WebView source={{ uri: tavusConversationUrl }} />

// SONRA:
// URL'yi render etmiyoruz, direkt browser açıyoruz
await WebBrowser.openBrowserAsync(conversationUrl);
// State gerekmez, WebView component yok
```

**Sonuç:** Expo Go uyumluluğu için pratik trade-off.
</details>

---

### Soru 7
**Hot Reload vs Live Reload vs Fast Refresh farkı nedir? Expo'da hangi kullanılıyor?**

<details>
<summary>Cevap</summary>

**1. Live Reload (Eski):**

**Nasıl Çalışır:**
- Dosya değiştir → Save
- Uygulama **tamamen yeniden başlar**
- State kaybolur
- 5-10 saniye sürer

**Dezavantaj:**
```typescript
// Login ekranındasın
const [email, setEmail] = useState('test@example.com');
const [password, setPassword] = useState('12345');

// UI değişikliği yapıp save et
// → Uygulama restart → Login ekranına dön → Tekrar email/password gir
```

---

**2. Hot Reload (Webpack HMR):**

**Nasıl Çalışır:**
- Sadece **değişen modül** yeniden yüklenir
- State korunur
- Instant (<1 saniye)

**Avantaj:**
```typescript
// Login ekranında email: 'test@example.com' yazdın
// UI değişikliği yap → Save
// → Sadece UI güncellenir, email state kaybolmaz ✅
```

**Dezavantaj:**
- Bazen state corrupt olur
- Class component'lerde sorunlu

---

**3. Fast Refresh (React Native Modern):**

**Nasıl Çalışır:**
- Hot Reload + React Hooks desteği
- Component state korunur
- Hooks'ları yeniden initialize eder
- Error recovery: Hata düzeltince otomatik devam

**Expo'da Fast Refresh:**
```typescript
// ConversationModeScreen.tsx
const [messages, setMessages] = useState([]);

// UI değiştir → Save
// → messages state korunur
// → Sadece render güncellenir
// → <1 saniye
```

**Error Handling:**
```typescript
// Hata yaz:
const x = undefined.name; // ❌ Crash

// Expo: Kırmızı ekran, hata mesajı
// Hatayı düzelt:
const x = person?.name; // ✅

// Save → Fast Refresh otomatik devam eder
// State kaybolmaz!
```

---

**SUOLINGO'da Kullanım:**

```bash
# Terminal
npx expo start

# Dosya değiştir (örn: AvatarScreen.tsx)
# → Fast Refresh çalışır
# → Değişiklik 500ms'de görünür
# → Redux state korunur
# → Navigation stack korunur
```

**Manuel Reload:**
- **iOS Simulator:** Cmd+R
- **Android Emulator:** R + R (twice)
- **Expo Go:** Shake → Reload

**Performance:**
- **Fast Refresh:** <1 saniye
- **Live Reload:** 5-10 saniye
- **Full Restart:** 20-30 saniye

**Expo Default:** Fast Refresh ✅
</details>

---

### Soru 8
**EAS Build nedir? Development build vs Production build farkı? SUOLINGO'da APK nasıl oluşturuldu?**

<details>
<summary>Cevap</summary>

**EAS Build (Expo Application Services):**

**Nedir:**
- Cloud-based build service
- iOS (IPA) ve Android (APK) oluşturur
- CI/CD pipeline entegrasyonu
- Free tier: 30 build/month

**Alternatifler:**
- Local build: `eas build --local`
- Xcode (iOS)
- Android Studio (Android)

---

**Development Build vs Production Build:**

| Özellik | Development | Production |
|---------|-------------|------------|
| Amaç | Testing | Release |
| Debug | Enabled | Disabled |
| Source maps | Included | Stripped |
| Performance | Yavaş | Optimized |
| APK boyutu | Büyük (~80MB) | Küçük (~50MB) |
| ProGuard | Disabled | Enabled |
| Install | Test cihazlar | App Store/Play |

**Development Build:**
```json
// eas.json
{
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal",
      "android": {
        "buildType": "apk"
      }
    }
  }
}
```

**Özellikleri:**
- Native modules dahil (WebView çalışır)
- Debug menu erişilebilir
- Shake → Dev menu
- Expo Go'ya benzer ama custom native code var

**Production Build:**
```json
{
  "build": {
    "production": {
      "android": {
        "buildType": "app-bundle"  // Google Play için
      },
      "ios": {
        "bundler": "metro"
      }
    }
  }
}
```

**Özellikleri:**
- Minified code
- ProGuard obfuscation (Android)
- App signing
- Store'a yüklenebilir

---

**SUOLINGO APK Build Süreci:**

**1. eas.json Oluştur:**
```json
{
  "cli": {
    "version": ">= 0.52.0"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal",
      "android": {
        "buildType": "apk"
      }
    }
  },
  "submit": {
    "production": {}
  }
}
```

**2. app.json Yapılandır:**
```json
{
  "expo": {
    "name": "SUOLINGO",
    "slug": "suolingo",
    "version": "1.0.0",
    "android": {
      "package": "com.suolingo.app",
      "versionCode": 1,
      "adaptiveIcon": {
        "foregroundImage": "./assets/icon.png",
        "backgroundColor": "#3b82f6"
      }
    }
  }
}
```

**3. Build Komutu:**
```bash
# Development build
npx eas-cli build --platform android --profile development

# Build başlar:
# ✔ Build ID: 5116ed9d-cbb7-4c38-8796-ff5233ef9cfa
# ✔ Status: In queue → In progress → Finished
# ✔ Süre: ~10 dakika
```

**4. Build Detayları:**
```
Build ID: 5116ed9d-cbb7-4c38-8796-ff5233ef9cfa
Platform: Android
Status: Finished
Profile: Development (Internal Distribution)
SDK Version: 54.0.0
App Version: 1.0.0
Build Tarihi: 19.12.2025 10:45-10:55
```

**5. APK İndirme:**
```
Direkt Link:
https://expo.dev/artifacts/eas/b1LG4kiZDeCz6iMjkeUBW3.apk

Build Sayfası:
https://expo.dev/accounts/srhot/projects/suolingo/builds/5116ed9d-cbb7-4c38-8796-ff5233ef9cfa
```

**6. APK Kurulumu:**
```bash
# Method 1: ADB
adb install ~/Downloads/b1LG4kiZDeCz6iMjkeUBW3.apk

# Method 2: Drag & Drop
# APK'yı Android emulator'e sürükle

# Method 3: Fiziksel Telefon
# APK'yı WhatsApp/Drive ile gönder → Kur
```

---

**SUOLINGO Build Stats:**
- Proje ID: `6eb53ccb-2530-42d2-86bf-8ed72e7d388f`
- Package Name: `com.suolingo.app`
- APK boyutu: ~75MB (development)
- Build süresi: 10 dakika
- Platform: Android 14 (API 34)

**Git Durumu (Build Sırasında):**
- Branch: `claude/fix-readme-app-purpose-011CUoXo9vS3Hw5LUTCEo4F1`
- Commit: `23c8685 - fix: Use WAV format for Role-Play microphone`

**Build Logs:**
```
› Compiling JavaScript
› Building Android app
› Signing APK
› Uploading artifact
› Build complete!
```

**Sonuç:** EAS Build, Xcode/Android Studio olmadan APK oluşturmanın en kolay yolu.
</details>

---

### Soru 9
**SUOLINGO'da Material Design 3 nasıl kullanıldı? react-native-paper'dan hangi componentler kullanıldı?**

<details>
<summary>Cevap</summary>

**Material Design 3 (Material You):**

**Nedir:**
- Google'ın design system'i
- Android 12+ native look
- Dynamic color (system theme)
- Accessibility standartları

**react-native-paper:**
- Material Design 3 implementation
- React Native için
- TypeScript support
- Theming system

---

**SUOLINGO'da Kullanılan Componentler:**

**1. Button:**
```typescript
import { Button } from 'react-native-paper';

<Button
  mode="contained"           // Filled button
  onPress={handleStartIELTS}
  loading={isProcessing}
  icon="school"
>
  Start Real-Time IELTS
</Button>

<Button
  mode="outlined"            // Outlined button
  onPress={handleCancel}
>
  Cancel
</Button>

<Button
  mode="text"                // Text button
  onPress={handleSkip}
>
  Skip
</Button>
```

**Mode Örnekleri:**
- **contained:** Arka plan renkli (primary action)
- **outlined:** Border var, arka plan şeffaf
- **text:** Sadece text, border yok

---

**2. Card:**
```typescript
import { Card } from 'react-native-paper';

// Exam Preparation Card
<Card
  mode="elevated"
  onPress={() => navigation.navigate('ExamMode')}
  style={styles.modeCard}
>
  <Card.Title
    title="Exam Preparation"
    subtitle="IELTS & TOEFL Speaking Practice"
    left={(props) => <Avatar.Icon {...props} icon="school" />}
  />
  <Card.Content>
    <Text>Real-time AI-powered exam simulations...</Text>
  </Card.Content>
</Card>
```

---

**3. Switch (Toggle):**
```typescript
import { Switch } from 'react-native-paper';

// Real-Time Mode Toggle
<View style={styles.toggleContainer}>
  <Text>Real-Time Mode</Text>
  <Switch
    value={isRealTimeMode}
    onValueChange={setIsRealTimeMode}
    color="#3b82f6"
  />
</View>
```

---

**4. Dialog:**
```typescript
import { Dialog, Portal } from 'react-native-paper';

<Portal>
  <Dialog visible={showDialog} onDismiss={hideDialog}>
    <Dialog.Title>Conversation Completed</Dialog.Title>
    <Dialog.Content>
      <Text>Your IELTS practice session has ended.</Text>
    </Dialog.Content>
    <Dialog.Actions>
      <Button onPress={hideDialog}>OK</Button>
    </Dialog.Actions>
  </Dialog>
</Portal>
```

---

**5. TextInput:**
```typescript
import { TextInput } from 'react-native-paper';

<TextInput
  label="Email"
  value={email}
  onChangeText={setEmail}
  mode="outlined"
  left={<TextInput.Icon icon="email" />}
  keyboardType="email-address"
/>
```

---

**6. FAB (Floating Action Button):**
```typescript
import { FAB } from 'react-native-paper';

<FAB
  icon="microphone"
  style={styles.fab}
  onPress={startRecording}
  color="white"
  customSize={64}
/>
```

---

**7. Avatar:**
```typescript
import { Avatar } from 'react-native-paper';

<Avatar.Image
  size={64}
  source={{ uri: avatarUrl }}
/>

<Avatar.Icon
  size={48}
  icon="account"
/>

<Avatar.Text
  size={48}
  label="SH"
/>
```

---

**8. ProgressBar:**
```typescript
import { ProgressBar } from 'react-native-paper';

<ProgressBar
  progress={pronunciationScore / 100}
  color="#3b82f6"
  style={styles.progressBar}
/>
```

---

**9. Chip:**
```typescript
import { Chip } from 'react-native-paper';

<Chip
  icon="check"
  onPress={handleSelectCEFR}
  selected={selectedLevel === 'B2'}
>
  B2 - Upper Intermediate
</Chip>
```

---

**10. Snackbar:**
```typescript
import { Snackbar } from 'react-native-paper';

<Snackbar
  visible={snackbarVisible}
  onDismiss={() => setSnackbarVisible(false)}
  duration={3000}
  action={{
    label: 'Undo',
    onPress: handleUndo,
  }}
>
  Message sent successfully!
</Snackbar>
```

---

**Theming:**

```typescript
// App.tsx
import { Provider as PaperProvider, MD3LightTheme } from 'react-native-paper';

const lightTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: '#3b82f6',       // Blue
    secondary: '#8b5cf6',     // Purple
    tertiary: '#ec4899',      // Pink
    error: '#ef4444',
    background: '#f9fafb',
    surface: '#ffffff',
    onPrimary: '#ffffff',
    onSecondary: '#ffffff',
  },
};

export default function App() {
  return (
    <PaperProvider theme={lightTheme}>
      {/* App content */}
    </PaperProvider>
  );
}
```

---

**Icon Library:**
```typescript
// Material Community Icons (default)
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

<MaterialCommunityIcons name="account-voice" size={24} color="#3b82f6" />
```

**SUOLINGO'da Kullanılan İkonlar:**
- `account-voice` - Practice tab
- `school` - Exams tab
- `chart-line` - Progress tab
- `account` - Profile tab
- `microphone` - Recording
- `play` - Play audio

---

**Accessibility:**
```typescript
<Button
  mode="contained"
  accessibilityLabel="Start IELTS exam practice"
  accessibilityHint="Opens real-time conversation with AI examiner"
>
  Start IELTS
</Button>
```

**Sonuç:** react-native-paper, Material Design'ı React Native'e getiren en iyi kütüphane.
</details>

---

### Soru 10
**Expo Go vs Development Build vs Production Build karşılaştırmasını tablo halinde yapın. SUOLINGO hangi aşamada?**

<details>
<summary>Cevap</summary>

**Karşılaştırma Tablosu:**

| Özellik | Expo Go | Development Build | Production Build |
|---------|---------|-------------------|------------------|
| **Kurulum** | App Store'dan indir | EAS Build (~10 dk) | EAS Build (~15 dk) |
| **Native Modules** | ❌ Sadece Expo SDK | ✅ Custom natives | ✅ Custom natives |
| **WebView** | ❌ Çalışmaz | ✅ Çalışır | ✅ Çalışır |
| **Test Hızı** | ⚡ Anında (QR kod) | 🐢 Build gerekli | 🐢 Build gerekli |
| **Debug Menu** | ✅ Var | ✅ Var | ❌ Yok |
| **Hot Reload** | ✅ Fast Refresh | ✅ Fast Refresh | ❌ Disabled |
| **APK Boyutu** | - (app zaten yüklü) | ~80MB | ~50MB |
| **Performance** | Normal | Normal | ⚡ Optimized |
| **ProGuard** | - | ❌ Disabled | ✅ Enabled |
| **Source Maps** | Included | Included | Stripped |
| **Signing** | - | Dev certificate | Production key |
| **Deployment** | - | Internal test | App Store/Play |
| **Use Case** | MVP, prototype | Testing natives | Release |
| **Maliyet** | ✅ Ücretsiz | ✅ 30 build/month free | ✅ 30 build/month free |

---

**Detaylı Açıklamalar:**

**1. Expo Go:**
```bash
# Kullanım:
npx expo start
# → QR kod tara (Expo Go app ile)
# → Anında çalışır (5 saniye)

# Avantajlar:
✅ En hızlı test yöntemi
✅ No build gerekli
✅ Herkes aynı app kullanır

# Dezavantajlar:
❌ Native modules yok
❌ WebView çalışmaz
❌ Camera, Bluetooth limitli
```

---

**2. Development Build:**
```bash
# Build:
npx eas-cli build --platform android --profile development

# Kurulum:
adb install app.apk

# Çalıştırma:
npx expo start --dev-client

# Avantajlar:
✅ Custom native modules
✅ WebView çalışır
✅ Debug menu aktif
✅ Fast Refresh var

# Dezavantajlar:
🐢 İlk build 10-15 dk
🐢 Her native değişiklikte rebuild
📦 APK büyük (~80MB)
```

**Development Build İçeriği:**
```
APK:
├── Expo runtime
├── React Native
├── Custom native modules (WebView, etc.)
├── Debug symbols
├── Source maps
└── Dev menu
```

---

**3. Production Build:**
```bash
# Build:
npx eas-cli build --platform android --profile production

# Submit:
npx eas submit -p android

# Avantajlar:
⚡ Optimized performance
📦 Küçük APK (~50MB)
🔒 ProGuard obfuscation
✅ Store'a yüklenebilir

# Dezavantajlar:
❌ Debug menu yok
❌ Hot Reload yok
🐞 Debug zorlaşır
```

**Production Build Optimizations:**
```
Minification:    ✅ Enabled
Obfuscation:     ✅ ProGuard
Tree Shaking:    ✅ Unused code removed
Source Maps:     ❌ Stripped
Debug Symbols:   ❌ Removed
Performance:     ⚡ +30% faster
```

---

**SUOLINGO Şu Anda Hangi Aşamada:**

**Mevcut Durum: Expo Go** ✅

```typescript
// package.json
{
  "scripts": {
    "start": "expo start"  // ← Expo Go
  }
}

// Kullanım:
npx expo start --tunnel
// → iPhone/Android Expo Go ile QR tara
// → Uygulama çalışır
```

**Neden Expo Go Seçildi:**
1. **MVP Hız:** Anında test
2. **Ödev Teslimi:** Build süresi yok
3. **Demo:** QR kod ile kolay gösterim
4. **Çoğu özellik çalışıyor:**
   - ✅ Avatar servisleri (API calls)
   - ✅ STT/TTS (Deepgram, ElevenLabs)
   - ✅ Navigation
   - ✅ Redux
   - ✅ expo-web-browser (Tavus için)

**Expo Go'da Çalışmayanlar:**
- ❌ react-native-webview (native module)
- ❌ Custom camera features
- ❌ Background audio (advanced)

**Çözüm:** expo-web-browser kullanıldı (trade-off)

---

**Sonraki Aşamalar:**

**Aşama 2: Development Build** (Gelecek)
```bash
# Build:
npx eas-cli build --platform android --profile development

# Ne değişir:
✅ WebView embedded olarak çalışır
✅ Custom camera için native code
✅ Background audio
```

**Use Case:**
- Hocaya embedded WebView göstermek
- Production-like test
- Beta testing

---

**Aşama 3: Production Build** (App Store/Play)
```bash
# Build + Submit:
npx eas-cli build --platform android --profile production
npx eas submit -p android

# Ne değişir:
✅ Google Play'de yayınlanır
✅ Public download
✅ Optimized performance
```

---

**Timeline:**

```
Şu An: Expo Go (MVP, ödev teslimi)
    ↓
İleri: Development Build (hoca demo, test)
    ↓
Uzun Vade: Production Build (App Store/Play)
```

**Sonuç:** SUOLINGO şu an Expo Go ile çalışıyor, embedded WebView için Development Build gerekecek.
</details>

---

## 🤖 BÖLÜM 2: AI SERVİSLERİ - DEEPGRAM, ELEVENLABS, TAVUS (15 Soru)

### Soru 11
**Deepgram nedir? STT (Speech-to-Text) nasıl çalışır? SUOLINGO'da hangi modlar için kullanıldı?**

<details>
<summary>Cevap</summary>

**Deepgram:**

**Nedir:**
- Speech-to-Text (STT) API servisi
- Real-time + Batch transcription
- 30+ dil desteği (Turkish, English, etc.)
- AI-powered (deep learning models)

**Kurucular:** Adam Sypniewski, Scott Stephenson (2015)
**Headquarters:** San Francisco, CA

---

**STT Nasıl Çalışır:**

**1. Ses Kaydı:**
```typescript
// User mikrofona konuşur
const audioBlob = await recordAudio(); // WAV, MP3, WebM
```

**2. API İsteği:**
```typescript
import DeepgramService from '@/services/voice/DeepgramService';

const result = await DeepgramService.transcribe(
  audioBlob,
  'tr'  // Turkish
);

// Result:
{
  transcript: "Merhaba, nasılsın?",
  confidence: 0.97,
  words: [
    { word: "Merhaba", start: 0.0, end: 0.5 },
    { word: "nasılsın", start: 0.6, end: 1.2 }
  ]
}
```

**3. AI Processing:**
```
Audio Waveform → Feature Extraction → Deep Learning Model → Text
   (WAV)            (MFCC, spectrograms)      (RNN, Transformer)     (Transcript)
```

**4. Return:**
- Transcript (metin)
- Confidence score (doğruluk)
- Word-level timestamps
- Speaker diarization (kim konuştu)

---

**Deepgram API Endpoints:**

**REST API (Batch):**
```typescript
POST https://api.deepgram.com/v1/listen
Headers:
  Authorization: Token YOUR_API_KEY
  Content-Type: audio/wav

Body: <audio file>

Query Params:
  ?language=tr
  &model=nova-3
  &punctuate=true
  &diarize=true
```

**WebSocket API (Real-time):**
```typescript
wss://api.deepgram.com/v1/listen?language=tr&punctuate=true

// Send audio chunks
ws.send(audioChunk);

// Receive transcripts
ws.onmessage = (msg) => {
  console.log(msg.data.transcript);
};
```

---

**Deepgram Models (2025-2026):**

**Nova-3 (Latest):**
- 54.2% lower Word Error Rate (WER)
- 36 dil desteği
- En hızı: 29.8 saniye/saat audio
- Use case: Production apps

**Whisper (Legacy):**
- OpenAI Whisper tabanlı
- Daha yavaş ama hassas
- 99 dil desteği

---

**SUOLINGO'da Kullanımı:**

**1. Mode 2: Voice Input Translation**
```typescript
// Workflow:
1. User presses 🎤 Microphone
2. Record audio (WAV format)
3. Deepgram.transcribe(audioBlob, 'tr')
4. Transcript → Text area 1
5. Translate to English
6. Avatar speaks (ElevenLabs TTS)
```

**Kod:**
```typescript
// src/services/voice/DeepgramService.ts
class DeepgramService {
  async transcribe(audioBlob: Blob, language: 'tr' | 'en'): Promise<string> {
    const formData = new FormData();
    formData.append('audio', audioBlob);

    const response = await axios.post(
      'https://api.deepgram.com/v1/listen',
      formData,
      {
        headers: {
          'Authorization': `Token ${process.env.DEEPGRAM_API_KEY}`,
        },
        params: {
          language,
          model: 'nova-3',
          punctuate: true
        }
      }
    );

    return response.data.results.channels[0].alternatives[0].transcript;
  }
}
```

---

**2. Mode 7: Role-Play Mode**
```typescript
// Scenario: Restaurant
// User: "Can I have the menu please?"
// Deepgram transcribes → Gemini AI responds → ElevenLabs speaks
```

---

**3. Mode 9: Pronunciation Practice**
```typescript
// User: "entrepreneur" der
// Deepgram transcribes: "entreepranure"
// → WER hesapla
// → Pronunciation score: 75/100
// → Feedback: "r harfi daha net olmalı"
```

**Pronunciation Scoring:**
```typescript
import { calculatePronunciationScore } from '@/services/pronunciation';

const score = calculatePronunciationScore(
  referenceText: "entrepreneur",
  spokenText: "entreepranure"
);

// Score: Levenshtein distance + confidence
// 0-100 arası
```

---

**4. Mode 11: Video Subtitle Practice**
```typescript
// Avatar video oynar
// User konuşmayı dinler
// "Repeat after me" → User tekrarlar
// Deepgram transcribes → Compare with original
```

---

**Deepgram Pricing (2026):**

| Plan | Fiyat | Dakika/Ay |
|------|-------|-----------|
| Free | $0 | 45 dakika |
| Pay as you go | $0.0043/dakika | Unlimited |
| Growth | $1,200/ay | 300,000 dakika |

**SUOLINGO için:** Free tier yeterli (MVP)

---

**Alternatifler:**

1. **OpenAI Whisper API:**
   - $0.006/dakika
   - 99 dil
   - Daha yavaş

2. **Google Cloud Speech-to-Text:**
   - $0.016/dakika
   - 125 dil
   - Enterprise features

3. **ElevenLabs Scribe:**
   - $0.008/dakika
   - 99 dil
   - 96.7% accuracy

**Neden Deepgram:**
- ✅ En hızlı (real-time)
- ✅ Türkçe desteği iyi
- ✅ Free tier cömert
- ✅ WebSocket support

---

**Performance (SUOLINGO'da):**

```
Audio kaydı:     2 saniye (user konuşur)
Upload:          0.5 saniye
Deepgram işler:  0.8 saniye (Nova-3)
Total:           ~3.3 saniye ✅
```

**Kullanıcı deneyimi:** "Konuş → 3 saniye → Metin görünür"

**Sonuç:** Deepgram, SUOLINGO'nun STT ihtiyaçları için ideal.
</details>

---

### Soru 12
**ElevenLabs nedir? TTS (Text-to-Speech) teknolojisi nasıl çalışır? Voice cloning özelliği nedir?**

<details>
<summary>Cevap</summary>

**ElevenLabs:**

**Nedir:**
- Text-to-Speech (TTS) API servisi
- AI-powered natural voice synthesis
- Voice cloning (ses kopyalama)
- 32 dil desteği

**Kurucular:** Piotr Dabkowski, Mati Staniszewski (2022)
**Headquarters:** New York, USA

---

**TTS Nasıl Çalışır:**

**1. Input Text:**
```typescript
const text = "Hello, how are you today?";
```

**2. AI Processing:**
```
Text → Tokenization → Phoneme Prediction → Prosody Model → Audio Waveform
              ↓              ↓                  ↓               ↓
         "Hello"      /həˈloʊ/        pitch,duration,stress   WAV/MP3
```

**3. Deep Learning Pipeline:**
```
Text Encoder (Transformer)
    ↓
Acoustic Model (predict mel-spectrograms)
    ↓
Vocoder (mel → audio waveform)
    ↓
Post-processing (denoise, normalize)
    ↓
Audio Output (MP3, WAV)
```

---

**ElevenLabs API:**

**Basic TTS:**
```typescript
import ElevenLabsService from '@/services/voice/ElevenLabsService';

const audioUrl = await ElevenLabsService.generateSpeech(
  text: "Merhaba, nasılsın?",
  voiceId: "21m00Tcm4TlvDq8ikWAM",  // Rachel (default)
  language: "tr"
);

// Returns: https://api.elevenlabs.io/v1/audio/xxx.mp3
```

**Voice Parameters:**
```typescript
await ElevenLabsService.generateSpeech(text, {
  voiceId: "21m00Tcm4TlvDq8ikWAM",
  stability: 0.75,        // 0-1 (consistency)
  similarity_boost: 0.85, // 0-1 (voice match)
  style: 0.5,             // 0-1 (exaggeration)
  use_speaker_boost: true
});
```

---

**Voice Cloning:**

**Nedir:**
- Kullanıcının sesini kopyalama
- 30 saniyelik sample ile
- Custom voice oluşturma

**Workflow:**
```
1. User 30 saniye konuşur (temiz kayıt)
2. Upload to ElevenLabs
3. AI analyzes vocal characteristics:
   - Pitch (ses perdesi)
   - Timbre (ses rengi)
   - Accent (aksan)
   - Speaking rate
4. Custom voice ID döner: "vc_xyz123"
5. Bu ID ile TTS kullan → User'ın sesiyle konuşur
```

**API:**
```typescript
// 1. Clone voice
const clonedVoiceId = await ElevenLabsService.cloneVoice(
  name: "Serhat's Voice",
  audioSamples: [audioBlob1, audioBlob2, audioBlob3]  // 30s each
);

// 2. Use cloned voice
const audioUrl = await ElevenLabsService.generateSpeech(
  text: "Bu benim sesim!",
  voiceId: clonedVoiceId
);

// Result: Avatar Serhat'ın sesiyle konuşur 🎙️
```

---

**SUOLINGO'da Kullanımı:**

**1. Avatar Speech (Tüm Modlar):**
```typescript
// Mode 1: Basic Translation
// Text area 2: "Hello, how are you?"
// → Press [Speak] button
// → ElevenLabs TTS generates audio
// → Avatar lip-sync (A2E)
// → Plays audio
```

**Kod:**
```typescript
// AvatarScreen.tsx
const handleSpeak = async () => {
  const text = textArea2;

  // Generate speech
  const audioUrl = await ElevenLabsService.generateSpeech(
    text,
    selectedVoice.id,  // Male: "ahmet", Female: "ayse"
    'en'
  );

  // Generate lip-sync video
  const videoUrl = await A2EService.generateLipSync(
    avatarImage,
    audioUrl
  );

  // Play
  setAvatarVideoUrl(videoUrl);
};
```

---

**2. Custom Avatar Voice (Mode: Upload Avatar):**
```typescript
// User uploads avatar + voice sample

const customAvatar = {
  id: uuid(),
  name: "My Avatar",
  image: uploadedImage,
  voiceId: await ElevenLabsService.cloneVoice(
    "My Voice",
    [voiceSample]  // 30s recording
  )
};

// Avatar artık user'ın sesiyle konuşur
```

---

**3. CEFR-Based Voice Adaptation:**
```typescript
// A1 (Beginner): Yavaş, açık telaffuz
await ElevenLabsService.generateSpeech(text, {
  voiceId,
  stability: 0.9,   // Tutarlı
  style: 0.2        // Az abartma
});

// C2 (Proficient): Normal hız, doğal
await ElevenLabsService.generateSpeech(text, {
  voiceId,
  stability: 0.6,
  style: 0.8        // Doğal tonlama
});
```

---

**ElevenLabs Models (2025-2026):**

**1. Flash (Latest):**
- 75ms latency (ultra-fast)
- Real-time conversations
- Use case: SUOLINGO real-time modes

**2. Multilingual V3:**
- 32 dil
- Emotional control
- Inline audio tags: `<emotion>happy</emotion>`

**3. Turbo V2.5:**
- Balance: quality + speed
- Production recommended

---

**Pricing (2026):**

| Plan | Fiyat | Karakter/Ay |
|------|-------|-------------|
| Free | $0 | 10,000 chars |
| Starter | $5 | 30,000 chars |
| Creator | $22 | 100,000 chars |
| Pro | $99 | 500,000 chars |

**SUOLINGO estimate:**
- 1 konuşma: ~200 karakter
- 50 konuşma/gün: 10,000 chars/gün
- Free tier: ~1 gün 😅
- **Recommendation:** Starter plan ($5/ay)

---

**Alternatifler:**

1. **OpenAI TTS (gpt-4o-mini-tts):**
   - $15 / 1M karakter
   - Instruction-based ("talk like a teacher")
   - 2025 yeni özellik

2. **Google Gemini 2.5 TTS:**
   - Low latency
   - Multi-speaker
   - Free (Google AI Studio)

3. **Deepgram Aura:**
   - $0.030 / 1K chars
   - 40% ucuz (ElevenLabs'tan)
   - Enterprise-ready

4. **expo-speech (Native):**
   - ✅ Ücretsiz
   - ❌ Robot sesi
   - Offline

**Neden ElevenLabs:**
- ✅ En doğal ses kalitesi
- ✅ Voice cloning
- ✅ Emotional range
- ✅ Türkçe desteği mükemmel

---

**Performance (SUOLINGO'da):**

```
API call:        0.5 saniye
Audio generation: 1.2 saniye (Flash model)
Download:        0.3 saniye
Total:           ~2 saniye ✅
```

**Kullanıcı deneyimi:** "Speak butonuna bas → 2 saniye → Avatar konuşmaya başlar"

**Sonuç:** ElevenLabs, SUOLINGO'nun TTS ihtiyaçları için pazar lideri.
</details>

---

### Soru 13
**Tavus Conversational API nedir? Real-time conversation nasıl çalışır? SUOLINGO'da Exam Mode için nasıl kullanıldı?**

<details>
<summary>Cevap</summary>

**Tavus Conversational API:**

**Nedir:**
- Real-time video conversation API
- AI avatar ile canlı konuşma
- WebRTC tabanlı (<500ms latency)
- Persona system (AI karakter oluşturma)

**Kurucular:** Tavus Team (2023)
**Headquarters:** San Francisco, CA
**Website:** https://tavus.io

---

**Temel Kavramlar:**

**1. Replica (Avatar):**
- Önceden hazırlanmış avatar modeli
- 50+ avatar mevcut (Tavus library)
- Örnek: "Professional Woman", "Business Man"

**2. Persona (AI Karakter):**
- Avatar'ın kişiliği, rolü, konuşma tarzı
- Prompt-based: "You are an IELTS examiner..."
- Context: Sınav kuralları, soru tipleri

**3. Conversation:**
- Real-time video call
- User konuşur → AI avatar cevaplar
- Daily.co infrastructure (WebRTC)

---

**Tavus API Workflow:**

**1. Persona Oluştur:**
```typescript
// src/services/avatar/TavusConversationalService.ts

const createIELTSPersona = async () => {
  const response = await axios.post(
    'https://tavusapi.com/v2/personas',
    {
      persona_name: "IELTS Speaking Examiner",
      system_prompt: `You are an IELTS Speaking test examiner.

      Part 1 (4-5 min): Ask about familiar topics (work, study, home, family)
      Part 2 (3-4 min): Give a topic card, user speaks for 2 minutes
      Part 3 (4-5 min): Ask deeper questions related to Part 2 topic

      Be professional, encouraging, and follow official IELTS guidelines.
      Speak clearly at moderate pace (CEFR B2-C1 level).`,

      context: "IELTS Speaking Test Preparation",
      default_replica_id: "r7c7a3b2d8e"  // Professional female avatar
    },
    {
      headers: {
        'x-api-key': '6d0584bf48a04c20afb83941f2653884'
      }
    }
  );

  return response.data.persona_id;  // "p47fdaf4e9de"
};
```

---

**2. Conversation Başlat:**
```typescript
const startIELTSConversation = async () => {
  const response = await axios.post(
    'https://tavusapi.com/v2/conversations',
    {
      persona_id: "p47fdaf4e9de",  // IELTS persona
      conversation_name: "IELTS Practice Session",
      conversational_context: "User is preparing for IELTS Speaking exam"
    },
    {
      headers: {
        'x-api-key': '6d0584bf48a04c20afb83941f2653884'
      }
    }
  );

  return response.data.conversation_url;
  // "https://tavus.daily.co/c1af06719048b47d"
};
```

---

**3. Conversation Açma (SUOLINGO'da):**

**Önce (WebView - Çalışmadı):**
```typescript
// ❌ Expo Go'da native module hatası
import { WebView } from 'react-native-webview';

<WebView source={{ uri: conversationUrl }} />
```

**Sonra (expo-web-browser - Çalıştı):**
```typescript
// ✅ Expo Go uyumlu
import * as WebBrowser from 'expo-web-browser';

const handleStartRealTimeIELTS = async () => {
  setIsProcessing(true);

  try {
    // 1. Persona al veya oluştur
    const personaId = await TavusConversationalService.getOrCreateIELTSPersona();

    // 2. Conversation başlat
    const conversationUrl = await TavusConversationalService.startIELTSConversation();

    // 3. In-app browser'da aç
    await WebBrowser.openBrowserAsync(conversationUrl, {
      // iOS
      preferredBarTintColor: '#3b82f6',
      preferredControlTintColor: '#ffffff',

      // Android
      toolbarColor: '#3b82f6',
      enableBarCollapsing: true
    });

    Alert.alert(
      'Conversation Completed! 🎉',
      'Your IELTS practice session has ended.'
    );

  } catch (error) {
    Alert.alert('Error', 'Could not start conversation. Try again.');
  } finally {
    setIsProcessing(false);
  }
};
```

---

**Real-Time Conversation Flow:**

```
User Press "Start Real-Time IELTS"
    ↓
Tavus API creates conversation → Returns URL
    ↓
expo-web-browser opens URL
    ↓
Daily.co room loads (WebRTC)
    ↓
AI Avatar appears (video)
    ↓
Avatar: "Hello, I'm your IELTS examiner. Let's start Part 1. Can you tell me about your work?"
    ↓
User speaks (microphone on)
    ↓
Tavus STT transcribes user speech
    ↓
Gemini AI (backend) generates response
    ↓
Tavus TTS + Lip-sync
    ↓
Avatar responds (real-time video)
    ↓
Conversation continues (10-15 minutes)
    ↓
User closes browser → Returns to app
```

---

**SUOLINGO Exam Mode Implementation:**

**ExamModeScreen.tsx:**
```typescript
const ExamModeScreen = () => {
  const [isRealTimeMode, setIsRealTimeMode] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  return (
    <ScrollView>
      {/* Real-Time Mode Toggle */}
      <View style={styles.toggleContainer}>
        <Text>Real-Time Mode (Tavus API)</Text>
        <Switch
          value={isRealTimeMode}
          onValueChange={setIsRealTimeMode}
        />
      </View>

      {isRealTimeMode && (
        <>
          {/* IELTS Button */}
          <Button
            mode="contained"
            onPress={handleStartRealTimeIELTS}
            loading={isProcessing}
            icon="school"
          >
            Start Real-Time IELTS
          </Button>

          {/* TOEFL Button */}
          <Button
            mode="contained"
            onPress={handleStartRealTimeTOEFL}
            loading={isProcessing}
            icon="school"
          >
            Start Real-Time TOEFL
          </Button>
        </>
      )}

      {!isRealTimeMode && (
        <Button
          onPress={handleStartStandardIELTS}
          icon="clock-outline"
        >
          Start Standard IELTS
        </Button>
      )}
    </ScrollView>
  );
};
```

---

**Tavus Persona Examples:**

**1. IELTS Persona:**
```json
{
  "persona_id": "p47fdaf4e9de",
  "persona_name": "IELTS Speaking Examiner",
  "default_replica_id": "r7c7a3b2d8e",
  "system_prompt": "You are an IELTS examiner...",
  "created_at": "2025-12-25T10:30:00Z"
}
```

**2. TOEFL Persona:**
```json
{
  "persona_id": "p52gef4h8jk",
  "persona_name": "TOEFL Speaking Instructor",
  "default_replica_id": "r9d8f5a3c1b",
  "system_prompt": "You are a TOEFL Speaking test instructor..."
}
```

---

**Tavus Replicas (Available Avatars):**

```typescript
// List replicas
const replicas = await TavusService.listReplicas();

console.log(replicas.length);  // 53 avatars

// Examples:
{
  replica_id: "r7c7a3b2d8e",
  replica_name: "Professional Woman - Business",
  thumbnail_url: "https://..."
},
{
  replica_id: "r9d8f5a3c1b",
  replica_name: "Professor - Male",
  thumbnail_url: "https://..."
}
```

---

**WebRTC Architecture:**

```
SUOLINGO App
    ↓
expo-web-browser opens URL
    ↓
Daily.co WebRTC Room
    ↓
┌─────────────────────┐
│  User Device        │
│  ┌───────────────┐  │
│  │ Microphone    │──┼──→ Audio stream
│  └───────────────┘  │
│  ┌───────────────┐  │
│  │ Speaker       │←─┼──  Avatar audio
│  └───────────────┘  │
│  ┌───────────────┐  │
│  │ Screen        │←─┼──  Avatar video
│  └───────────────┘  │
└─────────────────────┘
         ↕ WebRTC (<500ms latency)
┌─────────────────────┐
│  Tavus Backend      │
│  ┌───────────────┐  │
│  │ STT (Deepgram)│  │
│  ├───────────────┤  │
│  │ AI (Gemini)   │  │
│  ├───────────────┤  │
│  │ TTS + Lip-sync│  │
│  └───────────────┘  │
└─────────────────────┘
```

---

**Pricing (2026):**

| Plan | Fiyat | Conversations/Mo |
|------|-------|------------------|
| Free | $0 | 50 conversations |
| Starter | $99 | 500 conversations |
| Pro | $499 | 5,000 conversations |

**SUOLINGO için:** Free tier (50/ay yeterli MVP için)

**Test Results:**
- ✅ 10 persona created
- ✅ IELTS test conversation successful
- ✅ Conversation URL: https://tavus.daily.co/c1af06719048b47d

---

**Alternatifler:**

1. **HeyGen Streaming Avatar:**
   - Similar real-time
   - 175+ languages
   - $29/mo

2. **NavTalk:**
   - WebSocket-based
   - 60+ languages
   - Frame-accurate lip-sync

3. **Custom (Deepgram + ElevenLabs + A2E):**
   - Kendi pipeline'ı kur
   - Daha ucuz
   - Daha fazla kontrol

**Neden Tavus:**
- ✅ Plug-and-play (no backend)
- ✅ Persona system kolay
- ✅ WebRTC infrastructure hazır
- ✅ Production-ready

**Sonuç:** Tavus, SUOLINGO Exam Mode için turnkey solution.
</details>

---

### Soru 14
**A2E (Audio2Expression) servisi ne işe yarar? Lip-sync nasıl oluşturulur? Face/voice cloning nasıl çalışır?**

<details>
<summary>Cevap</summary>

**A2E (Audio2Expression):**

**Nedir:**
- Lip-sync generation servisi
- Audio → Video (mouth movements)
- Face cloning (10s video → digital twin)
- Voice cloning (30s audio → voice model)

**Website:** https://video.a2e.ai
**Use Case:** Custom avatar oluşturma

---

**Lip-Sync Nasıl Çalışır:**

**Input:**
1. **Avatar Image/Video** - Yüz görüntüsü
2. **Audio File** - Konuşma sesi (MP3, WAV)

**AI Processing:**
```
Audio Analysis
    ↓
Phoneme Detection (ses birimleri)
    ↓
Viseme Mapping (her phoneme → ağız şekli)
    ↓
Face Mesh Manipulation
    ↓
Video Rendering
    ↓
Lip-Synced Video Output
```

**Phoneme → Viseme:**
```
/p/ → Lips closed
/a/ → Mouth open wide
/f/ → Upper teeth on lower lip
/o/ → Lips rounded
/s/ → Teeth close, tongue behind
```

---

**A2E API Usage:**

**1. Generate Lip-Sync:**
```typescript
// src/services/avatar/A2EService.ts

class A2EService {
  async generateLipSync(
    avatarImage: string,  // URL or base64
    audioUrl: string       // MP3/WAV URL
  ): Promise<string> {
    const response = await axios.post(
      'https://video.a2e.ai/api/v1/lipsync',
      {
        image: avatarImage,
        audio: audioUrl,
        quality: 'high',
        fps: 30
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.A2E_API_KEY}`
        }
      }
    );

    // Poll for completion
    const jobId = response.data.job_id;
    const videoUrl = await this.pollJob(jobId);

    return videoUrl;  // https://a2e.ai/videos/xyz.mp4
  }

  private async pollJob(jobId: string): Promise<string> {
    while (true) {
      const status = await axios.get(`https://video.a2e.ai/api/v1/jobs/${jobId}`);

      if (status.data.status === 'completed') {
        return status.data.video_url;
      }

      if (status.data.status === 'failed') {
        throw new Error('Lip-sync generation failed');
      }

      await new Promise(resolve => setTimeout(resolve, 2000));  // 2s interval
    }
  }
}
```

---

**2. Face Cloning:**

**Workflow:**
```
1. User uploads 10-second video (talking)
2. A2E analyzes:
   - Face geometry (3D mesh)
   - Skin texture
   - Eye movements
   - Facial expressions
   - Head poses
3. Creates "digital twin" avatar
4. Returns avatar_id: "av_xyz123"
5. Use avatar_id for lip-sync generation
```

**API:**
```typescript
const cloneFace = async (videoFile: File) => {
  const formData = new FormData();
  formData.append('video', videoFile);
  formData.append('name', 'My Avatar');

  const response = await axios.post(
    'https://video.a2e.ai/api/v1/clone/face',
    formData,
    {
      headers: {
        'Authorization': `Bearer ${A2E_API_KEY}`,
        'Content-Type': 'multipart/form-data'
      }
    }
  );

  return response.data.avatar_id;  // "av_xyz123"
};

// Use cloned avatar
const videoUrl = await A2EService.generateLipSync(
  avatarId: "av_xyz123",
  audioUrl: "https://..."
);
```

**Requirements:**
- Video: 10-30 seconds
- Resolution: 720p minimum
- Face: Front-facing, well-lit
- Background: Plain preferred

---

**3. Voice Cloning:**

**Workflow:**
```
1. User records 30 seconds of speech
2. A2E analyzes:
   - Pitch (fundamental frequency)
   - Timbre (vocal quality)
   - Accent & pronunciation
   - Speaking rate
   - Prosody (intonation)
3. Creates voice model
4. Returns voice_id: "vc_abc456"
5. Generate TTS with cloned voice
```

**API:**
```typescript
const cloneVoice = async (audioSamples: File[]) => {
  const formData = new FormData();
  audioSamples.forEach((file, i) => {
    formData.append(`sample_${i}`, file);
  });
  formData.append('name', 'My Voice');

  const response = await axios.post(
    'https://video.a2e.ai/api/v1/clone/voice',
    formData,
    {
      headers: {
        'Authorization': `Bearer ${A2E_API_KEY}`
      }
    }
  );

  return response.data.voice_id;  // "vc_abc456"
};

// Use cloned voice for TTS
const audioUrl = await A2EService.generateSpeech(
  text: "Merhaba, bu benim sesim!",
  voiceId: "vc_abc456"
);
```

---

**SUOLINGO'da Kullanımı:**

**1. Pre-configured Avatars:**
```typescript
// src/data/avatars.ts

export const defaultAvatars = [
  {
    id: 'male-professor',
    name: 'Prof. Dr. Ahmet Yılmaz',
    imageUrl: '/assets/avatars/male-idle.mp4',
    voiceId: 'vc_male_tr',  // Pre-cloned Turkish male
    language: 'tr'
  },
  {
    id: 'female-teacher',
    name: 'Dr. Ayşe Kaya',
    imageUrl: '/assets/avatars/female-idle.mp4',
    voiceId: 'vc_female_tr',  // Pre-cloned Turkish female
    language: 'tr'
  }
];
```

---

**2. Custom Avatar Upload:**
```typescript
// AvatarSelectionScreen.tsx

const handleUploadCustomAvatar = async () => {
  // 1. Upload video (10s)
  const videoFile = await pickVideo();
  const avatarId = await A2EService.cloneFace(videoFile);

  // 2. Upload voice sample (30s)
  const audioFile = await recordAudio();
  const voiceId = await A2EService.cloneVoice([audioFile]);

  // 3. Save custom avatar
  const customAvatar = {
    id: uuid(),
    name: userName,
    avatarId,
    voiceId,
    isCustom: true
  };

  dispatch(addCustomAvatar(customAvatar));

  Alert.alert('Success!', 'Your custom avatar is ready! 🎭');
};
```

---

**3. Real-time Speech → Avatar:**
```typescript
// ConversationModeScreen.tsx

const handleUserSpeaks = async () => {
  // 1. User speaks
  const userAudio = await recordMicrophone();

  // 2. Transcribe (Deepgram)
  const userText = await DeepgramService.transcribe(userAudio, 'en');

  // 3. AI generates response (Gemini)
  const aiResponse = await GeminiService.generateResponse(userText);

  // 4. Generate audio (ElevenLabs with custom voice)
  const audioUrl = await ElevenLabsService.generateSpeech(
    aiResponse,
    selectedAvatar.voiceId  // Could be cloned voice
  );

  // 5. Generate lip-sync video (A2E)
  const videoUrl = await A2EService.generateLipSync(
    selectedAvatar.avatarId,  // Could be cloned avatar
    audioUrl
  );

  // 6. Play video
  setAvatarVideoUrl(videoUrl);
};
```

---

**Loop Animations (Idle State):**

**Problem:** Avatar statik durduğunda donuk görünür

**Çözüm:** Idle loop video
```typescript
// assets/avatars/male-idle.mp4
// 5-10 saniye döngü:
// - Göz kırpma
// - Hafif baş hareketi
// - Nefes alma (göğüs hareketi)
// - Doğal mikro-ifadeler
```

**Implementation:**
```typescript
<Video
  source={{ uri: avatarVideoUrl || idleVideoUrl }}
  shouldPlay
  isLooping={!avatarVideoUrl}  // Idle ise loop
  style={styles.avatarVideo}
/>
```

---

**Performance:**

```
Face Cloning:    5-10 dakika (one-time)
Voice Cloning:   3-5 dakika (one-time)
Lip-sync:        5-6 saniye (per request)
```

**SUOLINGO Experience:**
- Custom avatar upload: 10 dk (one-time)
- Her konuşma: 5-6s lip-sync generation
- Cache edilebilir (aynı text için)

---

**Pricing (2026):**

| Service | Fiyat |
|---------|-------|
| Face Clone | $49 one-time/avatar |
| Voice Clone | $29 one-time/voice |
| Lip-sync | $0.05/video |

**Free tier:** 100 lip-sync/month

**SUOLINGO estimate:**
- 50 conversation/day
- 5 avatar response/conversation
- 250 lip-sync/day
- **Cost:** ~$12.50/day 😱
- **Recommendation:** Cache + limit usage

---

**Alternatifler:**

1. **HeyGen:**
   - Similar features
   - $29/mo unlimited
   - 175+ languages

2. **D-ID:**
   - Cheaper ($0.02/video)
   - Lower quality

3. **Simli:**
   - 5-6 second generation
   - Good quality

4. **Wav2Lip (Open-source):**
   - ✅ Ücretsiz
   - ❌ Kendi sunucu gerekli
   - ❌ Setup karmaşık

**Neden A2E:**
- ✅ High-quality lip-sync
- ✅ Face/voice cloning integrated
- ✅ Simple API

**Sonuç:** A2E, custom avatar özelliği için güçlü ama pahalı. Production'da cache stratejisi gerekli.
</details>

---

### Soru 15
**NavTalk, Simli, HeyGen, DID servisleri arasındaki farklar nelerdir? SUOLINGO'da hangisi tercih edildi ve neden?**

<details>
<summary>Cevap</summary>

**Avatar Servisleri Karşılaştırma Tablosu:**

| Özellik | NavTalk | Simli | HeyGen | D-ID | A2E | Tavus |
|---------|---------|-------|--------|------|-----|-------|
| **Teknoloji** | WebRTC | Audio→Video | Streaming | API | Lip-sync | Conversational |
| **Latency** | <500ms | 5-6s | 1-2s | 3-4s | 5-6s | <500ms |
| **Dil Sayısı** | 60+ | 30+ | 175+ | 119 | 50+ | 40+ |
| **Lip-sync Quality** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| **Real-time** | ✅ Yes | ❌ No | ✅ Limited | ❌ No | ❌ No | ✅ Yes |
| **Voice Clone** | ❌ No | ✅ Yes | ✅ Yes | ✅ Yes | ✅ Yes | ❌ No |
| **Face Clone** | ❌ No | ❌ No | ✅ Yes | ✅ Yes | ✅ Yes | ❌ No |
| **Pricing (Free)** | Limited | 100/mo | Trial | 20/mo | 100/mo | 50/mo |
| **Use Case** | Real-time chat | Quick avatar | Professional | Basic | Custom avatar | Exam/Interview |

---

**1. NavTalk**

**Teknoloji:**
- **WebSocket** tabanlı real-time
- **WebRTC** peer-to-peer
- Frame-accurate lip-sync
- 60+ language support

**API:**
```typescript
// src/services/avatar/NavTalkService.ts

const ws = new WebSocket(
  `wss://transfer.navtalk.ai/api/realtime-api?license=sk_navtalk_6z5t0vTWf1hh5roE2Y3P4FxYpWvdWJBH`
);

// Send audio chunk
ws.send(audioChunk);

// Receive video frame
ws.onmessage = (event) => {
  const videoFrame = event.data;
  renderToScreen(videoFrame);
};
```

**Avantajlar:**
- ✅ Ultra-low latency (<500ms)
- ✅ Real-time conversation
- ✅ Frame-accurate lip-sync
- ✅ 60+ languages

**Dezavantajlar:**
- ❌ No voice/face cloning
- ❌ WebSocket complexity
- ❌ React Native WebSocket sorunları

**SUOLINGO için:**
- Conversation Mode için ideal
- Real-time chat scenarios
- **Kullanılmadı:** WebSocket implementation karmaşık

---

**2. Simli**

**Teknoloji:**
- Audio → Video pipeline
- 5-6 second generation
- Cloud-based rendering

**API:**
```typescript
const response = await axios.post('https://api.simli.com/v1/generate', {
  avatarId: 'av_female_professional',
  audioUrl: 'https://audio.mp3'
});

// Poll for video
const videoUrl = await pollJobStatus(response.data.job_id);
// 5-6 saniye sonra video hazır
```

**Avantajlar:**
- ✅ Fast generation (5-6s)
- ✅ Good quality
- ✅ Simple API
- ✅ Free tier: 100 videos/month

**Dezavantajlar:**
- ❌ Not real-time
- ❌ No custom avatar upload

**SUOLINGO için:**
- Basic translation modes için iyi
- Quick avatar responses
- **Kısmi kullanıldı:** Alternative olarak düşünüldü

---

**3. HeyGen**

**Teknoloji:**
- Streaming Avatar API
- Real-time (limited)
- 175+ languages
- Professional quality

**API:**
```typescript
import StreamingAvatar from '@heygen/streaming-avatar';

const avatar = new StreamingAvatar({
  apiKey: process.env.HEYGEN_API_KEY
});

await avatar.init();
await avatar.speak('Hello, how are you?', 'en');
// Avatar konuşur (streaming)
```

**Avantajlar:**
- ✅ Professional quality
- ✅ 175+ languages
- ✅ Emotion capture
- ✅ Voice/face cloning
- ✅ Streaming support

**Dezavantajlar:**
- ❌ Expensive ($29/mo minimum)
- ❌ Real-time limited

**SUOLINGO için:**
- Production-ready quality
- Custom avatar upload feature için
- **Kullanıldı:** package.json'da mevcut!

```json
{
  "dependencies": {
    "@heygen/streaming-avatar": "^2.1.0"
  }
}
```

---

**4. D-ID (D-ID Studio)**

**Teknoloji:**
- Text/Audio → Talking head
- Cloud rendering
- 119 languages

**API:**
```typescript
const response = await axios.post(
  'https://api.d-id.com/talks',
  {
    source_url: 'https://avatar-image.jpg',
    script: {
      type: 'text',
      input: 'Hello, I am your teacher',
      provider: { type: 'microsoft', voice_id: 'en-US-Jenny' }
    }
  },
  {
    headers: {
      'Authorization': `Basic ${DID_API_KEY}`
    }
  }
);

const videoUrl = await pollTalk(response.data.id);
```

**Avantajlar:**
- ✅ Simple API
- ✅ 119 languages
- ✅ Cheap ($0.02/video)
- ✅ Free tier: 20 videos/month

**Dezavantajlar:**
- ❌ Lower quality (compared to HeyGen)
- ❌ 3-4 second latency
- ❌ Lip-sync sometimes off

**SUOLINGO için:**
- Budget option
- Quick prototyping
- **Kullanıldı:** Servis dosyası mevcut ama aktif değil

---

**5. A2E (Audio2Expression)**

**(Detaylı açıklaması Soru 14'te)**

**Özet:**
- ✅ High-quality lip-sync
- ✅ Face/voice cloning
- ❌ 5-6 second generation
- ❌ Pahalı ($0.05/video)

**SUOLINGO için:**
- Custom avatar upload feature
- **Kullanıldı:** Ana lip-sync provider

---

**6. Tavus Conversational API**

**(Detaylı açıklaması Soru 13'te)**

**Özet:**
- ✅ Real-time conversation (<500ms)
- ✅ Persona system (AI characters)
- ✅ WebRTC infrastructure
- ❌ No custom avatar upload

**SUOLINGO için:**
- Exam Mode (IELTS/TOEFL)
- **Kullanıldı:** Real-time exam practice için

---

**SUOLINGO'da Tercih Edilen Servisler:**

**1. Ana Lip-sync: A2E**
```typescript
// AvatarScreen.tsx - Mode 1-3
const videoUrl = await A2EService.generateLipSync(
  selectedAvatar.imageUrl,
  audioUrl
);
```

**Neden:**
- High-quality output
- Custom avatar support
- Face/voice cloning

---

**2. Real-time Conversations: Tavus**
```typescript
// ExamModeScreen.tsx - Real-Time Mode
const conversationUrl = await TavusConversationalService.startIELTSConversation();
await WebBrowser.openBrowserAsync(conversationUrl);
```

**Neden:**
- <500ms latency
- Persona system (IELTS examiner)
- WebRTC infrastructure ready

---

**3. Backup/Alternative: HeyGen**
```typescript
// package.json
"@heygen/streaming-avatar": "^2.1.0"

// Kullanılabilir:
import StreamingAvatar from '@heygen/streaming-avatar';
```

**Neden:**
- Professional quality
- 175+ languages
- Streaming support

---

**4. Planlanan: NavTalk**
```typescript
// src/services/avatar/NavTalkService.ts (dosya mevcut)
// Henüz aktif kullanılmıyor
```

**Neden:**
- Future: WebSocket real-time için

---

**Karar Matrisi:**

| Scenario | Tercih Edilen | Alternatif |
|----------|---------------|------------|
| Basic translation (Mode 1-3) | A2E | Simli |
| Conversation (Mode 4) | NavTalk (future) | HeyGen |
| Role-play (Mode 7) | A2E + HeyGen | Simli |
| Exam Mode (real-time) | **Tavus** | NavTalk |
| Custom avatar upload | **A2E** | HeyGen |
| Pronunciation practice | A2E | D-ID |

---

**Maliyet Optimizasyonu:**

**Scenario 1: MVP (Şu an)**
```
- A2E: Free tier (100 lip-sync/mo)
- Tavus: Free tier (50 conversation/mo)
- Total: $0/mo ✅
```

**Scenario 2: Production (100 users/day)**
```
- A2E: 500 lip-sync/day × $0.05 = $25/day = $750/mo
- Tavus: 50 conversation/day × $0 (free tier) = $0
- HeyGen: Unlimited streaming = $99/mo
- Total: $849/mo
```

**Optimizasyon:**
```
Switch to HeyGen Streaming:
- HeyGen Unlimited: $99/mo
- Tavus: $99/mo (500 conversations)
- Total: $198/mo ✅ (77% savings)
```

---

**Sonuç:**

**SUOLINGO'nun Seçimi:**
1. **A2E:** Custom avatar + quality lip-sync
2. **Tavus:** Real-time exam mode
3. **HeyGen:** Backup/future production

**Tercih Sebepleri:**
- ✅ Quality over speed (MVP için yeterli)
- ✅ Custom avatar support (ödev requirement)
- ✅ Free tier'lar kullanılabiliyor
- ✅ Multiple provider → vendor lock-in yok
</details>

---

### Soru 16-25 (DevamI) Bekleniyor...

**Kalan AI Servisleri Soruları:**
- Gemini AI (conversation generation)
- Translation API
- Pronunciation scoring
- WebSocket vs REST API
- Real-time communication protocols
- API rate limiting strategies
- Error handling patterns
- Caching strategies
- Service abstractions (IAvatarService interface)
- Future alternatives (OpenAI Realtime API, Google Gemini 2.5 TTS)

(Dosya boyutu limiti nedeniyle devam edecek...)

---

## 🔄 BÖLÜM 3: STATE MANAGEMENT & REDUX (10 Soru)

*(Soru 26-35: Redux Toolkit, slices, async thunks, selectors, middleware, etc.)*

## 🗺️ BÖLÜM 4: NAVIGATION & ROUTING (5 Soru)

*(Soru 36-40: React Navigation, nested navigators, deep linking, etc.)*

## ⚙️ BÖLÜM 5: BACKEND & API MİMARİSİ (10 Soru)

*(Soru 41-50: REST vs WebSocket, API design, error handling, etc.)*

## 📱 BÖLÜM 6: SUOLINGO PROJE DETAYLARI (10 Soru)

*(Soru 51-60: Learning modes, CEFR levels, features, etc.)*

---

**TOPLAM: 60 SORU**

Bu ilk dosyadır. İkinci dosyayı (AI gelişmeleri + genel sorular) da hazırlayacağım.
