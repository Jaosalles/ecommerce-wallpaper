import { z } from "zod";

export const registerSchema = z.object({
  email: z.email("Email inválido"),
  password: z.string().min(6, "A senha deve ter pelo menos 6 caracteres"),
  name: z.string().min(2, "O nome deve ter pelo menos 2 caracteres"),
  phone: z.string().optional(),
});

export const loginSchema = z.object({
  email: z.email("Email inválido"),
  password: z.string().min(1, "Senha é obrigatória"),
});

export const loginRequestSchema = loginSchema.extend({
  requiredRole: z.enum(["CUSTOMER", "ADMIN"]).optional(),
});

export const createProductSchema = z.object({
  name: z.string().min(2, "Nome inválido"),
  slug: z.string().min(2, "Slug inválido"),
  description: z.string().min(10, "Descrição muito curta"),
  price: z.number().positive("Preço deve ser positivo"),
  imageUrls: z
    .array(z.string().url("URL da imagem inválida"))
    .min(1, "Pelo menos 1 imagem é obrigatória")
    .max(3, "Máximo de 3 imagens por produto"),
  collectionId: z.string().min(1, "Coleção inválida"),
});

export const updateProductSchema = createProductSchema.partial();

export const createCollectionSchema = z.object({
  name: z.string().min(2, "Nome da coleção inválido"),
  slug: z.string().min(2, "Slug da coleção inválido"),
  description: z.string().min(2, "Descrição inválida").optional(),
});

export const updateCollectionSchema = createCollectionSchema.partial();

export const cartItemInputSchema = z.object({
  productId: z.string().min(1, "Produto inválido"),
  quantity: z
    .number()
    .int("Quantidade inválida")
    .positive("Quantidade deve ser maior que zero")
    .max(99, "Quantidade máxima por item é 99")
    .default(1),
});

export const createOrderSchema = z.object({
  items: z
    .array(
      z.object({
        productId: z.string().min(1, "Produto inválido"),
        quantity: z
          .number()
          .int("Quantidade inválida")
          .positive("Quantidade deve ser maior que zero")
          .max(99, "Quantidade máxima por item é 99"),
      }),
    )
    .min(1, "O pedido precisa ter ao menos 1 item"),
});

export const uploadImageMetadataSchema = z
  .object({
    productId: z.string().trim().optional(),
    draftId: z.string().trim().optional(),
    bucket: z.enum(["product-images", "product-originals"]),
  })
  .refine((value) => Boolean(value.productId || value.draftId), {
    message: "Informe productId ou draftId para o upload",
    path: ["productId"],
  });

export const deleteUploadSchema = z.object({
  bucket: z.enum(["product-images", "product-originals"]),
  path: z.string().min(1, "Caminho do arquivo inválido"),
});
