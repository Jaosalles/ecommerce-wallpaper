import { useCallback, useState } from "react";
import { toast } from "sonner";

type ApiResponse<T> = {
  success: boolean;
  data?: T;
  error?: string;
};

type UseAdminDeleteParams = {
  buildEndpoint: (id: string) => string;
  fallbackErrorMessage: string;
  successMessage: string;
  onDeleted?: (id: string) => Promise<void> | void;
};

export function useAdminDelete<TItem extends { id: string }>({
  buildEndpoint,
  fallbackErrorMessage,
  successMessage,
  onDeleted,
}: UseAdminDeleteParams) {
  const [deleteTarget, setDeleteTarget] = useState<TItem | null>(null);
  const [deleting, setDeleting] = useState(false);

  const openDeleteModal = useCallback((item: TItem) => {
    setDeleteTarget(item);
  }, []);

  const closeDeleteModal = useCallback(() => {
    setDeleteTarget(null);
  }, []);

  const confirmDelete = useCallback(async () => {
    if (!deleteTarget) {
      return;
    }

    setDeleting(true);

    try {
      const response = await fetch(buildEndpoint(deleteTarget.id), {
        method: "DELETE",
        credentials: "include",
      });

      const payload = (await response.json()) as ApiResponse<{
        message: string;
      }>;

      if (!response.ok || !payload.success) {
        toast.error(payload.error ?? fallbackErrorMessage);
        return;
      }

      toast.success(successMessage);

      if (onDeleted) {
        await onDeleted(deleteTarget.id);
      }

      setDeleteTarget(null);
    } catch {
      toast.error(fallbackErrorMessage);
    } finally {
      setDeleting(false);
    }
  }, [
    buildEndpoint,
    deleteTarget,
    fallbackErrorMessage,
    onDeleted,
    successMessage,
  ]);

  return {
    deleteTarget,
    deleting,
    openDeleteModal,
    closeDeleteModal,
    confirmDelete,
  };
}
