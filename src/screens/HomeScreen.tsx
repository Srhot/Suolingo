import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Card, Text, Button, useTheme } from 'react-native-paper';
import { useAppSelector } from '@/store/hooks';

export default function HomeScreen() {
  const theme = useTheme();
  const { user } = useAppSelector((state) => state.user);

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.content}>
        <Text variant="headlineMedium" style={styles.greeting}>
          Welcome back{user?.displayName ? `, ${user.displayName}` : ''}!
        </Text>

        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleLarge" style={styles.cardTitle}>
              Start Learning
            </Text>
            <Text variant="bodyMedium" style={styles.cardDescription}>
              Practice conversations with AI avatars
            </Text>
          </Card.Content>
          <Card.Actions>
            <Button mode="contained" onPress={() => {}}>
              Start Conversation
            </Button>
          </Card.Actions>
        </Card>

        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleLarge" style={styles.cardTitle}>
              Today's Goal
            </Text>
            <Text variant="bodyMedium">Complete 3 conversation scenarios</Text>
            <Text variant="bodySmall" style={styles.progress}>
              0 / 3 completed
            </Text>
          </Card.Content>
        </Card>

        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleLarge" style={styles.cardTitle}>
              Your Progress
            </Text>
            <View style={styles.statsRow}>
              <View style={styles.stat}>
                <Text variant="headlineSmall">{user?.totalXP || 0}</Text>
                <Text variant="bodySmall">XP</Text>
              </View>
              <View style={styles.stat}>
                <Text variant="headlineSmall">{user?.streakDays || 0}</Text>
                <Text variant="bodySmall">Day Streak</Text>
              </View>
              <View style={styles.stat}>
                <Text variant="headlineSmall">{user?.currentLevel || 1}</Text>
                <Text variant="bodySmall">Level</Text>
              </View>
            </View>
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
  greeting: {
    marginBottom: 24,
  },
  card: {
    marginBottom: 16,
  },
  cardTitle: {
    marginBottom: 8,
  },
  cardDescription: {
    opacity: 0.7,
  },
  progress: {
    marginTop: 8,
    opacity: 0.6,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 16,
  },
  stat: {
    alignItems: 'center',
  },
});
