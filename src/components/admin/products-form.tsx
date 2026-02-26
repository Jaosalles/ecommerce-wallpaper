import {
  CollectionItem,
  ProductFormData,
} from "@/components/admin/products-manager.shared";
import { FieldErrors, UseFormRegister } from "react-hook-form";

type AdminProductsFormProps = {
  isEditing: boolean;
  isSubmitting: boolean;
  errors: FieldErrors<ProductFormData>;
  register: UseFormRegister<ProductFormData>;
  collections: CollectionItem[];
  onCancelEdit: () => void;
};

export function AdminProductsForm({
  isEditing,
  isSubmitting,
  errors,
  register,
  collections,
  onCancelEdit,
}: AdminProductsFormProps) {
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
          <p className="mt-1 text-xs text-red-500">{errors.imageUrl.message}</p>
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
