import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/api/client";
import type { Item, ItemDraft, UUID } from "@/types/inventory";

export interface ItemFilters {
  locationId?: UUID;
  categoryId?: UUID;
  collectionId?: UUID;
  query?: string;
}

async function fetchItems(filters: ItemFilters): Promise<Item[]> {
  const { data } = await apiClient.get<Item[]>("/items", { params: filters });
  return data;
}

async function fetchItem(id: UUID): Promise<Item> {
  const { data } = await apiClient.get<Item>(`/items/${id}`);
  return data;
}

async function createItem(draft: ItemDraft): Promise<Item> {
  const { data } = await apiClient.post<Item>("/items", draft);
  return data;
}

async function updateItem(id: UUID, patch: Partial<ItemDraft>): Promise<Item> {
  const { data } = await apiClient.patch<Item>(`/items/${id}`, patch);
  return data;
}

async function deleteItem(id: UUID): Promise<void> {
  await apiClient.delete(`/items/${id}`);
}

export function useItems(filters: ItemFilters = {}) {
  return useQuery({
    queryKey: ["items", filters],
    queryFn: () => fetchItems(filters),
  });
}

export function useItem(id: UUID | undefined) {
  return useQuery({
    queryKey: ["items", id],
    queryFn: () => fetchItem(id as UUID),
    enabled: !!id,
  });
}

export function useCreateItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createItem,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["items"] }),
  });
}

export function useUpdateItem(id: UUID) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (patch: Partial<ItemDraft>) => updateItem(id, patch),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["items"] });
      queryClient.invalidateQueries({ queryKey: ["items", id] });
    },
  });
}

export function useDeleteItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteItem,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["items"] }),
  });
}
