"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { MouseEvent, useTransition } from "react";
import { PRODUCTS_RETURN_PATH_KEY } from "@/lib/products-navigation";

type DocumentWithViewTransition = Document & {
  startViewTransition?: (callback: () => void) => void;
};

export function ProductsBackLink() {
  const router = useRouter();
  const [isPending, startNavigationTransition] = useTransition();

  function resolveFallbackHref() {
    const savedReturnPath = sessionStorage.getItem(PRODUCTS_RETURN_PATH_KEY);

    if (!savedReturnPath || !savedReturnPath.startsWith("/products")) {
      return "/products";
    }

    return savedReturnPath;
  }

  function handleClick(event: MouseEvent<HTMLAnchorElement>) {
    if (
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey ||
      event.button !== 0
    ) {
      return;
    }

    event.preventDefault();

    const fallbackHref = resolveFallbackHref();

    const navigateBack = () => {
      startNavigationTransition(() => {
        if (window.history.length > 1) {
          router.back();
          return;
        }

        router.push(fallbackHref, { scroll: false });
      });
    };

    const documentWithTransition = document as DocumentWithViewTransition;

    if (documentWithTransition.startViewTransition) {
      documentWithTransition.startViewTransition(() => {
        navigateBack();
      });
      return;
    }

    navigateBack();
  }

  return (
    <Link
      href="/products"
      onClick={handleClick}
      aria-disabled={isPending}
      className="text-sm underline disabled:opacity-60"
    >
      {isPending ? "← Voltando..." : "← Voltar ao catálogo"}
    </Link>
  );
}
