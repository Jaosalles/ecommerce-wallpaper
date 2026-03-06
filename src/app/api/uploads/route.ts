import { fail, ok } from "@/lib/api";
import { getAuthenticatedUserFromCookie } from "@/lib/auth";
import { authz } from "@/lib/authz/facade";
import { errorCodes, errorMessages } from "@/lib/error-messages";
import { prisma } from "@/lib/prisma";
import {
  deleteStorageObject,
  isStorageBucket,
  uploadProductImage,
  validateUploadFile,
} from "@/lib/storage";
import {
  deleteUploadSchema,
  uploadImageMetadataSchema,
} from "@/lib/validators";
import { NextRequest } from "next/server";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthenticatedUserFromCookie();

    const formData = await request.formData();
    const file = formData.get("file");
    const bucketInput = String(formData.get("bucket") ?? "product-images");
    const productId = String(formData.get("productId") ?? "").trim();
    const draftId = String(formData.get("draftId") ?? "").trim();

    if (!(file instanceof File)) {
      return fail(errorMessages.storage.invalidFile, 400, {
        code: errorCodes.storage.invalidFile,
      });
    }

    if (!isStorageBucket(bucketInput)) {
      return fail(errorMessages.storage.invalidBucket, 400, {
        code: errorCodes.storage.invalidBucket,
      });
    }

    const parsedMetadata = uploadImageMetadataSchema.safeParse({
      productId,
      draftId,
      bucket: bucketInput,
    });

    if (!parsedMetadata.success) {
      return fail(
        parsedMetadata.error.issues[0]?.message ??
          errorMessages.common.invalidData,
        400,
        {
          code: errorCodes.common.invalidData,
        },
      );
    }

    const requiredPermission = parsedMetadata.data.productId
      ? "product:update"
      : "product:create";
    const authorization = authz.authorize(user, requiredPermission);

    if (!authorization.ok) {
      const authorizationCode =
        authorization.status === 401
          ? errorCodes.common.notAuthenticated
          : errorCodes.common.accessDenied;

      return fail(authorization.error, authorization.status, {
        code: authorizationCode,
      });
    }

    if (parsedMetadata.data.productId) {
      const product = await prisma.product.findUnique({
        where: { id: parsedMetadata.data.productId },
        select: { id: true },
      });

      if (!product) {
        return fail(errorMessages.product.notFound, 404, {
          code: errorCodes.product.notFound,
        });
      }
    }

    const validation = validateUploadFile(file, parsedMetadata.data.bucket);

    if (!validation.ok) {
      const code =
        validation.code === "file_too_large"
          ? errorCodes.storage.fileTooLarge
          : errorCodes.storage.invalidFile;

      const message =
        code === errorCodes.storage.fileTooLarge
          ? errorMessages.storage.fileTooLarge
          : validation.message;

      return fail(message, 400, {
        code,
      });
    }

    const uploaded = await uploadProductImage({
      targetId:
        parsedMetadata.data.productId ?? parsedMetadata.data.draftId ?? "",
      targetType: parsedMetadata.data.productId ? "product" : "draft",
      bucket: parsedMetadata.data.bucket,
      file,
    });

    return ok(
      {
        bucket: uploaded.bucket,
        path: uploaded.path,
        url: uploaded.url,
        mimeType: file.type,
        size: file.size,
      },
      201,
    );
  } catch {
    return fail(errorMessages.storage.uploadUnexpected, 500, {
      code: errorCodes.storage.uploadUnexpected,
    });
  }
}

export async function DELETE(request: NextRequest) {
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

    const body = await request.json();
    const bucketInput = String(body?.bucket ?? "");
    const pathInput = String(body?.path ?? "").trim();

    if (!isStorageBucket(bucketInput)) {
      return fail(errorMessages.storage.invalidBucket, 400, {
        code: errorCodes.storage.invalidBucket,
      });
    }

    const parsed = deleteUploadSchema.safeParse({
      bucket: bucketInput,
      path: pathInput,
    });

    if (!parsed.success) {
      return fail(
        parsed.error.issues[0]?.message ?? errorMessages.common.invalidData,
        400,
        {
          code: errorCodes.common.invalidData,
        },
      );
    }

    await deleteStorageObject(parsed.data);

    return ok({ deleted: true });
  } catch {
    return fail(errorMessages.storage.uploadUnexpected, 500, {
      code: errorCodes.storage.uploadUnexpected,
    });
  }
}
