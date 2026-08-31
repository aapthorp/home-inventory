import axios from "axios";

const DEFAULT_API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8080";
const DEFAULT_HOUSEHOLD_ID = import.meta.env.VITE_HOUSEHOLD_ID ?? "";

const STORAGE_KEY_BASE_URL = "homeInventory.apiBaseUrl";
const STORAGE_KEY_HOUSEHOLD_ID = "homeInventory.householdId";

export function getApiBaseUrl(): string {
  return localStorage.getItem(STORAGE_KEY_BASE_URL) ?? DEFAULT_API_BASE_URL;
}

export function setApiBaseUrl(url: string): void {
  localStorage.setItem(STORAGE_KEY_BASE_URL, url);
}

export function getHouseholdId(): string {
  return localStorage.getItem(STORAGE_KEY_HOUSEHOLD_ID) ?? DEFAULT_HOUSEHOLD_ID;
}

export function setHouseholdId(id: string): void {
  localStorage.setItem(STORAGE_KEY_HOUSEHOLD_ID, id);
}

export const apiClient = axios.create({
  timeout: 10_000,
});

// Resolved per-request (not baked in at client creation) so the Settings page
// can change these without a page reload.
apiClient.interceptors.request.use((config) => {
  config.baseURL = getApiBaseUrl();
  const householdId = getHouseholdId();
  if (householdId) {
    config.headers["X-Household-Id"] = householdId;
  }
  return config;
});
