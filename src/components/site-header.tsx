"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import { LoginLink } from "@/components/login-link";

export function SiteHeader() {
  const pathname = usePathname();
  const isAdminLoginPath = pathname === "/admin-login";
  const isAdminPanelPath =
    pathname === "/admin" || pathname.startsWith("/admin/");
  const [hideHeader, setHideHeader] = useState(false);

  useEffect(() => {
    let active = true;

    async function checkAuthForAdmin() {
      if (isAdminLoginPath) {
        setHideHeader(true);
        return;
      }

      if (!isAdminPanelPath) {
        setHideHeader(false);
        return;
      }

      try {
        const response = await fetch("/api/auth/me", {
          method: "GET",
          cache: "no-store",
        });

        if (!active) {
          return;
        }

        setHideHeader(response.ok);
      } catch {
        if (!active) {
          return;
        }

        setHideHeader(false);
      }
    }

    checkAuthForAdmin();

    return () => {
      active = false;
    };
  }, [isAdminLoginPath, isAdminPanelPath]);

  if (hideHeader) {
    return null;
  }

  return (
    <header className="site-surface border-b site-border">
      <div className="border-b site-border px-6 py-2 text-xs">
        <div className="site-muted mx-auto flex w-full max-w-6xl flex-wrap items-center justify-center gap-x-4 gap-y-1">
          <span>Frete grátis</span>
          <span>Meios de pagamento</span>
          <span>Compra segura</span>
          <span>Troca e devoluções</span>
        </div>
      </div>

      <div className="px-6 py-4">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between">
          <Link href="/" className="text-lg font-semibold tracking-wide">
            Wallpaper Store
          </Link>

          <nav className="flex items-center gap-4 text-sm">
            <Link href="/" className="hover:underline">
              Home
            </Link>
            <Link href="/products" className="hover:underline">
              Produtos
            </Link>
            <Link href="/cart" className="hover:underline">
              Carrinho
            </Link>
            <LoginLink />
            <Link href="/#sobre" className="hover:underline">
              Sobre
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}
