import React, { useState } from "react";
import { View, Text, TextInput, Pressable, StyleSheet } from "react-native";
import { buildTree, TreeNode } from "@/utils/tree";

export interface FlatTreeItem {
  id: string;
  name: string;
  parentId: string | null;
  extra?: string;
}

interface Props {
  items: FlatTreeItem[];
  onAddRoot: (name: string) => void;
  onAddChild: (parentId: string, name: string) => void;
  onRename: (id: string, name: string) => void;
  onDelete: (id: string) => void;
  addRootLabel?: string;
}

export default function TreeManager({ items, onAddRoot, onAddChild, onRename, onDelete, addRootLabel }: Props) {
  const tree = buildTree(items, (item) => item.parentId);
  const [newRootName, setNewRootName] = useState("");

  return (
    <View>
      <View style={styles.addRow}>
        <TextInput
          style={styles.input}
          placeholder={addRootLabel ?? "New top-level item…"}
          value={newRootName}
          onChangeText={setNewRootName}
        />
        <Pressable
          style={styles.addButton}
          onPress={() => {
            if (newRootName.trim()) {
              onAddRoot(newRootName.trim());
              setNewRootName("");
            }
          }}
        >
          <Text style={styles.addButtonText}>Add</Text>
        </Pressable>
      </View>

      {tree.length === 0 && <Text style={styles.helperText}>Nothing here yet.</Text>}
      {tree.map((node) => (
        <TreeRow key={node.item.id} node={node} depth={0} onAddChild={onAddChild} onRename={onRename} onDelete={onDelete} />
      ))}
    </View>
  );
}

function TreeRow({
  node,
  depth,
  onAddChild,
  onRename,
  onDelete,
}: {
  node: TreeNode<FlatTreeItem>;
  depth: number;
  onAddChild: (parentId: string, name: string) => void;
  onRename: (id: string, name: string) => void;
  onDelete: (id: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(node.item.name);
  const [addingChild, setAddingChild] = useState(false);
  const [childName, setChildName] = useState("");

  return (
    <View style={{ marginLeft: depth * 16 }}>
      <View style={styles.row}>
        {editing ? (
          <>
            <TextInput style={[styles.input, styles.rowInput]} value={name} onChangeText={setName} />
            <Pressable
              onPress={() => {
                if (name.trim()) onRename(node.item.id, name.trim());
                setEditing(false);
              }}
            >
              <Text style={styles.linkText}>Save</Text>
            </Pressable>
          </>
        ) : (
          <>
            <Text style={styles.rowName}>
              {node.item.name}
              {node.item.extra ? <Text style={styles.rowExtra}>  {node.item.extra}</Text> : null}
            </Text>
            <Pressable onPress={() => setEditing(true)}>
              <Text style={styles.linkText}>Rename</Text>
            </Pressable>
            <Pressable onPress={() => setAddingChild((v) => !v)}>
              <Text style={styles.linkText}>+ Child</Text>
            </Pressable>
            <Pressable onPress={() => onDelete(node.item.id)}>
              <Text style={styles.linkTextDanger}>Delete</Text>
            </Pressable>
          </>
        )}
      </View>

      {addingChild && (
        <View style={[styles.addRow, { marginLeft: 16 }]}>
          <TextInput style={styles.input} placeholder="Child name…" value={childName} onChangeText={setChildName} />
          <Pressable
            style={styles.addButton}
            onPress={() => {
              if (childName.trim()) {
                onAddChild(node.item.id, childName.trim());
                setChildName("");
                setAddingChild(false);
              }
            }}
          >
            <Text style={styles.addButtonText}>Add</Text>
          </Pressable>
        </View>
      )}

      {node.children.map((child) => (
        <TreeRow key={child.item.id} node={child} depth={depth + 1} onAddChild={onAddChild} onRename={onRename} onDelete={onDelete} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  addRow: { flexDirection: "row", gap: 8, marginBottom: 14, alignItems: "center" },
  input: { flex: 1, borderWidth: 1, borderColor: "#ddd", borderRadius: 8, paddingHorizontal: 10, paddingVertical: 8 },
  rowInput: { flex: 1, marginRight: 8 },
  addButton: { backgroundColor: "#1f6feb", borderRadius: 8, paddingHorizontal: 14, paddingVertical: 8 },
  addButtonText: { color: "#fff", fontWeight: "600", fontSize: 13 },
  helperText: { color: "#888", fontSize: 13, marginBottom: 8 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  rowName: { flex: 1, fontSize: 15, fontWeight: "500" },
  rowExtra: { fontSize: 12, color: "#999", fontWeight: "400" },
  linkText: { color: "#1f6feb", fontSize: 13 },
  linkTextDanger: { color: "#d1453b", fontSize: 13 },
});
