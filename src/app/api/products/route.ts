import { fail, ok } from "@/lib/api";
import { getAuthTokenFromCookie, verifyToken } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createProductSchema } from "@/lib/validators";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");

    const products = await prisma.product.findMany({
      where: category
        ? {
            category: {
              equals: category,
              mode: "insensitive",
            },
          }
        : undefined,
      orderBy: { createdAt: "desc" },
    });

    return ok(products);
  } catch {
    return fail("Erro ao buscar produtos", 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = await getAuthTokenFromCookie();

    if (!token) {
      return fail("Não autenticado", 401);
    }

    verifyToken(token);

    const body = await request.json();
    const parsed = createProductSchema.safeParse(body);

    if (!parsed.success) {
      return fail(parsed.error.issues[0]?.message ?? "Dados inválidos", 400);
    }

    const existingProduct = await prisma.product.findUnique({
      where: { slug: parsed.data.slug },
    });

    if (existingProduct) {
      return fail("Já existe um produto com este slug", 409);
    }

    const product = await prisma.product.create({ data: parsed.data });

    return ok(product, 201);
  } catch {
    return fail("Erro ao criar produto", 500);
  }
}
