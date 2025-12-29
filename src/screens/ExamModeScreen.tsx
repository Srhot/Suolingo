import React, { useState, useRef } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
  TouchableOpacity,
} from 'react-native';
import {
  Text,
  Button,
  Card,
  useTheme,
  IconButton,
  Divider,
  ProgressBar,
  Switch,
} from 'react-native-paper';
import { Video, ResizeMode, Audio } from 'expo-av';
import * as WebBrowser from 'expo-web-browser';
import { Avatar } from '@/types/Avatar';
import { AVATARS } from '@/data/avatars';
import A2EService from '@/services/avatar/A2EService';
import NavTalkService from '@/services/avatar/NavTalkService';
import SimliService from '@/services/avatar/SimliService';
import TavusConversationalService from '@/services/avatar/TavusConversationalService';
import GeminiService from '@/services/ai/GeminiService';
import DeepgramService from '@/services/voice/DeepgramService';
// import ProgressTrackingService from '@/services/progress/ProgressTrackingService'; // TODO: Create this service

// IELTS Speaking Parts
type IELTSSpeakingPart = 1 | 2 | 3;

interface IELTSQuestion {
  question: string;
  part: IELTSSpeakingPart;
}

interface IELTSPart2Topic {
  topic: string;
  prompts: string[];
}

export default function ExamModeScreen() {
  const theme = useTheme();
  const videoRef = useRef<Video>(null);
  const scrollViewRef = useRef<ScrollView>(null);

  // Avatar
  const [selectedAvatar] = useState<Avatar>(AVATARS[0]);
  const [currentVideoUrl, setCurrentVideoUrl] = useState<string | null>(null);

  // IELTS Speaking State
  const [examMode, setExamMode] = useState<'ielts' | 'toefl' | null>(null);
  const [isStarted, setIsStarted] = useState(false);
  const [currentPart, setCurrentPart] = useState<IELTSSpeakingPart>(1);
  const [questions, setQuestions] = useState<IELTSQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [part2Topic, setPart2Topic] = useState<IELTSPart2Topic | null>(null);
  const [userAnswers, setUserAnswers] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [bandScore, setBandScore] = useState<number | null>(null);
  const [useNavTalk, setUseNavTalk] = useState(true); // Hybrid mode toggle - try NavTalk first

  // Real-time Mode (Tavus)
  const [useRealTime, setUseRealTime] = useState(false); // Real-time conversation toggle

  // Recording state
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordedAnswers, setRecordedAnswers] = useState<string[]>([]); // Audio URIs

  // Start microphone recording
  const handleStartRecording = async () => {
    try {
      const { status } = await Audio.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Microphone permission is required to record your answers.');
        return;
      }

      if (recording) {
        await recording.stopAndUnloadAsync();
        setRecording(null);
        setIsRecording(false);
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      console.log('🎤 Starting recording...');
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
      Alert.alert('Error', 'Failed to start recording');
    }
  };

  // Stop microphone recording
  const handleStopRecording = async () => {
    if (!recording) return;

    try {
      console.log('⏹️ Stopping recording...');
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      console.log('📁 Recording URI:', uri);

      if (uri) {
        // Save audio URI
        setRecordedAnswers([...recordedAnswers, uri]);

        // Transcribe audio using Deepgram
        try {
          Alert.alert('Processing...', 'Transcribing your answer...');
          console.log('🎤 Starting transcription...');
          const transcript = await DeepgramService.transcribeAudio(uri);
          console.log('✅ Transcription:', transcript);

          // Save transcript as user answer
          setUserAnswers([...userAnswers, transcript]);
          Alert.alert('Success!', `Your answer has been recorded and transcribed:\n\n"${transcript.substring(0, 100)}${transcript.length > 100 ? '...' : ''}"`);
        } catch (transcriptionError) {
          console.error('❌ Transcription error:', transcriptionError);
          // Fallback: Save URI as placeholder if transcription fails
          setUserAnswers([...userAnswers, `[Audio recorded but transcription failed]`]);
          Alert.alert('Partial Success', 'Your answer was recorded but could not be transcribed. It will still be scored.');
        }
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true,
      });

      setIsRecording(false);
      setRecording(null);
      console.log('✅ Recording stopped');
    } catch (error) {
      console.error('❌ Stop recording error:', error);
      Alert.alert('Error', 'Failed to stop recording');
    }
  };

  /**
   * Hybrid Avatar Service - Try Simli first (fast), fallback to A2E
   * Simli: ~5-6 seconds (3-5x faster than A2E)
   * A2E: ~10-30 seconds (reliable fallback)
   */
  const createAvatarResponse = async (text: string, avatar: Avatar, language: string): Promise<string> => {
    if (useNavTalk) {
      // Try Simli for fast video generation
      try {
        console.log('🎭 Attempting Simli (fast audio-to-video)...');
        const response = await SimliService.createResponse(text, avatar, language);
        console.log('✅ Simli success!');
        return response;
      } catch (simliError) {
        console.warn('⚠️ Simli unavailable, falling back to A2E:', simliError);
        // Fall through to A2E
      }
    }

    // Fallback to A2E
    console.log('🎬 Using A2E (lip-sync video)...');
    return await A2EService.createLipsync(text, avatar, language);
  };

  /**
   * Start Real-Time IELTS Conversation (Tavus)
   * Opens in-app browser with live conversation
   */
  const handleStartRealTimeIELTS = async () => {
    try {
      setIsProcessing(true);
      console.log('⚡ Starting Real-Time IELTS with Tavus...');

      // Create Tavus conversation URL
      const conversationUrl = await TavusConversationalService.startIELTSConversation();

      // Open in-app browser
      await WebBrowser.openBrowserAsync(conversationUrl, {
        // iOS
        preferredBarTintColor: '#3b82f6',
        preferredControlTintColor: '#ffffff',
        // Android
        toolbarColor: '#3b82f6',
        enableBarCollapsing: true,
      });

      Alert.alert(
        'Real-Time Conversation Completed! 🎉',
        'You have finished your IELTS Speaking practice. Return to continue with other features.'
      );

      console.log('✅ Real-time IELTS conversation completed');
    } catch (error) {
      console.error('❌ Real-time IELTS error:', error);
      Alert.alert(
        'Error',
        'Could not start real-time conversation. Please try again or use Standard Mode.'
      );
    } finally {
      setIsProcessing(false);
    }
  };

  /**
   * Start Real-Time TOEFL Conversation (Tavus)
   * Opens in-app browser with live conversation
   */
  const handleStartRealTimeTOEFL = async () => {
    try {
      setIsProcessing(true);
      console.log('⚡ Starting Real-Time TOEFL with Tavus...');

      // Create Tavus conversation URL
      const conversationUrl = await TavusConversationalService.startTOEFLConversation();

      // Open in-app browser
      await WebBrowser.openBrowserAsync(conversationUrl, {
        // iOS
        preferredBarTintColor: '#3b82f6',
        preferredControlTintColor: '#ffffff',
        // Android
        toolbarColor: '#3b82f6',
        enableBarCollapsing: true,
      });

      Alert.alert(
        'Real-Time Conversation Completed! 🎉',
        'You have finished your TOEFL Speaking practice. Return to continue with other features.'
      );

      console.log('✅ Real-time TOEFL conversation completed');
    } catch (error) {
      console.error('❌ Real-time TOEFL error:', error);
      Alert.alert(
        'Error',
        'Could not start real-time conversation. Please try again or use Standard Mode.'
      );
    } finally {
      setIsProcessing(false);
    }
  };

  // Start IELTS Speaking (Standard Mode - Coming Soon)
  const handleStartIELTS = async () => {
    Alert.alert(
      'Coming Soon! 🚧',
      'Standard mode is under development.\n\nPlease use "Real-Time Mode" for now!\n\nToggle "Real-Time Mode" ON and try "Start Real-Time IELTS".',
      [{ text: 'OK' }]
    );
  };

  // Ask next question
  const handleAskQuestion = async () => {
    if (currentQuestionIndex >= questions.length) {
      // Move to next part/task
      if (examMode === 'ielts') {
        if (currentPart === 1) {
          await handleStartPart2();
        } else if (currentPart === 2) {
          await handleStartPart3();
        } else {
          await handleFinishExam();
        }
      } else if (examMode === 'toefl') {
        // TOEFL task progression
        if (currentPart === 1) {
          await handleStartTOEFLTask2();
        } else if (currentPart === 2) {
          await handleStartTOEFLTask3();
        } else if (currentPart === 3) {
          await handleStartTOEFLTask4();
        } else {
          await handleFinishExam();
        }
      }
      return;
    }

    try {
      setIsProcessing(true);
      const question = questions[currentQuestionIndex];
      const videoUrl = await createAvatarResponse(question.question, selectedAvatar, 'en');
      setCurrentVideoUrl(videoUrl);
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } catch (error) {
      console.error('❌ Question ask error:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  // Start Part 2 (Long Turn)
  const handleStartPart2 = async () => {
    try {
      setIsProcessing(true);
      setCurrentPart(2);
      console.log('🎓 Starting IELTS Part 2...');

      const topic = await GeminiService.generateIELTSPart2Topic();
      setPart2Topic(topic);

      const intro = `Now we'll move to Part 2. I'm going to give you a topic and I'd like you to talk about it for 1 to 2 minutes. You have one minute to think about what you're going to say. Here's your topic: ${topic.topic}. Remember, you should say: ${topic.prompts.join(', ')}. You can make notes if you wish.`;
      const videoUrl = await createAvatarResponse(intro, selectedAvatar, 'en');
      setCurrentVideoUrl(videoUrl);

      console.log('✅ IELTS Part 2 started');
    } catch (error) {
      console.error('❌ Part 2 error:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  // Start Part 3 (Discussion)
  const handleStartPart3 = async () => {
    try {
      setIsProcessing(true);
      setCurrentPart(3);
      console.log('🎓 Starting IELTS Part 3...');

      const part3Questions = await GeminiService.generateIELTSPart3Questions(part2Topic?.topic || 'general topics');
      setQuestions(part3Questions);
      setCurrentQuestionIndex(0);

      const intro = "Thank you. Now let's discuss some more abstract questions related to the topic.";
      const videoUrl = await createAvatarResponse(intro, selectedAvatar, 'en');
      setCurrentVideoUrl(videoUrl);

      console.log('✅ IELTS Part 3 started');
    } catch (error) {
      console.error('❌ Part 3 error:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  // Finish exam
  const handleFinishExam = async () => {
    try {
      setIsProcessing(true);

      if (examMode === 'ielts') {
        console.log('🎓 Finishing IELTS Speaking test...');

        // Calculate band score using AI
        console.log('🤖 Calculating IELTS band score with AI...');
        const testContext = questions.map((q, i) => `Q${i + 1}: ${q.question}`).join('\n');
        const scoring = await GeminiService.calculateIELTSBandScore(userAnswers, testContext);

        setBandScore(scoring.overallBand);

        // Save test result to progress
        // TODO: Implement ProgressTrackingService
        // await ProgressTrackingService.trackExamTest({
        //   type: 'ielts',
        //   score: scoring.overallBand,
        //   date: new Date(),
        //   breakdown: {
        //     fluencyCoherence: scoring.fluencyCoherence,
        //     lexicalResource: scoring.lexicalResource,
        //     grammaticalAccuracy: scoring.grammaticalAccuracy,
        //   },
        // });

        const outro = `Thank you. That's the end of the speaking test. Based on your responses, your estimated band score is ${scoring.overallBand}. Well done!`;
        const videoUrl = await createAvatarResponse(outro, selectedAvatar, 'en');
        setCurrentVideoUrl(videoUrl);

        Alert.alert(
          'IELTS Speaking Complete!',
          `Estimated Band Score: ${scoring.overallBand}/9\n\n` +
          `Fluency & Coherence: ${scoring.fluencyCoherence}\n` +
          `Lexical Resource: ${scoring.lexicalResource}\n` +
          `Grammatical Accuracy: ${scoring.grammaticalAccuracy}\n\n` +
          `${scoring.feedback}\n\n` +
          `✅ Result saved to your progress history!`,
          [{ text: 'OK', onPress: () => resetExam() }]
        );

        console.log('✅ IELTS Speaking test completed');
      } else if (examMode === 'toefl') {
        console.log('📚 Finishing TOEFL Speaking test...');

        // Calculate TOEFL score using AI
        console.log('🤖 Calculating TOEFL score with AI...');
        const testContext = questions.map((q, i) => `Task ${i + 1}: ${q.question}`).join('\n');
        const scoring = await GeminiService.calculateTOEFLScore(userAnswers, testContext);

        setBandScore(scoring.overallScore);

        // Save test result to progress
        // TODO: Implement ProgressTrackingService
        // await ProgressTrackingService.trackExamTest({
        //   type: 'toefl',
        //   score: scoring.overallScore,
        //   date: new Date(),
        //   breakdown: {
        //     delivery: scoring.delivery,
        //     languageUse: scoring.languageUse,
        //     topicDevelopment: scoring.topicDevelopment,
        //   },
        // });

        const outro = `Thank you. That's the end of the TOEFL Speaking section. Based on your responses, your estimated score is ${scoring.overallScore} out of 30. Great work!`;
        const videoUrl = await createAvatarResponse(outro, selectedAvatar, 'en');
        setCurrentVideoUrl(videoUrl);

        Alert.alert(
          'TOEFL Speaking Complete!',
          `Estimated Score: ${scoring.overallScore}/30\n\n` +
          `Delivery: ${scoring.delivery}/4\n` +
          `Language Use: ${scoring.languageUse}/4\n` +
          `Topic Development: ${scoring.topicDevelopment}/4\n\n` +
          `${scoring.feedback}\n\n` +
          `✅ Result saved to your progress history!`,
          [{ text: 'OK', onPress: () => resetExam() }]
        );

        console.log('✅ TOEFL Speaking test completed');
      }
    } catch (error) {
      console.error('❌ Finish exam error:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  // Reset exam
  const resetExam = () => {
    setExamMode(null);
    setIsStarted(false);
    setCurrentPart(1);
    setQuestions([]);
    setCurrentQuestionIndex(0);
    setPart2Topic(null);
    setUserAnswers([]);
    setBandScore(null);
    setCurrentVideoUrl(null);
  };

  // Start TOEFL Speaking (Standard Mode - Coming Soon)
  const handleStartTOEFL = async () => {
    Alert.alert(
      'Coming Soon! 🚧',
      'Standard mode is under development.\n\nPlease use "Real-Time Mode" for now!\n\nToggle "Real-Time Mode" ON and try "Start Real-Time TOEFL".',
      [{ text: 'OK' }]
    );
  };

  // Start TOEFL Task 2 (Independent Task - Opinion)
  const handleStartTOEFLTask2 = async () => {
    try {
      setIsProcessing(true);
      setCurrentPart(2 as IELTSSpeakingPart); // Reusing for TOEFL tasks
      console.log('📚 Starting TOEFL Task 2...');

      // Generate Task 2 question
      const task2 = await GeminiService.generateTOEFLTask2();
      setQuestions([{ question: task2.question, part: 2 as IELTSSpeakingPart }]);
      setCurrentQuestionIndex(0);

      // Avatar introduction
      const intro = "Now let's move to Task 2. This is another independent speaking task where you'll express your opinion. You'll have 15 seconds to prepare and 45 seconds to speak.";
      const videoUrl = await createAvatarResponse(intro, selectedAvatar, 'en');
      setCurrentVideoUrl(videoUrl);

      console.log('✅ TOEFL Task 2 started');
    } catch (error) {
      console.error('❌ TOEFL Task 2 error:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  // Start TOEFL Task 3 (Integrated Task - Campus Situation)
  const handleStartTOEFLTask3 = async () => {
    try {
      setIsProcessing(true);
      setCurrentPart(3 as IELTSSpeakingPart);
      console.log('📚 Starting TOEFL Task 3...');

      // Generate Task 3 (integrated task)
      const task3 = await GeminiService.generateTOEFLIntegratedTask(3);

      const fullQuestion = `${task3.context}\n\n${task3.question}`;
      setQuestions([{ question: fullQuestion, part: 3 as IELTSSpeakingPart }]);
      setCurrentQuestionIndex(0);

      // Avatar introduction
      const intro = "Now Task 3. This is an integrated task. You'll read a short announcement and hear a conversation. Then you'll have 30 seconds to prepare and 60 seconds to speak.";
      const videoUrl = await createAvatarResponse(intro, selectedAvatar, 'en');
      setCurrentVideoUrl(videoUrl);

      console.log('✅ TOEFL Task 3 started');
    } catch (error) {
      console.error('❌ TOEFL Task 3 error:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  // Start TOEFL Task 4 (Integrated Task - Academic Lecture)
  const handleStartTOEFLTask4 = async () => {
    try {
      setIsProcessing(true);
      setCurrentPart(4 as IELTSSpeakingPart);
      console.log('📚 Starting TOEFL Task 4...');

      // Generate Task 4 (integrated academic task)
      const task4 = await GeminiService.generateTOEFLIntegratedTask(4);

      const fullQuestion = `${task4.context}\n\n${task4.question}`;
      setQuestions([{ question: fullQuestion, part: 4 as IELTSSpeakingPart }]);
      setCurrentQuestionIndex(0);

      // Avatar introduction
      const intro = "Finally, Task 4. This is an academic integrated task. You'll listen to a short lecture excerpt. Then you'll have 20 seconds to prepare and 60 seconds to speak.";
      const videoUrl = await createAvatarResponse(intro, selectedAvatar, 'en');
      setCurrentVideoUrl(videoUrl);

      console.log('✅ TOEFL Task 4 started');
    } catch (error) {
      console.error('❌ TOEFL Task 4 error:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Avatar Video (Standard Mode) */}
      {currentVideoUrl && (
        <View style={styles.avatarContainer}>
          <Video
            ref={videoRef}
            source={{ uri: currentVideoUrl }}
            style={styles.video}
            resizeMode={ResizeMode.COVER}
            shouldPlay
            isLooping={false}
            useNativeControls={false}
            onError={(error) => {
              console.error('❌ Video playback error:', error);
              Alert.alert('Video Error', `Failed to play video: ${JSON.stringify(error)}`);
            }}
            onLoad={() => {
              console.log('✅ Video loaded successfully:', currentVideoUrl);
            }}
          />
        </View>
      )}

      <ScrollView
        ref={scrollViewRef}
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Exam Selection (not started) */}
        {!isStarted && (
          <>
            <Text variant="headlineMedium" style={styles.title}>
              Exam Preparation
            </Text>
            <Text variant="bodyMedium" style={styles.subtitle}>
              Choose your exam type to start practice
            </Text>

            {/* Real-Time Mode Toggle */}
            <Card style={styles.card} mode="outlined">
              <Card.Content>
                <View style={styles.examOption}>
                  <View style={{ flex: 1 }}>
                    <Text variant="titleMedium">
                      {useRealTime ? '⚡ REAL-TIME MODE (Tavus)' : '🎬 Standard Mode'}
                    </Text>
                    <Text variant="bodySmall" style={{ marginTop: 4, color: '#666' }}>
                      {useRealTime
                        ? '<500ms latency • Like talking to real person!'
                        : '10-30 seconds per response'}
                    </Text>
                  </View>
                  <Switch
                    value={useRealTime}
                    onValueChange={setUseRealTime}
                    color="#10b981"
                  />
                </View>
              </Card.Content>
            </Card>

            {/* Avatar Service Toggle (Standard Mode Only) */}
            {!useRealTime && (
              <Card style={styles.card} mode="outlined">
                <Card.Content>
                  <View style={styles.examOption}>
                    <View style={{ flex: 1 }}>
                      <Text variant="titleMedium">
                        {useNavTalk ? '⚡ Fast Avatar (Simli)' : '🎬 Lip-Sync Video (A2E)'}
                      </Text>
                      <Text variant="bodySmall" style={{ marginTop: 4, color: '#666' }}>
                        {useNavTalk
                          ? '~5 seconds • 3-5x faster'
                          : 'Slower but reliable'}
                      </Text>
                    </View>
                    <Switch
                      value={useNavTalk}
                      onValueChange={setUseNavTalk}
                    />
                  </View>
                </Card.Content>
              </Card>
            )}

            <Card style={styles.card} mode="outlined">
              <Card.Content>
                <View style={styles.examOption}>
                  <View>
                    <Text variant="titleLarge">
                      🎓 IELTS Speaking
                      {useRealTime && ' ⚡'}
                    </Text>
                    <Text variant="bodySmall" style={{ marginTop: 4, color: '#666' }}>
                      {useRealTime
                        ? 'Real-time conversation • <500ms latency'
                        : '3 parts • 11-14 minutes • Band Score 1-9'}
                    </Text>
                  </View>
                  <Button
                    mode="contained"
                    onPress={useRealTime ? handleStartRealTimeIELTS : handleStartIELTS}
                    disabled={isProcessing}
                    buttonColor={useRealTime ? '#10b981' : undefined}
                  >
                    {useRealTime ? 'Start Real-Time' : 'Start'}
                  </Button>
                </View>
              </Card.Content>
            </Card>

            <Card style={styles.card} mode="outlined">
              <Card.Content>
                <View style={styles.examOption}>
                  <View>
                    <Text variant="titleLarge">
                      📚 TOEFL Speaking
                      {useRealTime && ' ⚡'}
                    </Text>
                    <Text variant="bodySmall" style={{ marginTop: 4, color: '#666' }}>
                      {useRealTime
                        ? 'Real-time conversation • <500ms latency'
                        : '4 tasks • 17 minutes • Score 0-30'}
                    </Text>
                  </View>
                  <Button
                    mode="contained"
                    onPress={useRealTime ? handleStartRealTimeTOEFL : handleStartTOEFL}
                    disabled={isProcessing}
                    buttonColor={useRealTime ? '#10b981' : undefined}
                  >
                    {useRealTime ? 'Start Real-Time' : 'Start'}
                  </Button>
                </View>
              </Card.Content>
            </Card>
          </>
        )}

        {/* IELTS Speaking Test */}
        {isStarted && examMode === 'ielts' && (
          <>
            {/* Progress */}
            <Card style={styles.card} mode="outlined">
              <Card.Content>
                <Text variant="titleMedium" style={{ marginBottom: 8 }}>
                  IELTS Speaking - Part {currentPart}
                </Text>
                <ProgressBar
                  progress={currentPart / 3}
                  color={theme.colors.primary}
                />
                <Text variant="bodySmall" style={{ marginTop: 4, textAlign: 'center', color: '#666' }}>
                  {currentPart === 1 && 'Introduction & Interview'}
                  {currentPart === 2 && 'Long Turn (Individual Talk)'}
                  {currentPart === 3 && 'Discussion'}
                </Text>
              </Card.Content>
            </Card>

            {/* Part 1 & 3: Questions */}
            {(currentPart === 1 || currentPart === 3) && (
              <Card style={styles.card} mode="outlined">
                <Card.Content>
                  <Text variant="bodyMedium" style={{ marginBottom: 16, textAlign: 'center' }}>
                    Listen to the examiner's questions and respond naturally.
                  </Text>
                  <Button
                    mode="contained"
                    icon="play"
                    onPress={handleAskQuestion}
                    disabled={isProcessing}
                  >
                    {currentQuestionIndex === 0 ? 'Start Questions' : 'Next Question'}
                  </Button>
                  <Text variant="bodySmall" style={{ marginTop: 8, textAlign: 'center', color: '#666' }}>
                    Question {currentQuestionIndex + 1} of {questions.length}
                  </Text>

                  {/* Microphone Button */}
                  {currentQuestionIndex > 0 && (
                    <>
                      <Divider style={{ marginVertical: 16 }} />
                      <Text variant="bodyMedium" style={{ marginBottom: 12, textAlign: 'center' }}>
                        Record your answer
                      </Text>
                      <Button
                        mode={isRecording ? 'contained-tonal' : 'contained'}
                        icon={isRecording ? 'stop' : 'microphone'}
                        onPress={isRecording ? handleStopRecording : handleStartRecording}
                        style={{ backgroundColor: isRecording ? '#ef4444' : undefined }}
                      >
                        {isRecording ? 'Stop Recording' : 'Start Recording'}
                      </Button>
                      <Text variant="bodySmall" style={{ marginTop: 8, textAlign: 'center', color: '#666' }}>
                        Answers recorded: {recordedAnswers.length}
                      </Text>
                    </>
                  )}
                </Card.Content>
              </Card>
            )}

            {/* Part 2: Topic Card */}
            {currentPart === 2 && part2Topic && (
              <Card style={styles.card} mode="outlined">
                <Card.Content>
                  <Text variant="titleMedium" style={{ marginBottom: 12 }}>
                    Topic Card
                  </Text>
                  <View style={styles.topicCard}>
                    <Text variant="bodyLarge" style={{ fontWeight: 'bold', marginBottom: 8 }}>
                      {part2Topic.topic}
                    </Text>
                    <Text variant="bodySmall" style={{ marginBottom: 4, color: '#666' }}>
                      You should say:
                    </Text>
                    {part2Topic.prompts.map((prompt, index) => (
                      <Text key={index} variant="bodyMedium" style={{ marginLeft: 8, marginBottom: 4 }}>
                        • {prompt}
                      </Text>
                    ))}
                  </View>
                  <Divider style={{ marginVertical: 16 }} />
                  <Text variant="bodySmall" style={{ textAlign: 'center', marginBottom: 12 }}>
                    Preparation time: 1 minute • Speaking time: 1-2 minutes
                  </Text>
                  {/* Microphone for Part 2 */}
                  <Text variant="bodyMedium" style={{ marginBottom: 12, textAlign: 'center' }}>
                    Record your 1-2 minute talk
                  </Text>
                  <Button
                    mode={isRecording ? 'contained-tonal' : 'contained'}
                    icon={isRecording ? 'stop' : 'microphone'}
                    onPress={isRecording ? handleStopRecording : handleStartRecording}
                    style={{ backgroundColor: isRecording ? '#ef4444' : undefined, marginBottom: 12 }}
                  >
                    {isRecording ? 'Stop Recording' : 'Start Recording'}
                  </Button>

                  <Button
                    mode="outlined"
                    icon="arrow-right"
                    onPress={() => handleStartPart3()}
                    disabled={isProcessing}
                  >
                    Continue to Part 3
                  </Button>
                </Card.Content>
              </Card>
            )}

            {/* Cancel Button */}
            <Button
              mode="text"
              onPress={() => {
                Alert.alert(
                  'Cancel Test?',
                  'Are you sure you want to cancel the test?',
                  [
                    { text: 'No', style: 'cancel' },
                    { text: 'Yes', onPress: resetExam }
                  ]
                );
              }}
              style={{ marginTop: 16 }}
            >
              Cancel Test
            </Button>
          </>
        )}

        {/* TOEFL Speaking Test */}
        {isStarted && examMode === 'toefl' && (
          <>
            {/* Progress */}
            <Card style={styles.card} mode="outlined">
              <Card.Content>
                <Text variant="titleMedium" style={{ marginBottom: 8 }}>
                  TOEFL Speaking - Task {currentPart}
                </Text>
                <ProgressBar
                  progress={currentPart / 4}
                  color={theme.colors.primary}
                />
                <Text variant="bodySmall" style={{ marginTop: 4, textAlign: 'center', color: '#666' }}>
                  {currentPart === 1 && 'Independent Task - Personal Preference'}
                  {currentPart === 2 && 'Independent Task - Opinion'}
                  {currentPart === 3 && 'Integrated Task - Campus Situation'}
                  {currentPart === 4 && 'Integrated Task - Academic Lecture'}
                </Text>
              </Card.Content>
            </Card>

            {/* Task Questions */}
            <Card style={styles.card} mode="outlined">
              <Card.Content>
                {currentQuestionIndex < questions.length && (
                  <>
                    <Text variant="bodyLarge" style={{ marginBottom: 16, fontWeight: 'bold' }}>
                      {questions[currentQuestionIndex].question}
                    </Text>
                    <Text variant="bodySmall" style={{ marginBottom: 12, color: '#666', textAlign: 'center' }}>
                      Preparation: 15 seconds • Speaking: 45 seconds
                    </Text>
                  </>
                )}
                <Button
                  mode="contained"
                  icon="play"
                  onPress={handleAskQuestion}
                  disabled={isProcessing}
                >
                  {currentQuestionIndex === 0 ? 'Listen to Question' : 'Next Task'}
                </Button>

                {/* Microphone Button for TOEFL */}
                {currentQuestionIndex > 0 && (
                  <>
                    <Divider style={{ marginVertical: 16 }} />
                    <Text variant="bodyMedium" style={{ marginBottom: 12, textAlign: 'center' }}>
                      Record your answer
                    </Text>
                    <Button
                      mode={isRecording ? 'contained-tonal' : 'contained'}
                      icon={isRecording ? 'stop' : 'microphone'}
                      onPress={isRecording ? handleStopRecording : handleStartRecording}
                      style={{ backgroundColor: isRecording ? '#ef4444' : undefined }}
                    >
                      {isRecording ? 'Stop Recording' : 'Start Recording'}
                    </Button>
                    <Text variant="bodySmall" style={{ marginTop: 8, textAlign: 'center', color: '#666' }}>
                      Answers recorded: {recordedAnswers.length}
                    </Text>
                  </>
                )}
              </Card.Content>
            </Card>

            {/* Cancel Button */}
            <Button
              mode="text"
              onPress={() => {
                Alert.alert(
                  'Cancel Test?',
                  'Are you sure you want to cancel the test?',
                  [
                    { text: 'No', style: 'cancel' },
                    { text: 'Yes', onPress: resetExam }
                  ]
                );
              }}
              style={{ marginTop: 16 }}
            >
              Cancel Test
            </Button>
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  avatarContainer: {
    width: '100%',
    height: 300,
    backgroundColor: '#000',
  },
  video: {
    width: '100%',
    height: '100%',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  title: {
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    textAlign: 'center',
    marginBottom: 24,
    color: '#666',
  },
  card: {
    marginBottom: 16,
  },
  examOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  topicCard: {
    backgroundColor: '#FFF9E6',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FFD700',
  },
});
