import { createCollectionSchema } from "@/lib/validators";
import { z } from "zod";

export type CollectionItem = {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  _count?: {
    products: number;
  };
};

export const INITIAL_FORM = {
  name: "",
  slug: "",
  description: "",
};

export const COLLECTIONS_PAGE_SIZE = 5;

export const collectionFormSchema = createCollectionSchema.extend({
  description: z
    .union([z.literal(""), z.string().min(2, "Descrição inválida")])
    .optional(),
});

export type CollectionFormData = z.infer<typeof collectionFormSchema>;
