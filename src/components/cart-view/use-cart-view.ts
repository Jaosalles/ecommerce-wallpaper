"use client";

import {
  CartItem,
  clearCart,
  createOrder,
  getCart,
  removeItemFromCart,
} from "@/lib/cart";
import { apiFetch } from "@/lib/client-api";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState, useTransition } from "react";
import { toast } from "sonner";

export function useCartView() {
  const router = useRouter();
  const [isRouteTransitionPending, startRouteTransition] = useTransition();
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  const total = useMemo(
    () => items.reduce((acc, item) => acc + item.price * item.quantity, 0),
    [items],
  );

  useEffect(() => {
    async function loadCart() {
      try {
        setLoading(true);
        const [cart, authResponse] = await Promise.all([
          getCart(),
          apiFetch("/api/auth/me", { method: "GET", cache: "no-store" }),
        ]);

        setItems(cart.items);
        setIsAuthenticated(authResponse.ok);
      } catch (errorValue) {
        if (errorValue instanceof Error) {
          toast.error(errorValue.message);
        } else {
          toast.error("Não foi possível carregar o carrinho");
        }
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    }

    loadCart();
  }, []);

  async function handleClearCart() {
    try {
      const cart = await clearCart();
      setItems(cart.items);
      toast.success("Carrinho limpo com sucesso");
    } catch (errorValue) {
      if (errorValue instanceof Error) {
        toast.error(errorValue.message);
      } else {
        toast.error("Não foi possível limpar o carrinho");
      }
    }
  }

  async function handleRemoveItem(productId: string) {
    try {
      const cart = await removeItemFromCart(productId);
      setItems(cart.items);
      toast.success("Item removido do carrinho");
    } catch (errorValue) {
      if (errorValue instanceof Error) {
        toast.error(errorValue.message);
      } else {
        toast.error("Não foi possível remover o item");
      }
    }
  }

  async function handleCheckout() {
    if (!isAuthenticated) {
      toast.error("Faça login para finalizar no WhatsApp.");
      startRouteTransition(() => {
        router.push("/login?redirect=/cart");
      });
      return;
    }

    try {
      setCheckoutLoading(true);

      const orderResponse = await createOrder({
        items: items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
        })),
      });

      window.open(
        orderResponse.whatsappCheckoutUrl,
        "_blank",
        "noopener,noreferrer",
      );

      const nextCart = await clearCart();
      setItems(nextCart.items);
      toast.success("Pedido enviado para o WhatsApp com sucesso");
    } catch (errorValue) {
      if (
        errorValue instanceof Error &&
        errorValue.message === "Não autenticado"
      ) {
        setIsAuthenticated(false);
        toast.error("Faça login para finalizar no WhatsApp.");
        startRouteTransition(() => {
          router.push("/login?redirect=/cart");
        });
      } else if (errorValue instanceof Error) {
        toast.error(errorValue.message);
      } else {
        toast.error("Não foi possível finalizar o pedido");
      }
    } finally {
      setCheckoutLoading(false);
    }
  }

  return {
    items,
    total,
    loading,
    checkoutLoading,
    isAuthenticated,
    isRouteTransitionPending,
    handleClearCart,
    handleRemoveItem,
    handleCheckout,
  };
}
