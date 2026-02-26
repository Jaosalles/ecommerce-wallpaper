import { useCallback, useState } from "react";
import { toast } from "sonner";
import { apiFetch, parseApiResponse } from "@/lib/client-api";

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
      const response = await apiFetch(buildEndpoint(deleteTarget.id), {
        method: "DELETE",
      });

      await parseApiResponse<{ message: string }>(response, {
        fallbackErrorMessage,
        allowEmptyData: true,
      });

      toast.success(successMessage);

      if (onDeleted) {
        await onDeleted(deleteTarget.id);
      }

      setDeleteTarget(null);
    } catch (errorValue) {
      if (errorValue instanceof Error) {
        toast.error(errorValue.message);
      } else {
        toast.error(fallbackErrorMessage);
      }
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
