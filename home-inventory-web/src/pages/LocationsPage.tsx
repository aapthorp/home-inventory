import React from "react";
import { locationHooks } from "@/api/resources";
import TreeEditor from "@/components/TreeEditor";

export default function LocationsPage() {
  const { data: locations, isLoading } = locationHooks.useList();
  const createLocation = locationHooks.useCreate();
  const updateLocation = locationHooks.useUpdate();
  const deleteLocation = locationHooks.useDelete();

  if (isLoading) return <p className="helper-text">Loading…</p>;

  const items = (locations ?? []).map((l) => ({
    id: l.id,
    name: l.name,
    parentId: l.parentLocationId,
    extra: <span className="badge">{l.type.toLowerCase()}</span>,
  }));

  return (
    <div>
      <div className="page-header">
        <h1>Locations</h1>
      </div>
      <p className="helper-text">
        Rooms, shelves, and boxes — nest them freely (e.g. House → Garage → Shelf 3 → Box B). New locations default to
        type "room"; edit via the API/Swagger UI for now if you need a different type on an existing node.
      </p>
      <TreeEditor
        items={items}
        addRootLabel="New room…"
        onAddRoot={(name) => createLocation.mutate({ name, parentLocationId: null, type: "ROOM" })}
        onAddChild={(parentId, name) => createLocation.mutate({ name, parentLocationId: parentId, type: "CONTAINER" })}
        onRename={(id, name) => {
          const existing = locations?.find((l) => l.id === id);
          if (!existing) return;
          updateLocation.mutate({ id, payload: { name, parentLocationId: existing.parentLocationId, type: existing.type } });
        }}
        onDelete={(id) => {
          if (confirm("Delete this location? Items assigned to it will keep a reference to a location that no longer resolves.")) {
            deleteLocation.mutate(id);
          }
        }}
      />
    </div>
  );
}
