"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useCallback, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { ConfirmDeleteModal } from "@/components/admin/confirm-delete-modal";
import { AdminProductsForm } from "@/components/admin/products-form";
import {
  CollectionItem,
  INITIAL_FORM,
  ProductFormData,
  ProductItem,
  productFormSchema,
  PRODUCTS_PAGE_SIZE,
} from "@/components/admin/products-manager.shared";
import { AdminProductsList } from "@/components/admin/products-list";
import { useAdminDelete } from "@/hooks/use-admin-delete";
import { useAdminEditor } from "@/hooks/use-admin-editor";
import { useAdminListResource } from "@/hooks/use-admin-list-resource";
import { useAdminUpsert } from "@/hooks/use-admin-upsert";
import { apiFetch, parseApiResponse } from "@/lib/client-api";
import { PaginatedResponse } from "@/types";

type UploadImageResponse = {
  bucket: "product-images" | "product-originals";
  path: string;
  url: string;
  mimeType: string;
  size: number;
};

export function AdminProductsManager() {
  const [productsPageRequest, setProductsPageRequest] = useState(1);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [creationDraftId, setCreationDraftId] = useState(() =>
    crypto.randomUUID(),
  );

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
      const normalizedImageUrls = [...item.imageUrls.slice(0, 3)];
      while (normalizedImageUrls.length < 3) {
        normalizedImageUrls.push("");
      }

      reset({
        name: item.name,
        slug: item.slug,
        description: item.description,
        price: item.price.toString(),
        imageUrls: normalizedImageUrls,
        collectionId: item.collectionId,
      });
    },
    [reset],
  );

  const {
    data: collections,
    loading: loadingCollections,
    isTransitionPending: transitioningCollections,
  } = useAdminListResource<CollectionItem[]>({
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

    setCreationDraftId(crypto.randomUUID());
  }, [collections, reset]);

  const { editingId, isEditing, startEdit, resetEdit } =
    useAdminEditor<ProductItem>({
      onStartEditItem: handleStartEdit,
      onResetForm: resetFormState,
    });

  const {
    data: productsResponse,
    loading: loadingProducts,
    isTransitionPending: transitioningProducts,
    reload: loadProducts,
  } = useAdminListResource<PaginatedResponse<ProductItem>>({
    endpoint: `/api/products?page=${productsPageRequest}&pageSize=${PRODUCTS_PAGE_SIZE}`,
    initialData: {
      data: [],
      total: 0,
      page: 1,
      pageSize: PRODUCTS_PAGE_SIZE,
      totalPages: 1,
    },
    loadErrorMessage: "Erro de conexão ao carregar produtos",
  });

  const loading = useMemo(
    () =>
      loadingCollections ||
      loadingProducts ||
      transitioningCollections ||
      transitioningProducts,
    [
      loadingCollections,
      loadingProducts,
      transitioningCollections,
      transitioningProducts,
    ],
  );

  const products = productsResponse.data;

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
      imageUrls: values.imageUrls.filter((value) => value.trim().length > 0),
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

  async function handleUploadImage(
    file: File,
    bucket: "product-images" | "product-originals",
  ) {
    setUploadLoading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);
      if (editingId) {
        formData.append("productId", editingId);
      } else {
        formData.append("draftId", creationDraftId);
      }
      formData.append("bucket", bucket);

      const response = await apiFetch("/api/uploads", {
        method: "POST",
        body: formData,
      });

      const uploaded = await parseApiResponse<UploadImageResponse>(response, {
        fallbackErrorMessage: "Nao foi possivel enviar a imagem",
      });

      const currentImageUrls = getValues("imageUrls");
      const targetIndex = currentImageUrls.findIndex(
        (value) => value.trim().length === 0,
      );

      if (targetIndex === -1) {
        toast.error("Limite de 3 imagens atingido");
        return;
      }

      const nextImageUrls = [...currentImageUrls];
      nextImageUrls[targetIndex] = uploaded.url;

      setValue("imageUrls", nextImageUrls, {
        shouldValidate: true,
        shouldDirty: true,
      });

      toast.success("Imagem enviada e URL preenchida");
    } catch (errorValue) {
      if (errorValue instanceof Error) {
        toast.error(errorValue.message);
      } else {
        toast.error("Erro ao enviar imagem");
      }
    } finally {
      setUploadLoading(false);
    }
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
          <AdminProductsForm
            isEditing={isEditing}
            isSubmitting={isSubmitting}
            errors={errors}
            register={register}
            collections={collections}
            uploadLoading={uploadLoading}
            canUploadImage={
              getValues("imageUrls").some((value) => value.trim().length === 0)
            }
            onUploadImage={handleUploadImage}
            onCancelEdit={resetEdit}
          />
        </form>
      </article>

      <AdminProductsList
        loading={loading}
        products={products}
        page={productsResponse.page}
        totalPages={productsResponse.totalPages}
        onPageChange={setProductsPageRequest}
        onEdit={startEdit}
        onDelete={openDeleteModal}
      />

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
