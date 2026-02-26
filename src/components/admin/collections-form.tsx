import { CollectionFormData } from "@/components/admin/collections-manager.shared";
import { FieldErrors, UseFormRegister } from "react-hook-form";

type AdminCollectionsFormProps = {
  isEditing: boolean;
  isSubmitting: boolean;
  errors: FieldErrors<CollectionFormData>;
  register: UseFormRegister<CollectionFormData>;
  onCancelEdit: () => void;
};

export function AdminCollectionsForm({
  isEditing,
  isSubmitting,
  errors,
  register,
  onCancelEdit,
}: AdminCollectionsFormProps) {
  return (
    <>
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
        <label htmlFor="collection-description" className="text-sm font-medium">
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
