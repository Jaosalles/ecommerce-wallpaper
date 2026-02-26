import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import { toast } from "sonner";
import { apiFetch, parseApiResponse } from "@/lib/client-api";

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
  const [isTransitionPending, startTransition] = useTransition();
  const onLoadedRef = useRef(onLoaded);

  useEffect(() => {
    onLoadedRef.current = onLoaded;
  }, [onLoaded]);

  const reload = useCallback(async () => {
    try {
      setLoading(true);

      const response = await apiFetch(endpoint, {
        method: "GET",
      });

      const data = await parseApiResponse<TData>(response, {
        fallbackErrorMessage: loadErrorMessage,
      });

      startTransition(() => {
        setData(data);
      });

      if (onLoadedRef.current) {
        await onLoadedRef.current(data);
      }
    } catch (errorValue) {
      if (errorValue instanceof Error) {
        toast.error(errorValue.message);
        return;
      }

      toast.error(loadErrorMessage);
    } finally {
      setLoading(false);
    }
  }, [endpoint, loadErrorMessage]);

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
    isTransitionPending,
    reload,
  };
}
