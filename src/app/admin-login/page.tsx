import Link from "next/link";

import { AuthForm } from "@/components/auth-form";

type AdminLoginPageProps = {
  searchParams?: Promise<{ redirect?: string; returnTo?: string }>;
};

export default async function AdminLoginPage({
  searchParams,
}: AdminLoginPageProps) {
  const params = (await searchParams) ?? {};
  const redirect = params.redirect ?? "/admin";
  const returnTo = params.returnTo ?? "/products";

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-6 py-10">
      <section className="site-surface mx-auto w-full max-w-md rounded-lg border site-border p-4 text-center">
        <p className="site-muted text-xs uppercase tracking-[0.2em]">
          Painel administrativo
        </p>
        <h1 className="mt-1 text-xl font-semibold">Login do painel</h1>
        <p className="site-muted mt-2 text-sm">
          Este acesso é exclusivo para administração da loja.
        </p>
      </section>

      <AuthForm
        mode="login"
        redirectTo={redirect}
        fallbackRedirectTo={returnTo}
        requiredRole="ADMIN"
      />

      <p className="site-muted text-center text-sm">
        Esta é uma tela diferente do login de clientes.{" "}
        <Link href="/login" className="underline">
          Ir para login do site
        </Link>
      </p>
    </main>
  );
}
