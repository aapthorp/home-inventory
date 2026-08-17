// Mirrors the backend data model (see architecture doc, section 4).
// Keep this file in sync with the API's OpenAPI schema as it stabilizes.

export type UUID = string;

export interface Location {
  id: UUID;
  name: string;
  parentLocationId: UUID | null;
  type: "room" | "container" | "shelf" | "box";
}

export interface Category {
  id: UUID;
  name: string;
  parentCategoryId: UUID | null;
}

export interface Collection {
  id: UUID;
  name: string;
  description: string | null;
  type: "music" | "video" | "books" | "general" | null;
}

export type ItemCondition = "new" | "good" | "fair" | "poor";
export type ItemStatus = "owned" | "loaned_out" | "sold" | "disposed" | "lost";

export interface Item {
  id: UUID;
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
  purchaseDate: string | null; // ISO date
  purchasePrice: number | null;
  currency: string | null;
  currentEstimatedValue: number | null;
  warrantyExpiryDate: string | null; // ISO date
  status: ItemStatus;
  notes: string | null;
  tags: string[];
  collectionIds: UUID[];
  createdAt: string;
  updatedAt: string;
}

export interface ItemAttachment {
  id: UUID;
  itemId: UUID;
  type: "photo" | "receipt" | "manual" | "warranty_doc";
  storageUrl: string;
  uploadedAt: string;
}

// Payload shapes for creating/updating an item — omit server-assigned fields.
export type ItemDraft = Omit<
  Item,
  "id" | "createdAt" | "updatedAt" | "tags" | "collectionIds"
> & {
  tags?: string[];
  collectionIds?: UUID[];
};
