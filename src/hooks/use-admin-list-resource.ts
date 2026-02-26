import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

type ApiResponse<T> = {
  success: boolean;
  data?: T;
  error?: string;
};

type UseAdminListResourceParams<TData> = {
  endpoint: string;
  initialData: TData;
  loadErrorMessage: string;
  autoLoad?: boolean;
  onLoaded?: (data: TData) => void | Promise<void>;
};

export function useAdminListResource<TData>({
  endpoint,
  initialData,
  loadErrorMessage,
  autoLoad = true,
  onLoaded,
}: UseAdminListResourceParams<TData>) {
  const [data, setData] = useState<TData>(initialData);
  const [loading, setLoading] = useState(autoLoad);

  const reload = useCallback(async () => {
    try {
      setLoading(true);

      const response = await fetch(endpoint, {
        method: "GET",
        credentials: "include",
      });

      const payload = (await response.json()) as ApiResponse<TData>;

      if (!response.ok || !payload.success || payload.data === undefined) {
        toast.error(payload.error ?? loadErrorMessage);
        return;
      }

      setData(payload.data);

      if (onLoaded) {
        await onLoaded(payload.data);
      }
    } catch {
      toast.error(loadErrorMessage);
    } finally {
      setLoading(false);
    }
  }, [endpoint, loadErrorMessage, onLoaded]);

  useEffect(() => {
    if (!autoLoad) {
      return;
    }

    reload();
  }, [autoLoad, reload]);

  return {
    data,
    setData,
    loading,
    reload,
  };
}
