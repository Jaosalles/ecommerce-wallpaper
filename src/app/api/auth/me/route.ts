import { fail, ok } from "@/lib/api";
import { getAuthTokenFromCookie, verifyToken } from "@/lib/auth";
import { errorCodes, errorMessages } from "@/lib/error-messages";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const token = await getAuthTokenFromCookie();

    if (!token) {
      return fail(errorMessages.common.notAuthenticated, 401, {
        code: errorCodes.common.notAuthenticated,
      });
    }

    const payload = verifyToken(token);

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        phone: true,
        avatar: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      return fail(errorMessages.auth.userNotFound, 404, {
        code: errorCodes.auth.userNotFound,
      });
    }

    return ok({ user });
  } catch {
    return fail(errorMessages.auth.invalidToken, 401, {
      code: errorCodes.auth.invalidToken,
    });
  }
}
