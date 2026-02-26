import { fail, ok } from "@/lib/api";
import { getAuthenticatedUserFromCookie } from "@/lib/auth";
import { authz } from "@/lib/authz/facade";
import { prisma } from "@/lib/prisma";
import { createCollectionSchema } from "@/lib/validators";
import { NextRequest } from "next/server";

export async function GET() {
  try {
    const collections = await prisma.collection.findMany({
      include: {
        _count: {
          select: {
            products: true,
          },
        },
      },
      orderBy: {
        name: "asc",
      },
    });

    return ok(collections);
  } catch {
    return fail("Erro ao buscar coleções", 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthenticatedUserFromCookie();
    const authorization = authz.authorize(user, "collection:create");

    if (!authorization.ok) {
      return fail(authorization.error, authorization.status);
    }

    const body = await request.json();
    const parsed = createCollectionSchema.safeParse(body);

    if (!parsed.success) {
      return fail(parsed.error.issues[0]?.message ?? "Dados inválidos", 400);
    }

    const existingCollection = await prisma.collection.findUnique({
      where: { slug: parsed.data.slug },
      select: { id: true },
    });

    if (existingCollection) {
      return fail("Já existe uma coleção com este slug", 409);
    }

    const collection = await prisma.collection.create({
      data: parsed.data,
    });

    return ok(collection, 201);
  } catch {
    return fail("Erro ao criar coleção", 500);
  }
}
