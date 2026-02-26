export function NewsletterSection() {
  return (
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
  );
}
