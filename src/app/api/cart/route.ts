import { fail, ok } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { cartItemInputSchema } from "@/lib/validators";
import { NextRequest } from "next/server";

type CartCookieItem = {
  productId: string;
  quantity: number;
};

const CART_COOKIE_NAME = "cart_items";
const CART_COOKIE_MAX_AGE = 60 * 60 * 24 * 30;

function parseCartCookie(rawCart: string | undefined): CartCookieItem[] {
  if (!rawCart) {
    return [];
  }

  try {
    const parsed = JSON.parse(rawCart) as CartCookieItem[];

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.filter(
      (item) =>
        item &&
        typeof item.productId === "string" &&
        typeof item.quantity === "number" &&
        item.quantity > 0,
    );
  } catch {
    return [];
  }
}

async function buildCartResponse(items: CartCookieItem[]) {
  if (!items.length) {
    return {
      items: [],
      itemCount: 0,
      total: 0,
    };
  }

  const productIds = items.map((item) => item.productId);

  const products = await prisma.product.findMany({
    where: {
      id: {
        in: productIds,
      },
    },
    select: {
      id: true,
      slug: true,
      name: true,
      price: true,
      imageUrl: true,
      category: true,
    },
  });

  const productMap = new Map(products.map((product) => [product.id, product]));

  const responseItems = items
    .map((item) => {
      const product = productMap.get(item.productId);

      if (!product) {
        return null;
      }

      return {
        productId: product.id,
        slug: product.slug,
        name: product.name,
        imageUrl: product.imageUrl,
        category: product.category,
        quantity: item.quantity,
        price: product.price,
        subtotal: product.price * item.quantity,
      };
    })
    .filter((item) => item !== null);

  const itemCount = responseItems.reduce((sum, item) => sum + item.quantity, 0);
  const total = responseItems.reduce((sum, item) => sum + item.subtotal, 0);

  return {
    items: responseItems,
    itemCount,
    total,
  };
}

export async function GET(request: NextRequest) {
  try {
    const cookieValue = request.cookies.get(CART_COOKIE_NAME)?.value;
    const items = parseCartCookie(cookieValue);

    const cart = await buildCartResponse(items);

    return ok(cart);
  } catch {
    return fail("Erro ao buscar carrinho", 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = cartItemInputSchema.safeParse(body);

    if (!parsed.success) {
      return fail(parsed.error.issues[0]?.message ?? "Dados inválidos", 400);
    }

    const { productId, quantity } = parsed.data;

    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { id: true },
    });

    if (!product) {
      return fail("Produto não encontrado", 404);
    }

    const cookieValue = request.cookies.get(CART_COOKIE_NAME)?.value;
    const currentItems = parseCartCookie(cookieValue);

    const existingItem = currentItems.find(
      (item) => item.productId === productId,
    );

    if (existingItem) {
      existingItem.quantity = Math.min(existingItem.quantity + quantity, 99);
    } else {
      currentItems.push({ productId, quantity });
    }

    const cart = await buildCartResponse(currentItems);
    const response = ok(cart);

    response.cookies.set(CART_COOKIE_NAME, JSON.stringify(currentItems), {
      path: "/",
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: CART_COOKIE_MAX_AGE,
    });

    return response;
  } catch {
    return fail("Erro ao atualizar carrinho", 500);
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get("productId");

    const cookieValue = request.cookies.get(CART_COOKIE_NAME)?.value;
    const currentItems = parseCartCookie(cookieValue);

    const nextItems = productId
      ? currentItems.filter((item) => item.productId !== productId)
      : [];

    const cart = await buildCartResponse(nextItems);
    const response = ok(cart);

    if (!nextItems.length) {
      response.cookies.delete(CART_COOKIE_NAME);
      return response;
    }

    response.cookies.set(CART_COOKIE_NAME, JSON.stringify(nextItems), {
      path: "/",
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: CART_COOKIE_MAX_AGE,
    });

    return response;
  } catch {
    return fail("Erro ao remover item do carrinho", 500);
  }
}
