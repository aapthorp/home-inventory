# Home Inventory — mobile app skeleton

Expo (React Native) + TypeScript skeleton for the home inventory app. Companion to the
architecture doc (`home-inventory-architecture.md`).

## What's here

- `App.tsx` — wires React Query + navigation.
- `src/navigation/RootNavigator.tsx` — stack: item list → detail, add item, barcode scan, collections.
- `src/screens/` — five screens, deliberately minimal:
  - `ItemListScreen` — search + list + FAB to add, scan entry point.
  - `ItemDetailScreen` — read-only field view.
  - `AddItemScreen` — MVP form (name + brand only; location/category/photos deferred to a fuller edit screen).
  - `BarcodeScanScreen` — camera scan, calls backend barcode lookup, hands off to Add Item prefilled.
  - `CollectionsScreen` — stub, not yet wired to an API endpoint.
- `src/api/` — axios client + React Query hooks (`items.ts`, `barcode.ts`). Swap `EXPO_PUBLIC_API_BASE_URL`
  to point at your Quarkus backend.
- `src/types/inventory.ts` — TypeScript types mirroring the backend data model. Keep in sync with the
  OpenAPI schema as the backend firms up.

## What's deliberately not here yet

Per the MVP phasing decision: no offline cache, no sync queue, no auth flow beyond a token stub in
`api/client.ts`. The two schema conventions that make offline easy to add later (UUIDs, `updatedAt` +
soft delete) live on the backend, not this client — nothing here blocks adding it.

## Getting started

```bash
npm install
npx expo start
```

Requires a running backend (see the Quarkus/Docker Compose setup in the architecture doc) reachable at
the URL in `EXPO_PUBLIC_API_BASE_URL` (defaults to `http://localhost:8080`).

## Next steps

1. Stand up the Quarkus backend with the `/items`, `/barcode/{upc}` endpoints this client expects.
2. Add a Location/Category picker to `AddItemScreen` (currently omitted for MVP speed).
3. Wire `CollectionsScreen` to `GET /collections`.
4. Add photo capture (`expo-image-picker` is already a dependency) and attachment upload.
