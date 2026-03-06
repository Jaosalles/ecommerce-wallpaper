"use client";

import {
  CartAddInput,
  CartData,
  CartItem,
  addItemToCart,
  clearCart as clearCartRequest,
  getCart,
  removeItemFromCart,
} from "@/lib/cart";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

type CartContextValue = {
  items: CartItem[];
  itemCount: number;
  total: number;
  loading: boolean;
  refreshCart: () => Promise<void>;
  addItem: (input: CartAddInput) => Promise<void>;
  removeItem: (productId: string) => Promise<void>;
  clearCart: () => Promise<void>;
};

const EMPTY_CART: CartData = {
  items: [],
  itemCount: 0,
  total: 0,
};

const CartContext = createContext<CartContextValue | null>(null);

type CartProviderProps = {
  children: React.ReactNode;
};

export function CartProvider({ children }: CartProviderProps) {
  const [cart, setCart] = useState<CartData>(EMPTY_CART);
  const [loading, setLoading] = useState(true);

  const refreshCart = useCallback(async () => {
    setLoading(true);

    try {
      const nextCart = await getCart();
      setCart(nextCart);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refreshCart();
  }, [refreshCart]);

  const addItem = useCallback(async (input: CartAddInput) => {
    const nextCart = await addItemToCart(input);
    setCart(nextCart);
  }, []);

  const removeItem = useCallback(async (productId: string) => {
    const nextCart = await removeItemFromCart(productId);
    setCart(nextCart);
  }, []);

  const clearCart = useCallback(async () => {
    const nextCart = await clearCartRequest();
    setCart(nextCart);
  }, []);

  const value = useMemo<CartContextValue>(
    () => ({
      items: cart.items,
      itemCount: cart.itemCount,
      total: cart.total,
      loading,
      refreshCart,
      addItem,
      removeItem,
      clearCart,
    }),
    [cart, loading, refreshCart, addItem, removeItem, clearCart],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error("useCart deve ser usado dentro de CartProvider");
  }

  return context;
}
