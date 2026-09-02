// Mirrors the backend data model. Enum-like string unions must match the
// Java enum constant names exactly (case-sensitive) — see the mobile app's
// AddItemScreen bug for what happens if these drift (Jackson rejects the
// mismatched case with a 400 that looks like a network failure).

export type UUID = string;

export type LocationType = "ROOM" | "CONTAINER" | "SHELF" | "BOX";
export type CollectionType = "MUSIC" | "VIDEO" | "BOOKS" | "GENERAL";
export type ItemCondition = "NEW" | "GOOD" | "FAIR" | "POOR";
export type ItemStatus = "OWNED" | "LOANED_OUT" | "SOLD" | "DISPOSED" | "LOST";

// LocationResource/CategoryResource/CollectionResource currently return the
// Panache entity directly rather than a DTO, so these include the raw fields
// (householdId, deletedAt) rather than a cleaned-up response shape.
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

export type ItemTypeCode = "GENERIC" | "BOOK" | "FILM" | "MUSIC_ALBUM";

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
  // shape depends on itemType; empty for GENERIC. See ItemTypeSchema for what's
  // available per type.
  details: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
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

// Request payload shapes — match the backend's *Request records exactly.
export type ItemRequest = Omit<Item, "id" | "createdAt" | "updatedAt">;

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
