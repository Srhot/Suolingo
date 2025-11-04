import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Button, Text, Chip, useTheme } from 'react-native-paper';
import { StackNavigationProp } from '@react-navigation/stack';
import { OnboardingStackParamList } from '@/navigation/types';

type LanguageSelectionScreenProps = {
  navigation: StackNavigationProp<OnboardingStackParamList, 'LanguageSelection'>;
};

const AVAILABLE_LANGUAGES = [
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'de', name: 'German', flag: '🇩🇪' },
];

export default function LanguageSelectionScreen({ navigation }: LanguageSelectionScreenProps) {
  const theme = useTheme();
  const [selectedLanguage, setSelectedLanguage] = useState<string | null>(null);

  const handleContinue = () => {
    if (selectedLanguage) {
      // TODO: Save selected language to user profile
      navigation.navigate('Permissions');
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.content}>
        <Text variant="headlineMedium" style={styles.title}>
          What language do you want to learn?
        </Text>

        <ScrollView contentContainerStyle={styles.languageList}>
          {AVAILABLE_LANGUAGES.map((language) => (
            <Chip
              key={language.code}
              selected={selectedLanguage === language.code}
              onPress={() => setSelectedLanguage(language.code)}
              style={styles.languageChip}
              mode="outlined"
            >
              {language.flag} {language.name}
            </Chip>
          ))}
        </ScrollView>
      </View>

      <View style={styles.buttonContainer}>
        <Button
          mode="contained"
          onPress={handleContinue}
          disabled={!selectedLanguage}
          style={styles.button}
        >
          Continue
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
    marginBottom: 32,
  },
  languageList: {
    gap: 12,
  },
  languageChip: {
    paddingVertical: 8,
  },
  buttonContainer: {
    paddingBottom: 40,
  },
  button: {
    paddingVertical: 8,
  },
});
