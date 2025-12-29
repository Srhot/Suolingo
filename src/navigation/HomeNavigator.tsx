import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { HomeStackParamList } from './types';
import ScenarioListScreen from '@/screens/ScenarioListScreen';
import ConversationScreen from '@/screens/ConversationScreen';
import ExamModeScreen from '@/screens/ExamModeScreen';

const Stack = createStackNavigator<HomeStackParamList>();

export default function HomeNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="ScenarioList" component={ScenarioListScreen} />
      <Stack.Screen
        name="Conversation"
        component={ConversationScreen}
        options={{
          headerShown: true,
          title: 'Practice',
        }}
      />
      <Stack.Screen
        name="ExamMode"
        component={ExamModeScreen}
        options={{
          headerShown: true,
          title: 'Exam Preparation',
        }}
      />
    </Stack.Navigator>
  );
}
