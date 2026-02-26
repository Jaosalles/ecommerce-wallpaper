"use client";

import {
  buildPublicWhatsAppMessage,
  CartItem,
  clearCart,
  createOrder,
  getCart,
  removeItemFromCart,
} from "@/lib/cart";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

const WHATSAPP_NUMBER = "5517981635657";

export function CartView() {
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [checkoutError, setCheckoutError] = useState("");

  const total = useMemo(
    () => items.reduce((acc, item) => acc + item.price * item.quantity, 0),
    [items],
  );

  useEffect(() => {
    async function loadCart() {
      try {
        setLoading(true);
        const cart = await getCart();
        setItems(cart.items);
      } catch {
        setError("Não foi possível carregar o carrinho");
      } finally {
        setLoading(false);
      }
    }

    loadCart();
  }, []);

  const publicWhatsappUrl = useMemo(() => {
    const message = buildPublicWhatsAppMessage(items, total);
    return `https://wa.me/${WHATSAPP_NUMBER}?text=${message}`;
  }, [items, total]);

  async function handleClearCart() {
    try {
      const cart = await clearCart();
      setItems(cart.items);
    } catch {
      setError("Não foi possível limpar o carrinho");
    }
  }

  async function handleRemoveItem(productId: string) {
    try {
      const cart = await removeItemFromCart(productId);
      setItems(cart.items);
    } catch {
      setError("Não foi possível remover o item");
    }
  }

  async function handleCheckout() {
    try {
      setCheckoutLoading(true);
      setCheckoutError("");

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
    } catch (errorValue) {
      if (
        errorValue instanceof Error &&
        errorValue.message === "Não autenticado"
      ) {
        window.open(publicWhatsappUrl, "_blank", "noopener,noreferrer");
        setCheckoutError("Faça login para registrar o pedido automaticamente.");
      } else {
        setCheckoutError("Não foi possível finalizar o pedido");
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
      {error ? (
        <div className="rounded-md border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

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
            disabled={checkoutLoading}
            className="site-btn rounded-md px-4 py-2 text-sm font-medium"
          >
            {checkoutLoading ? "Finalizando..." : "Finalizar no WhatsApp"}
          </button>

          <Link
            href="/login"
            className="site-btn-secondary rounded-md px-4 py-2 text-sm font-medium"
          >
            Entrar para registrar pedido
          </Link>

          <button
            type="button"
            onClick={handleClearCart}
            className="site-btn-secondary rounded-md px-4 py-2 text-sm font-medium"
          >
            Limpar carrinho
          </button>
        </div>

        {checkoutError ? (
          <p className="mt-3 text-sm text-amber-700">{checkoutError}</p>
        ) : null}
      </div>
    </div>
  );
}
