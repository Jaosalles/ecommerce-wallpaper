import Link from "next/link";

export function FeaturedCollectionsSection() {
  return (
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
  );
}
