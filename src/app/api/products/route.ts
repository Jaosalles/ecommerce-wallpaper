import { fail, ok } from "@/lib/api";
import { getAuthenticatedUserFromCookie } from "@/lib/auth";
import { authz } from "@/lib/authz/facade";
import { errorCodes, errorMessages } from "@/lib/error-messages";
import { prisma } from "@/lib/prisma";
import { createProductSchema } from "@/lib/validators";
import { PaginatedResponse } from "@/types";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const collection = searchParams.get("collection");
    const pageParam = searchParams.get("page");
    const pageSizeParam = searchParams.get("pageSize");

    const parsedPage = Number(pageParam ?? "1");
    const parsedPageSize = Number(pageSizeParam ?? "10");
    const shouldPaginate = pageParam !== null || pageSizeParam !== null;

    const page = Number.isFinite(parsedPage) && parsedPage > 0 ? parsedPage : 1;
    const pageSize =
      Number.isFinite(parsedPageSize) && parsedPageSize > 0
        ? parsedPageSize
        : 10;

    const where = collection
      ? {
          collection: {
            slug: {
              equals: collection,
              mode: "insensitive" as const,
            },
          },
        }
      : undefined;

    if (!shouldPaginate) {
      const products = await prisma.product.findMany({
        where,
        include: {
          collection: true,
        },
        orderBy: { createdAt: "desc" },
      });

      return ok(products);
    }

    const total = await prisma.product.count({ where });
    const totalPages = Math.max(1, Math.ceil(total / pageSize));
    const normalizedPage = Math.min(page, totalPages);
    const skip = (normalizedPage - 1) * pageSize;

    const products = await prisma.product.findMany({
      where,
      include: {
        collection: true,
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: pageSize,
    });

    const payload: PaginatedResponse<(typeof products)[number]> = {
      data: products,
      total,
      page: normalizedPage,
      pageSize,
      totalPages,
    };

    return ok(payload);
  } catch {
    return fail(errorMessages.product.fetchManyUnexpected, 500, {
      code: errorCodes.product.fetchManyUnexpected,
    });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthenticatedUserFromCookie();
    const authorization = authz.authorize(user, "product:create");

    if (!authorization.ok) {
      const authorizationCode =
        authorization.status === 401
          ? errorCodes.common.notAuthenticated
          : errorCodes.common.accessDenied;

      return fail(authorization.error, authorization.status, {
        code: authorizationCode,
      });
    }

    const body = await request.json();
    const parsed = createProductSchema.safeParse(body);

    if (!parsed.success) {
      return fail(
        parsed.error.issues[0]?.message ?? errorMessages.common.invalidData,
        400,
        { code: errorCodes.common.invalidData },
      );
    }

    const existingProduct = await prisma.product.findUnique({
      where: { slug: parsed.data.slug },
    });

    if (existingProduct) {
      return fail(errorMessages.product.duplicateSlug, 409, {
        code: errorCodes.product.duplicateSlug,
      });
    }

    const collection = await prisma.collection.findUnique({
      where: { id: parsed.data.collectionId },
      select: { id: true },
    });

    if (!collection) {
      return fail(errorMessages.collection.notFound, 404, {
        code: errorCodes.collection.notFound,
      });
    }

    const product = await prisma.product.create({
      data: parsed.data,
      include: {
        collection: true,
      },
    });

    return ok(product, 201);
  } catch {
    return fail(errorMessages.product.createUnexpected, 500, {
      code: errorCodes.product.createUnexpected,
    });
  }
}
