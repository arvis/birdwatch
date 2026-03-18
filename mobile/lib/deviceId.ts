import * as Application from 'expo-application';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import 'react-native-get-random-values';
import { v4 as uuidv4 } from 'uuid';

export async function getInstallId(): Promise<string> {
  const stored = await AsyncStorage.getItem('install_id');
  if (stored) return stored;
  const id = uuidv4();
  await AsyncStorage.setItem('install_id', id);
  return id;
}

export function getAndroidId(): string | null {
  if (Platform.OS === 'android') {
    return Application.getAndroidId() ?? null;
  }
  return null;
}
