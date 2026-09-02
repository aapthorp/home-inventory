import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  StyleSheet,
  Alert,
} from "react-native";
import axios from "axios";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { ItemsStackParamList } from "@/navigation/RootNavigator";
import { useCreateItem, useItem, useUpdateItem, useDeleteItem } from "@/api/items";
import { locationHooks, categoryHooks, collectionHooks } from "@/api/resources";
import { useItemTypes } from "@/api/itemTypes";
import { useBarcodeLookup } from "@/api/barcode";
import { flattenForPicker } from "@/utils/tree";
import PickerModal from "@/components/PickerModal";
import TypeDetailsForm from "@/components/TypeDetailsForm";
import AttachmentsPanel from "@/components/AttachmentsPanel";
import type { ItemCondition, ItemDraft, ItemStatus, ItemTypeCode } from "@/types/inventory";

type Props = NativeStackScreenProps<ItemsStackParamList, "ItemForm">;

const CONDITIONS: ItemCondition[] = ["NEW", "GOOD", "FAIR", "POOR"];
const STATUSES: ItemStatus[] = ["OWNED", "LOANED_OUT", "SOLD", "DISPOSED", "LOST"];

const emptyDraft: ItemDraft = {
  itemType: "GENERIC",
  name: "",
  description: null,
  categoryId: null,
  locationId: null,
  ownerUserId: null,
  barcode: null,
  brand: null,
  model: null,
  serialNumber: null,
  condition: "GOOD",
  quantity: 1,
  purchaseDate: null,
  purchasePrice: null,
  currency: null,
  currentEstimatedValue: null,
  warrantyExpiryDate: null,
  status: "OWNED",
  notes: null,
  tags: [],
  collectionIds: [],
  details: {},
};

export default function ItemFormScreen({ route, navigation }: Props) {
  const itemId = route.params?.itemId;
  const isEditing = !!itemId;
  const prefill = route.params?.prefill;

  const { data: existingItem } = useItem(itemId);
  const { data: locations } = locationHooks.useList();
  const { data: categories } = categoryHooks.useList();
  const { data: collections } = collectionHooks.useList();
  const { data: itemTypes } = useItemTypes();

  const createItem = useCreateItem();
  const updateItem = useUpdateItem(itemId ?? "");
  const deleteItem = useDeleteItem();
  const barcodeLookup = useBarcodeLookup();

  const [form, setForm] = useState<ItemDraft>({
    ...emptyDraft,
    barcode: prefill?.barcode ?? null,
    brand: prefill?.brand ?? null,
    name: prefill?.name ?? "",
  });
  const [tagsInput, setTagsInput] = useState("");
  const [locationPickerOpen, setLocationPickerOpen] = useState(false);
  const [categoryPickerOpen, setCategoryPickerOpen] = useState(false);

  useEffect(() => {
    navigation.setOptions({ title: isEditing ? "Edit item" : "Add item" });
  }, [isEditing, navigation]);

  useEffect(() => {
    if (existingItem) {
      const { id: _id, createdAt: _c, updatedAt: _u, ...rest } = existingItem;
      setForm(rest);
      setTagsInput(existingItem.tags.join(", "));
    }
  }, [existingItem]);

  const locationOptions = useMemo(
    () => (locations ? flattenForPicker(locations, (l) => l.parentLocationId) : []),
    [locations]
  );
  const categoryOptions = useMemo(
    () => (categories ? flattenForPicker(categories, (c) => c.parentCategoryId) : []),
    [categories]
  );
  const selectedLocationLabel = locationOptions.find((o) => o.id === form.locationId)?.label ?? "Unassigned";
  const selectedCategoryLabel = categoryOptions.find((o) => o.id === form.categoryId)?.label ?? "Unassigned";
  const currentTypeSchema = itemTypes?.find((t) => t.code === form.itemType);

  function field<K extends keyof ItemDraft>(key: K, value: ItemDraft[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function handleTypeChange(itemType: ItemTypeCode) {
    setForm((prev) => ({ ...prev, itemType, details: {} }));
  }

  function detailField(key: string, value: unknown) {
    setForm((prev) => ({ ...prev, details: { ...prev.details, [key]: value } }));
  }

  function toggleCollection(collectionId: string) {
    setForm((prev) => ({
      ...prev,
      collectionIds: prev.collectionIds.includes(collectionId)
        ? prev.collectionIds.filter((c) => c !== collectionId)
        : [...prev.collectionIds, collectionId],
    }));
  }

  async function handleBarcodeLookup() {
    if (!form.barcode) return;
    try {
      const result = await barcodeLookup.mutateAsync(form.barcode);
      setForm((prev) => ({
        ...prev,
        brand: result.brand ?? prev.brand,
        name: prev.name || result.name || prev.name,
      }));
    } catch (error) {
      console.warn("Barcode lookup failed (product not found or lookup unavailable):", error);
    }
  }

  async function handleSave() {
    if (!form.name.trim()) {
      Alert.alert("Name required", "Give the item a name before saving.");
      return;
    }
    const payload: ItemDraft = {
      ...form,
      tags: tagsInput.split(",").map((t) => t.trim()).filter(Boolean),
    };
    try {
      if (isEditing) {
        await updateItem.mutateAsync(payload);
      } else {
        await createItem.mutateAsync(payload);
      }
      navigation.goBack();
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error("Save item failed:", error.response?.status, error.response?.data);
      } else {
        console.error("Save item failed:", error);
      }
      Alert.alert("Couldn't save", "Check the Metro console for details — see server response status/data.");
    }
  }

  async function handleDelete() {
    if (!itemId) return;
    Alert.alert("Delete item?", `Delete "${form.name}"? This can't be undone from the app.`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          await deleteItem.mutateAsync(itemId);
          navigation.goBack();
        },
      },
    ]);
  }

  const barcodeHint =
    form.itemType === "BOOK"
      ? " (usually = ISBN-13)"
      : form.itemType === "MUSIC_ALBUM" || form.itemType === "FILM"
        ? " (usually = UPC/EAN)"
        : "";

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 16 }}>
      <Text style={styles.label}>Name *</Text>
      <TextInput style={styles.input} value={form.name} onChangeText={(v) => field("name", v)} />

      <Text style={styles.label}>Item type</Text>
      <View style={styles.chipRow}>
        {(itemTypes ?? []).map((t) => (
          <Pressable
            key={t.code}
            style={[styles.chip, form.itemType === t.code && styles.chipSelected]}
            onPress={() => handleTypeChange(t.code)}
          >
            <Text style={[styles.chipText, form.itemType === t.code && styles.chipTextSelected]}>{t.label}</Text>
          </Pressable>
        ))}
      </View>

      <Text style={styles.label}>Barcode{barcodeHint}</Text>
      <View style={styles.rowInline}>
        <TextInput
          style={[styles.input, { flex: 1 }]}
          value={form.barcode ?? ""}
          onChangeText={(v) => field("barcode", v || null)}
        />
        <Pressable style={styles.secondaryButton} onPress={handleBarcodeLookup}>
          <Text style={styles.secondaryButtonText}>Look up</Text>
        </Pressable>
      </View>

      <Text style={styles.label}>Brand</Text>
      <TextInput style={styles.input} value={form.brand ?? ""} onChangeText={(v) => field("brand", v || null)} />

      <Text style={styles.label}>Model</Text>
      <TextInput style={styles.input} value={form.model ?? ""} onChangeText={(v) => field("model", v || null)} />

      <Text style={styles.label}>Serial number</Text>
      <TextInput
        style={styles.input}
        value={form.serialNumber ?? ""}
        onChangeText={(v) => field("serialNumber", v || null)}
      />

      <Text style={styles.label}>Location</Text>
      <Pressable style={styles.pickerButton} onPress={() => setLocationPickerOpen(true)}>
        <Text style={styles.pickerButtonText}>{selectedLocationLabel}</Text>
      </Pressable>

      <Text style={styles.label}>Category</Text>
      <Pressable style={styles.pickerButton} onPress={() => setCategoryPickerOpen(true)}>
        <Text style={styles.pickerButtonText}>{selectedCategoryLabel}</Text>
      </Pressable>

      <Text style={styles.label}>Condition</Text>
      <View style={styles.chipRow}>
        {CONDITIONS.map((c) => (
          <Pressable key={c} style={[styles.chip, form.condition === c && styles.chipSelected]} onPress={() => field("condition", c)}>
            <Text style={[styles.chipText, form.condition === c && styles.chipTextSelected]}>{c.toLowerCase()}</Text>
          </Pressable>
        ))}
      </View>

      <Text style={styles.label}>Status</Text>
      <View style={styles.chipRow}>
        {STATUSES.map((s) => (
          <Pressable key={s} style={[styles.chip, form.status === s && styles.chipSelected]} onPress={() => field("status", s)}>
            <Text style={[styles.chipText, form.status === s && styles.chipTextSelected]}>
              {s.toLowerCase().replace("_", " ")}
            </Text>
          </Pressable>
        ))}
      </View>

      {currentTypeSchema && currentTypeSchema.fields.length > 0 && (
        <>
          <Text style={styles.sectionLabel}>{currentTypeSchema.label} details</Text>
          <TypeDetailsForm fields={currentTypeSchema.fields} values={form.details} onChange={detailField} />
        </>
      )}

      <Text style={styles.label}>Quantity</Text>
      <TextInput
        style={styles.input}
        keyboardType="numeric"
        value={String(form.quantity)}
        onChangeText={(v) => field("quantity", v ? Number(v) : 1)}
      />

      <Text style={styles.label}>Purchase date (YYYY-MM-DD)</Text>
      <TextInput
        style={styles.input}
        value={form.purchaseDate ?? ""}
        onChangeText={(v) => field("purchaseDate", v || null)}
        placeholder="2026-01-15"
      />

      <View style={styles.rowInline}>
        <View style={{ flex: 1 }}>
          <Text style={styles.label}>Purchase price</Text>
          <TextInput
            style={styles.input}
            keyboardType="numeric"
            value={form.purchasePrice != null ? String(form.purchasePrice) : ""}
            onChangeText={(v) => field("purchasePrice", v ? Number(v) : null)}
          />
        </View>
        <View style={{ width: 90 }}>
          <Text style={styles.label}>Currency</Text>
          <TextInput
            style={styles.input}
            placeholder="USD"
            value={form.currency ?? ""}
            onChangeText={(v) => field("currency", v || null)}
          />
        </View>
      </View>

      <Text style={styles.label}>Current estimated value</Text>
      <TextInput
        style={styles.input}
        keyboardType="numeric"
        value={form.currentEstimatedValue != null ? String(form.currentEstimatedValue) : ""}
        onChangeText={(v) => field("currentEstimatedValue", v ? Number(v) : null)}
      />

      <Text style={styles.label}>Warranty expiry (YYYY-MM-DD)</Text>
      <TextInput
        style={styles.input}
        value={form.warrantyExpiryDate ?? ""}
        onChangeText={(v) => field("warrantyExpiryDate", v || null)}
      />

      <Text style={styles.label}>Tags (comma separated)</Text>
      <TextInput style={styles.input} value={tagsInput} onChangeText={setTagsInput} />

      {collections && collections.length > 0 && (
        <>
          <Text style={styles.label}>Collections</Text>
          <View style={styles.chipRow}>
            {collections.map((c) => (
              <Pressable
                key={c.id}
                style={[styles.chip, form.collectionIds.includes(c.id) && styles.chipSelected]}
                onPress={() => toggleCollection(c.id)}
              >
                <Text style={[styles.chipText, form.collectionIds.includes(c.id) && styles.chipTextSelected]}>
                  {c.name}
                </Text>
              </Pressable>
            ))}
          </View>
        </>
      )}

      <Text style={styles.label}>Notes</Text>
      <TextInput
        style={[styles.input, styles.textArea]}
        multiline
        value={form.notes ?? ""}
        onChangeText={(v) => field("notes", v || null)}
      />

      <Pressable style={styles.saveButton} onPress={handleSave} disabled={createItem.isPending || updateItem.isPending}>
        <Text style={styles.saveButtonText}>
          {createItem.isPending || updateItem.isPending ? "Saving…" : "Save item"}
        </Text>
      </Pressable>

      {isEditing && (
        <Pressable style={styles.deleteButton} onPress={handleDelete}>
          <Text style={styles.deleteButtonText}>Delete item</Text>
        </Pressable>
      )}

      {isEditing && itemId ? (
        <AttachmentsPanel itemId={itemId} />
      ) : (
        <Text style={styles.helperText}>Save the item first to add photos and other attachments.</Text>
      )}

      <PickerModal
        visible={locationPickerOpen}
        title="Select location"
        options={locationOptions}
        selectedId={form.locationId}
        onSelect={(id) => field("locationId", id)}
        onClose={() => setLocationPickerOpen(false)}
      />
      <PickerModal
        visible={categoryPickerOpen}
        title="Select category"
        options={categoryOptions}
        selectedId={form.categoryId}
        onSelect={(id) => field("categoryId", id)}
        onClose={() => setCategoryPickerOpen(false)}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  label: { fontSize: 13, color: "#666", marginTop: 14, marginBottom: 4 },
  sectionLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: "#333",
    textTransform: "uppercase",
    marginTop: 20,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
  input: { borderWidth: 1, borderColor: "#ddd", borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10 },
  textArea: { minHeight: 80, textAlignVertical: "top" },
  rowInline: { flexDirection: "row", gap: 8, alignItems: "flex-end" },
  secondaryButton: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    paddingHorizontal: 14,
    justifyContent: "center",
  },
  secondaryButtonText: { fontWeight: "600", color: "#333" },
  pickerButton: { borderWidth: 1, borderColor: "#ddd", borderRadius: 8, paddingHorizontal: 12, paddingVertical: 12 },
  pickerButtonText: { fontSize: 15 },
  chipRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: { borderWidth: 1, borderColor: "#ddd", borderRadius: 16, paddingHorizontal: 12, paddingVertical: 6 },
  chipSelected: { backgroundColor: "#1f6feb", borderColor: "#1f6feb" },
  chipText: { fontSize: 13, color: "#333" },
  chipTextSelected: { color: "#fff", fontWeight: "600" },
  saveButton: { marginTop: 24, backgroundColor: "#1f6feb", borderRadius: 8, paddingVertical: 14, alignItems: "center" },
  saveButtonText: { color: "#fff", fontWeight: "600", fontSize: 16 },
  deleteButton: { marginTop: 12, borderWidth: 1, borderColor: "#d1453b", borderRadius: 8, paddingVertical: 12, alignItems: "center" },
  deleteButtonText: { color: "#d1453b", fontWeight: "600" },
  helperText: { color: "#888", fontSize: 13, marginTop: 16, textAlign: "center" },
});
