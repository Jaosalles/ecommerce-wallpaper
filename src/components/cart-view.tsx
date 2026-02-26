"use client";

import {
  CartItem,
  clearCart,
  createOrder,
  getCart,
  removeItemFromCart,
} from "@/lib/cart";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

export function CartView() {
  const router = useRouter();
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
          fetch("/api/auth/me", { method: "GET", cache: "no-store" }),
        ]);

        setItems(cart.items);
        setIsAuthenticated(authResponse.ok);
      } catch {
        toast.error("Não foi possível carregar o carrinho");
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
    } catch {
      toast.error("Não foi possível limpar o carrinho");
    }
  }

  async function handleRemoveItem(productId: string) {
    try {
      const cart = await removeItemFromCart(productId);
      setItems(cart.items);
      toast.success("Item removido do carrinho");
    } catch {
      toast.error("Não foi possível remover o item");
    }
  }

  async function handleCheckout() {
    if (!isAuthenticated) {
      toast.error("Faça login para finalizar no WhatsApp.");
      router.push("/login?redirect=/cart");
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
        router.push("/login?redirect=/cart");
      } else {
        toast.error("Não foi possível finalizar o pedido");
      }
    } finally {
      setCheckoutLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="site-surface rounded-lg border site-border p-6 text-center">
        <p className="site-muted text-sm">Carregando carrinho...</p>
      </div>
    );
  }

  if (!items.length) {
    return (
      <div className="site-surface rounded-lg border site-border p-6 text-center">
        <p className="site-muted text-sm">Seu carrinho está vazio.</p>
        <Link
          href="/products"
          className="site-btn mt-3 inline-flex rounded-md px-4 py-2 text-sm font-medium"
        >
          Ver produtos
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="site-surface space-y-3 rounded-lg border site-border p-6">
        {items.map((item) => (
          <div
            key={item.productId}
            className="flex items-center justify-between border-b site-border pb-3 text-sm last:border-none"
          >
            <div>
              <p className="font-medium">{item.name}</p>
              <p className="site-muted">Quantidade: {item.quantity}</p>
            </div>
            <div className="flex items-center gap-3">
              <p className="font-medium">
                {(item.price * item.quantity).toLocaleString("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                })}
              </p>
              <button
                type="button"
                onClick={() => handleRemoveItem(item.productId)}
                className="site-btn-secondary rounded-md px-2 py-1 text-xs"
              >
                Remover
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="site-surface rounded-lg border site-border p-6">
        <p className="text-lg font-semibold">
          Total:{" "}
          {total.toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL",
          })}
        </p>

        <div className="mt-4 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={handleCheckout}
            disabled={checkoutLoading || !isAuthenticated}
            className="site-btn rounded-md px-4 py-2 text-sm font-medium"
          >
            {checkoutLoading
              ? "Finalizando..."
              : isAuthenticated
                ? "Finalizar no WhatsApp"
                : "Faça login para finalizar"}
          </button>

          {!isAuthenticated ? (
            <Link
              href="/login?redirect=/cart"
              className="site-btn-secondary rounded-md px-4 py-2 text-sm font-medium"
            >
              Entrar para finalizar no WhatsApp
            </Link>
          ) : null}

          <button
            type="button"
            onClick={handleClearCart}
            disabled={checkoutLoading}
            className="site-btn-secondary rounded-md px-4 py-2 text-sm font-medium"
          >
            Limpar carrinho
          </button>
        </div>
      </div>
    </div>
  );
}
