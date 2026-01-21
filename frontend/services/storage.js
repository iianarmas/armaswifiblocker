import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS, DEFAULT_API_URL, DEFAULT_API_KEY } from './config';

export async function getApiUrl() {
  try {
    const url = await AsyncStorage.getItem(STORAGE_KEYS.API_URL);
    return url || DEFAULT_API_URL;
  } catch {
    return DEFAULT_API_URL;
  }
}

export async function setApiUrl(url) {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.API_URL, url);
    return true;
  } catch {
    return false;
  }
}

export async function getApiKey() {
  try {
    const key = await AsyncStorage.getItem(STORAGE_KEYS.API_KEY);
    return key || DEFAULT_API_KEY;
  } catch {
    return DEFAULT_API_KEY;
  }
}

export async function setApiKey(key) {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.API_KEY, key);
    return true;
  } catch {
    return false;
  }
}
