/**
 * Proximity Service
 *
 * Uses a hybrid approach:
 * 1. BLE advertising/scanning for true proximity detection (expo-ble or native module)
 * 2. Server-side geolocation clustering as fallback
 *
 * For production, install: npx expo install react-native-ble-plx
 * This file shows the integration pattern.
 */

import { Platform, PermissionsAndroid } from 'react-native';
import { socketService } from './socket';

// Rotating UUID prefix (changes every 15 minutes for privacy)
let currentUUID = '';
let uuidRotateInterval: ReturnType<typeof setInterval> | null = null;

function generateProximityUUID(userId: string): string {
  const slot = Math.floor(Date.now() / (15 * 60 * 1000)); // 15 min window
  return `EW-${slot}-${userId.slice(-8)}`;
}

export async function requestProximityPermissions(): Promise<boolean> {
  if (Platform.OS === 'android') {
    const granted = await PermissionsAndroid.requestMultiple([
      PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
      PermissionsAndroid.PERMISSIONS.BLUETOOTH_ADVERTISE,
      PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
    ]);
    return Object.values(granted).every(
      (v) => v === PermissionsAndroid.RESULTS.GRANTED
    );
  }
  return true; // iOS permissions handled via Info.plist
}

export function startProximityBroadcast(userId: string) {
  currentUUID = generateProximityUUID(userId);

  // Rotate UUID every 15 minutes for privacy
  uuidRotateInterval = setInterval(() => {
    currentUUID = generateProximityUUID(userId);
    console.log('[BLE] UUID rotated:', currentUUID);
  }, 15 * 60 * 1000);

  console.log('[BLE] Broadcasting UUID:', currentUUID);

  /**
   * Production BLE advertising with react-native-ble-plx:
   *
   * import BleManager from 'react-native-ble-plx';
   * const manager = new BleManager();
   * manager.startAdvertising({
   *   serviceUUIDs: ['EW00'],
   *   localName: currentUUID,
   * });
   */
}

export function stopProximityBroadcast() {
  if (uuidRotateInterval) {
    clearInterval(uuidRotateInterval);
    uuidRotateInterval = null;
  }
  console.log('[BLE] Stopped broadcasting');
}

export function startProximityScan(onUserFound: (uuid: string, rssi: number) => void) {
  /**
   * Production BLE scanning with react-native-ble-plx:
   *
   * manager.startDeviceScan(['EW00'], null, (error, device) => {
   *   if (error) return;
   *   if (device?.localName?.startsWith('EW-')) {
   *     onUserFound(device.localName, device.rssi ?? -100);
   *   }
   * });
   */
  console.log('[BLE] Scanning for nearby EmojiWave users...');
}

export function rssiToDistance(rssi: number): number {
  // Approximate distance from RSSI (txPower = -59 dBm at 1m)
  const txPower = -59;
  if (rssi === 0) return -1;
  const ratio = rssi / txPower;
  if (ratio < 1.0) return Math.pow(ratio, 10);
  return 0.89976 * Math.pow(ratio, 7.7095) + 0.111;
}

export function updateServerPosition(lat: number, lng: number, userId: string) {
  socketService.updatePosition(lat, lng, userId);
}
