"use client";

import { addItemToCart } from "@/lib/cart";
import { useState } from "react";

type AddToCartButtonProps = {
  productId: string;
};

export function AddToCartButton({ productId }: AddToCartButtonProps) {
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleAddToCart() {
    setLoading(true);

    try {
      await addItemToCart({ productId, quantity: 1 });

      setMessage("Produto adicionado ao carrinho");
    } catch {
      setMessage("Não foi possível adicionar no carrinho");
    } finally {
      setLoading(false);
      setTimeout(() => {
        setMessage("");
      }, 2500);
    }
  }

  return (
    <div className="mt-6 flex flex-col gap-2">
      <button
        type="button"
        onClick={handleAddToCart}
        disabled={loading}
        className="site-btn inline-flex w-fit rounded-md px-4 py-2 text-sm font-medium"
      >
        {loading ? "Adicionando..." : "Adicionar ao carrinho"}
      </button>

      {message ? (
        <p className="text-sm text-emerald-600 dark:text-emerald-400">
          {message}
        </p>
      ) : null}
    </div>
  );
}
