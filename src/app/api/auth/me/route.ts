import { fail, ok } from "@/lib/api";
import { getAuthTokenFromCookie, verifyToken } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const token = await getAuthTokenFromCookie();

    if (!token) {
      return fail("Não autenticado", 401);
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
      return fail("Usuário não encontrado", 404);
    }

    return ok({ user });
  } catch {
    return fail("Token inválido", 401);
  }
}
