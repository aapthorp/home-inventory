import React, { useState } from "react";
import { View, Text, TextInput, Pressable, FlatList, StyleSheet, Alert } from "react-native";
import { collectionHooks } from "@/api/resources";
import type { CollectionType } from "@/types/inventory";

const TYPE_OPTIONS: { value: CollectionType | null; label: string }[] = [
  { value: null, label: "No type" },
  { value: "MUSIC", label: "Music" },
  { value: "VIDEO", label: "Video" },
  { value: "BOOKS", label: "Books" },
  { value: "GENERAL", label: "General" },
];

export default function CollectionsScreen() {
  const { data: collections, isLoading } = collectionHooks.useList();
  const createCollection = collectionHooks.useCreate();
  const deleteCollection = collectionHooks.useDelete();

  const [name, setName] = useState("");
  const [type, setType] = useState<CollectionType | null>(null);

  return (
    <View style={styles.container}>
      <View style={styles.addSection}>
        <Text style={styles.helperText}>
          Cuts across locations — e.g. "Vinyl records" regardless of where each item physically lives.
        </Text>
        <TextInput style={styles.input} placeholder="Collection name" value={name} onChangeText={setName} />
        <View style={styles.chipRow}>
          {TYPE_OPTIONS.map((opt) => (
            <Pressable
              key={opt.label}
              style={[styles.chip, type === opt.value && styles.chipSelected]}
              onPress={() => setType(opt.value)}
            >
              <Text style={[styles.chipText, type === opt.value && styles.chipTextSelected]}>{opt.label}</Text>
            </Pressable>
          ))}
        </View>
        <Pressable
          style={styles.addButton}
          onPress={() => {
            if (!name.trim()) return;
            createCollection.mutate({ name: name.trim(), description: null, type });
            setName("");
            setType(null);
          }}
        >
          <Text style={styles.addButtonText}>Add collection</Text>
        </Pressable>
      </View>

      {isLoading && <Text style={styles.helperText}>Loading…</Text>}
      <FlatList
        data={collections ?? []}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Text style={styles.rowName}>{item.name}</Text>
              {item.type && <Text style={styles.rowMeta}>{item.type.toLowerCase()}</Text>}
            </View>
            <Pressable
              onPress={() =>
                Alert.alert("Delete collection?", `Items in "${item.name}" are unaffected, just ungrouped.`, [
                  { text: "Cancel", style: "cancel" },
                  { text: "Delete", style: "destructive", onPress: () => deleteCollection.mutate(item.id) },
                ])
              }
            >
              <Text style={styles.deleteText}>Delete</Text>
            </Pressable>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  addSection: { padding: 16, borderBottomWidth: 1, borderBottomColor: "#eee" },
  helperText: { color: "#888", fontSize: 13, marginBottom: 10 },
  input: { borderWidth: 1, borderColor: "#ddd", borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, marginBottom: 10 },
  chipRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 12 },
  chip: { borderWidth: 1, borderColor: "#ddd", borderRadius: 16, paddingHorizontal: 12, paddingVertical: 6 },
  chipSelected: { backgroundColor: "#1f6feb", borderColor: "#1f6feb" },
  chipText: { fontSize: 13, color: "#333" },
  chipTextSelected: { color: "#fff", fontWeight: "600" },
  addButton: { backgroundColor: "#1f6feb", borderRadius: 8, paddingVertical: 12, alignItems: "center" },
  addButtonText: { color: "#fff", fontWeight: "600" },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  rowName: { fontSize: 15, fontWeight: "500" },
  rowMeta: { fontSize: 12, color: "#999", marginTop: 2 },
  deleteText: { color: "#d1453b", fontSize: 13 },
});
