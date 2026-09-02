import React from "react";
import type { ItemTypeField } from "@/types/inventory";

interface Props {
  fields: ItemTypeField[];
  values: Record<string, unknown>;
  onChange: (key: string, value: unknown) => void;
}

/**
 * Deliberately knows nothing about "books" or "films" — it just renders
 * whatever the schema from GET /item-types says. Adding a new item type on
 * the backend (new migration + entity + handler + schema entry) needs no
 * changes here at all.
 */
export default function TypeDetailsForm({ fields, values, onChange }: Props) {
  if (fields.length === 0) {
    return null;
  }

  return (
    <>
      {fields.map((field) => (
        <label key={field.key} className="form-field">
          <span>{field.label}</span>
          {field.inputType === "select" && field.options ? (
            <select
              className="select"
              value={(values[field.key] as string) ?? ""}
              onChange={(e) => onChange(field.key, e.target.value || null)}
            >
              <option value="">—</option>
              {field.options.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          ) : (
            <input
              className="input"
              type={field.inputType === "number" ? "number" : "text"}
              value={(values[field.key] as string | number | undefined) ?? ""}
              onChange={(e) => {
                const raw = e.target.value;
                onChange(field.key, field.inputType === "number" ? (raw ? Number(raw) : null) : raw || null);
              }}
            />
          )}
        </label>
      ))}
    </>
  );
}
