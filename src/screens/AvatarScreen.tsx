import React, { useState, useRef, useEffect } from 'react';
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
import ElevenLabsService, { ElevenLabsVoice } from '@/services/voice/ElevenLabsService';
import A2EService from '@/services/avatar/A2EService';
import DeepgramService from '@/services/voice/DeepgramService';
import TranslationService from '@/services/translation/TranslationService';
import GeminiService from '@/services/ai/GeminiService';
import { LanguageCode } from '@/types/Translation';

// 🆕 Learning Modes
type LearningMode = 'translation' | 'conversation' | 'correction' | 'wordofday' | 'flashcard' | 'quiz';

// 🆕 CEFR Language Proficiency Levels
type CEFRLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';

export default function AvatarScreen() {
  const theme = useTheme();
  const videoRef = useRef<Video>(null);
  const scrollViewRef = useRef<ScrollView>(null);

  // 🆕 Helper: Convert CEFR level to difficulty
  const cefrToDifficulty = (level: CEFRLevel): 'beginner' | 'intermediate' | 'advanced' => {
    if (level === 'A1' || level === 'A2') return 'beginner';
    if (level === 'B1' || level === 'B2') return 'intermediate';
    return 'advanced'; // C1, C2
  };

  // Avatar seçimi
  const [selectedAvatar, setSelectedAvatar] = useState<Avatar>(AVATARS[0]);
  const [menuVisible, setMenuVisible] = useState(false);

  // 🆕 Voice seçimi (ElevenLabs voices)
  const [selectedVoice, setSelectedVoice] = useState<ElevenLabsVoice>(
    ElevenLabsService.getVoiceForGender(AVATARS[0].gender)
  );
  const [voiceMenuVisible, setVoiceMenuVisible] = useState(false);
  const [useElevenLabs, setUseElevenLabs] = useState(false); // 🔄 Default: A2E (Built-in) - ElevenLabs ready for future

  // 🆕 Learning Mode Selection
  const [learningMode, setLearningMode] = useState<LearningMode>('translation');
  const [modeMenuVisible, setModeMenuVisible] = useState(false);

  // 🆕 CEFR Level Selection
  const [cefrLevel, setCefrLevel] = useState<CEFRLevel>('B1'); // Default: Intermediate
  const [cefrMenuVisible, setCefrMenuVisible] = useState(false);

  // 🆕 Conversation Mode State
  const [conversationHistory, setConversationHistory] = useState<Array<{ role: string; content: string }>>([]);
  const [conversationInput, setConversationInput] = useState('');

  // 🆕 Correction Mode State
  const [correctionInput, setCorrectionInput] = useState('');
  const [correctionResult, setCorrectionResult] = useState<{
    corrected: string;
    hasError: boolean;
    explanation: string;
  } | null>(null);

  // 🆕 Word of the Day State
  const [wordOfTheDay, setWordOfTheDay] = useState<{
    word: string;
    definition: string;
    examples: string[];
    translation: string;
  } | null>(null);

  // 🆕 Flashcard Mode State
  const [flashcardSet, setFlashcardSet] = useState<Array<{ word: string; answer: string }>>([]);
  const [currentFlashcardIndex, setCurrentFlashcardIndex] = useState(0);
  const [flashcardInput, setFlashcardInput] = useState('');
  const [showFlashcardAnswer, setShowFlashcardAnswer] = useState(false);
  const [flashcardScore, setFlashcardScore] = useState({ correct: 0, total: 0 });

  // 🆕 Grammar Quiz Mode State
  const [quizQuestions, setQuizQuestions] = useState<Array<{
    question: string;
    options: string[];
    correctAnswer: number;
    explanation: string;
  }>>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showQuizExplanation, setShowQuizExplanation] = useState(false);
  const [quizScore, setQuizScore] = useState({ correct: 0, total: 0 });

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
    // 🆕 Auto-select voice for avatar gender
    setSelectedVoice(ElevenLabsService.getVoiceForGender(avatar.gender));
    closeMenu();
  };

  // 🆕 Voice seçim menüsü
  const openVoiceMenu = () => setVoiceMenuVisible(true);
  const closeVoiceMenu = () => setVoiceMenuVisible(false);

  const handleVoiceSelect = (voice: ElevenLabsVoice) => {
    setSelectedVoice(voice);
    closeVoiceMenu();
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

  // 🆕 Speak Handler with ElevenLabs + A2E integration
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
      console.log(`🎤 Using voice: ${selectedVoice.displayName}`);
      console.log(`🎬 Use ElevenLabs: ${useElevenLabs}`);

      let videoUrl: string;

      if (useElevenLabs) {
        // 🆕 ElevenLabs + A2E Pipeline
        console.log('🎤 Step 1: Generating ElevenLabs TTS audio...');

        // Generate audio with ElevenLabs and upload to temporary storage
        const audioUrl = await ElevenLabsService.textToSpeech(
          newMessage.text,
          selectedVoice.voice_id,
          true // Upload to storage for A2E
        );

        console.log('✅ ElevenLabs audio ready:', audioUrl);
        console.log('🎬 Step 2: Creating A2E lip-sync video...');

        // Create lip-sync video with ElevenLabs audio
        videoUrl = await A2EService.createLipsyncWithExternalAudio(audioUrl, selectedAvatar);

        console.log('✅ ElevenLabs + A2E lip-sync video ready!');
      } else {
        // Use A2E built-in TTS (fallback)
        console.log('🎬 Using A2E built-in TTS...');
        videoUrl = await A2EService.createLipsync(newMessage.text, selectedAvatar, lang);
        console.log('✅ A2E lip-sync video ready!');
      }

      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === newMessage.id ? { ...msg, videoUrl } : msg
        )
      );

      setCurrentVideoUrl(videoUrl);
    } catch (error) {
      console.error('❌ TTS Error:', error);

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

        // FIXED: Reset audio mode back to playback mode after recording
        // This ensures video playback volume is not affected by recording session
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: false,
          playsInSilentModeIOS: true,
          staysActiveInBackground: false,
        });
        console.log('✅ Audio mode reset to playback');

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

  // 🆕 MODE 4: Conversation Mode Handlers
  const handleStartConversation = async () => {
    try {
      setIsProcessing(true);
      const lang = lang2; // Conversation in target language (English default)
      const difficulty = cefrToDifficulty(cefrLevel);

      console.log(`🗣️ Starting conversation (${cefrLevel} - ${difficulty})...`);
      const starter = await GeminiService.generateConversationStarter(lang, difficulty);

      setConversationHistory([{ role: 'teacher', content: starter }]);

      // Avatar speaks the starter question
      const videoUrl = await A2EService.createLipsync(starter, selectedAvatar, lang);
      setCurrentVideoUrl(videoUrl);

      console.log('✅ Conversation started');
    } catch (error) {
      console.error('❌ Conversation start error:', error);
      Alert.alert('Hata', 'Sohbet başlatılamadı');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleConversationSend = async () => {
    if (!conversationInput.trim()) {
      Alert.alert('Uyarı', 'Lütfen bir mesaj yazın');
      return;
    }

    try {
      setIsProcessing(true);
      const userMessage = conversationInput.trim();
      const lang = lang2;

      // Add user message to history
      const newHistory = [...conversationHistory, { role: 'user', content: userMessage }];
      setConversationHistory(newHistory);
      setConversationInput('');

      const difficulty = cefrToDifficulty(cefrLevel);
      console.log(`💬 Generating AI response (${cefrLevel} - ${difficulty})...`);
      const aiResponse = await GeminiService.generateConversationResponse(
        userMessage,
        newHistory,
        lang,
        difficulty
      );

      // Add AI response to history
      setConversationHistory([...newHistory, { role: 'teacher', content: aiResponse }]);

      // Avatar speaks the response
      const videoUrl = await A2EService.createLipsync(aiResponse, selectedAvatar, lang);
      setCurrentVideoUrl(videoUrl);

      console.log('✅ Conversation response ready');
    } catch (error) {
      console.error('❌ Conversation error:', error);
      Alert.alert('Hata', 'Cevap oluşturulamadı');
    } finally {
      setIsProcessing(false);
    }
  };

  // 🆕 MODE 5: Sentence Correction Handler
  const handleCorrectSentence = async () => {
    if (!correctionInput.trim()) {
      Alert.alert('Uyarı', 'Lütfen düzeltilecek cümleyi yazın');
      return;
    }

    try {
      setIsProcessing(true);
      const targetLang = lang2; // Language being learned
      const explanationLang = lang1; // Native language for explanations

      console.log('📝 Checking sentence...');
      const result = await GeminiService.correctSentence(
        correctionInput.trim(),
        targetLang,
        explanationLang
      );

      setCorrectionResult(result);

      // Avatar speaks ONLY the corrected sentence (not explanation - too long for A2E)
      const messageToSpeak = result.hasError
        ? result.corrected
        : 'Perfect! Your sentence is correct.';

      const videoUrl = await A2EService.createLipsync(messageToSpeak, selectedAvatar, targetLang);
      setCurrentVideoUrl(videoUrl);

      console.log('✅ Sentence checked');
    } catch (error) {
      console.error('❌ Correction error:', error);
      Alert.alert('Hata', 'Cümle kontrol edilemedi');
    } finally {
      setIsProcessing(false);
    }
  };

  // 🆕 MODE 6: Word of the Day Handler
  const handleGenerateWordOfTheDay = async () => {
    try {
      setIsProcessing(true);
      const lang = lang2; // Target language
      const difficulty = cefrToDifficulty(cefrLevel);

      console.log(`📚 Generating word of the day (${cefrLevel} - ${difficulty})...`);
      const word = await GeminiService.generateWordOfTheDay(lang, difficulty);

      setWordOfTheDay(word);

      // Avatar introduces the word
      const introduction = `Today's word is: ${word.word}. ${word.definition}`;
      const videoUrl = await A2EService.createLipsync(introduction, selectedAvatar, lang);
      setCurrentVideoUrl(videoUrl);

      console.log('✅ Word of the day ready');
    } catch (error) {
      console.error('❌ Word of the day error:', error);
      Alert.alert('Hata', 'Kelime oluşturulamadı');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSpeakExample = async (example: string) => {
    try {
      setIsProcessing(true);
      const lang = lang2;
      const videoUrl = await A2EService.createLipsync(example, selectedAvatar, lang);
      setCurrentVideoUrl(videoUrl);
    } catch (error) {
      console.error('❌ Example speak error:', error);
      Alert.alert('Hata', 'Örnek konuşturulamadı');
    } finally {
      setIsProcessing(false);
    }
  };

  // 🆕 MODE 10: Flashcard Mode Handlers
  const handleStartFlashcard = async () => {
    try {
      setIsProcessing(true);
      const direction = lang2 === 'en' ? 'en-to-tr' : 'tr-to-en'; // Learn target language
      const difficulty = cefrToDifficulty(cefrLevel);

      console.log(`🃏 Generating flashcard set (${cefrLevel} - ${difficulty})...`);
      const flashcards = await GeminiService.generateFlashcardSet(direction, difficulty, 5);

      setFlashcardSet(flashcards);
      setCurrentFlashcardIndex(0);
      setFlashcardInput('');
      setShowFlashcardAnswer(false);
      setFlashcardScore({ correct: 0, total: 0 });

      // Avatar introduces flashcards
      const intro = lang2 === 'en'
        ? "Let's practice vocabulary! I'll show you words and you translate them."
        : "Kelime pratiği yapalım! Size kelimeler göstereceğim ve çevireceksiniz.";
      const videoUrl = await A2EService.createLipsync(intro, selectedAvatar, lang2);
      setCurrentVideoUrl(videoUrl);

      console.log('✅ Flashcard set ready');
    } catch (error) {
      console.error('❌ Flashcard error:', error);
      Alert.alert('Hata', 'Flashcard oluşturulamadı');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCheckFlashcard = () => {
    const currentCard = flashcardSet[currentFlashcardIndex];
    const userAnswer = flashcardInput.trim().toLowerCase();
    const correctAnswer = currentCard.answer.toLowerCase();

    const isCorrect = userAnswer === correctAnswer ||
                      correctAnswer.includes(userAnswer) ||
                      userAnswer.includes(correctAnswer);

    setShowFlashcardAnswer(true);

    if (isCorrect) {
      setFlashcardScore(prev => ({ correct: prev.correct + 1, total: prev.total + 1 }));
      Alert.alert('✅ Correct!', `Yes! ${currentCard.answer}`, [{ text: 'Next', onPress: handleNextFlashcard }]);
    } else {
      setFlashcardScore(prev => ({ correct: prev.correct, total: prev.total + 1 }));
      Alert.alert('❌ Not quite', `The correct answer is: ${currentCard.answer}`, [{ text: 'Next', onPress: handleNextFlashcard }]);
    }
  };

  const handleNextFlashcard = async () => {
    if (currentFlashcardIndex < flashcardSet.length - 1) {
      setCurrentFlashcardIndex(currentFlashcardIndex + 1);
      setFlashcardInput('');
      setShowFlashcardAnswer(false);
    } else {
      // Flashcard completed
      const percentage = Math.round((flashcardScore.correct / flashcardScore.total) * 100);
      const score = `${flashcardScore.correct} out of ${flashcardScore.total}`;

      // Short message for A2E (long messages can cause errors)
      const message = percentage >= 80
        ? `Excellent! You got ${score}!`
        : `Good try! You got ${score}.`;

      try {
        setIsProcessing(true);
        // Use 'en' directly (message is always in English)
        const videoUrl = await A2EService.createLipsync(message, selectedAvatar, 'en');
        setCurrentVideoUrl(videoUrl);
      } catch (error) {
        console.error('❌ Score speak error:', error);
        // Continue with Alert even if video fails
      } finally {
        setIsProcessing(false);
      }

      // Show detailed message in Alert
      const detailedMessage = percentage >= 80
        ? `Excellent! You got ${score}!`
        : `Good try! You got ${score}. Keep practicing!`;

      Alert.alert('Flashcard Complete!', detailedMessage, [
        { text: 'Try Again', onPress: handleStartFlashcard },
        { text: 'Done', onPress: () => setFlashcardSet([]) }
      ]);
    }
  };

  // 🆕 Speak Flashcard Word (Using device TTS - no token cost)
  const handleSpeakFlashcardWord = async (word: string) => {
    try {
      // Use device TTS for free pronunciation
      await Speech.speak(word, {
        language: lang2 === 'en' ? 'en-US' : 'tr-TR',
        pitch: 1.0,
        rate: 0.85, // Slightly slower for learning
      });
      console.log('🔊 Speaking word:', word);
    } catch (error) {
      console.error('❌ TTS Error:', error);
      Alert.alert('Hata', 'Kelime seslendirilemiyor');
    }
  };

  // 🆕 MODE 12: Grammar Quiz Mode Handlers
  const handleStartQuiz = async (topic: string) => {
    try {
      setIsProcessing(true);

      const difficulty = cefrToDifficulty(cefrLevel);
      console.log(`📝 Generating grammar quiz (${cefrLevel} - ${difficulty})...`);
      const questions = await GeminiService.generateGrammarQuiz(topic, difficulty, 5);

      setQuizQuestions(questions);
      setCurrentQuestionIndex(0);
      setSelectedAnswer(null);
      setShowQuizExplanation(false);
      setQuizScore({ correct: 0, total: 0 });

      // Avatar introduces quiz
      const intro = lang2 === 'en'
        ? `Let's test your ${topic} knowledge! Choose the correct answer.`
        : `${topic} bilginizi test edelim! Doğru cevabı seçin.`;
      const videoUrl = await A2EService.createLipsync(intro, selectedAvatar, lang2);
      setCurrentVideoUrl(videoUrl);

      console.log('✅ Grammar quiz ready');
    } catch (error) {
      console.error('❌ Quiz error:', error);
      Alert.alert('Hata', 'Quiz oluşturulamadı');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSelectAnswer = (answerIndex: number) => {
    if (showQuizExplanation) return; // Already answered

    setSelectedAnswer(answerIndex);
    setShowQuizExplanation(true);

    const currentQuestion = quizQuestions[currentQuestionIndex];
    const isCorrect = answerIndex === currentQuestion.correctAnswer;

    if (isCorrect) {
      setQuizScore(prev => ({ correct: prev.correct + 1, total: prev.total + 1 }));
    } else {
      setQuizScore(prev => ({ correct: prev.correct, total: prev.total + 1 }));
    }

    // Scroll to bottom to show "Next Question" button
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 300);
  };

  const handleNextQuestion = async () => {
    if (currentQuestionIndex < quizQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedAnswer(null);
      setShowQuizExplanation(false);
    } else {
      // Quiz completed
      const percentage = Math.round((quizScore.correct / quizScore.total) * 100);
      const score = `${quizScore.correct} out of ${quizScore.total}`;

      // Short message for A2E (long messages can cause errors)
      const message = percentage >= 80
        ? `Perfect! You got ${score}!`
        : percentage >= 60
        ? `Good job! You got ${score}.`
        : `You got ${score}.`;

      try {
        setIsProcessing(true);
        // Use 'en' directly (message is always in English)
        const videoUrl = await A2EService.createLipsync(message, selectedAvatar, 'en');
        setCurrentVideoUrl(videoUrl);
      } catch (error) {
        console.error('❌ Score speak error:', error);
        // Continue with Alert even if video fails
      } finally {
        setIsProcessing(false);
      }

      // Show detailed message in Alert
      const detailedMessage = percentage >= 80
        ? `Perfect! You got ${score} correct!`
        : percentage >= 60
        ? `Good job! You got ${score}. Keep studying!`
        : `You got ${score}. Review the material and try again!`;

      Alert.alert('Quiz Complete!', detailedMessage, [
        { text: 'Done', onPress: () => setQuizQuestions([]) }
      ]);
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

          {/* 🆕 CENTER - CEFR Level + Mode Selector */}
          <View style={styles.centerBadge}>
            {/* CEFR Level Selector */}
            <View style={styles.cefrBadgeWrapper} pointerEvents="box-none">
              <Menu
                key={`cefr-${cefrLevel}-${cefrMenuVisible}`}
                visible={cefrMenuVisible}
                onDismiss={() => setCefrMenuVisible(false)}
                anchor={
                  <TouchableOpacity
                    onPress={() => setCefrMenuVisible(true)}
                    style={styles.cefrBadge}
                    activeOpacity={0.7}
                  >
                    <Text variant="labelSmall" style={styles.cefrLabel}>
                      🎚️ {cefrLevel}
                    </Text>
                  </TouchableOpacity>
                }
              >
              <Menu.Item
                onPress={() => { setCefrLevel('A1'); setCefrMenuVisible(false); }}
                title="A1 - Beginner"
                leadingIcon={cefrLevel === 'A1' ? 'check' : undefined}
              />
              <Menu.Item
                onPress={() => { setCefrLevel('A2'); setCefrMenuVisible(false); }}
                title="A2 - Elementary"
                leadingIcon={cefrLevel === 'A2' ? 'check' : undefined}
              />
              <Menu.Item
                onPress={() => { setCefrLevel('B1'); setCefrMenuVisible(false); }}
                title="B1 - Intermediate"
                leadingIcon={cefrLevel === 'B1' ? 'check' : undefined}
              />
              <Menu.Item
                onPress={() => { setCefrLevel('B2'); setCefrMenuVisible(false); }}
                title="B2 - Upper Intermediate"
                leadingIcon={cefrLevel === 'B2' ? 'check' : undefined}
              />
              <Menu.Item
                onPress={() => { setCefrLevel('C1'); setCefrMenuVisible(false); }}
                title="C1 - Advanced"
                leadingIcon={cefrLevel === 'C1' ? 'check' : undefined}
              />
              <Menu.Item
                onPress={() => { setCefrLevel('C2'); setCefrMenuVisible(false); }}
                title="C2 - Proficient"
                leadingIcon={cefrLevel === 'C2' ? 'check' : undefined}
              />
              </Menu>
            </View>

            {/* Mode Selector */}
            <View style={styles.modeBadgeWrapper} pointerEvents="box-none">
              <Menu
                key={`mode-${learningMode}-${modeMenuVisible}`}
                visible={modeMenuVisible}
                onDismiss={() => setModeMenuVisible(false)}
                anchor={
                  <TouchableOpacity
                    onPress={() => setModeMenuVisible(true)}
                    style={styles.modeBadge}
                    activeOpacity={0.7}
                  >
                    <Text variant="labelSmall" style={styles.modeLabel}>
                      {learningMode === 'translation' && '📝 Translation'}
                      {learningMode === 'conversation' && '💬 Talk'}
                      {learningMode === 'correction' && '✏️ Check'}
                      {learningMode === 'wordofday' && '📚 Word'}
                      {learningMode === 'flashcard' && '🃏 Flash'}
                      {learningMode === 'quiz' && '🎯 Quiz'}
                    </Text>
                  </TouchableOpacity>
                }
              >
              <Menu.Item
                onPress={() => { setLearningMode('translation'); setModeMenuVisible(false); }}
                title="📝 Translation Mode"
                leadingIcon={learningMode === 'translation' ? 'check' : undefined}
              />
              <Menu.Item
                onPress={() => { setLearningMode('conversation'); setModeMenuVisible(false); }}
                title="💬 Conversation Mode"
                leadingIcon={learningMode === 'conversation' ? 'check' : undefined}
              />
              <Menu.Item
                onPress={() => { setLearningMode('correction'); setModeMenuVisible(false); }}
                title="✏️ Sentence Correction"
                leadingIcon={learningMode === 'correction' ? 'check' : undefined}
              />
              <Menu.Item
                onPress={() => { setLearningMode('wordofday'); setModeMenuVisible(false); }}
                title="📚 Word of the Day"
                leadingIcon={learningMode === 'wordofday' ? 'check' : undefined}
              />
              <Menu.Item
                onPress={() => { setLearningMode('flashcard'); setModeMenuVisible(false); }}
                title="🃏 Flashcard Mode"
                leadingIcon={learningMode === 'flashcard' ? 'check' : undefined}
              />
              <Menu.Item
                onPress={() => { setLearningMode('quiz'); setModeMenuVisible(false); }}
                title="🎯 Grammar Quiz"
                leadingIcon={learningMode === 'quiz' ? 'check' : undefined}
              />
              </Menu>
            </View>
          </View>

          {/* Right side - Voice selector */}
          <View style={styles.rightBadge} pointerEvents="box-none">
            <Menu
            key={`voice-${selectedVoice.voice_id}-${voiceMenuVisible}`}
            visible={voiceMenuVisible}
            onDismiss={closeVoiceMenu}
            anchor={
              <TouchableOpacity
                onPress={openVoiceMenu}
                style={styles.voiceBadge}
                activeOpacity={0.7}
              >
                <Text variant="labelSmall" style={styles.voiceLabel}>
                  🎤 Voice
                </Text>
                <Text variant="labelSmall" style={styles.voiceNameText}>
                  {selectedVoice.name}
                </Text>
              </TouchableOpacity>
            }
          >
            <Menu.Item
              title="🔊 Voice Source"
              disabled
              titleStyle={{ fontWeight: 'bold', color: '#6750A4' }}
            />
            <Menu.Item
              onPress={() => setUseElevenLabs(true)}
              title="✨ ElevenLabs (Native)"
              leadingIcon={useElevenLabs ? 'check-circle' : 'circle-outline'}
            />
            <Menu.Item
              onPress={() => setUseElevenLabs(false)}
              title="🤖 A2E (Built-in)"
              leadingIcon={!useElevenLabs ? 'check-circle' : 'circle-outline'}
            />
            <Divider />
            <Menu.Item
              title="🎭 ElevenLabs Voices"
              disabled
              titleStyle={{ fontWeight: 'bold', color: '#6750A4' }}
            />
            {Object.values(ElevenLabsService.VOICES)
              .filter((voice) => voice.gender === selectedAvatar.gender)
              .map((voice) => (
                <Menu.Item
                  key={voice.voice_id}
                  onPress={() => handleVoiceSelect(voice)}
                  title={voice.displayName}
                  leadingIcon={selectedVoice.voice_id === voice.voice_id ? 'check' : undefined}
                />
              ))}
          </Menu>
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

        {/* 🆕 MODE-BASED CONTENT */}
        <KeyboardAvoidingView
          style={styles.flex1}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 0}
        >
          <ScrollView
            ref={scrollViewRef}
            style={styles.inputSection}
            contentContainerStyle={styles.inputContent}
            keyboardShouldPersistTaps="handled"
            nestedScrollEnabled={true}
          >
            {/* MODE 1-3: Translation Mode (Default) */}
            {learningMode === 'translation' && (
              <>
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
              </>
            )}

            {/* MODE 4: Conversation Mode */}
            {learningMode === 'conversation' && (
              <>
                <Text variant="titleMedium" style={styles.sectionTitle}>
                  💬 Conversation Mode
                </Text>

                {/* Start Conversation Button */}
                {conversationHistory.length === 0 && (
                  <Card style={styles.textCard} mode="outlined">
                    <Card.Content>
                      <Text variant="bodyMedium" style={{ marginBottom: 12, textAlign: 'center' }}>
                        Start a natural conversation with the avatar!
                      </Text>
                      <Button
                        mode="contained"
                        icon="chat"
                        onPress={handleStartConversation}
                        disabled={isProcessing}
                      >
                        Start Conversation
                      </Button>
                    </Card.Content>
                  </Card>
                )}

                {/* Conversation History */}
                {conversationHistory.length > 0 && (
                  <>
                    <Card style={styles.textCard} mode="outlined">
                      <Card.Content>
                        {conversationHistory.map((msg, index) => (
                          <View
                            key={index}
                            style={[
                              styles.chatMessage,
                              msg.role === 'user' ? styles.chatMessageUser : styles.chatMessageTeacher,
                            ]}
                          >
                            <Text variant="labelSmall" style={styles.chatMessageRole}>
                              {msg.role === 'user' ? 'You' : 'Teacher'}
                            </Text>
                            <Text variant="bodyMedium">{msg.content}</Text>
                          </View>
                        ))}
                      </Card.Content>
                    </Card>

                    {/* Input Area */}
                    <Card style={styles.textCard} mode="outlined">
                      <Card.Content>
                        <TextInput
                          value={conversationInput}
                          onChangeText={setConversationInput}
                          placeholder="Type your response..."
                          mode="outlined"
                          multiline
                          numberOfLines={2}
                          maxLength={200}
                          style={styles.textInput}
                          disabled={isProcessing}
                        />
                        <Button
                          mode="contained"
                          icon="send"
                          onPress={handleConversationSend}
                          disabled={!conversationInput.trim() || isProcessing}
                          style={{ marginTop: 8 }}
                        >
                          Send
                        </Button>
                      </Card.Content>
                    </Card>
                  </>
                )}
              </>
            )}

            {/* MODE 5: Sentence Correction */}
            {learningMode === 'correction' && (
              <>
                <Text variant="titleMedium" style={styles.sectionTitle}>
                  ✏️ Sentence Correction
                </Text>

                <Card style={styles.textCard} mode="outlined">
                  <Card.Content>
                    <Text variant="bodyMedium" style={{ marginBottom: 12 }}>
                      Write a sentence in {lang2 === 'en' ? 'English' : 'Turkish'} and get corrections!
                    </Text>
                    <TextInput
                      value={correctionInput}
                      onChangeText={setCorrectionInput}
                      placeholder="Type your sentence here..."
                      mode="outlined"
                      multiline
                      numberOfLines={3}
                      maxLength={300}
                      style={styles.textInput}
                      disabled={isProcessing}
                    />
                    <Button
                      mode="contained"
                      icon="check-circle"
                      onPress={handleCorrectSentence}
                      disabled={!correctionInput.trim() || isProcessing}
                      style={{ marginTop: 8 }}
                    >
                      Check Sentence
                    </Button>
                  </Card.Content>
                </Card>

                {/* Correction Result */}
                {correctionResult && (
                  <Card style={styles.textCard} mode="outlined">
                    <Card.Content>
                      <Text variant="labelLarge" style={{ marginBottom: 8, color: correctionResult.hasError ? '#D32F2F' : '#388E3C' }}>
                        {correctionResult.hasError ? '❌ Correction:' : '✅ Perfect!'}
                      </Text>
                      {correctionResult.hasError && (
                        <Text variant="bodyLarge" style={{ marginBottom: 12, fontWeight: 'bold' }}>
                          {correctionResult.corrected}
                        </Text>
                      )}
                      <Text variant="bodyMedium" style={{ color: '#666' }}>
                        {correctionResult.explanation}
                      </Text>
                    </Card.Content>
                  </Card>
                )}
              </>
            )}

            {/* MODE 6: Word of the Day */}
            {learningMode === 'wordofday' && (
              <>
                <Text variant="titleMedium" style={styles.sectionTitle}>
                  📚 Word of the Day
                </Text>

                {/* Generate Word Button */}
                {!wordOfTheDay && (
                  <Card style={styles.textCard} mode="outlined">
                    <Card.Content>
                      <Text variant="bodyMedium" style={{ marginBottom: 12, textAlign: 'center' }}>
                        Get a new vocabulary word to learn today!
                      </Text>
                      <Button
                        mode="contained"
                        icon="book-open-variant"
                        onPress={handleGenerateWordOfTheDay}
                        disabled={isProcessing}
                      >
                        Generate Word
                      </Button>
                    </Card.Content>
                  </Card>
                )}

                {/* Word Card */}
                {wordOfTheDay && (
                  <>
                    <Card style={styles.textCard} mode="outlined">
                      <Card.Content>
                        <Text variant="headlineMedium" style={{ marginBottom: 8, fontWeight: 'bold', color: '#6750A4' }}>
                          {wordOfTheDay.word}
                        </Text>
                        <Text variant="bodySmall" style={{ marginBottom: 12, color: '#666' }}>
                          {wordOfTheDay.translation}
                        </Text>
                        <Text variant="bodyMedium" style={{ marginBottom: 16 }}>
                          {wordOfTheDay.definition}
                        </Text>

                        <Divider style={{ marginBottom: 12 }} />

                        <Text variant="labelLarge" style={{ marginBottom: 8 }}>
                          Examples:
                        </Text>
                        {wordOfTheDay.examples.map((example, index) => (
                          <TouchableOpacity
                            key={index}
                            onPress={() => handleSpeakExample(example)}
                            style={styles.exampleItem}
                          >
                            <Text variant="bodyMedium">• {example}</Text>
                            <IconButton icon="volume-high" size={20} />
                          </TouchableOpacity>
                        ))}

                        <Button
                          mode="outlined"
                          icon="refresh"
                          onPress={handleGenerateWordOfTheDay}
                          disabled={isProcessing}
                          style={{ marginTop: 12 }}
                        >
                          Get New Word
                        </Button>
                      </Card.Content>
                    </Card>
                  </>
                )}
              </>
            )}

            {/* MODE 10: Flashcard Mode */}
            {learningMode === 'flashcard' && (
              <>
                <Text variant="titleMedium" style={styles.sectionTitle}>
                  🃏 Flashcard Mode
                </Text>

                {/* Start Flashcard Button */}
                {flashcardSet.length === 0 && (
                  <Card style={styles.textCard} mode="outlined">
                    <Card.Content>
                      <Text variant="bodyMedium" style={{ marginBottom: 12, textAlign: 'center' }}>
                        Practice vocabulary with flashcards!
                      </Text>
                      <Button
                        mode="contained"
                        icon="cards"
                        onPress={handleStartFlashcard}
                        disabled={isProcessing}
                      >
                        Start Flashcard Practice
                      </Button>
                    </Card.Content>
                  </Card>
                )}

                {/* Flashcard Set */}
                {flashcardSet.length > 0 && (
                  <>
                    {/* Progress */}
                    <Card style={styles.textCard} mode="outlined">
                      <Card.Content>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                          <Text variant="labelLarge">
                            Card {currentFlashcardIndex + 1} / {flashcardSet.length}
                          </Text>
                          <Text variant="labelLarge" style={{ color: '#6750A4' }}>
                            Score: {flashcardScore.correct} / {flashcardScore.total}
                          </Text>
                        </View>
                      </Card.Content>
                    </Card>

                    {/* Current Flashcard */}
                    <Card style={styles.textCard} mode="outlined">
                      <Card.Content>
                        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                          <Text variant="headlineMedium" style={{ fontWeight: 'bold', color: '#6750A4', marginRight: 8 }}>
                            {flashcardSet[currentFlashcardIndex].word}
                          </Text>
                          <IconButton
                            icon="volume-high"
                            size={28}
                            iconColor="#6750A4"
                            onPress={() => handleSpeakFlashcardWord(flashcardSet[currentFlashcardIndex].word)}
                            style={{ margin: 0 }}
                          />
                        </View>

                        <TextInput
                          value={flashcardInput}
                          onChangeText={setFlashcardInput}
                          placeholder="Type the translation..."
                          mode="outlined"
                          maxLength={100}
                          style={styles.textInput}
                          disabled={isProcessing || showFlashcardAnswer}
                        />

                        {!showFlashcardAnswer && (
                          <Button
                            mode="contained"
                            icon="check"
                            onPress={handleCheckFlashcard}
                            disabled={!flashcardInput.trim() || isProcessing}
                            style={{ marginTop: 8 }}
                          >
                            Check Answer
                          </Button>
                        )}

                        {showFlashcardAnswer && (
                          <View style={{ marginTop: 12 }}>
                            <Text variant="labelLarge" style={{ marginBottom: 8, color: '#2E7D32' }}>
                              ✅ Correct Answer:
                            </Text>
                            <Text variant="bodyLarge" style={{ marginBottom: 16, fontWeight: 'bold' }}>
                              {flashcardSet[currentFlashcardIndex].answer}
                            </Text>
                            <Button
                              mode="contained"
                              icon="arrow-right"
                              onPress={handleNextFlashcard}
                              disabled={isProcessing}
                            >
                              {currentFlashcardIndex < flashcardSet.length - 1 ? 'Next Card' : 'Finish'}
                            </Button>
                          </View>
                        )}
                      </Card.Content>
                    </Card>
                  </>
                )}
              </>
            )}

            {/* MODE 12: Grammar Quiz Mode */}
            {learningMode === 'quiz' && (
              <>
                <Text variant="titleMedium" style={styles.sectionTitle}>
                  🎯 Grammar Quiz
                </Text>

                {/* Start Quiz Button */}
                {quizQuestions.length === 0 && (
                  <Card style={styles.textCard} mode="outlined">
                    <Card.Content>
                      <Text variant="bodyMedium" style={{ marginBottom: 12, textAlign: 'center' }}>
                        Test your grammar knowledge!
                      </Text>
                      <Button
                        mode="contained"
                        icon="text"
                        onPress={() => handleStartQuiz('Present Tense')}
                        disabled={isProcessing}
                        style={{ marginBottom: 8 }}
                      >
                        Present Tense Quiz
                      </Button>
                      <Button
                        mode="contained"
                        icon="text"
                        onPress={() => handleStartQuiz('Past Tense')}
                        disabled={isProcessing}
                        style={{ marginBottom: 8 }}
                      >
                        Past Tense Quiz
                      </Button>
                      <Button
                        mode="contained"
                        icon="text"
                        onPress={() => handleStartQuiz('Prepositions')}
                        disabled={isProcessing}
                      >
                        Prepositions Quiz
                      </Button>
                    </Card.Content>
                  </Card>
                )}

                {/* Quiz Questions */}
                {quizQuestions.length > 0 && (
                  <>
                    {/* Progress */}
                    <Card style={styles.textCard} mode="outlined">
                      <Card.Content>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                          <Text variant="labelLarge">
                            Question {currentQuestionIndex + 1} / {quizQuestions.length}
                          </Text>
                          <Text variant="labelLarge" style={{ color: '#6750A4' }}>
                            Score: {quizScore.correct} / {quizScore.total}
                          </Text>
                        </View>
                      </Card.Content>
                    </Card>

                    {/* Current Question */}
                    <Card style={styles.textCard} mode="outlined">
                      <Card.Content>
                        <Text variant="bodyLarge" style={{ marginBottom: 16, fontWeight: 'bold' }}>
                          {quizQuestions[currentQuestionIndex].question}
                        </Text>

                        {/* Options */}
                        {quizQuestions[currentQuestionIndex].options.map((option, index) => {
                          const isCorrect = index === quizQuestions[currentQuestionIndex].correctAnswer;
                          const isSelected = selectedAnswer === index;
                          const showResult = showQuizExplanation;

                          let buttonColor = '#E0E0E0';
                          let textColor = '#333';

                          if (showResult) {
                            if (isCorrect) {
                              buttonColor = '#C8E6C9';
                              textColor = '#2E7D32';
                            } else if (isSelected && !isCorrect) {
                              buttonColor = '#FFCDD2';
                              textColor = '#C62828';
                            }
                          } else if (isSelected) {
                            buttonColor = '#E8DEF8';
                            textColor = '#6750A4';
                          }

                          return (
                            <TouchableOpacity
                              key={index}
                              onPress={() => handleSelectAnswer(index)}
                              disabled={showResult || isProcessing}
                              style={{
                                backgroundColor: buttonColor,
                                padding: 16,
                                borderRadius: 8,
                                marginBottom: 8,
                                borderWidth: 2,
                                borderColor: isSelected ? '#6750A4' : 'transparent',
                              }}
                            >
                              <Text variant="bodyMedium" style={{ color: textColor, fontWeight: isSelected ? 'bold' : 'normal' }}>
                                {String.fromCharCode(65 + index)}) {option}
                              </Text>
                            </TouchableOpacity>
                          );
                        })}

                        {/* Explanation */}
                        {showQuizExplanation && (
                          <View style={{ marginTop: 16 }}>
                            <Text variant="labelLarge" style={{ marginBottom: 8, color: selectedAnswer === quizQuestions[currentQuestionIndex].correctAnswer ? '#2E7D32' : '#C62828' }}>
                              {selectedAnswer === quizQuestions[currentQuestionIndex].correctAnswer ? '✅ Correct!' : '❌ Incorrect'}
                            </Text>
                            <Text variant="bodyMedium" style={{ marginBottom: 16, color: '#666' }}>
                              {quizQuestions[currentQuestionIndex].explanation}
                            </Text>
                            <Button
                              mode="contained"
                              icon="arrow-right"
                              onPress={handleNextQuestion}
                              disabled={isProcessing}
                            >
                              {currentQuestionIndex < quizQuestions.length - 1 ? 'Next Question' : 'Finish Quiz'}
                            </Button>
                          </View>
                        )}
                      </Card.Content>
                    </Card>
                  </>
                )}
              </>
            )}
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
    paddingHorizontal: 8,
    paddingTop: 60,
    paddingBottom: 12,
    backgroundColor: '#F5F5F5',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    gap: 4,
  },
  avatarBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  centerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 0,
    gap: 4, // Space between CEFR and Mode badges
  },
  rightBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    flex: 0,
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
  // 🆕 Voice Badge Styles
  voiceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 2,
  },
  voiceLabel: {
    color: '#2E7D32',
    fontSize: 10,
  },
  voiceNameText: {
    color: '#1B5E20',
    fontWeight: '600',
    fontSize: 11,
  },
  voiceDropdownIcon: {
    margin: 0,
    padding: 0,
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
    width: 220, // Fixed width for consistent oval shape
    height: 260, // Fixed height for portrait oval
    borderRadius: 110, // Half of width for perfect oval
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
    borderRadius: 110, // Match parent frame
  },
  video: {
    width: '140%',  // Much wider to fill oval and minimize black space
    height: '140%', // Much taller to fill oval and minimize black space
    transform: [{ scale: 0.7 }], // Balanced zoom - fills frame but shows full head
    borderRadius: 110, // CRITICAL: Makes video itself oval-shaped
  },
  staticImage: {
    width: '140%',  // Much wider to fill oval and minimize black space
    height: '140%', // Much taller to fill oval and minimize black space
    transform: [{ scale: 0.7 }], // Balanced zoom - fills frame but shows full head
    borderRadius: 110, // CRITICAL: Makes image itself oval-shaped
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
    borderRadius: 110,
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
    paddingBottom: 200, // Extra padding for Quiz "Next Question" button visibility
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
  // 🆕 CEFR Level Badge Styles
  cefrBadgeWrapper: {
    flex: 0,
  },
  cefrBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 2,
  },
  cefrLabel: {
    color: '#2E7D32',
    fontWeight: '600',
    fontSize: 11,
  },
  cefrDropdownIcon: {
    margin: 0,
    padding: 0,
  },
  // 🆕 Mode Badge Styles
  modeBadgeWrapper: {
    flex: 0,
  },
  modeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF3E0',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 2,
  },
  modeLabel: {
    color: '#E65100',
    fontWeight: '600',
    fontSize: 11,
  },
  modeDropdownIcon: {
    margin: 0,
    padding: 0,
  },
  // 🆕 Conversation Mode Styles
  chatMessage: {
    padding: 12,
    marginBottom: 8,
    borderRadius: 12,
  },
  chatMessageUser: {
    backgroundColor: '#E3F2FD',
    marginLeft: 40,
  },
  chatMessageTeacher: {
    backgroundColor: '#F3E5F5',
    marginRight: 40,
  },
  chatMessageRole: {
    fontWeight: 'bold',
    marginBottom: 4,
    color: '#666',
  },
  // 🆕 Word of Day Styles
  exampleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    marginBottom: 8,
  },
});
