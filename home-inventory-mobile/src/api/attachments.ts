import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/api/client";
import type { ItemAttachment, ItemAttachmentUpdateRequest, UUID } from "@/types/inventory";

/** Shape of what we get back from expo-image-picker / expo-camera — just the
 *  fields needed to build a multipart form part, not the full picker result type. */
export interface PickedFile {
  uri: string;
  fileName?: string | null;
  mimeType?: string | null;
}

async function fetchAttachments(itemId: UUID): Promise<ItemAttachment[]> {
  const { data } = await apiClient.get<ItemAttachment[]>(`/items/${itemId}/attachments`);
  return data;
}

async function uploadAttachment(
  itemId: UUID,
  file: PickedFile,
  type: string,
  label: string | null
): Promise<ItemAttachment> {
  const formData = new FormData();
  // React Native's FormData accepts this {uri, name, type} object shape directly —
  // it is NOT a real Blob/File, but RN's networking layer knows how to stream it
  // from the uri. This is the standard RN multipart-upload pattern.
  formData.append("file", {
    uri: file.uri,
    name: file.fileName ?? `upload-${Date.now()}.jpg`,
    type: file.mimeType ?? "image/jpeg",
  } as unknown as Blob);
  formData.append("type", type);
  if (label) {
    formData.append("label", label);
  }
  const { data } = await apiClient.post<ItemAttachment>(`/items/${itemId}/attachments`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
}

async function updateAttachment(
  itemId: UUID,
  attachmentId: UUID,
  payload: ItemAttachmentUpdateRequest
): Promise<ItemAttachment> {
  const { data } = await apiClient.patch<ItemAttachment>(`/items/${itemId}/attachments/${attachmentId}`, payload);
  return data;
}

async function deleteAttachment(itemId: UUID, attachmentId: UUID): Promise<void> {
  await apiClient.delete(`/items/${itemId}/attachments/${attachmentId}`);
}

export function useAttachments(itemId: UUID | undefined) {
  return useQuery({
    queryKey: ["attachments", itemId],
    queryFn: () => fetchAttachments(itemId as UUID),
    enabled: !!itemId,
  });
}

export function useUploadAttachment(itemId: UUID) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ file, type, label }: { file: PickedFile; type: string; label: string | null }) =>
      uploadAttachment(itemId, file, type, label),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["attachments", itemId] }),
  });
}

export function useUpdateAttachment(itemId: UUID) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ attachmentId, payload }: { attachmentId: UUID; payload: ItemAttachmentUpdateRequest }) =>
      updateAttachment(itemId, attachmentId, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["attachments", itemId] }),
  });
}

export function useDeleteAttachment(itemId: UUID) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (attachmentId: UUID) => deleteAttachment(itemId, attachmentId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["attachments", itemId] }),
  });
}
