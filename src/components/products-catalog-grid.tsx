"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import {
  PRODUCTS_RETURN_PATH_KEY,
  PRODUCTS_SCROLL_POSITION_KEY,
} from "@/lib/products-navigation";
import {
  getProductImageTransitionName,
  getProductTitleTransitionName,
} from "@/lib/view-transition";

type ProductCatalogItem = {
  id: string;
  slug: string;
  name: string;
  description: string;
  price: number;
  imageUrls: string[];
  collection: {
    name: string;
  };
};

type ProductsCatalogGridProps = {
  products: ProductCatalogItem[];
};

type DocumentWithViewTransition = Document & {
  startViewTransition?: (callback: () => void) => void;
};

export function ProductsCatalogGrid({ products }: ProductsCatalogGridProps) {
  const router = useRouter();
  const [isNavigating, startNavigationTransition] = useTransition();
  const [isLeaving, setIsLeaving] = useState(false);

  useEffect(() => {
    const savedScrollY = sessionStorage.getItem(PRODUCTS_SCROLL_POSITION_KEY);

    if (!savedScrollY) {
      return;
    }

    const parsedScrollY = Number(savedScrollY);

    if (Number.isFinite(parsedScrollY) && parsedScrollY > 0) {
      requestAnimationFrame(() => {
        window.scrollTo({ top: parsedScrollY, behavior: "auto" });
      });
    }

    sessionStorage.removeItem(PRODUCTS_SCROLL_POSITION_KEY);
  }, []);

  function navigateToProduct(slug: string) {
    sessionStorage.setItem(
      PRODUCTS_SCROLL_POSITION_KEY,
      String(window.scrollY),
    );
    sessionStorage.setItem(
      PRODUCTS_RETURN_PATH_KEY,
      `${window.location.pathname}${window.location.search}`,
    );

    const href = `/products/${slug}`;
    const navigate = () => {
      startNavigationTransition(() => {
        router.push(href, { scroll: false });
      });
    };

    setIsLeaving(true);

    const documentWithTransition = document as DocumentWithViewTransition;

    if (documentWithTransition.startViewTransition) {
      documentWithTransition.startViewTransition(() => {
        navigate();
      });
      return;
    }

    navigate();
  }

  return (
    <section
      className={`grid gap-4 md:grid-cols-2 lg:grid-cols-3 transition-opacity duration-200 ${
        isLeaving ? "catalog-fade-out" : "catalog-fade-in"
      }`}
      aria-busy={isNavigating}
    >
      {products.map((product) => {
        const coverImageUrl =
          product.imageUrls[0] ??
          "https://picsum.photos/seed/product-grid-fallback/1200/1800";

        return (
          <article
            key={product.id}
            className="site-surface space-y-3 rounded-lg border site-border p-4"
          >
            <div
              className="site-surface-soft h-48 overflow-hidden rounded-md border site-border"
              style={{
                viewTransitionName: getProductImageTransitionName(product.slug),
              }}
            >
              <Image
                src={coverImageUrl}
                alt={product.name}
                width={640}
                height={480}
                className="h-full w-full object-cover"
              />
            </div>

            <div className="space-y-2">
              <h2
                className="text-lg font-semibold"
                style={{
                  viewTransitionName: getProductTitleTransitionName(product.slug),
                }}
              >
                {product.name}
              </h2>
              <p className="site-muted text-sm">{product.description}</p>
              <p className="text-sm">Coleção: {product.collection.name}</p>
              <p className="font-medium">
                {product.price.toLocaleString("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                })}
              </p>
            </div>

            <button
              type="button"
              disabled={isNavigating}
              onClick={() => navigateToProduct(product.slug)}
              className="site-btn mt-4 inline-flex rounded-md px-3 py-2 text-sm font-medium disabled:opacity-60"
            >
              {isNavigating ? "Abrindo..." : "Ver detalhes"}
            </button>
          </article>
        );
      })}
    </section>
  );
}
