"use client";

type PaginationControlsProps = {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  disabled?: boolean;
};

export function PaginationControls({
  page,
  totalPages,
  onPageChange,
  disabled = false,
}: PaginationControlsProps) {
  if (totalPages <= 1) {
    return null;
  }

  const isPreviousDisabled = disabled || page <= 1;
  const isNextDisabled = disabled || page >= totalPages;

  return (
    <div className="mt-4 flex items-center justify-between gap-3">
      <button
        type="button"
        disabled={isPreviousDisabled}
        onClick={() => onPageChange(page - 1)}
        className="site-btn-secondary rounded-md px-3 py-2 text-sm font-medium disabled:opacity-50"
      >
        Anterior
      </button>

      <p className="site-muted text-xs">
        Página {page} de {totalPages}
      </p>

      <button
        type="button"
        disabled={isNextDisabled}
        onClick={() => onPageChange(page + 1)}
        className="site-btn-secondary rounded-md px-3 py-2 text-sm font-medium disabled:opacity-50"
      >
        Próxima
      </button>
    </div>
  );
}
