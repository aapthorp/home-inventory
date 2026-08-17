import axios from "axios";

// Points at your Quarkus backend. Swap for the reverse-proxied/Tailscale
// address when running against the home server instead of localhost.
export const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL ?? "http://localhost:8080";

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10_000,
});

// Attach the auth token to every request once login is implemented.
let authToken: string | null = null;
export function setAuthToken(token: string | null) {
  authToken = token;
}

apiClient.interceptors.request.use((config) => {
  if (authToken) {
    config.headers.Authorization = `Bearer ${authToken}`;
  }
  return config;
});
