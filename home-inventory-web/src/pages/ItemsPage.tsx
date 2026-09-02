import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useItems } from "@/api/items";
import { locationHooks, categoryHooks, collectionHooks } from "@/api/resources";
import { buildTree } from "@/utils/tree";
import type { Location, Category } from "@/types/inventory";

/** Renders a select option list with indentation reflecting tree depth. */
function flattenForSelect<T extends { id: string; name: string }>(
  items: T[],
  getParentId: (item: T) => string | null
): { id: string; label: string }[] {
  const tree = buildTree(items, getParentId);
  const result: { id: string; label: string }[] = [];
  function walk(nodes: typeof tree, depth: number) {
    for (const node of nodes) {
      result.push({ id: node.item.id, label: `${"—".repeat(depth)} ${node.item.name}`.trim() });
      walk(node.children, depth + 1);
    }
  }
  walk(tree, 0);
  return result;
}

export default function ItemsPage() {
  const [query, setQuery] = useState("");
  const [locationId, setLocationId] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [collectionId, setCollectionId] = useState("");

  const { data: locations } = locationHooks.useList();
  const { data: categories } = categoryHooks.useList();
  const { data: collections } = collectionHooks.useList();

  const { data: items, isLoading, isError } = useItems({
    query: query || undefined,
    locationId: locationId || undefined,
    categoryId: categoryId || undefined,
    collectionId: collectionId || undefined,
  });

  const locationOptions = useMemo(
    () => (locations ? flattenForSelect<Location>(locations, (l) => l.parentLocationId) : []),
    [locations]
  );
  const categoryOptions = useMemo(
    () => (categories ? flattenForSelect<Category>(categories, (c) => c.parentCategoryId) : []),
    [categories]
  );

  const locationById = useMemo(() => new Map((locations ?? []).map((l) => [l.id, l.name])), [locations]);
  const categoryById = useMemo(() => new Map((categories ?? []).map((c) => [c.id, c.name])), [categories]);

  return (
    <div>
      <div className="page-header">
        <h1>Items</h1>
        <Link to="/items/new" className="button-primary">
          + Add item
        </Link>
      </div>

      <div className="filter-bar">
        <input
          className="input"
          placeholder="Search name, brand, serial…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <select className="select" value={locationId} onChange={(e) => setLocationId(e.target.value)}>
          <option value="">All locations</option>
          {locationOptions.map((opt) => (
            <option key={opt.id} value={opt.id}>
              {opt.label}
            </option>
          ))}
        </select>
        <select className="select" value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
          <option value="">All categories</option>
          {categoryOptions.map((opt) => (
            <option key={opt.id} value={opt.id}>
              {opt.label}
            </option>
          ))}
        </select>
        <select className="select" value={collectionId} onChange={(e) => setCollectionId(e.target.value)}>
          <option value="">All collections</option>
          {(collections ?? []).map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      {isLoading && <p className="helper-text">Loading…</p>}
      {isError && <p className="helper-text">Couldn't reach the server.</p>}
      {!isLoading && items?.length === 0 && <p className="helper-text">No items match these filters.</p>}

      {items && items.length > 0 && (
        <table className="table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Type</th>
              <th>Brand / Model</th>
              <th>Location</th>
              <th>Category</th>
              <th>Status</th>
              <th>Condition</th>
              <th>Qty</th>
              <th>Value</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id}>
                <td>
                  <Link to={`/items/${item.id}`}>{item.name}</Link>
                </td>
                <td>{item.itemType === "GENERIC" ? "—" : item.itemType.replace("_", " ").toLowerCase()}</td>
                <td>{[item.brand, item.model].filter(Boolean).join(" ") || "—"}</td>
                <td>{item.locationId ? locationById.get(item.locationId) ?? "—" : "—"}</td>
                <td>{item.categoryId ? categoryById.get(item.categoryId) ?? "—" : "—"}</td>
                <td>{item.status.toLowerCase().replace("_", " ")}</td>
                <td>{item.condition.toLowerCase()}</td>
                <td>{item.quantity}</td>
                <td>{item.currentEstimatedValue != null ? `${item.currentEstimatedValue} ${item.currency ?? ""}` : "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
