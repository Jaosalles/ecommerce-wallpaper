"use client";

import { SiteHeaderNav, useSiteHeaderVisibility } from "./site-header/index";
import Link from "next/link";

export function SiteHeader() {
  const { hideHeader } = useSiteHeaderVisibility();

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

          <SiteHeaderNav />
        </div>
      </div>
    </header>
  );
}
