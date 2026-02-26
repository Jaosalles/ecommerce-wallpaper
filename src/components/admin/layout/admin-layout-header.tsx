import { AdminLogoutButton } from "@/components/admin/logout-button";
import Link from "next/link";

export function AdminLayoutHeader() {
  return (
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
          <AdminLogoutButton />
        </nav>
      </div>
    </header>
  );
}
