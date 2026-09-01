import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/api/client";
import type { ItemAttachment, ItemAttachmentUpdateRequest, UUID } from "@/types/inventory";

async function fetchAttachments(itemId: UUID): Promise<ItemAttachment[]> {
  const { data } = await apiClient.get<ItemAttachment[]>(`/items/${itemId}/attachments`);
  return data;
}

async function uploadAttachment(
  itemId: UUID,
  file: File,
  type: string,
  label: string | null
): Promise<ItemAttachment> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("type", type);
  if (label) {
    formData.append("label", label);
  }
  // Content-Type is set automatically by the browser (with the correct multipart
  // boundary) when the body is a FormData instance — don't set it manually here.
  const { data } = await apiClient.post<ItemAttachment>(`/items/${itemId}/attachments`, formData);
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
    mutationFn: ({ file, type, label }: { file: File; type: string; label: string | null }) =>
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
