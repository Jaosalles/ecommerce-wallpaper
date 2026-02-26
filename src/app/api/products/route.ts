import { fail, ok } from "@/lib/api";
import { getAuthenticatedUserFromCookie } from "@/lib/auth";
import { authz } from "@/lib/authz/facade";
import { prisma } from "@/lib/prisma";
import { createProductSchema } from "@/lib/validators";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const collection = searchParams.get("collection");

    const products = await prisma.product.findMany({
      where: collection
        ? {
            collection: {
              slug: {
                equals: collection,
                mode: "insensitive",
              },
            },
          }
        : undefined,
      include: {
        collection: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return ok(products);
  } catch {
    return fail("Erro ao buscar produtos", 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthenticatedUserFromCookie();
    const authorization = authz.authorize(user, "product:create");

    if (!authorization.ok) {
      return fail(authorization.error, authorization.status);
    }

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

    const collection = await prisma.collection.findUnique({
      where: { id: parsed.data.collectionId },
      select: { id: true },
    });

    if (!collection) {
      return fail("Coleção não encontrada", 404);
    }

    const product = await prisma.product.create({
      data: parsed.data,
      include: {
        collection: true,
      },
    });

    return ok(product, 201);
  } catch {
    return fail("Erro ao criar produto", 500);
  }
}
