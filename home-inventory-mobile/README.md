# Home Inventory — mobile app

Expo (React Native) + TypeScript. Now at feature parity with the web app: full item CRUD, item
types (Book/Film/Music), photo/attachment capture, Location/Category tree management, Collections,
and a Settings screen for runtime configuration.

## What's here

- `App.tsx` — loads persisted settings (see below) before rendering, then wires React Query + navigation.
- `src/navigation/RootNavigator.tsx` — bottom-tab navigator (Items / Locations / Categories /
  Collections / Settings). The Items tab has its own nested stack: list → detail → form → barcode
  scan (exported as `ItemsStackParamList`).
- `src/screens/`:
  - `ItemListScreen` — search + list + type badges, FAB to add, scan entry point.
  - `ItemDetailScreen` — read-only view with an Edit button, type-specific fields, attachment thumbnails.
  - `ItemFormScreen` — unified add/edit form: full field set, item type selector + generic
    type-details form (schema-driven off `GET /item-types`, same principle as the web app), a
    Location/Category tree picker (`PickerModal`), tags, collections, and (once saved)
    `AttachmentsPanel`.
  - `BarcodeScanScreen` — unchanged; hands off to `ItemForm` prefilled.
  - `LocationsScreen` / `CategoriesScreen` — tree management (add root/child, rename, delete),
    mirroring the web app's `TreeEditor`.
  - `CollectionsScreen` — real CRUD, replacing the earlier stub.
  - `SettingsScreen` — API base URL + household ID, persisted via AsyncStorage rather than requiring
    a rebuild to change (this is what `EXPO_PUBLIC_*` env vars were doing alone before — painful to
    change on a physical device without a rebuild, per the CORS/networking debugging earlier in the
    build).
- `src/components/`:
  - `TypeDetailsForm` — same schema-driven approach as web; chips for `select` fields since there's
    no native RN dropdown worth adding a dependency for at this scale.
  - `PickerModal` — full-screen modal list for Location/Category selection (RN has no native `<select>`).
  - `AttachmentsPanel` — camera capture or library picker via `expo-image-picker`, uploads as
    multipart form data.
  - `TreeManager` — the Locations/Categories management UI, ported from web's `TreeEditor`.
- `src/api/` — `client.ts` now persists settings via AsyncStorage (pinned to `2.2.0` — later versions
  are broken on Expo SDK 54, per an open Expo issue); `crudHooks.ts` is the same generic
  list/create/update/delete factory as web; `attachments.ts` uses RN's `{uri, name, type}` FormData
  part shape rather than a browser `File`.

## What's deliberately not here yet

Real auth (still the `X-Household-Id` header stub — now editable via Settings instead of hardcoded),
offline cache/sync queue (per the original MVP-phasing decision), and date pickers (purchase/warranty
dates are free-text `YYYY-MM-DD` inputs rather than a native date picker, to avoid adding another
native dependency at this stage — worth revisiting if manual date entry proves annoying in practice).

## Running locally

```bash
npm install
npx expo start -c
```

On first launch, go to the **Settings** tab and enter your backend's URL (LAN IP if testing on a
physical device — not `localhost`) and the household UUID. Every other tab 401s until that's set.

## Next steps

- Real auth to replace the household-ID stub.
- Offline-first sync (deferred since the very first architecture discussion).
- A proper native date picker if free-text date entry turns out to be annoying.
