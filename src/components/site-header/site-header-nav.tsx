"use client";

import { useCart } from "@/context/cart-context";
import { LoginLink } from "@/components/login-link";
import Link from "next/link";
import { Suspense } from "react";

export function SiteHeaderNav() {
  const { itemCount } = useCart();

  return (
    <nav className="flex items-center gap-4 text-sm">
      <Link href="/" className="hover:underline">
        Home
      </Link>
      <Link href="/products" className="hover:underline">
        Produtos
      </Link>
      <Link href="/cart" className="inline-flex items-center gap-2 hover:underline">
        Carrinho
        {itemCount > 0 ? (
          <span className="site-btn inline-flex min-h-5 min-w-5 items-center justify-center rounded-full px-1 text-[10px] font-semibold leading-none">
            {itemCount > 99 ? "99+" : itemCount}
          </span>
        ) : null}
      </Link>
      <Link href="/#sobre" className="hover:underline">
        Sobre
      </Link>
      <Suspense fallback={null}>
        <LoginLink />
      </Suspense>
    </nav>
  );
}
