"use client";

import { createOrder } from "@/lib/cart";
import { useAuth } from "@/context/auth-context";
import { useCart } from "@/context/cart-context";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";

export function useCartView() {
  const { items, total, loading: cartLoading, removeItem, clearCart } = useCart();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();
  const [isRouteTransitionPending, startRouteTransition] = useTransition();
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  async function handleClearCart() {
    try {
      await clearCart();
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
      await removeItem(productId);
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

      await clearCart();
      toast.success("Pedido enviado para o WhatsApp com sucesso");
    } catch (errorValue) {
      if (
        errorValue instanceof Error &&
        errorValue.message === "Não autenticado"
      ) {
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
    loading: cartLoading || authLoading,
    checkoutLoading,
    isAuthenticated,
    isRouteTransitionPending,
    handleClearCart,
    handleRemoveItem,
    handleCheckout,
  };
}
