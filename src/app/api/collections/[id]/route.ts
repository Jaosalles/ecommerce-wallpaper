import { fail, ok } from "@/lib/api";
import { getAuthenticatedUserFromCookie } from "@/lib/auth";
import { authz } from "@/lib/authz/facade";
import { prisma } from "@/lib/prisma";
import { updateCollectionSchema } from "@/lib/validators";
import { NextRequest } from "next/server";

type Params = {
  params: Promise<{ id: string }>;
};

export async function GET(_: NextRequest, { params }: Params) {
  try {
    const { id } = await params;

    const collection = await prisma.collection.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            products: true,
          },
        },
      },
    });

    if (!collection) {
      return fail("Coleção não encontrada", 404);
    }

    return ok(collection);
  } catch {
    return fail("Erro ao buscar coleção", 500);
  }
}

export async function PUT(request: NextRequest, { params }: Params) {
  try {
    const user = await getAuthenticatedUserFromCookie();
    const authorization = authz.authorize(user, "collection:update");

    if (!authorization.ok) {
      return fail(authorization.error, authorization.status);
    }

    const { id } = await params;

    const body = await request.json();
    const parsed = updateCollectionSchema.safeParse(body);

    if (!parsed.success) {
      return fail(parsed.error.issues[0]?.message ?? "Dados inválidos", 400);
    }

    if (parsed.data.slug) {
      const collectionWithSlug = await prisma.collection.findUnique({
        where: { slug: parsed.data.slug },
        select: { id: true },
      });

      if (collectionWithSlug && collectionWithSlug.id !== id) {
        return fail("Já existe uma coleção com este slug", 409);
      }
    }

    const collection = await prisma.collection.update({
      where: { id },
      data: parsed.data,
    });

    return ok(collection);
  } catch {
    return fail("Erro ao atualizar coleção", 500);
  }
}

export async function DELETE(_: NextRequest, { params }: Params) {
  try {
    const user = await getAuthenticatedUserFromCookie();
    const authorization = authz.authorize(user, "collection:delete");

    if (!authorization.ok) {
      return fail(authorization.error, authorization.status);
    }

    const { id } = await params;

    const productsCount = await prisma.product.count({
      where: { collectionId: id },
    });

    if (productsCount > 0) {
      return fail("Não é possível remover coleção com produtos vinculados", 409);
    }

    await prisma.collection.delete({
      where: { id },
    });

    return ok({ message: "Coleção removida com sucesso" });
  } catch {
    return fail("Erro ao remover coleção", 500);
  }
}
