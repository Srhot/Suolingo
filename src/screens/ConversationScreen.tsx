import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TextInput as RNTextInput,
  ActivityIndicator,
} from 'react-native';
import { Text, useTheme, Button, TextInput } from 'react-native-paper';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { Video, ResizeMode } from 'expo-av';
import { HomeStackParamList } from '@/navigation/types';
import { MOCK_SCENARIOS } from '@/data/mockScenarios';
import { Message } from '@/types/Scenario';
import ConversationManager from '@/services/conversation/ConversationManager';

type ConversationScreenNavigationProp = StackNavigationProp<
  HomeStackParamList,
  'Conversation'
>;

type ConversationScreenRouteProp = RouteProp<HomeStackParamList, 'Conversation'>;

type Props = {
  navigation: ConversationScreenNavigationProp;
  route: ConversationScreenRouteProp;
};

export default function ConversationScreen({ navigation, route }: Props) {
  const theme = useTheme();
  const { scenarioId } = route.params;

  const scenario = MOCK_SCENARIOS.find((s) => s.id === scenarioId);
  const [messages, setMessages] = useState<Message[]>([]);
  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentVideoUrl, setCurrentVideoUrl] = useState<string | null>(null);
  const scrollViewRef = useRef<ScrollView>(null);
  const videoRef = useRef<Video>(null);

  // Initialize conversation with AI greeting
  useEffect(() => {
    if (scenario) {
      initializeConversation();
    }
  }, [scenario]);

  const initializeConversation = async () => {
    if (!scenario) return;

    setIsLoading(true);
    try {
      const greetingMessage = await ConversationManager.startConversation(
        scenario.title,
        scenario.description,
        'English' // TODO: Get from user's selected language
      );

      setMessages([greetingMessage]);

      if (greetingMessage.videoUrl) {
        setCurrentVideoUrl(greetingMessage.videoUrl);
      }
    } catch (error) {
      console.error('Initialize Conversation Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!userInput.trim() || !scenario) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: userInput.trim(),
      timestamp: new Date(),
    };

    // Add user message to chat
    setMessages((prev) => [...prev, userMessage]);
    setUserInput('');
    setIsLoading(true);

    try {
      // Get AI response with avatar video
      const aiMessage = await ConversationManager.processUserMessage(
        userMessage.content,
        scenario.title,
        scenario.description,
        messages
      );

      setMessages((prev) => [...prev, aiMessage]);

      if (aiMessage.videoUrl) {
        setCurrentVideoUrl(aiMessage.videoUrl);
        // Play video automatically
        if (videoRef.current) {
          await videoRef.current.playAsync();
        }
      }
    } catch (error) {
      console.error('Send Message Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!scenario) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <Text>Scenario not found</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        {/* Avatar Video Section */}
        <View style={styles.avatarSection}>
          {currentVideoUrl ? (
            <Video
              ref={videoRef}
              source={{ uri: currentVideoUrl }}
              style={styles.video}
              resizeMode={ResizeMode.CONTAIN}
              shouldPlay
              isLooping={false}
              useNativeControls={false}
            />
          ) : (
            <View style={[styles.avatarPlaceholder, { backgroundColor: theme.colors.surfaceVariant }]}>
              {isLoading ? (
                <>
                  <ActivityIndicator size="large" color={theme.colors.primary} />
                  <Text variant="bodySmall" style={styles.loadingText}>
                    Generating avatar response...
                  </Text>
                </>
              ) : (
                <>
                  <Text variant="headlineSmall" style={styles.avatarEmoji}>
                    👨‍🍳
                  </Text>
                  <Text variant="bodySmall" style={styles.avatarLabel}>
                    Avatar will appear here
                  </Text>
                </>
              )}
            </View>
          )}
        </View>

        {/* Messages Section */}
        <ScrollView
          ref={scrollViewRef}
          style={styles.messagesSection}
          contentContainerStyle={styles.messagesContent}
          onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
        >
          {messages.map((message) => (
            <View
              key={message.id}
              style={[
                styles.messageBubble,
                message.role === 'user' ? styles.userBubble : styles.avatarBubble,
              ]}
            >
              <Text
                variant="bodyMedium"
                style={message.role === 'user' ? styles.userText : styles.avatarTextContent}
              >
                {message.content}
              </Text>
            </View>
          ))}
          {isLoading && (
            <View style={[styles.messageBubble, styles.avatarBubble]}>
              <ActivityIndicator size="small" color={theme.colors.primary} />
              <Text variant="bodySmall" style={styles.loadingText}>
                Thinking...
              </Text>
            </View>
          )}
        </ScrollView>

        {/* Input Controls */}
        <View style={styles.inputSection}>
          <View style={styles.objectivesHint}>
            <Text variant="labelSmall" style={styles.objectivesTitle}>
              Objectives:
            </Text>
            {scenario.objectives.slice(0, 2).map((obj, index) => (
              <Text key={index} variant="bodySmall" style={styles.objectiveText}>
                • {obj}
              </Text>
            ))}
          </View>

          <View style={styles.inputRow}>
            <TextInput
              value={userInput}
              onChangeText={setUserInput}
              placeholder="Type your response..."
              mode="outlined"
              style={styles.textInput}
              multiline
              maxLength={200}
              disabled={isLoading}
              onSubmitEditing={handleSendMessage}
            />
            <Button
              mode="contained"
              onPress={handleSendMessage}
              disabled={!userInput.trim() || isLoading}
              style={styles.sendButton}
            >
              Send
            </Button>
          </View>

          <Button
            mode="text"
            onPress={() => navigation.goBack()}
            style={styles.endButton}
          >
            End Scenario
          </Button>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  avatarSection: {
    height: 250,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  video: {
    width: '100%',
    height: '100%',
  },
  avatarPlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarEmoji: {
    fontSize: 48,
    marginBottom: 8,
  },
  avatarLabel: {
    opacity: 0.7,
    color: '#fff',
  },
  loadingText: {
    marginTop: 8,
    opacity: 0.7,
    color: '#fff',
  },
  messagesSection: {
    flex: 1,
    paddingHorizontal: 16,
  },
  messagesContent: {
    paddingVertical: 16,
    gap: 12,
  },
  messageBubble: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 16,
  },
  avatarBubble: {
    alignSelf: 'flex-start',
    backgroundColor: '#E3F2FD',
  },
  userBubble: {
    alignSelf: 'flex-end',
    backgroundColor: '#6750A4',
  },
  userText: {
    color: '#fff',
  },
  avatarTextContent: {
    color: '#000',
  },
  inputSection: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  objectivesHint: {
    marginBottom: 12,
    padding: 10,
    backgroundColor: 'rgba(103, 80, 164, 0.1)',
    borderRadius: 8,
  },
  objectivesTitle: {
    fontWeight: '600',
    marginBottom: 4,
    fontSize: 11,
  },
  objectiveText: {
    opacity: 0.8,
    fontSize: 11,
  },
  inputRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  textInput: {
    flex: 1,
    maxHeight: 100,
  },
  sendButton: {
    justifyContent: 'center',
  },
  endButton: {
    marginTop: 4,
  },
});
