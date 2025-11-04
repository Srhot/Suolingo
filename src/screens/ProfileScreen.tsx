import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Card, Text, Button, List, useTheme } from 'react-native-paper';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { LocalAuthService } from '@/services/auth/LocalAuthService';
import { clearUser } from '@/store/slices/userSlice';

export default function ProfileScreen() {
  const theme = useTheme();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.user);

  const handleSignOut = async () => {
    try {
      await LocalAuthService.signOut();
      dispatch(clearUser());
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.content}>
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="headlineSmall" style={styles.name}>
              {user?.displayName || user?.email}
            </Text>
            <Text variant="bodyMedium" style={styles.email}>
              {user?.email}
            </Text>
            <View style={styles.tierBadge}>
              <Text variant="labelLarge" style={styles.tierText}>
                {user?.tier === 'premium' ? '👑 Premium' : '🆓 Free'}
              </Text>
            </View>
          </Card.Content>
        </Card>

        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleLarge" style={styles.cardTitle}>
              Learning Settings
            </Text>
          </Card.Content>
          <List.Item
            title="Target Languages"
            description={user?.targetLanguages.join(', ') || 'None selected'}
            left={(props) => <List.Icon {...props} icon="translate" />}
          />
          <List.Item
            title="Native Language"
            description={user?.nativeLanguage || 'Not set'}
            left={(props) => <List.Icon {...props} icon="earth" />}
          />
        </Card>

        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleLarge" style={styles.cardTitle}>
              Account
            </Text>
          </Card.Content>
          <List.Item
            title="Privacy Settings"
            left={(props) => <List.Icon {...props} icon="shield-check" />}
            right={(props) => <List.Icon {...props} icon="chevron-right" />}
          />
          <List.Item
            title="Notification Preferences"
            left={(props) => <List.Icon {...props} icon="bell" />}
            right={(props) => <List.Icon {...props} icon="chevron-right" />}
          />
        </Card>

        <View style={styles.buttonContainer}>
          <Button mode="outlined" onPress={handleSignOut} style={styles.signOutButton}>
            Sign Out
          </Button>
        </View>
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
  card: {
    marginBottom: 16,
  },
  cardTitle: {
    marginBottom: 8,
  },
  name: {
    marginBottom: 4,
  },
  email: {
    opacity: 0.7,
    marginBottom: 12,
  },
  tierBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(103, 80, 164, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  tierText: {
    color: '#6750A4',
  },
  buttonContainer: {
    marginTop: 24,
    marginBottom: 40,
  },
  signOutButton: {
    borderColor: '#B3261E',
  },
});
