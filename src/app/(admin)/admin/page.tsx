import Link from "next/link";

import { prisma } from "@/lib/prisma";

export default async function AdminPage() {
  const [productsCount, collectionsCount, usersCount, ordersCount] =
    await Promise.all([
      prisma.product.count(),
      prisma.collection.count(),
      prisma.user.count(),
      prisma.order.count(),
    ]);

  return (
    <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <article className="site-surface rounded-lg border site-border p-4">
        <p className="site-muted text-sm">Produtos</p>
        <p className="mt-2 text-3xl font-semibold">{productsCount}</p>
        <Link
          href="/admin/products"
          className="mt-3 inline-flex text-sm underline"
        >
          Gerenciar
        </Link>
      </article>

      <article className="site-surface rounded-lg border site-border p-4">
        <p className="site-muted text-sm">Coleções</p>
        <p className="mt-2 text-3xl font-semibold">{collectionsCount}</p>
        <Link
          href="/admin/collections"
          className="mt-3 inline-flex text-sm underline"
        >
          Gerenciar
        </Link>
      </article>

      <article className="site-surface rounded-lg border site-border p-4">
        <p className="site-muted text-sm">Usuários</p>
        <p className="mt-2 text-3xl font-semibold">{usersCount}</p>
      </article>

      <article className="site-surface rounded-lg border site-border p-4">
        <p className="site-muted text-sm">Pedidos</p>
        <p className="mt-2 text-3xl font-semibold">{ordersCount}</p>
      </article>
    </section>
  );
}
