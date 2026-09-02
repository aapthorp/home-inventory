import React, { useEffect, useMemo } from "react";
import { View, Text, Image, ScrollView, Pressable, StyleSheet } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { ItemsStackParamList } from "@/navigation/RootNavigator";
import { useItem } from "@/api/items";
import { useAttachments } from "@/api/attachments";
import { useItemTypes } from "@/api/itemTypes";
import { locationHooks, categoryHooks } from "@/api/resources";

type Props = NativeStackScreenProps<ItemsStackParamList, "ItemDetail">;

export default function ItemDetailScreen({ route, navigation }: Props) {
  const { itemId } = route.params;
  const { data: item, isLoading, isError } = useItem(itemId);
  const { data: attachments } = useAttachments(itemId);
  const { data: itemTypes } = useItemTypes();
  const { data: locations } = locationHooks.useList();
  const { data: categories } = categoryHooks.useList();

  const typeSchema = itemTypes?.find((t) => t.code === item?.itemType);
  const locationName = useMemo(
    () => locations?.find((l) => l.id === item?.locationId)?.name,
    [locations, item?.locationId]
  );
  const categoryName = useMemo(
    () => categories?.find((c) => c.id === item?.categoryId)?.name,
    [categories, item?.categoryId]
  );

  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <Pressable onPress={() => navigation.navigate("ItemForm", { itemId })}>
          <Text style={styles.editLink}>Edit</Text>
        </Pressable>
      ),
    });
  }, [navigation, itemId]);

  if (isLoading) return <Centered text="Loading…" />;
  if (isError || !item) return <Centered text="Couldn't load this item." />;

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 16 }}>
      <Text style={styles.title}>{item.name}</Text>
      {item.itemType !== "GENERIC" && (
        <Text style={styles.typeBadge}>{typeSchema?.label ?? item.itemType}</Text>
      )}
      {item.description && <Text style={styles.description}>{item.description}</Text>}

      <Field label="Location" value={locationName ?? "—"} />
      <Field label="Category" value={categoryName ?? "—"} />
      <Field label="Brand / Model" value={[item.brand, item.model].filter(Boolean).join(" ") || "—"} />
      <Field label="Serial number" value={item.serialNumber ?? "—"} />
      <Field label="Condition" value={item.condition.toLowerCase()} />
      <Field label="Status" value={item.status.toLowerCase().replace("_", " ")} />
      <Field label="Quantity" value={String(item.quantity)} />
      <Field
        label="Purchase"
        value={
          item.purchaseDate
            ? `${item.purchaseDate}${item.purchasePrice ? ` · ${item.purchasePrice} ${item.currency ?? ""}` : ""}`
            : "—"
        }
      />
      <Field label="Warranty expiry" value={item.warrantyExpiryDate ?? "—"} />
      <Field label="Estimated value" value={item.currentEstimatedValue ? String(item.currentEstimatedValue) : "—"} />
      {item.notes && <Field label="Notes" value={item.notes} />}
      {item.tags.length > 0 && <Field label="Tags" value={item.tags.join(", ")} />}

      {typeSchema && typeSchema.fields.length > 0 && (
        <>
          <Text style={styles.sectionLabel}>{typeSchema.label} details</Text>
          {typeSchema.fields.map((f) => {
            const value = item.details[f.key];
            if (value == null || value === "") return null;
            return <Field key={f.key} label={f.label} value={String(value)} />;
          })}
        </>
      )}

      {attachments && attachments.length > 0 && (
        <>
          <Text style={styles.sectionLabel}>Photos & attachments</Text>
          <View style={styles.attachmentGrid}>
            {attachments.map((a) =>
              a.contentType?.startsWith("image/") && a.downloadUrl ? (
                <Image key={a.id} source={{ uri: a.downloadUrl }} style={styles.thumb} />
              ) : (
                <View key={a.id} style={[styles.thumb, styles.thumbFile]}>
                  <Text style={styles.thumbFileText}>{a.type.replace("_", " ")}</Text>
                </View>
              )
            )}
          </View>
        </>
      )}
    </ScrollView>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <Text style={styles.fieldValue}>{value}</Text>
    </View>
  );
}

function Centered({ text }: { text: string }) {
  return (
    <View style={styles.centered}>
      <Text>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  title: { fontSize: 22, fontWeight: "700", marginBottom: 4 },
  typeBadge: {
    alignSelf: "flex-start",
    fontSize: 11,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    color: "#1f6feb",
    backgroundColor: "#eaf1fd",
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginBottom: 10,
  },
  description: { fontSize: 15, color: "#555", marginBottom: 16 },
  field: { marginBottom: 12 },
  fieldLabel: { fontSize: 12, color: "#888", textTransform: "uppercase" },
  fieldValue: { fontSize: 16, marginTop: 2 },
  sectionLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: "#333",
    textTransform: "uppercase",
    marginTop: 12,
    marginBottom: 10,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
  attachmentGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  thumb: { width: 90, height: 90, borderRadius: 8, backgroundColor: "#eee" },
  thumbFile: { alignItems: "center", justifyContent: "center" },
  thumbFileText: { fontSize: 10, color: "#888", textTransform: "uppercase", textAlign: "center" },
  centered: { flex: 1, alignItems: "center", justifyContent: "center" },
  editLink: { color: "#1f6feb", fontWeight: "600", fontSize: 16, marginRight: 4 },
});
