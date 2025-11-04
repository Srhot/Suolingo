import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Button, Text, useTheme } from 'react-native-paper';
import { StackNavigationProp } from '@react-navigation/stack';
import { OnboardingStackParamList } from '@/navigation/types';

type WelcomeScreenProps = {
  navigation: StackNavigationProp<OnboardingStackParamList, 'Welcome'>;
};

export default function WelcomeScreen({ navigation }: WelcomeScreenProps) {
  const theme = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.content}>
        <Text variant="displayMedium" style={styles.title}>
          Welcome to SUOLINGO
        </Text>
        <Text variant="bodyLarge" style={styles.subtitle}>
          Learn languages with AI-powered avatar conversations
        </Text>
        <Text variant="bodyMedium" style={styles.description}>
          Practice real conversations, improve pronunciation, and build confidence speaking a new
          language.
        </Text>
      </View>

      <View style={styles.buttonContainer}>
        <Button
          mode="contained"
          onPress={() => navigation.navigate('LanguageSelection')}
          style={styles.button}
        >
          Get Started
        </Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    textAlign: 'center',
    marginBottom: 16,
  },
  subtitle: {
    textAlign: 'center',
    marginBottom: 24,
    opacity: 0.8,
  },
  description: {
    textAlign: 'center',
    paddingHorizontal: 20,
    opacity: 0.7,
  },
  buttonContainer: {
    paddingBottom: 40,
  },
  button: {
    paddingVertical: 8,
  },
});
