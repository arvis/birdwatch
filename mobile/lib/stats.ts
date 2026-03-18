import * as Application from 'expo-application';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import { getInstallId, getAndroidId } from './deviceId';

const isWeb = typeof document !== 'undefined';

const API_URL = __DEV__
  ? isWeb
    ? 'http://localhost:8000'
    : 'http://10.0.2.2:8000'
  : 'https://api.birdwatch.app';

export interface StatsEvent {
  install_id: string;
  android_id: string | null;
  species: string;
  scientific_name: string;
  confidence: 'low' | 'medium' | 'high';
  had_result: boolean;
  duration_ms: number;
  wikipedia_tapped: boolean;
  example_images_count: number;
  platform: string;
  app_version: string;
  os_version: string;
  timestamp: string;
}

export async function sendStats(
  event: Omit<StatsEvent, 'install_id' | 'android_id' | 'platform' | 'app_version' | 'os_version' | 'timestamp'>
): Promise<void> {
  const install_id = await getInstallId();

  const payload: StatsEvent = {
    ...event,
    install_id,
    android_id: getAndroidId(),
    platform: Platform.OS,
    app_version: Application.nativeApplicationVersion ?? 'unknown',
    os_version: Device.osVersion ?? 'unknown',
    timestamp: new Date().toISOString(),
  };

  fetch(`${API_URL}/api/stats`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  }).catch((err) => {
    if (__DEV__) {
      console.warn('Stats send failed:', err);
    }
  });
}
