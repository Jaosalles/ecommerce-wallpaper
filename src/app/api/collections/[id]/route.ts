import { fail, ok } from "@/lib/api";
import { getAuthenticatedUserFromCookie } from "@/lib/auth";
import { authz } from "@/lib/authz/facade";
import {
  errorCodes,
  errorMessages,
  successMessages,
} from "@/lib/error-messages";
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
      return fail(errorMessages.collection.notFound, 404, {
        code: errorCodes.collection.notFound,
      });
    }

    return ok(collection);
  } catch {
    return fail(errorMessages.collection.fetchOneUnexpected, 500, {
      code: errorCodes.collection.fetchOneUnexpected,
    });
  }
}

export async function PUT(request: NextRequest, { params }: Params) {
  try {
    const user = await getAuthenticatedUserFromCookie();
    const authorization = authz.authorize(user, "collection:update");

    if (!authorization.ok) {
      const authorizationCode =
        authorization.status === 401
          ? errorCodes.common.notAuthenticated
          : errorCodes.common.accessDenied;

      return fail(authorization.error, authorization.status, {
        code: authorizationCode,
      });
    }

    const { id } = await params;

    const body = await request.json();
    const parsed = updateCollectionSchema.safeParse(body);

    if (!parsed.success) {
      return fail(
        parsed.error.issues[0]?.message ?? errorMessages.common.invalidData,
        400,
        { code: errorCodes.common.invalidData },
      );
    }

    if (parsed.data.slug) {
      const collectionWithSlug = await prisma.collection.findUnique({
        where: { slug: parsed.data.slug },
        select: { id: true },
      });

      if (collectionWithSlug && collectionWithSlug.id !== id) {
        return fail(errorMessages.collection.duplicateSlug, 409, {
          code: errorCodes.collection.duplicateSlug,
        });
      }
    }

    const collection = await prisma.collection.update({
      where: { id },
      data: parsed.data,
    });

    return ok(collection);
  } catch {
    return fail(errorMessages.collection.updateUnexpected, 500, {
      code: errorCodes.collection.updateUnexpected,
    });
  }
}

export async function DELETE(_: NextRequest, { params }: Params) {
  try {
    const user = await getAuthenticatedUserFromCookie();
    const authorization = authz.authorize(user, "collection:delete");

    if (!authorization.ok) {
      const authorizationCode =
        authorization.status === 401
          ? errorCodes.common.notAuthenticated
          : errorCodes.common.accessDenied;

      return fail(authorization.error, authorization.status, {
        code: authorizationCode,
      });
    }

    const { id } = await params;

    const productsCount = await prisma.product.count({
      where: { collectionId: id },
    });

    if (productsCount > 0) {
      return fail(errorMessages.collection.hasLinkedProducts, 409, {
        code: errorCodes.collection.hasLinkedProducts,
      });
    }

    await prisma.collection.delete({
      where: { id },
    });

    return ok({ message: successMessages.collection.deleted });
  } catch {
    return fail(errorMessages.collection.deleteUnexpected, 500, {
      code: errorCodes.collection.deleteUnexpected,
    });
  }
}
