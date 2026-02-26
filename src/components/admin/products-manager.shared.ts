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
  imageUrl: string;
  collectionId: string;
  collection: CollectionItem;
};

export const PRODUCTS_PAGE_SIZE = 5;

export const INITIAL_FORM = {
  name: "",
  slug: "",
  description: "",
  price: "",
  imageUrl: "",
  collectionId: "",
};

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
  imageUrl: createProductSchema.shape.imageUrl,
  collectionId: createProductSchema.shape.collectionId,
});

export type ProductFormData = z.infer<typeof productFormSchema>;
