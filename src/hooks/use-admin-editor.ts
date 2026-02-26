import { useCallback, useMemo, useState } from "react";

type UseAdminEditorParams<TItem extends { id: string }> = {
  onStartEditItem: (item: TItem) => void;
  onResetForm: () => void;
};

export function useAdminEditor<TItem extends { id: string }>({
  onStartEditItem,
  onResetForm,
}: UseAdminEditorParams<TItem>) {
  const [editingId, setEditingId] = useState<string | null>(null);

  const isEditing = useMemo(() => Boolean(editingId), [editingId]);

  const startEdit = useCallback(
    (item: TItem) => {
      setEditingId(item.id);
      onStartEditItem(item);
    },
    [onStartEditItem],
  );

  const resetEdit = useCallback(() => {
    setEditingId(null);
    onResetForm();
  }, [onResetForm]);

  return {
    editingId,
    isEditing,
    startEdit,
    resetEdit,
  };
}
