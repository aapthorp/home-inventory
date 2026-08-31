import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/api/client";
import type { UUID } from "@/types/inventory";

/**
 * Location/Category/Collection all follow the same list/create/update/delete
 * shape server-side, so this factory avoids writing the same six functions
 * three times. If one of them grows a resource-specific action later (e.g.
 * "merge categories"), just add it alongside the generated hooks for that
 * resource rather than fighting the abstraction to fit it in here.
 */
export function createCrudHooks<TEntity extends { id: UUID }, TRequest>(resourcePath: string, queryKey: string) {
  async function list(): Promise<TEntity[]> {
    const { data } = await apiClient.get<TEntity[]>(resourcePath);
    return data;
  }

  async function create(payload: TRequest): Promise<TEntity> {
    const { data } = await apiClient.post<TEntity>(resourcePath, payload);
    return data;
  }

  async function update(id: UUID, payload: TRequest): Promise<TEntity> {
    const { data } = await apiClient.patch<TEntity>(`${resourcePath}/${id}`, payload);
    return data;
  }

  async function remove(id: UUID): Promise<void> {
    await apiClient.delete(`${resourcePath}/${id}`);
  }

  function useList() {
    return useQuery({ queryKey: [queryKey], queryFn: list });
  }

  function useCreate() {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: create,
      onSuccess: () => queryClient.invalidateQueries({ queryKey: [queryKey] }),
    });
  }

  function useUpdate() {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: ({ id, payload }: { id: UUID; payload: TRequest }) => update(id, payload),
      onSuccess: () => queryClient.invalidateQueries({ queryKey: [queryKey] }),
    });
  }

  function useDelete() {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: remove,
      onSuccess: () => queryClient.invalidateQueries({ queryKey: [queryKey] }),
    });
  }

  return { useList, useCreate, useUpdate, useDelete };
}
