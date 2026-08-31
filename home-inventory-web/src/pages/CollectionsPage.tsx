import React, { useState } from "react";
import { collectionHooks } from "@/api/resources";
import type { CollectionType } from "@/types/inventory";

export default function CollectionsPage() {
  const { data: collections, isLoading } = collectionHooks.useList();
  const createCollection = collectionHooks.useCreate();
  const updateCollection = collectionHooks.useUpdate();
  const deleteCollection = collectionHooks.useDelete();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState<CollectionType | "">("");

  if (isLoading) return <p className="helper-text">Loading…</p>;

  return (
    <div>
      <div className="page-header">
        <h1>Collections</h1>
      </div>
      <p className="helper-text">
        Cuts across locations — e.g. "Vinyl records" or "Marvel Blu-rays" regardless of where each item physically
        lives. Assign items to collections from the item's edit form.
      </p>

      <div className="filter-bar">
        <input className="input" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />
        <input
          className="input"
          placeholder="Description (optional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <select className="select" value={type} onChange={(e) => setType(e.target.value as CollectionType | "")}>
          <option value="">No type</option>
          <option value="MUSIC">Music</option>
          <option value="VIDEO">Video</option>
          <option value="BOOKS">Books</option>
          <option value="GENERAL">General</option>
        </select>
        <button
          className="button-primary"
          onClick={() => {
            if (!name.trim()) return;
            createCollection.mutate({ name: name.trim(), description: description || null, type: type || null });
            setName("");
            setDescription("");
            setType("");
          }}
        >
          Add collection
        </button>
      </div>

      <table className="table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Description</th>
            <th>Type</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {(collections ?? []).map((c) => (
            <tr key={c.id}>
              <td>{c.name}</td>
              <td>{c.description ?? "—"}</td>
              <td>{c.type ? c.type.toLowerCase() : "—"}</td>
              <td>
                <button
                  className="link-button link-button-danger"
                  onClick={() => {
                    if (confirm(`Delete "${c.name}"? Items in it are unaffected, just ungrouped.`)) {
                      deleteCollection.mutate(c.id);
                    }
                  }}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
