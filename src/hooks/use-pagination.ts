"use client";

import { useCallback, useMemo, useState } from "react";

type UsePaginationParams<TItem> = {
  items: TItem[];
  pageSize: number;
  initialPage?: number;
};

export function usePagination<TItem>({
  items,
  pageSize,
  initialPage = 1,
}: UsePaginationParams<TItem>) {
  const [requestedPage, setRequestedPage] = useState(initialPage);

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(items.length / pageSize)),
    [items.length, pageSize],
  );

  const page = useMemo(
    () => Math.min(Math.max(requestedPage, 1), totalPages),
    [requestedPage, totalPages],
  );

  const paginatedItems = useMemo(() => {
    const start = (page - 1) * pageSize;
    const end = start + pageSize;

    return items.slice(start, end);
  }, [items, page, pageSize]);

  const goToPage = useCallback(
    (nextPage: number) => {
      const normalizedPage = Math.min(Math.max(nextPage, 1), totalPages);
      setRequestedPage(normalizedPage);
    },
    [totalPages],
  );

  return {
    page,
    totalPages,
    paginatedItems,
    goToPage,
  };
}
