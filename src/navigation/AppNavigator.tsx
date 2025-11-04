import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { RootStackParamList } from './types';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { setUser, clearUser, setLoading } from '@/store/slices/userSlice';
import { LocalAuthService } from '@/services/auth/LocalAuthService';
import AuthNavigator from './AuthNavigator';
import MainNavigator from './MainNavigator';
import OnboardingNavigator from './OnboardingNavigator';

const Stack = createStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  const dispatch = useAppDispatch();
  const { isAuthenticated, isLoading } = useAppSelector((state) => state.user);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);

  useEffect(() => {
    // Check AsyncStorage for saved user
    const loadUser = async () => {
      dispatch(setLoading(true));
      const user = await LocalAuthService.getCurrentUser();

      if (user) {
        dispatch(setUser(user));
        setHasCompletedOnboarding(true); // User varsa onboarding tamamlanmış
      } else {
        dispatch(clearUser());
      }
    };

    loadUser();
  }, [dispatch]);

  if (isLoading) {
    // TODO: Add a proper loading screen
    return null;
  }

  const handleOnboardingComplete = () => {
    setHasCompletedOnboarding(true);
  };

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!hasCompletedOnboarding ? (
          <Stack.Screen name="Onboarding">
            {() => <OnboardingNavigator onComplete={handleOnboardingComplete} />}
          </Stack.Screen>
        ) : !isAuthenticated ? (
          <Stack.Screen name="Auth" component={AuthNavigator} />
        ) : (
          <Stack.Screen name="Main" component={MainNavigator} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
