import { fail, ok } from "@/lib/api";
import { getAuthenticatedUserFromCookie } from "@/lib/auth";
import { authz } from "@/lib/authz/facade";
import { prisma } from "@/lib/prisma";
import { updateProductSchema } from "@/lib/validators";
import { NextRequest } from "next/server";

type Params = {
  params: Promise<{ id: string }>;
};

export async function GET(_: NextRequest, { params }: Params) {
  try {
    const { id } = await params;

    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        collection: true,
      },
    });

    if (!product) {
      return fail("Produto não encontrado", 404);
    }

    return ok(product);
  } catch {
    return fail("Erro ao buscar produto", 500);
  }
}

export async function PUT(request: NextRequest, { params }: Params) {
  try {
    const user = await getAuthenticatedUserFromCookie();
    const authorization = authz.authorize(user, "product:update");

    if (!authorization.ok) {
      return fail(authorization.error, authorization.status);
    }

    const { id } = await params;

    const body = await request.json();
    const parsed = updateProductSchema.safeParse(body);

    if (!parsed.success) {
      return fail(parsed.error.issues[0]?.message ?? "Dados inválidos", 400);
    }

    if (parsed.data.collectionId) {
      const collection = await prisma.collection.findUnique({
        where: { id: parsed.data.collectionId },
        select: { id: true },
      });

      if (!collection) {
        return fail("Coleção não encontrada", 404);
      }
    }

    const product = await prisma.product.update({
      where: { id },
      data: parsed.data,
      include: {
        collection: true,
      },
    });

    return ok(product);
  } catch {
    return fail("Erro ao atualizar produto", 500);
  }
}

export async function DELETE(_: NextRequest, { params }: Params) {
  try {
    const user = await getAuthenticatedUserFromCookie();
    const authorization = authz.authorize(user, "product:delete");

    if (!authorization.ok) {
      return fail(authorization.error, authorization.status);
    }

    const { id } = await params;

    await prisma.product.delete({ where: { id } });

    return ok({ message: "Produto removido com sucesso" });
  } catch {
    return fail("Erro ao remover produto", 500);
  }
}
