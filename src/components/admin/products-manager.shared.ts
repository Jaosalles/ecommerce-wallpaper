import { createProductSchema } from "@/lib/validators";
import { z } from "zod";

export type CollectionItem = {
  id: string;
  name: string;
  slug: string;
};

export type ProductItem = {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  imageUrls: string[];
  collectionId: string;
  collection: CollectionItem;
};

export const PRODUCTS_PAGE_SIZE = 5;

export const INITIAL_FORM = {
  name: "",
  slug: "",
  description: "",
  price: "",
  imageUrls: ["", "", ""],
  collectionId: "",
};

const optionalImageUrlSchema = z
  .string()
  .transform((value) => value.trim())
  .refine(
    (value) => {
      if (!value) {
        return true;
      }

      try {
        new URL(value);
        return true;
      } catch {
        return false;
      }
    },
    { message: "URL da imagem inválida" },
  );

export const productFormSchema = z.object({
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
  imageUrls: z
    .array(optionalImageUrlSchema)
    .length(3, "Use exatamente 3 campos de imagem")
    .refine(
      (values) => values.filter((value) => value.length > 0).length >= 1,
      {
        message: "Pelo menos 1 imagem é obrigatória",
      },
    ),
  collectionId: createProductSchema.shape.collectionId,
});

export type ProductFormData = z.infer<typeof productFormSchema>;
