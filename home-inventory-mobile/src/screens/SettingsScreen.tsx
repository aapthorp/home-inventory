import React, { useState } from "react";
import { View, Text, TextInput, Pressable, StyleSheet, Alert } from "react-native";
import { getApiBaseUrl, setApiBaseUrl, getHouseholdId, setHouseholdId } from "@/api/client";

export default function SettingsScreen() {
  const [apiBaseUrl, setApiBaseUrlInput] = useState(getApiBaseUrl());
  const [householdId, setHouseholdIdInput] = useState(getHouseholdId());

  async function handleSave() {
    await setApiBaseUrl(apiBaseUrl.trim());
    await setHouseholdId(householdId.trim());
    Alert.alert("Saved", "Restart any in-flight screens (pull to refresh) to pick up the change.");
  }

  return (
    <View style={styles.container}>
      <Text style={styles.helperText}>
        The household ID stands in for real login until JWT auth is built. Every request needs it — without it the
        API returns 401. Use your machine's LAN IP for the API URL, not localhost, when running on a physical device.
      </Text>

      <Text style={styles.label}>API base URL</Text>
      <TextInput
        style={styles.input}
        value={apiBaseUrl}
        onChangeText={setApiBaseUrlInput}
        autoCapitalize="none"
        autoCorrect={false}
      />

      <Text style={styles.label}>Household ID</Text>
      <TextInput
        style={styles.input}
        value={householdId}
        onChangeText={setHouseholdIdInput}
        autoCapitalize="none"
        autoCorrect={false}
      />

      <Pressable style={styles.saveButton} onPress={handleSave}>
        <Text style={styles.saveButtonText}>Save</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", padding: 16 },
  helperText: { color: "#888", fontSize: 13, marginBottom: 20, lineHeight: 18 },
  label: { fontSize: 13, color: "#666", marginBottom: 4, marginTop: 12 },
  input: { borderWidth: 1, borderColor: "#ddd", borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10 },
  saveButton: { marginTop: 24, backgroundColor: "#1f6feb", borderRadius: 8, paddingVertical: 14, alignItems: "center" },
  saveButtonText: { color: "#fff", fontWeight: "600", fontSize: 16 },
});
