import * as SecureStore from 'expo-secure-store';
import * as Crypto from 'expo-crypto';
import axios from 'axios';

const API_URL = 'https://api.emojiwave.app';
const USER_ID_KEY = 'emojiwave_user_id';
const TOKEN_KEY = 'emojiwave_token';
const PROFILE_KEY = 'emojiwave_profile';

export interface UserProfile {
  id: string;
  emoji: string;
  nickname: string;
  token: string;
}

export async function getOrCreateUser(): Promise<UserProfile> {
  // Check for existing user
  const stored = await SecureStore.getItemAsync(USER_ID_KEY);
  const storedToken = await SecureStore.getItemAsync(TOKEN_KEY);
  const storedProfile = await SecureStore.getItemAsync(PROFILE_KEY);

  if (stored && storedToken && storedProfile) {
    const profile = JSON.parse(storedProfile);
    return { ...profile, id: stored, token: storedToken };
  }

  // Generate anonymous ID
  const randomBytes = await Crypto.getRandomBytesAsync(16);
  const hex = Array.from(randomBytes).map(b => b.toString(16).padStart(2, '0')).join('');
  const newId = `ew_${hex}`;

  // Default profile
  const defaultEmojis = ['😎', '🦋', '🌊', '⚡', '🎯', '🦊', '🌙', '🔥'];
  const emoji = defaultEmojis[Math.floor(Math.random() * defaultEmojis.length)];

  // Register with server (anonymous)
  let token = '';
  try {
    const res = await axios.post(`${API_URL}/auth/anonymous`, { id: newId, emoji });
    token = res.data.token;
  } catch {
    // Offline fallback: generate a local token
    token = `local_${hex}`;
  }

  const profile = { emoji, nickname: 'Nuevo usuario' };

  await SecureStore.setItemAsync(USER_ID_KEY, newId);
  await SecureStore.setItemAsync(TOKEN_KEY, token);
  await SecureStore.setItemAsync(PROFILE_KEY, JSON.stringify(profile));

  return { id: newId, emoji, nickname: profile.nickname, token };
}

export async function updateProfile(emoji: string, nickname: string, token: string) {
  const id = await SecureStore.getItemAsync(USER_ID_KEY);
  if (!id) return;

  await SecureStore.setItemAsync(PROFILE_KEY, JSON.stringify({ emoji, nickname }));

  try {
    await axios.patch(`${API_URL}/users/${id}`, { emoji, nickname }, {
      headers: { Authorization: `Bearer ${token}` },
    });
  } catch (e) {
    console.warn('[Auth] Could not sync profile, saved locally');
  }
}

export async function deleteAccount() {
  await SecureStore.deleteItemAsync(USER_ID_KEY);
  await SecureStore.deleteItemAsync(TOKEN_KEY);
  await SecureStore.deleteItemAsync(PROFILE_KEY);
}
