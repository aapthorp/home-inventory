import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/api/client";
import type { ItemTypeSchema } from "@/types/inventory";

async function fetchItemTypes(): Promise<ItemTypeSchema[]> {
  const { data } = await apiClient.get<ItemTypeSchema[]>("/item-types");
  return data;
}

export function useItemTypes() {
  return useQuery({ queryKey: ["item-types"], queryFn: fetchItemTypes, staleTime: Infinity });
}
