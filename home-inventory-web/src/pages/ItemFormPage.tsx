import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { useCreateItem, useItem, useUpdateItem, useDeleteItem } from "@/api/items";
import { locationHooks, categoryHooks, collectionHooks } from "@/api/resources";
import { useBarcodeLookup } from "@/api/barcode";
import { buildTree } from "@/utils/tree";
import AttachmentsPanel from "@/components/AttachmentsPanel";
import type { ItemCondition, ItemRequest, ItemStatus, Location, Category } from "@/types/inventory";

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

const emptyForm: ItemRequest = {
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
};

export default function ItemFormPage() {
  const { id } = useParams<{ id: string }>();
  const isEditing = !!id && id !== "new";
  const navigate = useNavigate();

  const { data: existingItem } = useItem(isEditing ? id : undefined);
  const { data: locations } = locationHooks.useList();
  const { data: categories } = categoryHooks.useList();
  const { data: collections } = collectionHooks.useList();

  const createItem = useCreateItem();
  const updateItem = useUpdateItem(id ?? "");
  const deleteItem = useDeleteItem();
  const barcodeLookup = useBarcodeLookup();

  const [form, setForm] = useState<ItemRequest>(emptyForm);
  const [tagsInput, setTagsInput] = useState("");

  useEffect(() => {
    if (existingItem) {
      const { id: _id, createdAt: _c, updatedAt: _u, ...rest } = existingItem;
      setForm(rest);
      setTagsInput(existingItem.tags.join(", "));
    }
  }, [existingItem]);

  const locationOptions = useMemo(
    () => (locations ? flattenForSelect<Location>(locations, (l) => l.parentLocationId) : []),
    [locations]
  );
  const categoryOptions = useMemo(
    () => (categories ? flattenForSelect<Category>(categories, (c) => c.parentCategoryId) : []),
    [categories]
  );

  function field<K extends keyof ItemRequest>(key: K, value: ItemRequest[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
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

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) {
      alert("Name is required.");
      return;
    }
    const payload: ItemRequest = {
      ...form,
      tags: tagsInput
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
    };
    try {
      if (isEditing) {
        await updateItem.mutateAsync(payload);
      } else {
        await createItem.mutateAsync(payload);
      }
      navigate("/items");
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error("Save failed:", error.response?.status, error.response?.data);
        alert(`Couldn't save (server said: ${error.response?.status}). Check the console for details.`);
      } else {
        console.error("Save failed:", error);
        alert("Couldn't save. Check the console for details.");
      }
    }
  }

  async function handleDelete() {
    if (!id || !isEditing) return;
    if (!confirm(`Delete "${form.name}"? This can't be undone from the UI.`)) return;
    await deleteItem.mutateAsync(id);
    navigate("/items");
  }

  function toggleCollection(collectionId: string) {
    setForm((prev) => ({
      ...prev,
      collectionIds: prev.collectionIds.includes(collectionId)
        ? prev.collectionIds.filter((c) => c !== collectionId)
        : [...prev.collectionIds, collectionId],
    }));
  }

  return (
    <div>
      <div className="page-header">
        <h1>{isEditing ? "Edit item" : "Add item"}</h1>
        {isEditing && (
          <button className="button-danger" onClick={handleDelete}>
            Delete
          </button>
        )}
      </div>

      <form className="form-grid" onSubmit={handleSave}>
        <label className="form-field form-field-wide">
          <span>Name *</span>
          <input className="input" value={form.name} onChange={(e) => field("name", e.target.value)} required />
        </label>

        <label className="form-field form-field-wide">
          <span>Description</span>
          <textarea
            className="textarea"
            value={form.description ?? ""}
            onChange={(e) => field("description", e.target.value || null)}
          />
        </label>

        <label className="form-field">
          <span>Barcode</span>
          <div className="input-with-button">
            <input
              className="input"
              value={form.barcode ?? ""}
              onChange={(e) => field("barcode", e.target.value || null)}
            />
            <button type="button" className="button-secondary" onClick={handleBarcodeLookup}>
              Look up
            </button>
          </div>
        </label>

        <label className="form-field">
          <span>Brand</span>
          <input className="input" value={form.brand ?? ""} onChange={(e) => field("brand", e.target.value || null)} />
        </label>

        <label className="form-field">
          <span>Model</span>
          <input className="input" value={form.model ?? ""} onChange={(e) => field("model", e.target.value || null)} />
        </label>

        <label className="form-field">
          <span>Serial number</span>
          <input
            className="input"
            value={form.serialNumber ?? ""}
            onChange={(e) => field("serialNumber", e.target.value || null)}
          />
        </label>

        <label className="form-field">
          <span>Location</span>
          <select
            className="select"
            value={form.locationId ?? ""}
            onChange={(e) => field("locationId", e.target.value || null)}
          >
            <option value="">Unassigned</option>
            {locationOptions.map((opt) => (
              <option key={opt.id} value={opt.id}>
                {opt.label}
              </option>
            ))}
          </select>
        </label>

        <label className="form-field">
          <span>Category</span>
          <select
            className="select"
            value={form.categoryId ?? ""}
            onChange={(e) => field("categoryId", e.target.value || null)}
          >
            <option value="">Unassigned</option>
            {categoryOptions.map((opt) => (
              <option key={opt.id} value={opt.id}>
                {opt.label}
              </option>
            ))}
          </select>
        </label>

        <label className="form-field">
          <span>Condition</span>
          <select className="select" value={form.condition} onChange={(e) => field("condition", e.target.value as ItemCondition)}>
            <option value="NEW">New</option>
            <option value="GOOD">Good</option>
            <option value="FAIR">Fair</option>
            <option value="POOR">Poor</option>
          </select>
        </label>

        <label className="form-field">
          <span>Status</span>
          <select className="select" value={form.status} onChange={(e) => field("status", e.target.value as ItemStatus)}>
            <option value="OWNED">Owned</option>
            <option value="LOANED_OUT">Loaned out</option>
            <option value="SOLD">Sold</option>
            <option value="DISPOSED">Disposed</option>
            <option value="LOST">Lost</option>
          </select>
        </label>

        <label className="form-field">
          <span>Quantity</span>
          <input
            type="number"
            min={0}
            className="input"
            value={form.quantity}
            onChange={(e) => field("quantity", Number(e.target.value))}
          />
        </label>

        <label className="form-field">
          <span>Purchase date</span>
          <input
            type="date"
            className="input"
            value={form.purchaseDate ?? ""}
            onChange={(e) => field("purchaseDate", e.target.value || null)}
          />
        </label>

        <label className="form-field">
          <span>Purchase price</span>
          <input
            type="number"
            step="0.01"
            className="input"
            value={form.purchasePrice ?? ""}
            onChange={(e) => field("purchasePrice", e.target.value ? Number(e.target.value) : null)}
          />
        </label>

        <label className="form-field">
          <span>Currency</span>
          <input
            className="input"
            placeholder="USD"
            value={form.currency ?? ""}
            onChange={(e) => field("currency", e.target.value || null)}
          />
        </label>

        <label className="form-field">
          <span>Current estimated value</span>
          <input
            type="number"
            step="0.01"
            className="input"
            value={form.currentEstimatedValue ?? ""}
            onChange={(e) => field("currentEstimatedValue", e.target.value ? Number(e.target.value) : null)}
          />
        </label>

        <label className="form-field">
          <span>Warranty expiry</span>
          <input
            type="date"
            className="input"
            value={form.warrantyExpiryDate ?? ""}
            onChange={(e) => field("warrantyExpiryDate", e.target.value || null)}
          />
        </label>

        <label className="form-field form-field-wide">
          <span>Tags (comma separated)</span>
          <input className="input" value={tagsInput} onChange={(e) => setTagsInput(e.target.value)} />
        </label>

        {collections && collections.length > 0 && (
          <div className="form-field form-field-wide">
            <span>Collections</span>
            <div className="checkbox-group">
              {collections.map((c) => (
                <label key={c.id} className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={form.collectionIds.includes(c.id)}
                    onChange={() => toggleCollection(c.id)}
                  />
                  {c.name}
                </label>
              ))}
            </div>
          </div>
        )}

        <label className="form-field form-field-wide">
          <span>Notes</span>
          <textarea className="textarea" value={form.notes ?? ""} onChange={(e) => field("notes", e.target.value || null)} />
        </label>

        <div className="form-actions form-field-wide">
          <button type="submit" className="button-primary" disabled={createItem.isPending || updateItem.isPending}>
            {createItem.isPending || updateItem.isPending ? "Saving…" : "Save item"}
          </button>
        </div>
      </form>

      {isEditing && id ? (
        <div className="form-grid" style={{ marginTop: 20 }}>
          <AttachmentsPanel itemId={id} />
        </div>
      ) : (
        <p className="helper-text" style={{ marginTop: 16 }}>
          Save the item first to add photos and other attachments.
        </p>
      )}
    </div>
  );
}
