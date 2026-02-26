import Link from "next/link";

export function HeroSection() {
  return (
    <section className="site-surface grid gap-6 rounded-xl border site-border p-8 md:grid-cols-2">
      <div className="space-y-4">
        <p className="site-muted text-xs uppercase tracking-[0.2em]">
          Coleção nova
        </p>
        <h1 className="text-4xl font-semibold leading-tight md:text-5xl">
          Papéis de parede autorais para transformar seu ambiente
        </h1>
        <p className="site-muted text-sm">
          Explore coleções exclusivas com estética minimalista, floral e
          abstrata. Compra simples e entrega digital rápida.
        </p>

        <div className="flex flex-wrap gap-3 pt-2">
          <Link
            href="/products"
            className="site-btn rounded-md px-4 py-2 text-sm font-medium"
          >
            Ver coleção
          </Link>
          <Link
            href="/login?redirect=/"
            className="site-btn-secondary rounded-md px-4 py-2 text-sm font-medium"
          >
            Entrar
          </Link>
          <Link
            href="/cart"
            className="site-btn-secondary rounded-md px-4 py-2 text-sm font-medium"
          >
            Ir para carrinho
          </Link>
        </div>
      </div>

      <div className="site-surface-soft rounded-lg border site-border p-6">
        <div className="grid h-full grid-cols-2 gap-3">
          <div className="site-surface rounded-md border site-border" />
          <div className="site-surface rounded-md border site-border" />
          <div className="site-surface rounded-md border site-border" />
          <div className="site-surface rounded-md border site-border" />
        </div>
      </div>
    </section>
  );
}
