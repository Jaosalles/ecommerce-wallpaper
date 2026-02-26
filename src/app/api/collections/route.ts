import { fail, ok } from "@/lib/api";
import { getAuthenticatedUserFromCookie } from "@/lib/auth";
import { authz } from "@/lib/authz/facade";
import { errorCodes, errorMessages } from "@/lib/error-messages";
import { prisma } from "@/lib/prisma";
import { createCollectionSchema } from "@/lib/validators";
import { PaginatedResponse } from "@/types";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
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

    if (!shouldPaginate) {
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
    }

    const total = await prisma.collection.count();
    const totalPages = Math.max(1, Math.ceil(total / pageSize));
    const normalizedPage = Math.min(page, totalPages);
    const skip = (normalizedPage - 1) * pageSize;

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
      skip,
      take: pageSize,
    });

    const payload: PaginatedResponse<(typeof collections)[number]> = {
      data: collections,
      total,
      page: normalizedPage,
      pageSize,
      totalPages,
    };

    return ok(payload);
  } catch {
    return fail(errorMessages.collection.fetchManyUnexpected, 500, {
      code: errorCodes.collection.fetchManyUnexpected,
    });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthenticatedUserFromCookie();
    const authorization = authz.authorize(user, "collection:create");

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
    const parsed = createCollectionSchema.safeParse(body);

    if (!parsed.success) {
      return fail(
        parsed.error.issues[0]?.message ?? errorMessages.common.invalidData,
        400,
        { code: errorCodes.common.invalidData },
      );
    }

    const existingCollection = await prisma.collection.findUnique({
      where: { slug: parsed.data.slug },
      select: { id: true },
    });

    if (existingCollection) {
      return fail(errorMessages.collection.duplicateSlug, 409, {
        code: errorCodes.collection.duplicateSlug,
      });
    }

    const collection = await prisma.collection.create({
      data: parsed.data,
    });

    return ok(collection, 201);
  } catch {
    return fail(errorMessages.collection.createUnexpected, 500, {
      code: errorCodes.collection.createUnexpected,
    });
  }
}
