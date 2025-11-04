import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Button, Text, Checkbox, useTheme } from 'react-native-paper';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { OnboardingStackParamList } from '@/navigation/types';

type PermissionsScreenProps = {
  navigation: StackNavigationProp<OnboardingStackParamList, 'Permissions'>;
  route: RouteProp<OnboardingStackParamList, 'Permissions'>;
  onComplete: () => void;
};

export default function PermissionsScreen({ navigation, onComplete }: PermissionsScreenProps) {
  const theme = useTheme();
  const [voiceConsent, setVoiceConsent] = useState(false);

  const handleComplete = () => {
    if (voiceConsent) {
      // TODO: Save consent to user profile
      onComplete();
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.content}>
        <Text variant="headlineMedium" style={styles.title}>
          Voice Recording Consent
        </Text>

        <Text variant="bodyLarge" style={styles.description}>
          To provide pronunciation feedback and conversational practice, SUOLINGO needs to record
          your voice.
        </Text>

        <View style={styles.consentBox}>
          <Text variant="bodyMedium" style={styles.bulletTitle}>
            Your recordings will be:
          </Text>
          <Text variant="bodyMedium" style={styles.bullet}>
            • Stored securely and encrypted
          </Text>
          <Text variant="bodyMedium" style={styles.bullet}>
            • Used only for your learning progress
          </Text>
          <Text variant="bodyMedium" style={styles.bullet}>
            • Automatically deleted after 30 days of inactivity
          </Text>
          <Text variant="bodyMedium" style={styles.bullet}>
            • Deletable by you at any time in Settings
          </Text>
        </View>

        <View style={styles.checkboxContainer}>
          <Checkbox
            status={voiceConsent ? 'checked' : 'unchecked'}
            onPress={() => setVoiceConsent(!voiceConsent)}
          />
          <Text variant="bodyMedium" style={styles.checkboxLabel}>
            I consent to voice recording for educational purposes
          </Text>
        </View>
      </View>

      <View style={styles.buttonContainer}>
        <Button
          mode="contained"
          onPress={handleComplete}
          disabled={!voiceConsent}
          style={styles.button}
        >
          Complete Setup
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
  },
  title: {
    textAlign: 'center',
    marginTop: 40,
    marginBottom: 24,
  },
  description: {
    textAlign: 'center',
    marginBottom: 32,
    paddingHorizontal: 20,
  },
  consentBox: {
    backgroundColor: 'rgba(103, 80, 164, 0.1)',
    padding: 20,
    borderRadius: 12,
    marginBottom: 24,
  },
  bulletTitle: {
    marginBottom: 12,
    fontWeight: '600',
  },
  bullet: {
    marginBottom: 8,
    opacity: 0.8,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  checkboxLabel: {
    flex: 1,
    marginLeft: 8,
  },
  buttonContainer: {
    paddingBottom: 40,
  },
  button: {
    paddingVertical: 8,
  },
});
