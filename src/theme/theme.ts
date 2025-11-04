import { MD3LightTheme, MD3DarkTheme } from 'react-native-paper';

// SUOLINGO Brand Colors
const brandColors = {
  primary: '#6750A4', // Purple - represents learning and creativity
  secondary: '#625B71', // Gray purple
  tertiary: '#7D5260', // Warm accent
  success: '#4CAF50',
  warning: '#FF9800',
  error: '#B3261E',
};

export const lightTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: brandColors.primary,
    secondary: brandColors.secondary,
    tertiary: brandColors.tertiary,
    error: brandColors.error,
  },
};

export const darkTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: brandColors.primary,
    secondary: brandColors.secondary,
    tertiary: brandColors.tertiary,
    error: brandColors.error,
  },
};
