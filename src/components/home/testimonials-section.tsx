export function TestimonialsSection() {
  return (
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
  );
}
