import { prisma } from "@/lib/prisma";
import { AddToCartButton } from "@/components/add-to-cart-button";
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

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-6 py-10">
      <Link href="/products" className="text-sm underline">
        ← Voltar ao catálogo
      </Link>

      <article className="site-surface grid gap-6 rounded-lg border site-border p-6 md:grid-cols-2">
        <div className="site-surface-soft overflow-hidden rounded-md border site-border">
          <Image
            src={product.imageUrl}
            alt={product.name}
            width={900}
            height={900}
            className="h-full w-full object-cover"
          />
        </div>

        <div>
          <p className="site-muted text-xs uppercase tracking-[0.2em]">
            {product.collection.name}
          </p>
          <h1 className="mt-2 text-3xl font-semibold">{product.name}</h1>
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
