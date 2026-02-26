"use client";

import { useEffect } from "react";

type ConfirmDeleteModalProps = {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

export function ConfirmDeleteModal({
  open,
  title,
  description,
  confirmLabel = "Excluir",
  cancelLabel = "Cancelar",
  loading = false,
  onConfirm,
  onCancel,
}: ConfirmDeleteModalProps) {
  useEffect(() => {
    if (!open || loading) {
      return;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onCancel();
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, loading, onCancel]);

  if (!open) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
      onClick={(event) => {
        if (event.target === event.currentTarget && !loading) {
          onCancel();
        }
      }}
    >
      <div className="site-surface w-full max-w-md rounded-lg border site-border p-5 shadow-sm">
        <h3 className="text-lg font-semibold">{title}</h3>
        <p className="site-muted mt-2 text-sm">{description}</p>

        <div className="mt-5 flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="site-btn-secondary rounded-md px-4 py-2 text-sm font-medium disabled:opacity-60"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className="site-btn rounded-md px-4 py-2 text-sm font-medium disabled:opacity-60"
          >
            {loading ? "Excluindo..." : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
