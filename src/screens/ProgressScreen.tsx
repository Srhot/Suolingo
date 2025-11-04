import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Card, Text, useTheme } from 'react-native-paper';
import { useAppSelector } from '@/store/hooks';

export default function ProgressScreen() {
  const theme = useTheme();
  const { user } = useAppSelector((state) => state.user);

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.content}>
        <Text variant="headlineMedium" style={styles.title}>
          Your Progress
        </Text>

        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleLarge" style={styles.cardTitle}>
              Overall Stats
            </Text>
            <View style={styles.statRow}>
              <Text variant="bodyLarge">Total XP:</Text>
              <Text variant="bodyLarge">{user?.totalXP || 0}</Text>
            </View>
            <View style={styles.statRow}>
              <Text variant="bodyLarge">Current Level:</Text>
              <Text variant="bodyLarge">{user?.currentLevel || 1}</Text>
            </View>
            <View style={styles.statRow}>
              <Text variant="bodyLarge">Streak Days:</Text>
              <Text variant="bodyLarge">{user?.streakDays || 0}</Text>
            </View>
          </Card.Content>
        </Card>

        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleLarge" style={styles.cardTitle}>
              Skills Breakdown
            </Text>
            <Text variant="bodyMedium" style={styles.placeholder}>
              Coming soon: Vocabulary, Grammar, Pronunciation, Listening
            </Text>
          </Card.Content>
        </Card>

        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleLarge" style={styles.cardTitle}>
              Achievements
            </Text>
            <Text variant="bodyMedium" style={styles.placeholder}>
              Complete scenarios to earn badges!
            </Text>
          </Card.Content>
        </Card>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  title: {
    marginBottom: 24,
  },
  card: {
    marginBottom: 16,
  },
  cardTitle: {
    marginBottom: 12,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  placeholder: {
    opacity: 0.6,
    fontStyle: 'italic',
  },
});
