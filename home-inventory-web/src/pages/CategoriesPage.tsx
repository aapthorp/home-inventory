import React from "react";
import { categoryHooks } from "@/api/resources";
import TreeEditor from "@/components/TreeEditor";

export default function CategoriesPage() {
  const { data: categories, isLoading } = categoryHooks.useList();
  const createCategory = categoryHooks.useCreate();
  const updateCategory = categoryHooks.useUpdate();
  const deleteCategory = categoryHooks.useDelete();

  if (isLoading) return <p className="helper-text">Loading…</p>;

  const items = (categories ?? []).map((c) => ({
    id: c.id,
    name: c.name,
    parentId: c.parentCategoryId,
  }));

  return (
    <div>
      <div className="page-header">
        <h1>Categories</h1>
      </div>
      <p className="helper-text">e.g. Electronics → Audio → Headphones.</p>
      <TreeEditor
        items={items}
        addRootLabel="New top-level category…"
        onAddRoot={(name) => createCategory.mutate({ name, parentCategoryId: null })}
        onAddChild={(parentId, name) => createCategory.mutate({ name, parentCategoryId: parentId })}
        onRename={(id, name) => {
          const existing = categories?.find((c) => c.id === id);
          if (!existing) return;
          updateCategory.mutate({ id, payload: { name, parentCategoryId: existing.parentCategoryId } });
        }}
        onDelete={(id) => {
          if (confirm("Delete this category? Items assigned to it will keep a reference to a category that no longer resolves.")) {
            deleteCategory.mutate(id);
          }
        }}
      />
    </div>
  );
}
