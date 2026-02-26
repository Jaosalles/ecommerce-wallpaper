import Link from "next/link";
import { redirect } from "next/navigation";
import { headers } from "next/headers";

import { getAuthenticatedUserFromCookie } from "@/lib/auth";
import { authz } from "@/lib/authz/facade";
import { AdminLogoutButton } from "@/components/admin/logout-button";

function normalizeRedirectPath(pathname: string | null | undefined) {
  if (!pathname || !pathname.startsWith("/") || pathname.startsWith("//")) {
    return "/products";
  }

  return pathname;
}

function getPathFromReferer(referer: string | null) {
  if (!referer) {
    return null;
  }

  try {
    const url = new URL(referer);
    return `${url.pathname}${url.search}`;
  } catch {
    return null;
  }
}

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getAuthenticatedUserFromCookie();
  const requestHeaders = await headers();
  const returnToPath = normalizeRedirectPath(
    getPathFromReferer(requestHeaders.get("referer")),
  );

  if (!user) {
    const params = new URLSearchParams({
      redirect: "/admin",
      returnTo: returnToPath,
    });

    redirect(`/admin-login?${params.toString()}`);
  }

  if (!authz.can(user, "product:create")) {
    redirect(returnToPath);
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
            <AdminLogoutButton />
          </nav>
        </div>
      </header>

      {children}
    </main>
  );
}
