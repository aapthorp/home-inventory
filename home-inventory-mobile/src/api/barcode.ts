import { useMutation } from "@tanstack/react-query";
import { apiClient } from "@/api/client";

export interface BarcodeLookupResult {
  barcode: string;
  brand: string | null;
  name: string | null;
  imageUrl: string | null;
}

// Calls the backend's /barcode/{upc} endpoint, which itself proxies to
// an external UPC database (see architecture doc, section 3). Keeping
// the external call server-side avoids shipping an API key in the app.
async function lookupBarcode(upc: string): Promise<BarcodeLookupResult> {
  const { data } = await apiClient.get<BarcodeLookupResult>(`/barcode/${upc}`);
  return data;
}

export function useBarcodeLookup() {
  return useMutation({ mutationFn: lookupBarcode });
}
