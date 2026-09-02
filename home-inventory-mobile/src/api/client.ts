import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

const DEFAULT_API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL ?? "http://localhost:8080";
const DEFAULT_HOUSEHOLD_ID = process.env.EXPO_PUBLIC_HOUSEHOLD_ID ?? "";

const STORAGE_KEY_BASE_URL = "homeInventory.apiBaseUrl";
const STORAGE_KEY_HOUSEHOLD_ID = "homeInventory.householdId";

// In-memory cache so the axios interceptor (which can't itself be async-awaited
// by axios internals reliably across versions) reads synchronously after the
// first load. SettingsScreen calls the setters below, which update both the
// cache and AsyncStorage together.
let cachedBaseUrl = DEFAULT_API_BASE_URL;
let cachedHouseholdId = DEFAULT_HOUSEHOLD_ID;
let loaded = false;

export async function loadPersistedSettings(): Promise<void> {
  const [storedBaseUrl, storedHouseholdId] = await Promise.all([
    AsyncStorage.getItem(STORAGE_KEY_BASE_URL),
    AsyncStorage.getItem(STORAGE_KEY_HOUSEHOLD_ID),
  ]);
  if (storedBaseUrl) cachedBaseUrl = storedBaseUrl;
  if (storedHouseholdId) cachedHouseholdId = storedHouseholdId;
  loaded = true;
}

export function getApiBaseUrl(): string {
  return cachedBaseUrl;
}

export async function setApiBaseUrl(url: string): Promise<void> {
  cachedBaseUrl = url;
  await AsyncStorage.setItem(STORAGE_KEY_BASE_URL, url);
}

export function getHouseholdId(): string {
  return cachedHouseholdId;
}

export async function setHouseholdId(id: string): Promise<void> {
  cachedHouseholdId = id;
  await AsyncStorage.setItem(STORAGE_KEY_HOUSEHOLD_ID, id);
}

export function isSettingsLoaded(): boolean {
  return loaded;
}

export const apiClient = axios.create({
  timeout: 10_000,
});

apiClient.interceptors.request.use((config) => {
  config.baseURL = cachedBaseUrl;
  if (cachedHouseholdId) {
    config.headers["X-Household-Id"] = cachedHouseholdId;
  }
  return config;
});
