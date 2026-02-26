"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useCallback } from "react";
import { useForm } from "react-hook-form";
import { ConfirmDeleteModal } from "@/components/admin/confirm-delete-modal";
import { useAdminDelete } from "@/hooks/use-admin-delete";
import { useAdminEditor } from "@/hooks/use-admin-editor";
import { useAdminListResource } from "@/hooks/use-admin-list-resource";
import { useAdminUpsert } from "@/hooks/use-admin-upsert";
import { createCollectionSchema } from "@/lib/validators";
import { z } from "zod";

type CollectionItem = {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  _count?: {
    products: number;
  };
};

const INITIAL_FORM = {
  name: "",
  slug: "",
  description: "",
};

const collectionFormSchema = createCollectionSchema.extend({
  description: z
    .union([z.literal(""), z.string().min(2, "Descrição inválida")])
    .optional(),
});

type CollectionFormData = z.infer<typeof collectionFormSchema>;

export function AdminCollectionsManager() {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CollectionFormData>({
    resolver: zodResolver(collectionFormSchema),
    defaultValues: INITIAL_FORM,
  });

  const handleStartEdit = useCallback(
    (item: CollectionItem) => {
      reset({
        name: item.name,
        slug: item.slug,
        description: item.description ?? "",
      });
    },
    [reset],
  );

  const resetFormState = useCallback(() => {
    reset(INITIAL_FORM);
  }, [reset]);

  const { editingId, isEditing, startEdit, resetEdit } =
    useAdminEditor<CollectionItem>({
      onStartEditItem: handleStartEdit,
      onResetForm: resetFormState,
    });

  const {
    data: collections,
    loading,
    reload: loadCollections,
  } = useAdminListResource<CollectionItem[]>({
    endpoint: "/api/collections",
    initialData: [],
    loadErrorMessage: "Erro de conexão ao carregar coleções",
  });

  const { submit: submitCollection } = useAdminUpsert<
    CollectionFormData,
    CollectionItem
  >({
    editingId,
    createEndpoint: "/api/collections",
    updateEndpoint: (id) => `/api/collections/${id}`,
    mapBody: (values) => {
      const normalizedDescription = values.description?.trim();

      return {
        name: values.name,
        slug: values.slug,
        description: normalizedDescription ? normalizedDescription : undefined,
      };
    },
    createSuccessMessage: "Coleção criada com sucesso",
    updateSuccessMessage: "Coleção atualizada com sucesso",
    fallbackErrorMessage: "Não foi possível salvar a coleção",
    connectionErrorMessage: "Erro de conexão ao salvar coleção",
    onSuccess: async () => {
      resetEdit();
      await loadCollections();
    },
  });

  async function onSubmit(values: CollectionFormData) {
    await submitCollection(values);
  }

  const {
    deleteTarget,
    deleting,
    openDeleteModal,
    closeDeleteModal,
    confirmDelete,
  } = useAdminDelete<CollectionItem>({
    buildEndpoint: (id) => `/api/collections/${id}`,
    fallbackErrorMessage: "Erro de conexão ao remover coleção",
    successMessage: "Coleção removida com sucesso",
    onDeleted: async (id) => {
      if (editingId === id) {
        resetEdit();
      }

      await loadCollections();
    },
  });

  return (
    <section className="grid gap-4 lg:grid-cols-[1.2fr_1fr]">
      <article className="site-surface rounded-lg border site-border p-4">
        <h2 className="text-lg font-semibold">
          {isEditing ? "Editar coleção" : "Nova coleção"}
        </h2>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-4 space-y-3">
          <div>
            <label htmlFor="collection-name" className="text-sm font-medium">
              Nome
            </label>
            <input
              id="collection-name"
              {...register("name")}
              className="site-input mt-1 w-full rounded-md px-3 py-2 text-sm outline-none"
            />
            {errors.name ? (
              <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>
            ) : null}
          </div>

          <div>
            <label htmlFor="collection-slug" className="text-sm font-medium">
              Slug
            </label>
            <input
              id="collection-slug"
              {...register("slug")}
              className="site-input mt-1 w-full rounded-md px-3 py-2 text-sm outline-none"
            />
            {errors.slug ? (
              <p className="mt-1 text-xs text-red-500">{errors.slug.message}</p>
            ) : null}
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
              {...register("description")}
              className="site-input mt-1 min-h-24 w-full rounded-md px-3 py-2 text-sm outline-none"
            />
            {errors.description ? (
              <p className="mt-1 text-xs text-red-500">
                {errors.description.message}
              </p>
            ) : null}
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="site-btn rounded-md px-4 py-2 text-sm font-medium disabled:opacity-60"
            >
              {isSubmitting
                ? "Salvando..."
                : isEditing
                  ? "Salvar alterações"
                  : "Criar coleção"}
            </button>

            {isEditing ? (
              <button
                type="button"
                onClick={resetEdit}
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
                  onClick={() => startEdit(item)}
                  className="site-btn-secondary rounded-md px-2 py-1 text-xs"
                >
                  Editar
                </button>
                <button
                  type="button"
                  onClick={() => openDeleteModal(item)}
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
        onCancel={closeDeleteModal}
        onConfirm={confirmDelete}
      />
    </section>
  );
}
