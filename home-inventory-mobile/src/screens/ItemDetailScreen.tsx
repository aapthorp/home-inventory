import React from "react";
import { View, Text, ScrollView, StyleSheet } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RootStackParamList } from "@/navigation/RootNavigator";
import { useItem } from "@/api/items";

type Props = NativeStackScreenProps<RootStackParamList, "ItemDetail">;

export default function ItemDetailScreen({ route }: Props) {
  const { itemId } = route.params;
  const { data: item, isLoading, isError } = useItem(itemId);

  if (isLoading) return <Centered text="Loading…" />;
  if (isError || !item) return <Centered text="Couldn't load this item." />;

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 16 }}>
      <Text style={styles.title}>{item.name}</Text>
      {item.description && <Text style={styles.description}>{item.description}</Text>}

      <Field label="Brand / Model" value={[item.brand, item.model].filter(Boolean).join(" ") || "—"} />
      <Field label="Serial number" value={item.serialNumber ?? "—"} />
      <Field label="Condition" value={item.condition} />
      <Field label="Status" value={item.status} />
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
  description: { fontSize: 15, color: "#555", marginBottom: 16 },
  field: { marginBottom: 12 },
  fieldLabel: { fontSize: 12, color: "#888", textTransform: "uppercase" },
  fieldValue: { fontSize: 16, marginTop: 2 },
  centered: { flex: 1, alignItems: "center", justifyContent: "center" },
});
