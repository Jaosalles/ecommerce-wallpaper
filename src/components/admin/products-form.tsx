import {
  CollectionItem,
  ProductFormData,
} from "@/components/admin/products-manager.shared";
import { useState } from "react";
import { FieldErrors, UseFormRegister } from "react-hook-form";

type AdminProductsFormProps = {
  isEditing: boolean;
  isSubmitting: boolean;
  errors: FieldErrors<ProductFormData>;
  register: UseFormRegister<ProductFormData>;
  collections: CollectionItem[];
  uploadLoading: boolean;
  canUploadImage: boolean;
  onUploadImage: (
    file: File,
    bucket: "product-images" | "product-originals",
  ) => Promise<void>;
  onCancelEdit: () => void;
};

export function AdminProductsForm({
  isEditing,
  isSubmitting,
  errors,
  register,
  collections,
  uploadLoading,
  canUploadImage,
  onUploadImage,
  onCancelEdit,
}: AdminProductsFormProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadBucket, setUploadBucket] = useState<
    "product-images" | "product-originals"
  >("product-images");

  async function handleUpload() {
    if (!selectedFile || !canUploadImage) {
      return;
    }

    await onUploadImage(selectedFile, uploadBucket);
    setSelectedFile(null);
  }

  return (
    <>
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
        <label className="text-sm font-medium" htmlFor="product-description">
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
            <p className="mt-1 text-xs text-red-500">{errors.price.message}</p>
          ) : null}
        </div>

        <div>
          <label className="text-sm font-medium" htmlFor="product-collection">
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

      <div className="space-y-2">
        <label className="text-sm font-medium">Imagens (maximo 3)</label>

        {[0, 1, 2].map((index) => (
          <div key={`product-image-${index}`}>
            <label className="text-xs" htmlFor={`product-image-${index}`}>
              URL da imagem {index + 1}
            </label>
            <input
              id={`product-image-${index}`}
              {...register(`imageUrls.${index}` as const)}
              className="site-input mt-1 w-full rounded-md px-3 py-2 text-sm outline-none"
            />
            {errors.imageUrls?.[index] ? (
              <p className="mt-1 text-xs text-red-500">
                {errors.imageUrls[index]?.message}
              </p>
            ) : null}
          </div>
        ))}

        {errors.imageUrls?.message ? (
          <p className="mt-1 text-xs text-red-500">{errors.imageUrls.message}</p>
        ) : null}

        <div className="mt-3 rounded-md border site-border p-3">
          <p className="text-xs font-medium">Upload no Supabase Storage</p>

          <div className="mt-2 grid gap-2 sm:grid-cols-[1fr_auto] sm:items-end">
            <div>
              <label className="text-xs" htmlFor="product-upload-file">
                Arquivo
              </label>
              <input
                id="product-upload-file"
                type="file"
                accept="image/jpeg,image/png,image/webp,image/avif"
                onChange={(event) => {
                  const file = event.target.files?.[0] ?? null;
                  setSelectedFile(file);
                }}
                className="site-input mt-1 w-full rounded-md px-3 py-2 text-xs outline-none"
              />
            </div>

            <div>
              <label className="text-xs" htmlFor="product-upload-bucket">
                Bucket
              </label>
              <select
                id="product-upload-bucket"
                value={uploadBucket}
                onChange={(event) => {
                  setUploadBucket(
                    event.target.value as
                      | "product-images"
                      | "product-originals",
                  );
                }}
                className="site-input mt-1 w-full rounded-md px-3 py-2 text-xs outline-none"
              >
                <option value="product-images">product-images (publico)</option>
                <option value="product-originals">
                  product-originals (privado)
                </option>
              </select>
            </div>
          </div>

          <p className="site-muted mt-2 text-xs">
            O upload funciona em criacao e edicao. A URL sera adicionada no
            proximo campo vazio.
          </p>

          <button
            type="button"
            disabled={!selectedFile || !canUploadImage || uploadLoading}
            onClick={handleUpload}
            className="site-btn mt-3 rounded-md px-3 py-2 text-xs font-medium disabled:opacity-60"
          >
            {uploadLoading
              ? "Enviando imagem..."
              : "Enviar imagem e preencher URL"}
          </button>
        </div>
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
            onClick={onCancelEdit}
            className="site-btn-secondary rounded-md px-4 py-2 text-sm font-medium"
          >
            Cancelar edição
          </button>
        ) : null}
      </div>
    </>
  );
}
