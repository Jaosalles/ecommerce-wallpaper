"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useCallback, useState } from "react";
import { useForm } from "react-hook-form";
import { AdminCollectionsForm } from "@/components/admin/collections-form";
import { AdminCollectionsList } from "@/components/admin/collections-list";
import {
  CollectionFormData,
  CollectionItem,
  collectionFormSchema,
  COLLECTIONS_PAGE_SIZE,
  INITIAL_FORM,
} from "@/components/admin/collections-manager.shared";
import { ConfirmDeleteModal } from "@/components/admin/confirm-delete-modal";
import { useAdminDelete } from "@/hooks/use-admin-delete";
import { useAdminEditor } from "@/hooks/use-admin-editor";
import { useAdminListResource } from "@/hooks/use-admin-list-resource";
import { useAdminUpsert } from "@/hooks/use-admin-upsert";
import { PaginatedResponse } from "@/types";

export function AdminCollectionsManager() {
  const [collectionsPageRequest, setCollectionsPageRequest] = useState(1);

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
    data: collectionsResponse,
    loading,
    isTransitionPending,
    reload: loadCollections,
  } = useAdminListResource<PaginatedResponse<CollectionItem>>({
    endpoint: `/api/collections?page=${collectionsPageRequest}&pageSize=${COLLECTIONS_PAGE_SIZE}`,
    initialData: {
      data: [],
      total: 0,
      page: 1,
      pageSize: COLLECTIONS_PAGE_SIZE,
      totalPages: 1,
    },
    loadErrorMessage: "Erro de conexão ao carregar coleções",
  });

  const collections = collectionsResponse.data;

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
          <AdminCollectionsForm
            isEditing={isEditing}
            isSubmitting={isSubmitting}
            errors={errors}
            register={register}
            onCancelEdit={resetEdit}
          />
        </form>
      </article>

      <AdminCollectionsList
        loading={loading}
        isTransitionPending={isTransitionPending}
        collections={collections}
        page={collectionsResponse.page}
        totalPages={collectionsResponse.totalPages}
        onPageChange={setCollectionsPageRequest}
        onEdit={startEdit}
        onDelete={openDeleteModal}
      />

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
