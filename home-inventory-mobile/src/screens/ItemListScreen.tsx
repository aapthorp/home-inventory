import React, { useState } from "react";
import { View, Text, FlatList, TextInput, Pressable, StyleSheet } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RootStackParamList } from "@/navigation/RootNavigator";
import { useItems } from "@/api/items";

type Props = NativeStackScreenProps<RootStackParamList, "ItemList">;

export default function ItemListScreen({ navigation }: Props) {
  const [query, setQuery] = useState("");
  const { data: items, isLoading, isError } = useItems({ query: query || undefined });

  return (
    <View style={styles.container}>
      <View style={styles.searchRow}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search name, brand, serial…"
          value={query}
          onChangeText={setQuery}
          returnKeyType="search"
        />
        <Pressable style={styles.scanButton} onPress={() => navigation.navigate("BarcodeScan")}>
          <Text style={styles.scanButtonText}>Scan</Text>
        </Pressable>
      </View>

      {isLoading && <Text style={styles.helperText}>Loading…</Text>}
      {isError && <Text style={styles.helperText}>Couldn't reach the server. Pull to retry.</Text>}
      {!isLoading && items?.length === 0 && (
        <Text style={styles.helperText}>No items yet — scan or add your first one.</Text>
      )}

      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Pressable
            style={styles.row}
            onPress={() => navigation.navigate("ItemDetail", { itemId: item.id })}
          >
            <Text style={styles.rowTitle}>{item.name}</Text>
            <Text style={styles.rowSubtitle}>
              {[item.brand, item.model].filter(Boolean).join(" · ") || "No brand/model set"}
            </Text>
          </Pressable>
        )}
      />

      <Pressable style={styles.fab} onPress={() => navigation.navigate("AddItem")}>
        <Text style={styles.fabText}>+</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  searchRow: { flexDirection: "row", padding: 12, gap: 8 },
  searchInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  scanButton: {
    backgroundColor: "#1f6feb",
    borderRadius: 8,
    paddingHorizontal: 14,
    justifyContent: "center",
  },
  scanButtonText: { color: "#fff", fontWeight: "600" },
  helperText: { textAlign: "center", color: "#666", marginTop: 24 },
  row: { paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: "#eee" },
  rowTitle: { fontSize: 16, fontWeight: "500" },
  rowSubtitle: { fontSize: 13, color: "#777", marginTop: 2 },
  fab: {
    position: "absolute",
    right: 20,
    bottom: 28,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#1f6feb",
    alignItems: "center",
    justifyContent: "center",
    elevation: 4,
  },
  fabText: { color: "#fff", fontSize: 28, lineHeight: 28 },
});
