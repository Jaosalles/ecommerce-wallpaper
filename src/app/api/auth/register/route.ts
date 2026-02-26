import { fail, ok } from "@/lib/api";
import {
  hashPassword,
  sanitizeUser,
  setAuthCookie,
  signToken,
} from "@/lib/auth";
import { errorCodes, errorMessages } from "@/lib/error-messages";
import { prisma } from "@/lib/prisma";
import { registerSchema } from "@/lib/validators";
import { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      return fail(
        parsed.error.issues[0]?.message ?? errorMessages.common.invalidData,
        400,
        { code: errorCodes.common.invalidData },
      );
    }

    const { email, password, name, phone } = parsed.data;

    const existingUser = await prisma.user.findUnique({ where: { email } });

    if (existingUser) {
      return fail(errorMessages.auth.emailAlreadyRegistered, 409, {
        code: errorCodes.auth.emailAlreadyRegistered,
      });
    }

    const hashedPassword = await hashPassword(password);

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        phone,
      },
    });

    const token = signToken({ userId: user.id, email: user.email });
    await setAuthCookie(token);

    return ok(
      {
        user: sanitizeUser(user),
        token,
      },
      201,
    );
  } catch {
    return fail(errorMessages.auth.registerUnexpected, 500, {
      code: errorCodes.auth.registerUnexpected,
    });
  }
}
