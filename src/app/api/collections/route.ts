import { fail, ok } from "@/lib/api";
import { getAuthenticatedUserFromCookie } from "@/lib/auth";
import { authz } from "@/lib/authz/facade";
import { errorCodes, errorMessages } from "@/lib/error-messages";
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
