import React from "react";
import { ScrollView, Text, StyleSheet, Alert } from "react-native";
import { categoryHooks } from "@/api/resources";
import TreeManager from "@/components/TreeManager";

export default function CategoriesScreen() {
  const { data: categories, isLoading } = categoryHooks.useList();
  const createCategory = categoryHooks.useCreate();
  const updateCategory = categoryHooks.useUpdate();
  const deleteCategory = categoryHooks.useDelete();

  if (isLoading) return <Text style={styles.helperText}>Loading…</Text>;

  const items = (categories ?? []).map((c) => ({
    id: c.id,
    name: c.name,
    parentId: c.parentCategoryId,
  }));

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 16 }}>
      <Text style={styles.helperText}>e.g. Electronics → Audio → Headphones.</Text>
      <TreeManager
        items={items}
        addRootLabel="New top-level category…"
        onAddRoot={(name) => createCategory.mutate({ name, parentCategoryId: null })}
        onAddChild={(parentId, name) => createCategory.mutate({ name, parentCategoryId: parentId })}
        onRename={(id, name) => {
          const existing = categories?.find((c) => c.id === id);
          if (!existing) return;
          updateCategory.mutate({ id, payload: { name, parentCategoryId: existing.parentCategoryId } });
        }}
        onDelete={(id) =>
          Alert.alert("Delete category?", "Items assigned to it will keep a reference that no longer resolves.", [
            { text: "Cancel", style: "cancel" },
            { text: "Delete", style: "destructive", onPress: () => deleteCategory.mutate(id) },
          ])
        }
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  helperText: { color: "#888", fontSize: 13, marginBottom: 12 },
});
