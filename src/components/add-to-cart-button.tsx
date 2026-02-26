"use client";

import { addItemToCart } from "@/lib/cart";
import { useState } from "react";
import { toast } from "sonner";

type AddToCartButtonProps = {
  productId: string;
};

export function AddToCartButton({ productId }: AddToCartButtonProps) {
  const [loading, setLoading] = useState(false);

  async function handleAddToCart() {
    setLoading(true);

    try {
      await addItemToCart({ productId, quantity: 1 });

      toast.success("Produto adicionado ao carrinho");
    } catch (errorValue) {
      if (errorValue instanceof Error) {
        toast.error(errorValue.message);
      } else {
        toast.error("Não foi possível adicionar no carrinho");
      }
    } finally {
      setLoading(false);
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
    </div>
  );
}
