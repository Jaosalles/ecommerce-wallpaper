import { useCallback } from "react";
import { toast } from "sonner";
import { apiFetch, parseApiResponse } from "@/lib/client-api";

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

        const response = await apiFetch(endpoint, {
          method,
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(mapBody(values)),
        });

        await parseApiResponse<TResponseData>(response, {
          fallbackErrorMessage,
          allowEmptyData: true,
        });

        toast.success(editingId ? updateSuccessMessage : createSuccessMessage);

        if (onSuccess) {
          await onSuccess();
        }

        return true;
      } catch (errorValue) {
        if (errorValue instanceof Error) {
          toast.error(errorValue.message);
          return false;
        }

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
