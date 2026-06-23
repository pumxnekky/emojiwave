import React, { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';

import AppNavigator from './src/navigation/AppNavigator';
import OnboardingScreen from './src/screens/OnboardingScreen';
import { getOrCreateUser } from './src/services/auth';
import { registerForPushNotifications } from './src/services/notifications';
import { socketService } from './src/services/socket';
import { useStore } from './src/store/useStore';

const ONBOARDING_KEY = 'emojiwave_onboarded';

export default function App() {
  const [loading, setLoading] = useState(true);
  const [onboarded, setOnboarded] = useState(false);
  const { setProfile } = useStore();

  useEffect(() => {
    async function init() {
      try {
        // Check onboarding
        const done = await AsyncStorage.getItem(ONBOARDING_KEY);
        setOnboarded(!!done);

        // Get or create anonymous user
        const user = await getOrCreateUser();
        setProfile(user.id, user.emoji, user.nickname);

        // Register push notifications
        const pushToken = await registerForPushNotifications();

        // Connect to realtime server
        socketService.connect(user.id, user.token);
      } catch (e) {
        console.warn('[App] Init error:', e);
      } finally {
        setLoading(false);
      }
    }
    init();

    return () => { socketService.disconnect(); };
  }, []);

  const handleOnboardingDone = async () => {
    await AsyncStorage.setItem(ONBOARDING_KEY, '1');
    setOnboarded(true);
  };

  if (loading) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <StatusBar style="light" backgroundColor="#0D0D1A" />
        {!onboarded ? (
          <OnboardingScreen onDone={handleOnboardingDone} />
        ) : (
          <NavigationContainer>
            <AppNavigator />
          </NavigationContainer>
        )}
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
