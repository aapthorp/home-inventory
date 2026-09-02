import React from "react";
import { View, Text, TextInput, Pressable, StyleSheet } from "react-native";
import type { ItemTypeField } from "@/types/inventory";

interface Props {
  fields: ItemTypeField[];
  values: Record<string, unknown>;
  onChange: (key: string, value: unknown) => void;
}

/**
 * Deliberately knows nothing about "books" or "films" — renders whatever the
 * schema from GET /item-types says, same principle as the web app's
 * TypeDetailsForm. Adding a new item type needs no changes here.
 */
export default function TypeDetailsForm({ fields, values, onChange }: Props) {
  if (fields.length === 0) {
    return null;
  }

  return (
    <>
      {fields.map((field) => (
        <View key={field.key} style={styles.field}>
          <Text style={styles.label}>{field.label}</Text>
          {field.inputType === "select" && field.options ? (
            <View style={styles.chipRow}>
              {field.options.map((opt) => {
                const selected = values[field.key] === opt;
                return (
                  <Pressable
                    key={opt}
                    style={[styles.chip, selected && styles.chipSelected]}
                    onPress={() => onChange(field.key, selected ? null : opt)}
                  >
                    <Text style={[styles.chipText, selected && styles.chipTextSelected]}>{opt}</Text>
                  </Pressable>
                );
              })}
            </View>
          ) : (
            <TextInput
              style={styles.input}
              keyboardType={field.inputType === "number" ? "numeric" : "default"}
              value={values[field.key] != null ? String(values[field.key]) : ""}
              onChangeText={(text) =>
                onChange(field.key, field.inputType === "number" ? (text ? Number(text) : null) : text || null)
              }
            />
          )}
        </View>
      ))}
    </>
  );
}

const styles = StyleSheet.create({
  field: { marginBottom: 14 },
  label: { fontSize: 13, color: "#666", marginBottom: 4 },
  input: { borderWidth: 1, borderColor: "#ddd", borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10 },
  chipRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  chipSelected: { backgroundColor: "#1f6feb", borderColor: "#1f6feb" },
  chipText: { fontSize: 13, color: "#333" },
  chipTextSelected: { color: "#fff", fontWeight: "600" },
});
