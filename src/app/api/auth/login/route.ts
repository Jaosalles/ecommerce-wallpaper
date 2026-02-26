import { fail, ok } from "@/lib/api";
import {
  comparePassword,
  sanitizeUser,
  setAuthCookie,
  signToken,
} from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { loginSchema } from "@/lib/validators";
import { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = loginSchema.safeParse(body);

    if (!parsed.success) {
      return fail(parsed.error.issues[0]?.message ?? "Dados inválidos", 400);
    }

    const { email, password } = parsed.data;

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return fail("Credenciais inválidas", 401);
    }

    const passwordIsValid = await comparePassword(password, user.password);

    if (!passwordIsValid) {
      return fail("Credenciais inválidas", 401);
    }

    const token = signToken({ userId: user.id, email: user.email });
    await setAuthCookie(token);

    return ok({
      user: sanitizeUser(user),
      token,
    });
  } catch {
    return fail("Erro interno ao autenticar usuário", 500);
  }
}
