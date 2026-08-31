# Home Inventory — web app

Vite + React + TypeScript. Companion to the mobile app and Quarkus backend — same API, same data
model, aimed at the fuller desktop workflows the mobile app deliberately left out: full item forms,
and managing the Location/Category trees and Collections list.

## What's here

- `src/pages/ItemsPage.tsx` — table view with search + location/category/collection filters.
- `src/pages/ItemFormPage.tsx` — the full add/edit form (location & category pickers, tags,
  collection checkboxes, barcode lookup) that the mobile app's MVP form deferred.
- `src/pages/LocationsPage.tsx` / `CategoriesPage.tsx` — tree editors (rename, add child, delete)
  built on the shared `TreeEditor` component and `utils/tree.ts`.
- `src/pages/CollectionsPage.tsx` — flat list, create/delete.
- `src/pages/SettingsPage.tsx` — sets the API base URL and household ID at runtime (stored in
  `localStorage`), since this is a real deployed site rather than a rebuild-to-configure app.
- `src/api/` — axios client + React Query hooks. `crudHooks.ts` is a small factory shared by
  Location/Category/Collection since all three follow the same list/create/update/delete shape.
- `src/types/inventory.ts` — mirrors the backend. Enum-like fields (condition, status, location
  type, collection type) are uppercase strings matching the Java enum constants exactly — this bit
  everyone during the mobile build (see AddItemScreen's original bug), so it's called out explicitly
  in a comment here.

## Backend changes that came with this

`LocationResource`, `CategoryResource`, and `CollectionResource` gained `PATCH /{id}` endpoints —
previously they only supported list/create/delete, which wasn't enough for the rename/re-parent
actions this UI needed.

## Running locally

```bash
npm install
npm run dev
```

Opens at `http://localhost:5173`. On first load, go to **Settings** and enter your backend's URL
and the household UUID you inserted earlier (same one the mobile app uses) — needed before any
other page will return data instead of a 401.

## Next steps

- Item-side collection assignment works; there's no dedicated "manage items in this collection"
  view yet — add one to `CollectionsPage` if that becomes a common workflow.
- Location "type" can only be set at creation via this UI (defaults to ROOM for top-level, CONTAINER
  for children) — edit via Swagger UI if you need a specific type on an existing node.
- No attachment/photo upload UI yet — matches the backend, which doesn't have that endpoint either.
