"use client";

import { CartItem } from "@/lib/cart";
import Link from "next/link";

type CartViewContentProps = {
  items: CartItem[];
  total: number;
  checkoutLoading: boolean;
  isAuthenticated: boolean | null;
  isRouteTransitionPending: boolean;
  onCheckout: () => void;
  onClearCart: () => void;
  onRemoveItem: (productId: string) => void;
};

export function CartViewContent({
  items,
  total,
  checkoutLoading,
  isAuthenticated,
  isRouteTransitionPending,
  onCheckout,
  onClearCart,
  onRemoveItem,
}: CartViewContentProps) {
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
                onClick={() => onRemoveItem(item.productId)}
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
            onClick={onCheckout}
            disabled={
              checkoutLoading || isRouteTransitionPending || !isAuthenticated
            }
            className="site-btn rounded-md px-4 py-2 text-sm font-medium"
          >
            {checkoutLoading
              ? "Finalizando..."
              : isRouteTransitionPending
                ? "Redirecionando..."
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
            onClick={onClearCart}
            disabled={checkoutLoading || isRouteTransitionPending}
            className="site-btn-secondary rounded-md px-4 py-2 text-sm font-medium"
          >
            Limpar carrinho
          </button>
        </div>
      </div>
    </div>
  );
}
