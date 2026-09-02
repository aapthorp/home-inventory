import React from "react";
import { Modal, View, Text, Pressable, FlatList, StyleSheet } from "react-native";

export interface PickerOption {
  id: string;
  label: string;
  depth: number;
}

interface Props {
  visible: boolean;
  title: string;
  options: PickerOption[];
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  onClose: () => void;
}

export default function PickerModal({ visible, title, options, selectedId, onSelect, onClose }: Props) {
  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>{title}</Text>
          <Pressable onPress={onClose}>
            <Text style={styles.closeButton}>Done</Text>
          </Pressable>
        </View>
        <FlatList
          data={[{ id: "", label: "Unassigned", depth: 0 } as PickerOption, ...options]}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <Pressable
              style={[styles.row, { paddingLeft: 16 + item.depth * 20 }]}
              onPress={() => {
                onSelect(item.id || null);
                onClose();
              }}
            >
              <Text style={[styles.rowText, (selectedId ?? "") === item.id && styles.rowTextSelected]}>
                {item.label}
              </Text>
              {(selectedId ?? "") === item.id && <Text style={styles.checkmark}>✓</Text>}
            </Pressable>
          )}
        />
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", paddingTop: 50 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  title: { fontSize: 18, fontWeight: "700" },
  closeButton: { color: "#1f6feb", fontSize: 16, fontWeight: "600" },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 14,
    paddingRight: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  rowText: { fontSize: 16 },
  rowTextSelected: { color: "#1f6feb", fontWeight: "600" },
  checkmark: { color: "#1f6feb", fontSize: 16, fontWeight: "700" },
});
