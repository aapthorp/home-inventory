import React, { useState } from "react";
import { View, Text, TextInput, Pressable, StyleSheet, ScrollView, Alert } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RootStackParamList } from "@/navigation/RootNavigator";
import { useCreateItem } from "@/api/items";
import type { ItemDraft } from "@/types/inventory";

type Props = NativeStackScreenProps<RootStackParamList, "AddItem">;

export default function AddItemScreen({ route, navigation }: Props) {
  const prefill = route.params?.prefill;
  const [name, setName] = useState(prefill?.name ?? "");
  const [brand, setBrand] = useState(prefill?.brand ?? "");
  const [barcode] = useState(prefill?.barcode ?? "");
  const createItem = useCreateItem();

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert("Name required", "Give the item a name before saving.");
      return;
    }
    const draft: ItemDraft = {
      name: name.trim(),
      description: null,
      categoryId: null,
      locationId: null,
      ownerUserId: null,
      barcode: barcode || null,
      brand: brand || null,
      model: null,
      serialNumber: null,
      condition: "good",
      quantity: 1,
      purchaseDate: null,
      purchasePrice: null,
      currency: null,
      currentEstimatedValue: null,
      warrantyExpiryDate: null,
      status: "owned",
      notes: null,
    };
    try {
      await createItem.mutateAsync(draft);
      navigation.goBack();
    } catch {
      Alert.alert("Couldn't save", "Check your connection and try again.");
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 16 }}>
      <Text style={styles.label}>Name</Text>
      <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="e.g. Cordless drill" />

      <Text style={styles.label}>Brand</Text>
      <TextInput style={styles.input} value={brand} onChangeText={setBrand} placeholder="e.g. Bosch" />

      {barcode ? <Text style={styles.helper}>Barcode: {barcode}</Text> : null}

      <Text style={styles.helper}>
        Location, category, and photos are left for the full edit screen — this is a minimal MVP form to
        get an item saved fast.
      </Text>

      <Pressable style={styles.saveButton} onPress={handleSave} disabled={createItem.isPending}>
        <Text style={styles.saveButtonText}>{createItem.isPending ? "Saving…" : "Save item"}</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  label: { fontSize: 13, color: "#666", marginTop: 12, marginBottom: 4 },
  input: { borderWidth: 1, borderColor: "#ddd", borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10 },
  helper: { fontSize: 12, color: "#888", marginTop: 12 },
  saveButton: {
    marginTop: 24,
    backgroundColor: "#1f6feb",
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: "center",
  },
  saveButtonText: { color: "#fff", fontWeight: "600", fontSize: 16 },
});
