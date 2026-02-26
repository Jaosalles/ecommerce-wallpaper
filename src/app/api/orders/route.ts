import { fail, ok } from "@/lib/api";
import { getAuthTokenFromCookie, verifyToken } from "@/lib/auth";
import { errorCodes, errorMessages } from "@/lib/error-messages";
import { prisma } from "@/lib/prisma";
import { createOrderSchema } from "@/lib/validators";
import { NextRequest } from "next/server";

const WHATSAPP_NUMBER = process.env.WHATSAPP_NUMBER ?? "5517981635657";

function buildWhatsAppCheckoutUrl(order: {
  id: string;
  items: { product: { name: string }; quantity: number; price: number }[];
  total: number;
}) {
  const lines = order.items.map(
    (item, index) =>
      `${index + 1}. ${item.product.name} x${item.quantity} - ${(
        item.price * item.quantity
      ).toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL",
      })}`,
  );

  const text = `Olá! Quero finalizar o pedido ${order.id}.%0A%0A${lines.join(
    "%0A",
  )}%0A%0ATotal: ${order.total.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  })}`;

  return `https://wa.me/${WHATSAPP_NUMBER}?text=${text}`;
}

async function getAuthenticatedUserId() {
  const token = await getAuthTokenFromCookie();

  if (!token) {
    return null;
  }

  const payload = verifyToken(token);
  return payload.userId;
}

export async function GET() {
  try {
    const userId = await getAuthenticatedUserId();

    if (!userId) {
      return fail(errorMessages.common.notAuthenticated, 401, {
        code: errorCodes.common.notAuthenticated,
      });
    }

    const orders = await prisma.order.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                slug: true,
                name: true,
                imageUrl: true,
                collection: {
                  select: {
                    id: true,
                    name: true,
                    slug: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    return ok(orders);
  } catch {
    return fail(errorMessages.order.fetchUnexpected, 500, {
      code: errorCodes.order.fetchUnexpected,
    });
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = await getAuthenticatedUserId();

    if (!userId) {
      return fail(errorMessages.common.notAuthenticated, 401, {
        code: errorCodes.common.notAuthenticated,
      });
    }

    const body = await request.json();
    const parsed = createOrderSchema.safeParse(body);

    if (!parsed.success) {
      return fail(
        parsed.error.issues[0]?.message ?? errorMessages.common.invalidData,
        400,
        { code: errorCodes.common.invalidData },
      );
    }

    const itemMap = new Map<string, number>();

    for (const item of parsed.data.items) {
      const currentQuantity = itemMap.get(item.productId) ?? 0;
      itemMap.set(item.productId, currentQuantity + item.quantity);
    }

    const uniqueProductIds = [...itemMap.keys()];

    const products = await prisma.product.findMany({
      where: {
        id: {
          in: uniqueProductIds,
        },
      },
      select: {
        id: true,
        price: true,
      },
    });

    if (products.length !== uniqueProductIds.length) {
      return fail(errorMessages.order.productNotFound, 404, {
        code: errorCodes.order.productNotFound,
      });
    }

    const productPriceMap = new Map(
      products.map((product: (typeof products)[number]) => [
        product.id,
        product.price,
      ]),
    );

    let total = 0;

    const itemsToCreate = uniqueProductIds.map((productId) => {
      const quantity = itemMap.get(productId) ?? 0;
      const price = Number(productPriceMap.get(productId) ?? 0);

      total += price * quantity;

      return {
        productId,
        quantity,
        price,
      };
    });

    const order = await prisma.order.create({
      data: {
        userId,
        total,
        status: "pending",
        items: {
          create: itemsToCreate,
        },
      },
      include: {
        items: {
          include: {
            product: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });

    const whatsappCheckoutUrl = buildWhatsAppCheckoutUrl(order);

    return ok(
      {
        order,
        whatsappCheckoutUrl,
      },
      201,
    );
  } catch {
    return fail(errorMessages.order.createUnexpected, 500, {
      code: errorCodes.order.createUnexpected,
    });
  }
}
