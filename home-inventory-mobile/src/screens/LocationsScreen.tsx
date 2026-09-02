import React from "react";
import { ScrollView, Text, StyleSheet, Alert } from "react-native";
import { locationHooks } from "@/api/resources";
import TreeManager from "@/components/TreeManager";

export default function LocationsScreen() {
  const { data: locations, isLoading } = locationHooks.useList();
  const createLocation = locationHooks.useCreate();
  const updateLocation = locationHooks.useUpdate();
  const deleteLocation = locationHooks.useDelete();

  if (isLoading) return <Text style={styles.helperText}>Loading…</Text>;

  const items = (locations ?? []).map((l) => ({
    id: l.id,
    name: l.name,
    parentId: l.parentLocationId,
    extra: l.type.toLowerCase(),
  }));

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 16 }}>
      <Text style={styles.helperText}>
        Rooms, shelves, and boxes — nest freely (House → Garage → Shelf 3 → Box B).
      </Text>
      <TreeManager
        items={items}
        addRootLabel="New room…"
        onAddRoot={(name) => createLocation.mutate({ name, parentLocationId: null, type: "ROOM" })}
        onAddChild={(parentId, name) => createLocation.mutate({ name, parentLocationId: parentId, type: "CONTAINER" })}
        onRename={(id, name) => {
          const existing = locations?.find((l) => l.id === id);
          if (!existing) return;
          updateLocation.mutate({ id, payload: { name, parentLocationId: existing.parentLocationId, type: existing.type } });
        }}
        onDelete={(id) =>
          Alert.alert("Delete location?", "Items assigned to it will keep a reference that no longer resolves.", [
            { text: "Cancel", style: "cancel" },
            { text: "Delete", style: "destructive", onPress: () => deleteLocation.mutate(id) },
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
