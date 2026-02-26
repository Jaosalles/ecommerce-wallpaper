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

export const createProductSchema = z.object({
  name: z.string().min(2, "Nome inválido"),
  slug: z.string().min(2, "Slug inválido"),
  description: z.string().min(10, "Descrição muito curta"),
  price: z.number().positive("Preço deve ser positivo"),
  imageUrl: z.string().min(1, "URL da imagem é obrigatória"),
  collectionId: z.string().min(1, "Coleção inválida"),
});

export const updateProductSchema = createProductSchema.partial();

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
