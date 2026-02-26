export function BenefitsSection() {
  return (
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
  );
}
