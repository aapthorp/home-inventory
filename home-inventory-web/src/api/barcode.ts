import { useMutation } from "@tanstack/react-query";
import { apiClient } from "@/api/client";

export interface BarcodeLookupResult {
  barcode: string;
  brand: string | null;
  name: string | null;
  imageUrl: string | null;
}

async function lookupBarcode(upc: string): Promise<BarcodeLookupResult> {
  const { data } = await apiClient.get<BarcodeLookupResult>(`/barcode/${upc}`);
  return data;
}

export function useBarcodeLookup() {
  return useMutation({ mutationFn: lookupBarcode });
}
