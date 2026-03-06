import { fail, ok } from "@/lib/api";
import {
  comparePassword,
  sanitizeUser,
  setAuthCookie,
  signToken,
} from "@/lib/auth";
import { errorCodes, errorMessages } from "@/lib/error-messages";
import { prisma } from "@/lib/prisma";
import { loginRequestSchema } from "@/lib/validators";
import { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = loginRequestSchema.safeParse(body);

    if (!parsed.success) {
      return fail(
        parsed.error.issues[0]?.message ?? errorMessages.common.invalidData,
        400,
        { code: errorCodes.common.invalidData },
      );
    }

    const { email, password, requiredRole } = parsed.data;

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return fail(errorMessages.auth.invalidCredentials, 401, {
        code: errorCodes.auth.invalidCredentials,
      });
    }

    const passwordIsValid = await comparePassword(password, user.password);

    if (!passwordIsValid) {
      return fail(errorMessages.auth.invalidCredentials, 401, {
        code: errorCodes.auth.invalidCredentials,
      });
    }

    if (requiredRole && user.role !== requiredRole) {
      return fail(errorMessages.auth.invalidCredentials, 401, {
        code: errorCodes.auth.invalidCredentials,
      });
    }

    const token = signToken({ userId: user.id, email: user.email });
    await setAuthCookie(token);

    return ok({
      user: sanitizeUser(user),
      token,
    });
  } catch {
    return fail(errorMessages.auth.loginUnexpected, 500, {
      code: errorCodes.auth.loginUnexpected,
    });
  }
}
