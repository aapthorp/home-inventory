import { createCrudHooks } from "@/api/crudHooks";
import type { Location, LocationRequest, Category, CategoryRequest, Collection, CollectionRequest } from "@/types/inventory";

export const locationHooks = createCrudHooks<Location, LocationRequest>("/locations", "locations");
export const categoryHooks = createCrudHooks<Category, CategoryRequest>("/categories", "categories");
export const collectionHooks = createCrudHooks<Collection, CollectionRequest>("/collections", "collections");
