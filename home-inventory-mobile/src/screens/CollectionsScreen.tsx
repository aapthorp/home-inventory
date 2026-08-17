import React from "react";
import { View, Text, StyleSheet } from "react-native";

// Placeholder — wire up to GET /collections and CollectionItem membership
// once the backend endpoint exists (see architecture doc, section 4).
export default function CollectionsScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Collections (e.g. "Vinyl records", "Marvel Blu-rays") will list here,
        independent of item location. Not yet wired to the API.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24 },
  text: { textAlign: "center", color: "#666" },
});
