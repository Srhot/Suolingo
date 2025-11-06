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

  // 🆕 Dual Text Areas (Turkish ↔ English)
  const [textInput1, setTextInput1] = useState(''); // First text area
  const [textInput2, setTextInput2] = useState(''); // Second text area
  const [lang1, setLang1] = useState<LanguageCode>('tr'); // Language of text area 1
  const [lang2, setLang2] = useState<LanguageCode>('en'); // Language of text area 2
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

  // 🆕 Translation Handler (Bi-directional)
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

  // 🆕 Swap Languages (Switch TR ↔ EN)
  const handleSwapLanguages = () => {
    setLang1(lang2);
    setLang2(lang1);
    const temp = textInput1;
    setTextInput1(textInput2);
    setTextInput2(temp);
  };

  // 🆕 Speak Handler (works for both text areas)
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

      // Create lip-sync video with A2E (using text)
      const videoUrl = await A2EService.createLipsync(newMessage.text, selectedAvatar);

      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === newMessage.id ? { ...msg, videoUrl } : msg
        )
      );

      setCurrentVideoUrl(videoUrl);
      console.log('✅ Lip-sync video ready and playing!');

    } catch (error) {
      console.error('❌ Voice/Lip-sync Error:', error);
      Alert.alert('Hata', 'Avatar videosu oluşturulamadı. TTS ile devam ediliyor.');

      try {
        await Speech.speak(newMessage.text, {
          language: lang === 'tr' ? 'tr-TR' : 'en-US',
          pitch: selectedAvatar.gender === 'male' ? 1.0 : 1.2,
          rate: 0.9,
        });
      } catch (ttsError) {
        console.error('TTS Error:', ttsError);
      }
    } finally {
      setIsProcessing(false);
    }
  };

  // Mikrofon butonu (STT) - will be enhanced in Step 2
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
          const transcript = await DeepgramService.transcribeAudio(uri);
          setTextInput1(transcript); // Default to first text area for now
          console.log('✅ Transcription:', transcript);
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
        const { recording: newRecording } = await Audio.Recording.createAsync({
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
            audioQuality: Audio.IOSAudioQuality.HIGH,
            sampleRate: 16000,
            numberOfChannels: 1,
            bitRate: 128000,
            linearPCMBitDepth: 16,
            linearPCMIsBigEndian: false,
            linearPCMIsFloat: false,
          },
          web: {
            mimeType: 'audio/wav',
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

  // İleri/Geri Navigation
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
        {/* Header - Avatar Seçimi */}
        <View style={styles.header}>
          <Menu
            visible={menuVisible}
            onDismiss={closeMenu}
            anchor={
              <Button mode="outlined" onPress={openMenu} icon="account">
                {selectedAvatar.title}
              </Button>
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

        <Divider />

        {/* Avatar Video/Image Section */}
        <View style={styles.videoSection}>
          {currentVideoUrl ? (
            <Video
              ref={videoRef}
              source={{ uri: currentVideoUrl }}
              style={styles.video}
              resizeMode={ResizeMode.CONTAIN}
              shouldPlay
              isLooping={false}
              useNativeControls={false}
              onPlaybackStatusUpdate={(status) => {
                if (status.isLoaded && status.didJustFinish) {
                  setCurrentVideoUrl(null);
                }
              }}
            />
          ) : selectedAvatar.isStaticImage ? (
            <Image
              source={selectedAvatar.idleVideoUrl}
              style={styles.staticImage}
              resizeMode="contain"
            />
          ) : (
            <Video
              source={
                typeof selectedAvatar.idleVideoUrl === 'string'
                  ? { uri: selectedAvatar.idleVideoUrl }
                  : selectedAvatar.idleVideoUrl
              }
              style={styles.video}
              resizeMode={ResizeMode.CONTAIN}
              shouldPlay
              isLooping
              useNativeControls={false}
            />
          )}

          {isProcessing && (
            <View style={styles.loadingOverlay}>
              <ActivityIndicator size="large" color="#fff" />
              <Text variant="bodySmall" style={styles.loadingText}>
                Avatar videosu oluşturuluyor... (~15 saniye)
              </Text>
            </View>
          )}
        </View>

        <Divider />

        {/* 🆕 DUAL TEXT AREAS + TRANSLATION */}
        <KeyboardAvoidingView
          style={styles.flex1}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 0}
        >
          <ScrollView
            style={styles.inputSection}
            contentContainerStyle={styles.inputContent}
            keyboardShouldPersistTaps="handled"
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
                  <IconButton
                    icon="swap-horizontal"
                    size={20}
                    onPress={handleSwapLanguages}
                    disabled={isTranslating || isProcessing}
                  />
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

                <View style={styles.cardActions}>
                  <Button
                    mode="contained"
                    icon="volume-high"
                    onPress={() => handleSpeak(1)}
                    disabled={!textInput1.trim() || isProcessing}
                    style={styles.actionButton}
                  >
                    Konuştur
                  </Button>
                  <IconButton
                    icon={isRecording ? 'stop' : 'microphone'}
                    mode="contained-tonal"
                    size={24}
                    onPress={handleMicrophone}
                    disabled={isProcessing}
                    containerColor={isRecording ? '#FF0000' : theme.colors.secondaryContainer}
                  />
                </View>
              </Card.Content>
            </Card>

            {/* Translation Button */}
            <View style={styles.translationButtonContainer}>
              <Button
                mode="elevated"
                icon="translate"
                onPress={() => handleTranslate(1)}
                loading={isTranslating}
                disabled={!textInput1.trim() || isTranslating || isProcessing}
                style={styles.translateButton}
                contentStyle={styles.translateButtonContent}
              >
                {isTranslating ? 'Çevriliyor...' : 'Çevir ⬇️'}
              </Button>

              <Text variant="bodySmall" style={styles.translationHint}>
                veya
              </Text>

              <Button
                mode="elevated"
                icon="translate"
                onPress={() => handleTranslate(2)}
                loading={isTranslating}
                disabled={!textInput2.trim() || isTranslating || isProcessing}
                style={styles.translateButton}
                contentStyle={styles.translateButtonContent}
              >
                {isTranslating ? 'Çevriliyor...' : 'Çevir ⬆️'}
              </Button>
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

                <View style={styles.cardActions}>
                  <Button
                    mode="contained"
                    icon="volume-high"
                    onPress={() => handleSpeak(2)}
                    disabled={!textInput2.trim() || isProcessing}
                    style={styles.actionButton}
                  >
                    Konuştur
                  </Button>
                </View>
              </Card.Content>
            </Card>

            <Divider style={styles.divider} />

            {/* İleri/Geri Butonları */}
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

            {/* Mesaj Geçmişi */}
            {messages.length > 0 && (
              <View style={styles.historyInfo}>
                <Text variant="bodySmall" style={styles.historyText}>
                  📝 Toplam {messages.length} konuşma kaydedildi
                </Text>
              </View>
            )}

            {/* Klavye İpucu */}
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
  header: {
    padding: 16,
    paddingTop: 60,
    alignItems: 'center',
  },
  videoSection: {
    height: 280,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  video: {
    width: '100%',
    height: '100%',
  },
  staticImage: {
    width: '100%',
    height: '100%',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#fff',
    marginTop: 8,
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
    marginBottom: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
    alignItems: 'center',
  },
  actionButton: {
    flex: 1,
  },
  translationButtonContainer: {
    alignItems: 'center',
    marginVertical: 12,
  },
  translateButton: {
    marginVertical: 4,
    minWidth: 200,
  },
  translateButtonContent: {
    paddingVertical: 4,
  },
  translationHint: {
    opacity: 0.6,
    marginVertical: 4,
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
