"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useCallback, useMemo } from "react";
import { useForm } from "react-hook-form";
import { ConfirmDeleteModal } from "@/components/admin/confirm-delete-modal";
import { useAdminDelete } from "@/hooks/use-admin-delete";
import { useAdminEditor } from "@/hooks/use-admin-editor";
import { useAdminListResource } from "@/hooks/use-admin-list-resource";
import { useAdminUpsert } from "@/hooks/use-admin-upsert";
import { createProductSchema } from "@/lib/validators";
import { z } from "zod";

type CollectionItem = {
  id: string;
  name: string;
  slug: string;
};

type ProductItem = {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  imageUrl: string;
  collectionId: string;
  collection: CollectionItem;
};

const INITIAL_FORM = {
  name: "",
  slug: "",
  description: "",
  price: "",
  imageUrl: "",
  collectionId: "",
};

const productFormSchema = z.object({
  name: createProductSchema.shape.name,
  slug: createProductSchema.shape.slug,
  description: createProductSchema.shape.description,
  price: z
    .string()
    .min(1, "Preço é obrigatório")
    .refine(
      (value) => {
        const parsed = Number(value);
        return Number.isFinite(parsed) && parsed > 0;
      },
      { message: "Preço deve ser positivo" },
    ),
  imageUrl: createProductSchema.shape.imageUrl,
  collectionId: createProductSchema.shape.collectionId,
});

type ProductFormData = z.infer<typeof productFormSchema>;

export function AdminProductsManager() {
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm<ProductFormData>({
    resolver: zodResolver(productFormSchema),
    defaultValues: INITIAL_FORM,
  });

  const handleStartEdit = useCallback(
    (item: ProductItem) => {
      reset({
        name: item.name,
        slug: item.slug,
        description: item.description,
        price: item.price.toString(),
        imageUrl: item.imageUrl,
        collectionId: item.collectionId,
      });
    },
    [reset],
  );

  const { data: collections, loading: loadingCollections } =
    useAdminListResource<CollectionItem[]>({
      endpoint: "/api/collections",
      initialData: [],
      loadErrorMessage: "Erro de conexão ao carregar coleções",
      onLoaded: (collectionList) => {
        if (collectionList.length === 0) {
          return;
        }

        const currentCollectionId = getValues("collectionId");

        if (!currentCollectionId) {
          setValue("collectionId", collectionList[0].id);
        }
      },
    });

  const resetFormState = useCallback(() => {
    reset({
      ...INITIAL_FORM,
      collectionId: collections[0]?.id ?? "",
    });
  }, [collections, reset]);

  const { editingId, isEditing, startEdit, resetEdit } =
    useAdminEditor<ProductItem>({
      onStartEditItem: handleStartEdit,
      onResetForm: resetFormState,
    });

  const {
    data: products,
    loading: loadingProducts,
    reload: loadProducts,
  } = useAdminListResource<ProductItem[]>({
    endpoint: "/api/products",
    initialData: [],
    loadErrorMessage: "Erro de conexão ao carregar produtos",
  });

  const loading = useMemo(
    () => loadingCollections || loadingProducts,
    [loadingCollections, loadingProducts],
  );

  const { submit: submitProduct } = useAdminUpsert<
    ProductFormData,
    ProductItem
  >({
    editingId,
    createEndpoint: "/api/products",
    updateEndpoint: (id) => `/api/products/${id}`,
    mapBody: (values) => ({
      name: values.name,
      slug: values.slug,
      description: values.description,
      price: Number(values.price),
      imageUrl: values.imageUrl,
      collectionId: values.collectionId,
    }),
    createSuccessMessage: "Produto criado com sucesso",
    updateSuccessMessage: "Produto atualizado com sucesso",
    fallbackErrorMessage: "Não foi possível salvar o produto",
    connectionErrorMessage: "Erro de conexão ao salvar produto",
    onSuccess: async () => {
      resetEdit();
      await loadProducts();
    },
  });

  async function onSubmit(values: ProductFormData) {
    await submitProduct(values);
  }

  const {
    deleteTarget,
    deleting,
    openDeleteModal,
    closeDeleteModal,
    confirmDelete,
  } = useAdminDelete<ProductItem>({
    buildEndpoint: (id) => `/api/products/${id}`,
    fallbackErrorMessage: "Erro de conexão ao remover produto",
    successMessage: "Produto removido com sucesso",
    onDeleted: async (id) => {
      if (editingId === id) {
        resetEdit();
      }

      await loadProducts();
    },
  });

  return (
    <section className="grid gap-4 lg:grid-cols-[1.2fr_1fr]">
      <article className="site-surface rounded-lg border site-border p-4">
        <h2 className="text-lg font-semibold">
          {isEditing ? "Editar produto" : "Novo produto"}
        </h2>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-4 space-y-3">
          <div>
            <label className="text-sm font-medium" htmlFor="product-name">
              Nome
            </label>
            <input
              id="product-name"
              {...register("name")}
              className="site-input mt-1 w-full rounded-md px-3 py-2 text-sm outline-none"
            />
            {errors.name ? (
              <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>
            ) : null}
          </div>

          <div>
            <label className="text-sm font-medium" htmlFor="product-slug">
              Slug
            </label>
            <input
              id="product-slug"
              {...register("slug")}
              className="site-input mt-1 w-full rounded-md px-3 py-2 text-sm outline-none"
            />
            {errors.slug ? (
              <p className="mt-1 text-xs text-red-500">{errors.slug.message}</p>
            ) : null}
          </div>

          <div>
            <label
              className="text-sm font-medium"
              htmlFor="product-description"
            >
              Descrição
            </label>
            <textarea
              id="product-description"
              {...register("description")}
              className="site-input mt-1 min-h-24 w-full rounded-md px-3 py-2 text-sm outline-none"
            />
            {errors.description ? (
              <p className="mt-1 text-xs text-red-500">
                {errors.description.message}
              </p>
            ) : null}
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="text-sm font-medium" htmlFor="product-price">
                Preço
              </label>
              <input
                id="product-price"
                type="number"
                min="0"
                step="0.01"
                {...register("price")}
                className="site-input mt-1 w-full rounded-md px-3 py-2 text-sm outline-none"
              />
              {errors.price ? (
                <p className="mt-1 text-xs text-red-500">
                  {errors.price.message}
                </p>
              ) : null}
            </div>

            <div>
              <label
                className="text-sm font-medium"
                htmlFor="product-collection"
              >
                Coleção
              </label>
              <select
                id="product-collection"
                {...register("collectionId")}
                className="site-input mt-1 w-full rounded-md px-3 py-2 text-sm outline-none"
              >
                {collections.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </select>
              {errors.collectionId ? (
                <p className="mt-1 text-xs text-red-500">
                  {errors.collectionId.message}
                </p>
              ) : null}
            </div>
          </div>

          <div>
            <label className="text-sm font-medium" htmlFor="product-image">
              URL da imagem
            </label>
            <input
              id="product-image"
              {...register("imageUrl")}
              className="site-input mt-1 w-full rounded-md px-3 py-2 text-sm outline-none"
            />
            {errors.imageUrl ? (
              <p className="mt-1 text-xs text-red-500">
                {errors.imageUrl.message}
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
                  : "Criar produto"}
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
        <h2 className="text-lg font-semibold">Produtos cadastrados</h2>

        {loading ? (
          <p className="site-muted mt-3 text-sm">Carregando...</p>
        ) : null}

        {!loading && !products.length ? (
          <p className="site-muted mt-3 text-sm">Nenhum produto cadastrado.</p>
        ) : null}

        <ul className="mt-3 space-y-2">
          {products.map((item) => (
            <li
              key={item.id}
              className="site-surface-soft rounded-md border site-border p-3"
            >
              <p className="font-medium">{item.name}</p>
              <p className="site-muted text-xs">slug: {item.slug}</p>
              <p className="site-muted text-xs">
                coleção: {item.collection.name}
              </p>
              <p className="site-muted mt-1 text-xs">
                {item.price.toLocaleString("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                })}
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
        description={`Tem certeza que deseja excluir o produto \"${deleteTarget?.name ?? ""}\"?`}
        loading={deleting}
        onCancel={closeDeleteModal}
        onConfirm={confirmDelete}
      />
    </section>
  );
}
