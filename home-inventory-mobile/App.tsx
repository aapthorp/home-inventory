import React, { useEffect, useState } from "react";
import { View, ActivityIndicator } from "react-native";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SafeAreaProvider } from "react-native-safe-area-context";
import RootNavigator from "@/navigation/RootNavigator";
import { loadPersistedSettings } from "@/api/client";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30_000,
    },
  },
});

export default function App() {
  const [settingsReady, setSettingsReady] = useState(false);

  useEffect(() => {
    // Must finish before any screen renders, since the API client's axios
    // interceptor reads the household ID / base URL from an in-memory cache
    // (synchronously) rather than AsyncStorage directly — see api/client.ts.
    loadPersistedSettings().then(() => setSettingsReady(true));
  }, []);

  if (!settingsReady) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <RootNavigator />
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}
