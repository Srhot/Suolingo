import React from 'react';
import { Platform } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MainTabParamList } from './types';
import AvatarScreen from '@/screens/AvatarScreen';
import ExamModeScreen from '@/screens/ExamModeScreen';
import ProgressScreen from '@/screens/ProgressScreen';
import ProfileScreen from '@/screens/ProfileScreen';

const Tab = createBottomTabNavigator<MainTabParamList>();

export default function MainNavigator() {
  const insets = useSafeAreaInsets();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          paddingTop: 8,
          paddingBottom: Platform.OS === 'ios' ? insets.bottom : 8,
          height: Platform.OS === 'ios' ? 65 + insets.bottom : 65,
          backgroundColor: '#fff',
          borderTopWidth: 1,
          borderTopColor: '#e0e0e0',
        },
        tabBarActiveTintColor: '#3b82f6',
        tabBarInactiveTintColor: '#9ca3af',
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
      }}
    >
      <Tab.Screen
        name="Practice"
        component={AvatarScreen}
        options={{
          title: 'Practice',
          tabBarLabel: 'Practice',
          tabBarIcon: ({ color, size }) => (
            <TabBarIcon name="account-voice" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Exams"
        component={ExamModeScreen}
        options={{
          headerShown: true,
          title: 'Exam Preparation',
          tabBarLabel: 'Exams',
          tabBarIcon: ({ color, size }) => (
            <TabBarIcon name="school" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Progress"
        component={ProgressScreen}
        options={{
          headerShown: true,
          title: 'Progress',
          tabBarLabel: 'Progress',
          tabBarIcon: ({ color, size }) => (
            <TabBarIcon name="chart-line" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          headerShown: true,
          title: 'Profile',
          tabBarLabel: 'Profile',
          tabBarIcon: ({ color, size }) => (
            <TabBarIcon name="account" color={color} size={size} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

// Tab bar icon component
import { Icon } from 'react-native-paper';

function TabBarIcon({ name, color, size }: { name: string; color: string; size: number }) {
  return <Icon source={name} size={size} color={color} />;
}
