import { useCallback } from "react";
import { toast } from "sonner";

type ApiResponse<T> = {
  success: boolean;
  data?: T;
  error?: string;
};

type UseAdminUpsertParams<TFormData> = {
  editingId: string | null;
  createEndpoint: string;
  updateEndpoint: (id: string) => string;
  mapBody: (values: TFormData) => unknown;
  createSuccessMessage: string;
  updateSuccessMessage: string;
  fallbackErrorMessage: string;
  connectionErrorMessage: string;
  onSuccess?: () => Promise<void> | void;
};

export function useAdminUpsert<TFormData, TResponseData>({
  editingId,
  createEndpoint,
  updateEndpoint,
  mapBody,
  createSuccessMessage,
  updateSuccessMessage,
  fallbackErrorMessage,
  connectionErrorMessage,
  onSuccess,
}: UseAdminUpsertParams<TFormData>) {
  const submit = useCallback(
    async (values: TFormData) => {
      try {
        const endpoint = editingId ? updateEndpoint(editingId) : createEndpoint;
        const method = editingId ? "PUT" : "POST";

        const response = await fetch(endpoint, {
          method,
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(mapBody(values)),
        });

        const payload = (await response.json()) as ApiResponse<TResponseData>;

        if (!response.ok || !payload.success) {
          toast.error(payload.error ?? fallbackErrorMessage);
          return false;
        }

        toast.success(editingId ? updateSuccessMessage : createSuccessMessage);

        if (onSuccess) {
          await onSuccess();
        }

        return true;
      } catch {
        toast.error(connectionErrorMessage);
        return false;
      }
    },
    [
      connectionErrorMessage,
      createEndpoint,
      createSuccessMessage,
      editingId,
      fallbackErrorMessage,
      mapBody,
      onSuccess,
      updateEndpoint,
      updateSuccessMessage,
    ],
  );

  return {
    submit,
  };
}
