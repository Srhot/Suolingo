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
} from 'react-native-paper';
import { Video, ResizeMode, Audio } from 'expo-av';
import * as Speech from 'expo-speech';
import { Avatar, ConversationMessage } from '@/types/Avatar';
import { AVATARS } from '@/data/avatars';
import ElevenLabsService from '@/services/voice/ElevenLabsService';
import A2EService from '@/services/avatar/A2EService';
import DeepgramService from '@/services/voice/DeepgramService';

export default function AvatarScreen() {
  const theme = useTheme();
  const videoRef = useRef<Video>(null);

  // Avatar seçimi
  const [selectedAvatar, setSelectedAvatar] = useState<Avatar>(AVATARS[0]);
  const [menuVisible, setMenuVisible] = useState(false);

  // Konuşma
  const [textInput, setTextInput] = useState('');
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
    setSelectedAvatar(avatar);
    setCurrentVideoUrl(null); // Reset video to idle
    closeMenu();
  };

  // Konuştur butonu (TTS)
  const handleSpeak = async () => {
    if (!textInput.trim()) {
      Alert.alert('Uyarı', 'Lütfen bir metin girin');
      return;
    }

    const newMessage: ConversationMessage = {
      id: Date.now().toString(),
      text: textInput.trim(),
      timestamp: new Date(),
    };

    // Mesajı kaydet
    setMessages((prev) => [...prev, newMessage]);
    setCurrentMessageIndex((prev) => prev + 1);
    setTextInput('');
    setIsProcessing(true);

    try {
      // 🎯 YENİ SİSTEM: ElevenLabs TTS + A2E Lip-Sync
      console.log('🚀 Starting voice generation...');

      // Step 1: Get voice for avatar gender
      const voice = ElevenLabsService.getVoiceForGender(selectedAvatar.gender);
      console.log('Selected voice:', voice.name);

      // Step 2: Generate natural speech with ElevenLabs (COMMENTED OUT - causes issues)
      // const audioDataUri = await ElevenLabsService.textToSpeech(newMessage.text, voice.voice_id);

      // Step 3: Create lip-sync video with A2E (using text for now)
      const videoUrl = await A2EService.createLipsync(newMessage.text, selectedAvatar);

      // Mesajı video URL'si ile güncelle
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === newMessage.id ? { ...msg, videoUrl } : msg
        )
      );

      // Video URL'sini set et (otomatik oynatılacak)
      setCurrentVideoUrl(videoUrl);

      console.log('✅ Lip-sync video ready and playing!');

    } catch (error) {
      console.error('❌ Voice/Lip-sync Error:', error);
      Alert.alert('Hata', 'Avatar videosu oluşturulamadı. TTS ile devam ediliyor.');

      // Hata durumunda fallback: Device TTS kullan
      try {
        await Speech.speak(newMessage.text, {
          language: 'tr-TR',
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

  // Mikrofon butonu (STT)
  const handleMicrophone = async () => {
    if (isRecording) {
      // Stop recording
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
          // Transcribe with Deepgram (pass file URI directly)
          const transcript = await DeepgramService.transcribeAudio(uri);
          setTextInput(transcript);
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
      // Start recording
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

  // İleri butonu
  const handleNext = () => {
    if (currentMessageIndex < messages.length - 1) {
      const nextIndex = currentMessageIndex + 1;
      setCurrentMessageIndex(nextIndex);
      setTextInput(messages[nextIndex].text);

      // Önceki mesajı tekrar konuştur
      Speech.speak(messages[nextIndex].text, {
        language: 'tr-TR',
        pitch: 1.0,
        rate: 0.9,
      });
    }
  };

  // Geri butonu
  const handlePrevious = () => {
    if (currentMessageIndex > 0) {
      const prevIndex = currentMessageIndex - 1;
      setCurrentMessageIndex(prevIndex);
      setTextInput(messages[prevIndex].text);

      // Önceki mesajı tekrar konuştur
      Speech.speak(messages[prevIndex].text, {
        language: 'tr-TR',
        pitch: 1.0,
        rate: 0.9,
      });
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
            // D-ID lip-sync video (konuşma sırasında)
            <Video
              ref={videoRef}
              source={{ uri: currentVideoUrl }}
              style={styles.video}
              resizeMode={ResizeMode.CONTAIN}
              shouldPlay
              isLooping={false}
              useNativeControls={false}
              onPlaybackStatusUpdate={(status) => {
                // Video bitince idle loop'a dön
                if (status.isLoaded && status.didJustFinish) {
                  setCurrentVideoUrl(null);
                }
              }}
            />
          ) : selectedAvatar.isStaticImage ? (
            // Static görsel (PNG/JPG - eski, kullanılmıyor)
            <Image
              source={selectedAvatar.idleVideoUrl}
              style={styles.staticImage}
              resizeMode="contain"
            />
          ) : (
            // Idle loop video (normal durumda sürekli döner)
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

        {/* Text Input Section - ScrollView ile */}
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
              Metni Girin
            </Text>

            <TextInput
              value={textInput}
              onChangeText={setTextInput}
              placeholder="Avatar'ın söylemesini istediğiniz metni yazın..."
              mode="outlined"
              multiline
              numberOfLines={2}
              maxLength={300}
              style={styles.textInput}
              disabled={isProcessing}
              returnKeyType="done"
              blurOnSubmit={true}
            />

            {/* Konuştur + Mikrofon Butonları */}
            <View style={styles.actionRow}>
              <Button
                mode="contained"
                onPress={handleSpeak}
                disabled={!textInput.trim() || isProcessing}
                style={styles.speakButton}
                icon="volume-high"
              >
                Konuştur
              </Button>

              <IconButton
                icon={isRecording ? "stop" : "microphone"}
                mode="contained"
                size={28}
                onPress={handleMicrophone}
                disabled={isProcessing}
                containerColor={isRecording ? '#FF0000' : theme.colors.secondary}
                iconColor="#fff"
              />
            </View>

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

            {/* Mesaj Geçmişi Bilgisi */}
            {messages.length > 0 && (
              <View style={styles.historyInfo}>
                <Text variant="bodySmall" style={styles.historyText}>
                  Toplam {messages.length} konuşma kaydedildi
                </Text>
              </View>
            )}

            {/* Klavye Kapatma İpucu */}
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
    height: 300,
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
    marginBottom: 12,
    fontWeight: '600',
  },
  textInput: {
    marginBottom: 16,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  speakButton: {
    flex: 1,
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
