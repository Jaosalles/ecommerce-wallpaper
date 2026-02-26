import Link from "next/link";

export default function Home() {
  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col px-6 py-10">
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

      <section className="mt-8 grid gap-3 md:grid-cols-4">
        {[
          "Frete grátis",
          "Meios de pagamento",
          "Compra segura",
          "Troca facilitada",
        ].map((item) => (
          <div
            key={item}
            className="site-surface rounded-lg border site-border px-4 py-3 text-center text-sm"
          >
            {item}
          </div>
        ))}
      </section>

      <section className="mt-12 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold">Coleção em destaque</h2>
          <Link href="/products" className="text-sm underline">
            Ver todos
          </Link>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {[
            {
              title: "Doce Botanique",
              description: "Estilo romântico e delicado",
            },
            {
              title: "Blue Garden",
              description: "Tons frios e elegância natural",
            },
            {
              title: "Florescer",
              description: "Vibração suave para ambientes criativos",
            },
          ].map((collection) => (
            <article
              key={collection.title}
              className="site-surface space-y-3 rounded-lg border site-border p-4"
            >
              <div className="site-surface-soft h-44 rounded-md border site-border" />
              <h3 className="text-lg font-medium">{collection.title}</h3>
              <p className="site-muted text-sm">{collection.description}</p>
              <Link href="/products" className="inline-flex text-sm underline">
                Explorar coleção
              </Link>
            </article>
          ))}
        </div>
      </section>

      <section
        id="sobre"
        className="site-surface mt-12 rounded-xl border site-border p-8"
      >
        <h2 className="text-2xl font-semibold">Design com propósito</h2>
        <p className="site-muted mt-3 max-w-3xl text-sm">
          Criamos wallpapers digitais com foco em identidade visual, composição
          e atmosfera. O objetivo é transformar espaços com arte acessível e
          pronta para uso.
        </p>
      </section>

      <section className="mt-12">
        <h2 className="text-2xl font-semibold">Nossos clientes</h2>

        <div className="mt-4 grid gap-4 md:grid-cols-3">
          {[
            "Meu home office mudou completamente com a nova estampa.",
            "Compra rápida, arquivo impecável e ótimo resultado na impressão.",
            "Atendimento ágil e coleções muito bonitas para decoração.",
          ].map((testimonial) => (
            <article
              key={testimonial}
              className="site-surface site-muted rounded-lg border site-border p-4 text-sm"
            >
              “{testimonial}”
            </article>
          ))}
        </div>
      </section>

      <section className="site-surface mt-12 rounded-xl border site-border p-8">
        <h2 className="text-2xl font-semibold">Newsletter</h2>
        <p className="site-muted mt-2 text-sm">
          Cadastre-se e receba novidades e novas coleções.
        </p>

        <form className="mt-4 flex flex-col gap-3 sm:flex-row">
          <input
            type="email"
            placeholder="Seu melhor email"
            className="site-input w-full rounded-md px-3 py-2 text-sm outline-none"
          />
          <button
            type="button"
            className="site-btn rounded-md px-4 py-2 text-sm font-medium"
          >
            Enviar
          </button>
        </form>
      </section>
    </main>
  );
}
