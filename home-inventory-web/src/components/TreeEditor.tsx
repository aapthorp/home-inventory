import React, { useState } from "react";
import { buildTree, TreeNode } from "@/utils/tree";

export interface FlatTreeItem {
  id: string;
  name: string;
  parentId: string | null;
  /** Optional extra content rendered next to the name, e.g. Location's type badge. */
  extra?: React.ReactNode;
}

interface TreeEditorProps {
  items: FlatTreeItem[];
  onAddRoot: (name: string) => void;
  onAddChild: (parentId: string, name: string) => void;
  onRename: (id: string, name: string) => void;
  onDelete: (id: string) => void;
  addRootLabel?: string;
}

export default function TreeEditor({ items, onAddRoot, onAddChild, onRename, onDelete, addRootLabel }: TreeEditorProps) {
  const tree = buildTree(items, (item) => item.parentId);
  const [newRootName, setNewRootName] = useState("");

  return (
    <div>
      <div className="tree-add-root">
        <input
          className="input"
          placeholder={addRootLabel ?? "New top-level item…"}
          value={newRootName}
          onChange={(e) => setNewRootName(e.target.value)}
        />
        <button
          className="button-secondary"
          onClick={() => {
            if (newRootName.trim()) {
              onAddRoot(newRootName.trim());
              setNewRootName("");
            }
          }}
        >
          Add
        </button>
      </div>

      <div className="tree">
        {tree.length === 0 && <p className="helper-text">Nothing here yet.</p>}
        {tree.map((node) => (
          <TreeRow key={node.item.id} node={node} depth={0} onAddChild={onAddChild} onRename={onRename} onDelete={onDelete} />
        ))}
      </div>
    </div>
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
    <div style={{ marginLeft: depth * 20 }}>
      <div className="tree-row">
        {editing ? (
          <>
            <input className="input" value={name} onChange={(e) => setName(e.target.value)} />
            <button
              className="button-secondary"
              onClick={() => {
                if (name.trim()) onRename(node.item.id, name.trim());
                setEditing(false);
              }}
            >
              Save
            </button>
            <button className="button-secondary" onClick={() => setEditing(false)}>
              Cancel
            </button>
          </>
        ) : (
          <>
            <span className="tree-row-name">{node.item.name}</span>
            {node.item.extra}
            <button className="link-button" onClick={() => setEditing(true)}>
              Rename
            </button>
            <button className="link-button" onClick={() => setAddingChild((v) => !v)}>
              Add child
            </button>
            <button className="link-button link-button-danger" onClick={() => onDelete(node.item.id)}>
              Delete
            </button>
          </>
        )}
      </div>

      {addingChild && (
        <div className="tree-add-child" style={{ marginLeft: 20 }}>
          <input className="input" value={childName} onChange={(e) => setChildName(e.target.value)} placeholder="Child name…" />
          <button
            className="button-secondary"
            onClick={() => {
              if (childName.trim()) {
                onAddChild(node.item.id, childName.trim());
                setChildName("");
                setAddingChild(false);
              }
            }}
          >
            Add
          </button>
        </div>
      )}

      {node.children.map((child) => (
        <TreeRow key={child.item.id} node={child} depth={depth + 1} onAddChild={onAddChild} onRename={onRename} onDelete={onDelete} />
      ))}
    </div>
  );
}
