import React, { useState, useRef } from 'react';
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
  Image,
  ScrollView,
  Keyboard,
  TouchableWithoutFeedback,
  TouchableOpacity,
} from 'react-native';
import {
  Text,
  TextInput,
  Button,
  IconButton,
  Menu,
  useTheme,
  Divider,
  Card,
} from 'react-native-paper';
import { Video, ResizeMode, Audio } from 'expo-av';
import * as Speech from 'expo-speech';
import { Avatar, ConversationMessage } from '@/types/Avatar';
import { AVATARS } from '@/data/avatars';
import ElevenLabsService from '@/services/voice/ElevenLabsService';
import A2EService from '@/services/avatar/A2EService';
import DeepgramService from '@/services/voice/DeepgramService';
import TranslationService from '@/services/translation/TranslationService';
import { LanguageCode } from '@/types/Translation';

export default function AvatarScreen() {
  const theme = useTheme();
  const videoRef = useRef<Video>(null);

  // Avatar seçimi
  const [selectedAvatar, setSelectedAvatar] = useState<Avatar>(AVATARS[0]);
  const [menuVisible, setMenuVisible] = useState(false);

  // Dual Text Areas (Turkish ↔ English)
  const [textInput1, setTextInput1] = useState('');
  const [textInput2, setTextInput2] = useState('');
  const [lang1, setLang1] = useState<LanguageCode>('tr');
  const [lang2, setLang2] = useState<LanguageCode>('en');
  const [isTranslating, setIsTranslating] = useState(false);

  // Konuşma
  const [messages, setMessages] = useState<ConversationMessage[]>([]);
  const [currentMessageIndex, setCurrentMessageIndex] = useState(-1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentVideoUrl, setCurrentVideoUrl] = useState<string | null>(null);

  // Ses kaydı
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [isRecording, setIsRecording] = useState(false);

  // Avatar seçim menüsü
  const openMenu = () => setMenuVisible(true);
  const closeMenu = () => setMenuVisible(false);

  const handleAvatarSelect = (avatar: Avatar) => {
    if (selectedAvatar.id === avatar.id) {
      closeMenu();
      return;
    }
    setSelectedAvatar(avatar);
    setCurrentVideoUrl(null);
    closeMenu();
  };

  // Translation Handler (Bi-directional)
  const handleTranslate = async (fromArea: 1 | 2) => {
    try {
      const sourceText = fromArea === 1 ? textInput1 : textInput2;

      if (!sourceText.trim()) {
        Alert.alert('Uyarı', 'Lütfen çevrilecek metni girin');
        return;
      }

      setIsTranslating(true);
      const sourceLang = fromArea === 1 ? lang1 : lang2;
      const targetLang = fromArea === 1 ? lang2 : lang1;

      console.log(`🌐 Translating from ${sourceLang} to ${targetLang}`);

      const translatedText = await TranslationService.translate(
        sourceText,
        sourceLang,
        targetLang
      );

      if (fromArea === 1) {
        setTextInput2(translatedText);
      } else {
        setTextInput1(translatedText);
      }

      console.log('✅ Translation complete');
    } catch (error) {
      console.error('❌ Translation Error:', error);
      Alert.alert('Hata', 'Çeviri yapılamadı. İnternet bağlantınızı kontrol edin.');
    } finally {
      setIsTranslating(false);
    }
  };

  // Swap Languages
  const handleSwapLanguages = () => {
    setLang1(lang2);
    setLang2(lang1);
    const temp = textInput1;
    setTextInput1(textInput2);
    setTextInput2(temp);
  };

  // 🆕 Speak Handler with fallback (if A2E fails, use device TTS)
  const handleSpeak = async (textArea: 1 | 2) => {
    const text = textArea === 1 ? textInput1 : textInput2;
    const lang = textArea === 1 ? lang1 : lang2;

    if (!text.trim()) {
      Alert.alert('Uyarı', 'Lütfen bir metin girin');
      return;
    }

    const newMessage: ConversationMessage = {
      id: Date.now().toString(),
      text: text.trim(),
      timestamp: new Date(),
      avatarId: selectedAvatar.id,
    };

    setMessages((prev) => [...prev, newMessage]);
    setCurrentMessageIndex((prev) => prev + 1);
    setIsProcessing(true);

    try {
      console.log(`🚀 Starting TTS for language: ${lang}`);

      // Try A2E lip-sync video generation with language-specific voice
      const videoUrl = await A2EService.createLipsync(newMessage.text, selectedAvatar, lang);

      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === newMessage.id ? { ...msg, videoUrl } : msg
        )
      );

      setCurrentVideoUrl(videoUrl);
      console.log('✅ Lip-sync video ready!');
    } catch (error) {
      console.error('❌ A2E Error:', error);

      // Fallback to device TTS (no video, just audio)
      console.log('🔄 Falling back to device TTS...');
      Alert.alert(
        'Bilgi',
        'Avatar videosu oluşturulamadı. Ses ile devam ediliyor.',
        [{ text: 'Tamam' }]
      );

      try {
        await Speech.speak(newMessage.text, {
          language: lang === 'tr' ? 'tr-TR' : 'en-US',
          pitch: selectedAvatar.gender === 'male' ? 1.0 : 1.2,
          rate: 0.9,
        });
        console.log('✅ Device TTS played successfully');
      } catch (ttsError) {
        console.error('❌ TTS Error:', ttsError);
        Alert.alert('Hata', 'Ses çalınamadı');
      }
    } finally {
      setIsProcessing(false);
    }
  };

  // 🆕 Smart Microphone with Auto Language Detection
  const handleMicrophone = async () => {
    if (isRecording) {
      try {
        console.log('🛑 Stopping recording...');
        await recording?.stopAndUnloadAsync();
        const uri = recording?.getURI();

        if (!uri) {
          Alert.alert('Hata', 'Ses kaydı alınamadı');
          setIsRecording(false);
          setRecording(null);
          return;
        }

        console.log('📁 Recording URI:', uri);
        setIsRecording(false);
        setRecording(null);

        try {
          // Transcribe audio
          const transcript = await DeepgramService.transcribeAudio(uri);
          console.log('✅ Transcription:', transcript);

          // 🆕 Auto-detect language and fill appropriate text area
          const { detectedLang } = await TranslationService.autoTranslate(transcript);

          if (detectedLang === 'tr') {
            setTextInput1(transcript);
            Alert.alert('✅ Türkçe Algılandı', 'Türkçe text alanına yazıldı');
          } else {
            setTextInput2(transcript);
            Alert.alert('✅ English Detected', 'Written to English text area');
          }
        } catch (error) {
          console.error('❌ Transcription error:', error);
          Alert.alert('Hata', 'Ses metne çevrilemedi');
        }
      } catch (error) {
        console.error('❌ Stop recording error:', error);
        Alert.alert('Hata', 'Kayıt durdurulamadı');
        setIsRecording(false);
        setRecording(null);
      }
    } else {
      try {
        console.log('🎤 Requesting permissions...');
        const permission = await Audio.requestPermissionsAsync();

        if (!permission.granted) {
          Alert.alert('İzin Gerekli', 'Mikrofon izni verilmedi');
          return;
        }

        await Audio.setAudioModeAsync({
          allowsRecordingIOS: true,
          playsInSilentModeIOS: true,
        });

        console.log('🎤 Starting recording...');
        // Use LINEAR16 PCM WAV - Deepgram's preferred format
        // This is the most reliable format for speech recognition
        const { recording: newRecording } = await Audio.Recording.createAsync({
          isMeteringEnabled: true,
          android: {
            extension: '.wav',
            outputFormat: Audio.AndroidOutputFormat.DEFAULT,
            audioEncoder: Audio.AndroidAudioEncoder.DEFAULT,
            sampleRate: 16000,
            numberOfChannels: 1,
            bitRate: 128000,
          },
          ios: {
            extension: '.wav',
            outputFormat: Audio.IOSOutputFormat.LINEARPCM,
            audioQuality: Audio.IOSAudioQuality.HIGH,
            sampleRate: 16000,
            numberOfChannels: 1,
            bitRate: 128000,
            linearPCMBitDepth: 16,
            linearPCMIsBigEndian: false,
            linearPCMIsFloat: false,
          },
          web: {
            mimeType: 'audio/webm',
            bitsPerSecond: 128000,
          },
        });

        setRecording(newRecording);
        setIsRecording(true);
        console.log('✅ Recording started');
      } catch (error) {
        console.error('❌ Start recording error:', error);
        Alert.alert('Hata', 'Kayıt başlatılamadı');
      }
    }
  };

  // Navigation
  const handleNext = () => {
    if (currentMessageIndex < messages.length - 1) {
      const nextIndex = currentMessageIndex + 1;
      setCurrentMessageIndex(nextIndex);
      const message = messages[nextIndex];
      if (message.videoUrl) {
        setCurrentVideoUrl(message.videoUrl);
      } else {
        Speech.speak(message.text, {
          language: 'tr-TR',
          pitch: 1.0,
          rate: 0.9,
        });
      }
    }
  };

  const handlePrevious = () => {
    if (currentMessageIndex > 0) {
      const prevIndex = currentMessageIndex - 1;
      setCurrentMessageIndex(prevIndex);
      const message = messages[prevIndex];
      if (message.videoUrl) {
        setCurrentVideoUrl(message.videoUrl);
      } else {
        Speech.speak(message.text, {
          language: 'tr-TR',
          pitch: 1.0,
          rate: 0.9,
        });
      }
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        {/* 🆕 MODERN COMPACT HEADER - Avatar Badge Style */}
        <View style={styles.compactHeader}>
          <View style={styles.avatarBadge}>
            {/* Avatar Thumbnail */}
            {selectedAvatar.thumbnailUrl && (
              <Image
                source={selectedAvatar.thumbnailUrl}
                style={styles.avatarThumbnail}
                resizeMode="cover"
              />
            )}

            {/* Avatar Name + Selector */}
            <Menu
              visible={menuVisible}
              onDismiss={closeMenu}
              anchor={
                <TouchableOpacity
                  onPress={openMenu}
                  style={styles.avatarNameContainer}
                >
                  <View>
                    <Text variant="labelSmall" style={styles.avatarLabel}>
                      Teacher
                    </Text>
                    <Text variant="titleSmall" style={styles.avatarName}>
                      {selectedAvatar.name}
                    </Text>
                  </View>
                  <IconButton icon="chevron-down" size={20} style={styles.dropdownIcon} />
                </TouchableOpacity>
              }
            >
              {AVATARS.map((avatar) => (
                <Menu.Item
                  key={avatar.id}
                  onPress={() => handleAvatarSelect(avatar)}
                  title={avatar.title}
                  leadingIcon={avatar.gender === 'male' ? 'face-man' : 'face-woman'}
                />
              ))}
            </Menu>
          </View>

          {/* Right side - Mode indicator */}
          <View style={styles.modeIndicator}>
            <Text variant="labelSmall" style={styles.modeText}>
              🌐 Translation Mode
            </Text>
          </View>
        </View>

        {/* 🆕 COMPACT Avatar Video Section */}
        <View style={[styles.videoSection, { backgroundColor: '#ffffff' }]}>
          <View style={styles.videoFrame}>
            <View style={styles.videoContainer}>
              {currentVideoUrl ? (
                <Video
                  key={currentVideoUrl}
                  ref={videoRef}
                  source={{ uri: currentVideoUrl }}
                  style={styles.video}
                  resizeMode={ResizeMode.COVER}
                  shouldPlay={true}
                  isLooping={false}
                  useNativeControls={false}
                  volume={1.0} // FIXED: Full volume
                  isMuted={false} // FIXED: Ensure not muted
                  onPlaybackStatusUpdate={(status) => {
                    if (status.isLoaded && status.didJustFinish) {
                      console.log('🎬 Video finished, returning to idle');
                      setCurrentVideoUrl(null);
                    }
                  }}
                  onLoad={() => {
                    console.log('🎬 Video loaded successfully');
                  }}
                  onError={(error) => {
                    console.error('❌ Video playback error:', error);
                    setCurrentVideoUrl(null);
                  }}
                />
              ) : selectedAvatar.isStaticImage ? (
                <Image
                  source={selectedAvatar.idleVideoUrl}
                  style={styles.staticImage}
                  resizeMode="cover"
                />
              ) : (
                <Video
                  key="idle-video"
                  source={
                    typeof selectedAvatar.idleVideoUrl === 'string'
                      ? { uri: selectedAvatar.idleVideoUrl }
                      : selectedAvatar.idleVideoUrl
                  }
                  style={styles.video}
                  resizeMode={ResizeMode.COVER}
                  shouldPlay
                  isLooping
                  useNativeControls={false}
                  volume={0.0} // Muted for idle loop (no sound needed)
                  isMuted={true} // Idle video is muted
                />
              )}
            </View>
          </View>

          {isProcessing && (
            <View style={styles.loadingOverlay}>
              <ActivityIndicator size="large" color="#6750A4" />
              <Text variant="bodySmall" style={styles.loadingText}>
                🎬 Avatar videosu oluşturuluyor...
              </Text>
              <Text variant="bodySmall" style={styles.loadingSubtext}>
                Bu işlem 30-60 saniye sürebilir
              </Text>
            </View>
          )}
        </View>

        {/* 🆕 IMPROVED DUAL TEXT AREAS */}
        <KeyboardAvoidingView
          style={styles.flex1}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 0}
        >
          <ScrollView
            style={styles.inputSection}
            contentContainerStyle={styles.inputContent}
            keyboardShouldPersistTaps="handled"
            nestedScrollEnabled={true}
          >
            <Text variant="titleMedium" style={styles.sectionTitle}>
              🌐 Çift Dil Çeviri Sistemi
            </Text>

            {/* Text Area 1 */}
            <Card style={styles.textCard} mode="outlined">
              <Card.Content>
                <View style={styles.cardHeader}>
                  <Text variant="labelLarge" style={styles.langLabel}>
                    {lang1 === 'tr' ? '🇹🇷 Türkçe' : '🇬🇧 English'}
                  </Text>
                </View>

                <TextInput
                  value={textInput1}
                  onChangeText={setTextInput1}
                  placeholder={lang1 === 'tr' ? 'Türkçe metin girin...' : 'Enter English text...'}
                  mode="outlined"
                  multiline
                  numberOfLines={3}
                  maxLength={500}
                  style={styles.textInput}
                  disabled={isProcessing || isTranslating}
                />

                {/* 🆕 Inline Action Buttons */}
                <View style={styles.cardActions}>
                  <Button
                    mode="contained"
                    icon="volume-high"
                    onPress={() => handleSpeak(1)}
                    disabled={!textInput1.trim() || isProcessing}
                    style={styles.actionButton}
                    compact
                  >
                    Konuştur
                  </Button>
                  <Button
                    mode="outlined"
                    icon="translate"
                    onPress={() => handleTranslate(1)}
                    loading={isTranslating}
                    disabled={!textInput1.trim() || isTranslating || isProcessing}
                    style={styles.actionButton}
                    compact
                  >
                    Çevir ⬇️
                  </Button>
                </View>
              </Card.Content>
            </Card>

            {/* 🆕 CENTERED Swap Button */}
            <View style={styles.swapButtonContainer}>
              <IconButton
                icon="swap-vertical"
                size={32}
                mode="contained"
                onPress={handleSwapLanguages}
                disabled={isTranslating || isProcessing}
                containerColor={theme.colors.primaryContainer}
                iconColor={theme.colors.primary}
              />
            </View>

            {/* Text Area 2 */}
            <Card style={styles.textCard} mode="outlined">
              <Card.Content>
                <View style={styles.cardHeader}>
                  <Text variant="labelLarge" style={styles.langLabel}>
                    {lang2 === 'tr' ? '🇹🇷 Türkçe' : '🇬🇧 English'}
                  </Text>
                </View>

                <TextInput
                  value={textInput2}
                  onChangeText={setTextInput2}
                  placeholder={lang2 === 'tr' ? 'Türkçe metin girin...' : 'Enter English text...'}
                  mode="outlined"
                  multiline
                  numberOfLines={3}
                  maxLength={500}
                  style={styles.textInput}
                  disabled={isProcessing || isTranslating}
                />

                {/* 🆕 Inline Action Buttons */}
                <View style={styles.cardActions}>
                  <Button
                    mode="contained"
                    icon="volume-high"
                    onPress={() => handleSpeak(2)}
                    disabled={!textInput2.trim() || isProcessing}
                    style={styles.actionButton}
                    compact
                  >
                    Konuştur
                  </Button>
                  <Button
                    mode="outlined"
                    icon="translate"
                    onPress={() => handleTranslate(2)}
                    loading={isTranslating}
                    disabled={!textInput2.trim() || isTranslating || isProcessing}
                    style={styles.actionButton}
                    compact
                  >
                    Çevir ⬆️
                  </Button>
                </View>
              </Card.Content>
            </Card>

            {/* 🆕 SMART Microphone at Bottom */}
            <Card style={styles.microphoneCard} mode="elevated">
              <Card.Content>
                <View style={styles.microphoneContainer}>
                  <View style={styles.microphoneInfo}>
                    <Text variant="labelLarge">🎤 Akıllı Mikrofon</Text>
                    <Text variant="bodySmall" style={styles.microphoneHint}>
                      {isRecording
                        ? '🔴 Konuşun... (Dil otomatik algılanacak)'
                        : 'Türkçe veya İngilizce konuşun, otomatik algılanır'}
                    </Text>
                  </View>
                  <IconButton
                    icon={isRecording ? 'stop-circle' : 'microphone'}
                    size={40}
                    mode="contained"
                    onPress={handleMicrophone}
                    disabled={isProcessing}
                    containerColor={isRecording ? '#FF0000' : theme.colors.primary}
                    iconColor="#fff"
                  />
                </View>
              </Card.Content>
            </Card>

            <Divider style={styles.divider} />

            {/* Navigation */}
            <View style={styles.navigationRow}>
              <Button
                mode="outlined"
                onPress={handlePrevious}
                disabled={currentMessageIndex <= 0}
                icon="arrow-left"
                style={styles.navButton}
              >
                Geri
              </Button>

              <Text variant="bodySmall" style={styles.messageCounter}>
                {messages.length > 0 ? `${currentMessageIndex + 1} / ${messages.length}` : '0 / 0'}
              </Text>

              <Button
                mode="outlined"
                onPress={handleNext}
                disabled={currentMessageIndex >= messages.length - 1}
                icon="arrow-right"
                contentStyle={{ flexDirection: 'row-reverse' }}
                style={styles.navButton}
              >
                İleri
              </Button>
            </View>

            {/* History */}
            {messages.length > 0 && (
              <View style={styles.historyInfo}>
                <Text variant="bodySmall" style={styles.historyText}>
                  📝 Toplam {messages.length} konuşma kaydedildi
                </Text>
              </View>
            )}

            <Text variant="bodySmall" style={styles.keyboardHint}>
              💡 Klavyeyi kapatmak için ekrana dokunun
            </Text>
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  flex1: {
    flex: 1,
  },
  // 🆕 Modern Compact Header Styles
  compactHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 12,
    backgroundColor: '#F5F5F5',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  avatarBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatarThumbnail: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: '#6750A4',
    backgroundColor: '#fff',
  },
  avatarNameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  avatarLabel: {
    color: '#666',
    fontSize: 11,
    marginBottom: 2,
  },
  avatarName: {
    fontWeight: '600',
    color: '#333',
    fontSize: 16,
  },
  dropdownIcon: {
    margin: 0,
  },
  modeIndicator: {
    backgroundColor: '#E8DEF8',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  modeText: {
    color: '#6750A4',
    fontWeight: '600',
    fontSize: 11,
  },
  // 🆕 Compact Video Section
  videoSection: {
    height: 280, // Reduced from 400 for more space for text areas
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  videoFrame: {
    width: '85%',
    height: '95%',
    borderRadius: 120,
    overflow: 'hidden',
    borderWidth: 4,
    borderColor: '#6750A4',
    backgroundColor: '#000',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  videoContainer: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden', // IMPORTANT: Clips content to oval shape
    borderRadius: 120, // Match parent frame
  },
  video: {
    width: '120%',  // Wider to fill oval
    height: '120%', // Taller to fill oval
    transform: [{ scale: 0.55 }], // More zoom out - show full head + hair
  },
  staticImage: {
    width: '120%',  // Wider to fill oval
    height: '120%', // Taller to fill oval
    transform: [{ scale: 0.55 }], // More zoom out - show full head + hair
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255,255,255,0.95)',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 120,
  },
  loadingText: {
    color: '#6750A4',
    marginTop: 12,
    fontWeight: '600',
  },
  loadingSubtext: {
    color: '#6750A4',
    marginTop: 4,
    opacity: 0.7,
  },
  inputSection: {
    flex: 1,
  },
  inputContent: {
    padding: 16,
    paddingBottom: 40,
  },
  sectionTitle: {
    marginBottom: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  textCard: {
    marginBottom: 8,
  },
  cardHeader: {
    marginBottom: 8,
  },
  langLabel: {
    fontWeight: '600',
  },
  textInput: {
    marginBottom: 12,
  },
  cardActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flex: 1,
  },
  swapButtonContainer: {
    alignItems: 'center',
    marginVertical: 8,
  },
  microphoneCard: {
    marginTop: 16,
    marginBottom: 8,
  },
  microphoneContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  microphoneInfo: {
    flex: 1,
    marginRight: 12,
  },
  microphoneHint: {
    opacity: 0.7,
    marginTop: 4,
  },
  divider: {
    marginVertical: 16,
  },
  navigationRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  navButton: {
    flex: 1,
  },
  messageCounter: {
    marginHorizontal: 16,
    opacity: 0.7,
  },
  historyInfo: {
    padding: 12,
    backgroundColor: 'rgba(103, 80, 164, 0.1)',
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  historyText: {
    opacity: 0.8,
  },
  keyboardHint: {
    textAlign: 'center',
    opacity: 0.5,
    marginTop: 16,
    fontStyle: 'italic',
  },
});
