"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { ConfirmDeleteModal } from "@/components/admin/confirm-delete-modal";
import { toast } from "sonner";

type CollectionItem = {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  _count?: {
    products: number;
  };
};

type ApiResponse<T> = {
  success: boolean;
  data?: T;
  error?: string;
};

const INITIAL_FORM = {
  name: "",
  slug: "",
  description: "",
};

export function AdminCollectionsManager() {
  const [collections, setCollections] = useState<CollectionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(INITIAL_FORM);
  const [deleteTarget, setDeleteTarget] = useState<CollectionItem | null>(null);
  const [deleting, setDeleting] = useState(false);

  const isEditing = useMemo(() => Boolean(editingId), [editingId]);

  const loadCollections = useCallback(async () => {
    try {
      setLoading(true);

      const response = await fetch("/api/collections", {
        method: "GET",
        credentials: "include",
      });

      const payload = (await response.json()) as ApiResponse<CollectionItem[]>;

      if (!response.ok || !payload.success || !payload.data) {
        toast.error(payload.error ?? "Não foi possível carregar as coleções");
        return;
      }

      setCollections(payload.data);
    } catch {
      toast.error("Erro de conexão ao carregar coleções");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCollections();
  }, [loadCollections]);

  function resetForm() {
    setForm(INITIAL_FORM);
    setEditingId(null);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);

    try {
      const endpoint = editingId
        ? `/api/collections/${editingId}`
        : "/api/collections";
      const method = editingId ? "PUT" : "POST";

      const response = await fetch(endpoint, {
        method,
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: form.name,
          slug: form.slug,
          description: form.description || undefined,
        }),
      });

      const payload = (await response.json()) as ApiResponse<CollectionItem>;

      if (!response.ok || !payload.success) {
        toast.error(payload.error ?? "Não foi possível salvar a coleção");
        return;
      }

      toast.success(
        editingId
          ? "Coleção atualizada com sucesso"
          : "Coleção criada com sucesso",
      );
      resetForm();
      await loadCollections();
    } catch {
      toast.error("Erro de conexão ao salvar coleção");
    } finally {
      setSaving(false);
    }
  }

  function handleStartEdit(item: CollectionItem) {
    setEditingId(item.id);
    setForm({
      name: item.name,
      slug: item.slug,
      description: item.description ?? "",
    });
  }

  async function handleDelete(id: string) {
    setDeleting(true);

    try {
      const response = await fetch(`/api/collections/${id}`, {
        method: "DELETE",
        credentials: "include",
      });

      const payload = (await response.json()) as ApiResponse<{
        message: string;
      }>;

      if (!response.ok || !payload.success) {
        toast.error(payload.error ?? "Não foi possível remover a coleção");
        return;
      }

      if (editingId === id) {
        resetForm();
      }

      toast.success("Coleção removida com sucesso");
      await loadCollections();
      setDeleteTarget(null);
    } catch {
      toast.error("Erro de conexão ao remover coleção");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <section className="grid gap-4 lg:grid-cols-[1.2fr_1fr]">
      <article className="site-surface rounded-lg border site-border p-4">
        <h2 className="text-lg font-semibold">
          {isEditing ? "Editar coleção" : "Nova coleção"}
        </h2>

        <form onSubmit={handleSubmit} className="mt-4 space-y-3">
          <div>
            <label htmlFor="collection-name" className="text-sm font-medium">
              Nome
            </label>
            <input
              id="collection-name"
              required
              value={form.name}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, name: event.target.value }))
              }
              className="site-input mt-1 w-full rounded-md px-3 py-2 text-sm outline-none"
            />
          </div>

          <div>
            <label htmlFor="collection-slug" className="text-sm font-medium">
              Slug
            </label>
            <input
              id="collection-slug"
              required
              value={form.slug}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, slug: event.target.value }))
              }
              className="site-input mt-1 w-full rounded-md px-3 py-2 text-sm outline-none"
            />
          </div>

          <div>
            <label
              htmlFor="collection-description"
              className="text-sm font-medium"
            >
              Descrição
            </label>
            <textarea
              id="collection-description"
              value={form.description}
              onChange={(event) =>
                setForm((prev) => ({
                  ...prev,
                  description: event.target.value,
                }))
              }
              className="site-input mt-1 min-h-24 w-full rounded-md px-3 py-2 text-sm outline-none"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="submit"
              disabled={saving}
              className="site-btn rounded-md px-4 py-2 text-sm font-medium disabled:opacity-60"
            >
              {saving
                ? "Salvando..."
                : isEditing
                  ? "Salvar alterações"
                  : "Criar coleção"}
            </button>

            {isEditing ? (
              <button
                type="button"
                onClick={resetForm}
                className="site-btn-secondary rounded-md px-4 py-2 text-sm font-medium"
              >
                Cancelar edição
              </button>
            ) : null}
          </div>
        </form>
      </article>

      <article className="site-surface rounded-lg border site-border p-4">
        <h2 className="text-lg font-semibold">Coleções cadastradas</h2>

        {loading ? (
          <p className="site-muted mt-3 text-sm">Carregando...</p>
        ) : null}

        {!loading && !collections.length ? (
          <p className="site-muted mt-3 text-sm">Nenhuma coleção cadastrada.</p>
        ) : null}

        <ul className="mt-3 space-y-2">
          {collections.map((item) => (
            <li
              key={item.id}
              className="site-surface-soft rounded-md border site-border p-3"
            >
              <p className="font-medium">{item.name}</p>
              <p className="site-muted text-xs">slug: {item.slug}</p>
              <p className="site-muted mt-1 text-xs">
                Produtos: {item._count?.products ?? 0}
              </p>

              <div className="mt-3 flex gap-2">
                <button
                  type="button"
                  onClick={() => handleStartEdit(item)}
                  className="site-btn-secondary rounded-md px-2 py-1 text-xs"
                >
                  Editar
                </button>
                <button
                  type="button"
                  onClick={() => setDeleteTarget(item)}
                  className="site-btn-secondary rounded-md px-2 py-1 text-xs"
                >
                  Excluir
                </button>
              </div>
            </li>
          ))}
        </ul>
      </article>

      <ConfirmDeleteModal
        open={Boolean(deleteTarget)}
        title="Confirmar exclusão"
        description={`Tem certeza que deseja excluir a coleção \"${deleteTarget?.name ?? ""}\"?`}
        loading={deleting}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={() => {
          if (deleteTarget) {
            handleDelete(deleteTarget.id);
          }
        }}
      />
    </section>
  );
}
