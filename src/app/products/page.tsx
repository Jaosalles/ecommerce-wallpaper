import { prisma } from "@/lib/prisma";
import Image from "next/image";
import Link from "next/link";

export default async function ProductsPage() {
  const products = await prisma.product.findMany({
    include: {
      collection: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-6 py-10">
      <header className="space-y-2">
        <p className="site-muted text-xs uppercase tracking-[0.2em]">
          Papel de parede
        </p>
        <h1 className="text-3xl font-semibold">Catálogo de Wallpapers</h1>
        <p className="site-muted max-w-2xl text-sm">
          Navegue pela coleção completa sem login. Escolha os itens e finalize
          no carrinho.
        </p>
      </header>

      <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {products.map((product: (typeof products)[number]) => (
          <article
            key={product.id}
            className="site-surface space-y-3 rounded-lg border site-border p-4"
          >
            <div className="site-surface-soft h-48 overflow-hidden rounded-md border site-border">
              <Image
                src={product.imageUrl}
                alt={product.name}
                width={640}
                height={480}
                className="h-full w-full object-cover"
              />
            </div>

            <div className="space-y-2">
              <h2 className="text-lg font-semibold">{product.name}</h2>
              <p className="site-muted text-sm">{product.description}</p>
              <p className="text-sm">Coleção: {product.collection.name}</p>
              <p className="font-medium">
                {product.price.toLocaleString("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                })}
              </p>
            </div>

            <Link
              href={`/products/${product.slug}`}
              className="site-btn mt-4 inline-flex rounded-md px-3 py-2 text-sm font-medium"
            >
              Ver detalhes
            </Link>
          </article>
        ))}
      </section>
    </main>
  );
}
