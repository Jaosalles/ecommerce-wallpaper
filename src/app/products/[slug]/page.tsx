import { prisma } from "@/lib/prisma";
import { AddToCartButton } from "@/components/add-to-cart-button";
import { ProductsBackLink } from "@/components/products-back-link";
import {
  getProductImageTransitionName,
  getProductTitleTransitionName,
} from "@/lib/view-transition";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

type ProductDetailsPageProps = {
  params: Promise<{ slug: string }>;
};

export default async function ProductDetailsPage({
  params,
}: ProductDetailsPageProps) {
  const { slug } = await params;

  const product = await prisma.product.findUnique({
    where: { slug },
    include: {
      collection: true,
    },
  });

  if (!product) {
    notFound();
  }

  const imageUrls = product.imageUrls;
  const coverImageUrl = imageUrls[0] ?? "https://picsum.photos/seed/product-fallback/1200/1800";

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-6 py-10">
      <ProductsBackLink />

      <article className="site-surface grid gap-6 rounded-lg border site-border p-6 md:grid-cols-2">
        <div className="space-y-3">
          <div
            className="site-surface-soft overflow-hidden rounded-md border site-border"
            style={{
              viewTransitionName: getProductImageTransitionName(product.slug),
            }}
          >
            <Image
              src={coverImageUrl}
              alt={product.name}
              width={900}
              height={900}
              className="h-full w-full object-cover"
            />
          </div>

          {imageUrls.length > 1 ? (
            <div className="grid grid-cols-3 gap-2">
              {imageUrls.slice(1, 3).map((imageUrl, index) => (
                <div
                  key={`${imageUrl}-${index}`}
                  className="site-surface-soft overflow-hidden rounded-md border site-border"
                >
                  <Image
                    src={imageUrl}
                    alt={`${product.name} - imagem ${index + 2}`}
                    width={400}
                    height={400}
                    className="h-full w-full object-cover"
                  />
                </div>
              ))}
            </div>
          ) : null}
        </div>

        <div>
          <p className="site-muted text-xs uppercase tracking-[0.2em]">
            {product.collection.name}
          </p>
          <h1
            className="mt-2 text-3xl font-semibold"
            style={{
              viewTransitionName: getProductTitleTransitionName(product.slug),
            }}
          >
            {product.name}
          </h1>
          <p className="site-muted mt-4 text-sm">{product.description}</p>

          <p className="mt-6 text-2xl font-semibold">
            {product.price.toLocaleString("pt-BR", {
              style: "currency",
              currency: "BRL",
            })}
          </p>

          <AddToCartButton productId={product.id} />

          <Link href="/cart" className="mt-2 inline-flex text-sm underline">
            Ir para o carrinho
          </Link>
        </div>
      </article>
    </main>
  );
}
