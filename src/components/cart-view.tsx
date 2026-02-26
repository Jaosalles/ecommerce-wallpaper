"use client";

import { CartViewContent, useCartView } from "@/components/cart-view/index";

export function CartView() {
  const {
    items,
    total,
    loading,
    checkoutLoading,
    isAuthenticated,
    isRouteTransitionPending,
    handleClearCart,
    handleRemoveItem,
    handleCheckout,
  } = useCartView();

  if (loading) {
    return (
      <div className="site-surface rounded-lg border site-border p-6 text-center">
        <p className="site-muted text-sm">Carregando carrinho...</p>
      </div>
    );
  }

  return (
    <CartViewContent
      items={items}
      total={total}
      checkoutLoading={checkoutLoading}
      isAuthenticated={isAuthenticated}
      isRouteTransitionPending={isRouteTransitionPending}
      onCheckout={handleCheckout}
      onClearCart={handleClearCart}
      onRemoveItem={handleRemoveItem}
    />
  );
}
