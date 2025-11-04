import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { OnboardingStackParamList } from './types';
import WelcomeScreen from '@/screens/onboarding/WelcomeScreen';
import LanguageSelectionScreen from '@/screens/onboarding/LanguageSelectionScreen';
import PermissionsScreen from '@/screens/onboarding/PermissionsScreen';

const Stack = createStackNavigator<OnboardingStackParamList>();

type OnboardingNavigatorProps = {
  onComplete: () => void;
};

export default function OnboardingNavigator({ onComplete }: OnboardingNavigatorProps) {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="Welcome" component={WelcomeScreen} />
      <Stack.Screen name="LanguageSelection" component={LanguageSelectionScreen} />
      <Stack.Screen name="Permissions">
        {(props) => <PermissionsScreen {...props} onComplete={onComplete} />}
      </Stack.Screen>
    </Stack.Navigator>
  );
}
