import { apiFetch, parseApiResponse } from "@/lib/client-api";

export type CartItem = {
  productId: string;
  slug: string;
  name: string;
  price: number;
  imageUrl: string;
  collection: {
    id: string;
    name: string;
    slug: string;
  };
  quantity: number;
  subtotal: number;
};

export type CartData = {
  items: CartItem[];
  itemCount: number;
  total: number;
};

export type CartAddInput = {
  productId: string;
  quantity?: number;
};

export type OrderCheckoutInput = {
  items: Array<{
    productId: string;
    quantity: number;
  }>;
};

export async function getCart(): Promise<CartData> {
  const response = await apiFetch("/api/cart", {
    method: "GET",
  });

  return parseApiResponse<CartData>(response);
}

export async function addItemToCart(input: CartAddInput): Promise<CartData> {
  const response = await apiFetch("/api/cart", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      productId: input.productId,
      quantity: input.quantity ?? 1,
    }),
  });

  return parseApiResponse<CartData>(response);
}

export async function removeItemFromCart(productId: string): Promise<CartData> {
  const response = await apiFetch(
    `/api/cart?productId=${encodeURIComponent(productId)}`,
    {
      method: "DELETE",
    },
  );

  return parseApiResponse<CartData>(response);
}

export async function clearCart(): Promise<CartData> {
  const response = await apiFetch("/api/cart", {
    method: "DELETE",
  });

  return parseApiResponse<CartData>(response);
}

export async function createOrder(input: OrderCheckoutInput): Promise<{
  order: {
    id: string;
    total: number;
    status: string;
  };
  whatsappCheckoutUrl: string;
}> {
  const response = await apiFetch("/api/orders", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
  });

  return parseApiResponse<{
    order: {
      id: string;
      total: number;
      status: string;
    };
    whatsappCheckoutUrl: string;
  }>(response);
}

export function buildPublicWhatsAppMessage(items: CartItem[], total: number) {
  const lines = items.map(
    (item, index) =>
      `${index + 1}. ${item.name} x${item.quantity} - ${(
        item.price * item.quantity
      ).toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL",
      })}`,
  );

  return `Olá! Quero finalizar meu pedido de wallpapers:%0A%0A${lines.join("%0A")}%0A%0ATotal: ${total.toLocaleString(
    "pt-BR",
    {
      style: "currency",
      currency: "BRL",
    },
  )}`;
}
