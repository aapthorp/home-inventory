// Mirrors the backend data model (see architecture doc, section 4).
// Enum-like string unions must match the Java enum constant names exactly
// (case-sensitive) — see AddItemScreen's original bug if this drifts again.

export type UUID = string;

export type LocationType = "ROOM" | "CONTAINER" | "SHELF" | "BOX";
export type CollectionType = "MUSIC" | "VIDEO" | "BOOKS" | "GENERAL";
export type ItemCondition = "NEW" | "GOOD" | "FAIR" | "POOR";
export type ItemStatus = "OWNED" | "LOANED_OUT" | "SOLD" | "DISPOSED" | "LOST";
export type ItemTypeCode = "GENERIC" | "BOOK" | "FILM" | "MUSIC_ALBUM";

// Location/Category/Collection resources return the raw Panache entity, not a
// cleaned-up DTO — these include householdId/timestamps accordingly.
export interface Location {
  id: UUID;
  householdId: UUID;
  name: string;
  parentLocationId: UUID | null;
  type: LocationType;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface Category {
  id: UUID;
  householdId: UUID;
  name: string;
  parentCategoryId: UUID | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface Collection {
  id: UUID;
  householdId: UUID;
  name: string;
  description: string | null;
  type: CollectionType | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface Item {
  id: UUID;
  itemType: ItemTypeCode;
  name: string;
  description: string | null;
  categoryId: UUID | null;
  locationId: UUID | null;
  ownerUserId: UUID | null;
  barcode: string | null;
  brand: string | null;
  model: string | null;
  serialNumber: string | null;
  condition: ItemCondition;
  quantity: number;
  purchaseDate: string | null;
  purchasePrice: number | null;
  currency: string | null;
  currentEstimatedValue: number | null;
  warrantyExpiryDate: string | null;
  status: ItemStatus;
  notes: string | null;
  tags: string[];
  collectionIds: UUID[];
  // Type-specific fields (ISBN/author for BOOK, director/actors for FILM, etc.) —
  // shape depends on itemType; empty for GENERIC. See ItemTypeSchema.
  details: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export type ItemDraft = Omit<Item, "id" | "createdAt" | "updatedAt">;

export interface LocationRequest {
  name: string;
  parentLocationId: UUID | null;
  type: LocationType;
}

export interface CategoryRequest {
  name: string;
  parentCategoryId: UUID | null;
}

export interface CollectionRequest {
  name: string;
  description: string | null;
  type: CollectionType | null;
}

export interface ItemTypeField {
  key: string;
  label: string;
  inputType: "text" | "number" | "select";
  options: string[] | null;
}

export interface ItemTypeSchema {
  code: ItemTypeCode;
  label: string;
  fields: ItemTypeField[];
}

export type AttachmentType = "PHOTO" | "RECEIPT" | "MANUAL" | "WARRANTY_DOC";

export interface ItemAttachment {
  id: UUID;
  type: AttachmentType;
  label: string | null;
  contentType: string | null;
  sizeBytes: number | null;
  sortOrder: number;
  downloadUrl: string | null;
  createdAt: string;
}

export interface ItemAttachmentUpdateRequest {
  label?: string | null;
  type?: AttachmentType;
  sortOrder?: number;
}
