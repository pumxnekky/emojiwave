import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export async function registerForPushNotifications(): Promise<string | null> {
  if (!Device.isDevice) {
    console.warn('[Push] Must use physical device for push notifications');
    return null;
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    console.warn('[Push] Permission not granted');
    return null;
  }

  const projectId = Constants.expoConfig?.extra?.eas?.projectId;
  if (!projectId) {
    console.warn('[Push] No EAS project ID found');
    return null;
  }

  const token = (await Notifications.getExpoPushTokenAsync({ projectId })).data;

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('reactions', {
      name: 'Reacciones',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 150, 250],
      lightColor: '#7C3AED',
      sound: 'wave.wav',
    });

    await Notifications.setNotificationChannelAsync('messages', {
      name: 'Mensajes',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 100],
      lightColor: '#06B6D4',
    });
  }

  return token;
}

export function addNotificationListener(handler: (n: Notifications.Notification) => void) {
  return Notifications.addNotificationReceivedListener(handler);
}

export function addResponseListener(handler: (r: Notifications.NotificationResponse) => void) {
  return Notifications.addNotificationResponseReceivedListener(handler);
}

export async function scheduleLocalNotification(title: string, body: string, data?: object) {
  await Notifications.scheduleNotificationAsync({
    content: { title, body, data, sound: 'wave.wav' },
    trigger: null,
  });
}
