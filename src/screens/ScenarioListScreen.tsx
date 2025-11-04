import React from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Text, Card, Chip, useTheme, Icon } from 'react-native-paper';
import { CompositeNavigationProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { HomeStackParamList, MainTabParamList } from '@/navigation/types';
import { MOCK_SCENARIOS } from '@/data/mockScenarios';
import { Scenario, ScenarioDifficulty } from '@/types/Scenario';

type ScenarioListScreenNavigationProp = CompositeNavigationProp<
  StackNavigationProp<HomeStackParamList, 'ScenarioList'>,
  BottomTabNavigationProp<MainTabParamList>
>;

type Props = {
  navigation: ScenarioListScreenNavigationProp;
};

const DIFFICULTY_COLORS: Record<ScenarioDifficulty, string> = {
  beginner: '#4CAF50',
  intermediate: '#FF9800',
  advanced: '#F44336',
};

const CATEGORY_ICONS: Record<string, string> = {
  restaurant: 'food-fork-drink',
  travel: 'airplane',
  shopping: 'shopping',
  business: 'briefcase',
  healthcare: 'medical-bag',
};

export default function ScenarioListScreen({ navigation }: Props) {
  const theme = useTheme();

  const handleScenarioPress = (scenario: Scenario) => {
    if (scenario.isLocked) {
      // TODO: Show alert that scenario is locked
      return;
    }
    navigation.navigate('Conversation', { scenarioId: scenario.id });
  };

  const renderScenarioCard = (scenario: Scenario) => {
    return (
      <TouchableOpacity
        key={scenario.id}
        onPress={() => handleScenarioPress(scenario)}
        disabled={scenario.isLocked}
        style={styles.cardWrapper}
      >
        <Card
          style={[
            styles.card,
            scenario.isLocked && styles.lockedCard,
            scenario.isCompleted && styles.completedCard,
          ]}
          mode="elevated"
        >
          <Card.Content>
            <View style={styles.cardHeader}>
              <View style={styles.titleRow}>
                <Icon
                  source={CATEGORY_ICONS[scenario.category] || 'help-circle'}
                  size={24}
                  color={scenario.isLocked ? '#999' : theme.colors.primary}
                />
                <Text
                  variant="titleMedium"
                  style={[styles.title, scenario.isLocked && styles.lockedText]}
                >
                  {scenario.title}
                </Text>
              </View>
              {scenario.isLocked && (
                <Icon source="lock" size={20} color="#999" />
              )}
              {scenario.isCompleted && (
                <Icon source="check-circle" size={20} color="#4CAF50" />
              )}
            </View>

            <Text
              variant="bodyMedium"
              style={[styles.description, scenario.isLocked && styles.lockedText]}
            >
              {scenario.description}
            </Text>

            <View style={styles.metaRow}>
              <Chip
                mode="outlined"
                style={[
                  styles.difficultyChip,
                  { borderColor: DIFFICULTY_COLORS[scenario.difficulty] },
                ]}
                textStyle={{ color: DIFFICULTY_COLORS[scenario.difficulty] }}
              >
                {scenario.difficulty}
              </Chip>
              <View style={styles.infoChips}>
                <Chip mode="outlined" compact icon="clock-outline">
                  {scenario.estimatedDuration} min
                </Chip>
                <Chip mode="outlined" compact icon="star-outline">
                  {scenario.xpReward} XP
                </Chip>
              </View>
            </View>

            <View style={styles.objectives}>
              <Text variant="labelSmall" style={styles.objectivesTitle}>
                Objectives:
              </Text>
              {scenario.objectives.slice(0, 3).map((obj, index) => (
                <Text key={index} variant="bodySmall" style={styles.objective}>
                  • {obj}
                </Text>
              ))}
            </View>
          </Card.Content>
        </Card>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <Text variant="headlineMedium" style={styles.headerTitle}>
          Practice Scenarios
        </Text>
        <Text variant="bodyMedium" style={styles.headerSubtitle}>
          Choose a scenario to practice real-world conversations
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {MOCK_SCENARIOS.map(renderScenarioCard)}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 20,
    paddingTop: 60,
  },
  headerTitle: {
    fontWeight: 'bold',
    marginBottom: 8,
  },
  headerSubtitle: {
    opacity: 0.7,
  },
  scrollContent: {
    padding: 16,
    paddingTop: 0,
    gap: 16,
  },
  cardWrapper: {
    marginBottom: 0,
  },
  card: {
    elevation: 2,
  },
  lockedCard: {
    opacity: 0.6,
  },
  completedCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  title: {
    fontWeight: '600',
    flex: 1,
  },
  lockedText: {
    color: '#999',
  },
  description: {
    marginBottom: 12,
    lineHeight: 20,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  difficultyChip: {
    borderWidth: 1.5,
  },
  infoChips: {
    flexDirection: 'row',
    gap: 8,
  },
  objectives: {
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  objectivesTitle: {
    fontWeight: '600',
    marginBottom: 4,
    opacity: 0.7,
  },
  objective: {
    opacity: 0.8,
    marginBottom: 2,
  },
});
