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

  const handleExamModePress = () => {
    navigation.navigate('ExamMode');
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
        {/* Exam Preparation Card */}
        <TouchableOpacity onPress={handleExamModePress} style={styles.cardWrapper}>
          <Card style={[styles.card, styles.examCard]} mode="elevated">
            <Card.Content>
              <View style={styles.examCardHeader}>
                <View style={styles.examIconContainer}>
                  <Icon source="school" size={32} color="#fff" />
                </View>
                <View style={styles.examTextContainer}>
                  <Text variant="titleLarge" style={styles.examTitle}>
                    Exam Preparation
                  </Text>
                  <Text variant="bodyMedium" style={styles.examSubtitle}>
                    IELTS & TOEFL Speaking Tests
                  </Text>
                </View>
                <Icon source="chevron-right" size={28} color={theme.colors.primary} />
              </View>
              <View style={styles.examFeatures}>
                <View style={styles.featureItem}>
                  <Icon source="lightning-bolt" size={16} color="#10b981" />
                  <Text variant="bodySmall" style={styles.featureText}>
                    Real-time AI Avatar
                  </Text>
                </View>
                <View style={styles.featureItem}>
                  <Icon source="clock-fast" size={16} color="#10b981" />
                  <Text variant="bodySmall" style={styles.featureText}>
                    500ms Latency
                  </Text>
                </View>
                <View style={styles.featureItem}>
                  <Icon source="account-voice" size={16} color="#10b981" />
                  <Text variant="bodySmall" style={styles.featureText}>
                    Live Conversation
                  </Text>
                </View>
              </View>
            </Card.Content>
          </Card>
        </TouchableOpacity>

        {/* Scenario Cards */}
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
  examCard: {
    backgroundColor: '#f0f9ff',
    borderWidth: 2,
    borderColor: '#3b82f6',
    elevation: 4,
  },
  examCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  examIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#3b82f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  examTextContainer: {
    flex: 1,
  },
  examTitle: {
    fontWeight: 'bold',
    color: '#1e40af',
  },
  examSubtitle: {
    color: '#3b82f6',
    marginTop: 4,
  },
  examFeatures: {
    flexDirection: 'row',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#bfdbfe',
    gap: 12,
    flexWrap: 'wrap',
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  featureText: {
    color: '#059669',
    fontWeight: '500',
  },
});
