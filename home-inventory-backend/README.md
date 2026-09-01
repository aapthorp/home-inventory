# Home Inventory — Quarkus backend skeleton

Companion to the architecture doc and the Expo mobile skeleton. Implements the MVP-scoped
endpoints the mobile app already expects: Item/Location/Category/Collection CRUD and barcode lookup.

## What's here

- `domain/` — JPA entities (Panache). `AbstractEntity` gives every table a UUID PK,
  `createdAt`/`updatedAt`, and a `deletedAt` soft-delete column — the two conventions from the
  architecture doc's MVP-phasing decision that keep offline sync addable later without a schema
  rewrite.
- `resource/` — JAX-RS endpoints: `ItemResource` (search/CRUD, matches `src/api/items.ts` in the
  mobile app), `LocationResource`, `CategoryResource`, `CollectionResource`, `BarcodeResource`
  (matches `src/api/barcode.ts`).
- `dto/` — `ItemRequest`/`ItemResponse` keep the wire format decoupled from the entity.
- `service/HouseholdContext` — **stub for auth.** Currently reads an `X-Household-Id` header
  directly; swap for a claim from a validated JWT once real login exists. Every resource already
  depends on this bean, so that's a one-file change.
- `service/BarcodeLookupClient` — typed REST client proxying an external UPC database. The
  provider/shape here is a placeholder (UPCitemdb's trial API) — swap for whichever service you
  settle on.
- `db/migration/V1__init.sql` — Flyway migration matching the entity model exactly.
- `docker-compose.yml` — Postgres + MinIO + the API itself, mirroring the architecture doc's
  deployment section.
- `service/itemtype/` — **pluggable item types.** `Item.itemType` discriminates GENERIC / BOOK /
  FILM / MUSIC_ALBUM; each non-generic type has its own 1:1 extension table (`BookDetails`,
  `FilmDetails`, `MusicAlbumDetails`) for real typed columns rather than a JSONB blob. Adding a new
  type (e.g. Wine) is: one Flyway migration, one entity, one `ItemTypeDetailsHandler`
  implementation (auto-discovered via CDI — no manual registration), and one schema entry in
  `ItemTypeSchemas`. Nothing else changes — `ItemResource` and both frontends are written against
  the generic `Map<String, Object> details` contract, not against specific types, and
  `GET /item-types` lets the frontends render type-specific form fields without per-type UI code.

  Known limitation: changing an item's `itemType` doesn't clean up the previous type's details
  row — it's just orphaned. Fine for MVP; revisit if that turns out to matter in practice.

## What's deliberately not here yet

Auth beyond the header stub, Loan/ValuationHistory/AuditLog entities, attachment upload endpoint
(MinIO client is wired via `quarkus-minio` but no resource uses it yet), and any multi-user
permission logic within a household. All were explicitly deferred to v2 in the architecture doc.

## Running locally

**Dev mode (Quarkus Dev Services auto-starts a throwaway Postgres — nothing to configure):**

```bash
mvn quarkus:dev
```

Swagger UI: `http://localhost:8080/swagger-ui`

**Full stack (Postgres + MinIO + API, matching production shape):**

```bash
docker compose up --build
```

Every request needs an `X-Household-Id: <uuid>` header until real auth lands — insert a row into
`household` manually for now:

```sql
insert into household (name) values ('My Household') returning id;
```

## Next steps

1. Point the mobile app's `EXPO_PUBLIC_API_BASE_URL` at this server and set the household header
   in `src/api/client.ts`.
2. Add the attachment upload endpoint (`POST /items/{id}/attachments`) using the already-wired
   MinIO client.
3. Replace `HouseholdContext`'s header stub with real JWT-based auth.
4. Swap `BarcodeLookupClient`'s provider for your chosen UPC API and add its key via
   `application.properties`/env var.
