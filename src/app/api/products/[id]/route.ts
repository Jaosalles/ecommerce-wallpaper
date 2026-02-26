import { fail, ok } from "@/lib/api";
import { getAuthenticatedUserFromCookie } from "@/lib/auth";
import { authz } from "@/lib/authz/facade";
import {
  errorCodes,
  errorMessages,
  mapProductDeleteError,
  successMessages,
} from "@/lib/error-messages";
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
      return fail(errorMessages.product.notFound, 404, {
        code: errorCodes.product.notFound,
      });
    }

    return ok(product);
  } catch {
    return fail(errorMessages.product.fetchOneUnexpected, 500, {
      code: errorCodes.product.fetchOneUnexpected,
    });
  }
}

export async function PUT(request: NextRequest, { params }: Params) {
  try {
    const user = await getAuthenticatedUserFromCookie();
    const authorization = authz.authorize(user, "product:update");

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
    const parsed = updateProductSchema.safeParse(body);

    if (!parsed.success) {
      return fail(
        parsed.error.issues[0]?.message ?? errorMessages.common.invalidData,
        400,
        { code: errorCodes.common.invalidData },
      );
    }

    if (parsed.data.collectionId) {
      const collection = await prisma.collection.findUnique({
        where: { id: parsed.data.collectionId },
        select: { id: true },
      });

      if (!collection) {
        return fail(errorMessages.collection.notFound, 404, {
          code: errorCodes.collection.notFound,
        });
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
    return fail(errorMessages.product.updateUnexpected, 500, {
      code: errorCodes.product.updateUnexpected,
    });
  }
}

export async function DELETE(_: NextRequest, { params }: Params) {
  try {
    const user = await getAuthenticatedUserFromCookie();
    const authorization = authz.authorize(user, "product:delete");

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

    await prisma.product.delete({ where: { id } });

    return ok({ message: successMessages.product.deleted });
  } catch (errorValue) {
    const mappedError = mapProductDeleteError(errorValue);

    if (mappedError) {
      return fail(mappedError.message, mappedError.status, {
        code: mappedError.code,
      });
    }

    return fail(errorMessages.product.deleteUnexpected, 500, {
      code: errorCodes.product.deleteUnexpected,
    });
  }
}
