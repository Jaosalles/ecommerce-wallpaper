import Link from "next/link";
import { redirect } from "next/navigation";

import { getAuthenticatedUserFromCookie } from "@/lib/auth";
import { authz } from "@/lib/authz/facade";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getAuthenticatedUserFromCookie();

  if (!authz.can(user, "product:create")) {
    if (!user) {
      redirect("/login");
    }

    redirect("/products");
  }

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-6 py-10">
      <header className="site-surface rounded-lg border site-border p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="site-muted text-xs uppercase tracking-[0.2em]">
              Painel administrativo
            </p>
            <h1 className="text-2xl font-semibold">Gestão da loja</h1>
          </div>

          <nav className="flex flex-wrap items-center gap-2 text-sm">
            <Link
              href="/admin"
              className="site-btn-secondary rounded-md px-3 py-2"
            >
              Visão geral
            </Link>
            <Link
              href="/admin/products"
              className="site-btn-secondary rounded-md px-3 py-2"
            >
              Produtos
            </Link>
            <Link
              href="/admin/collections"
              className="site-btn-secondary rounded-md px-3 py-2"
            >
              Coleções
            </Link>
          </nav>
        </div>
      </header>

      {children}
    </main>
  );
}
