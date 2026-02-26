import { CartView } from "@/components/cart-view";

export default function CartPage() {
  return (
    <main className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-6 py-10">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold">Carrinho</h1>
        <p className="site-muted text-sm">
          Revise os itens e avance para o checkout via WhatsApp.
        </p>
      </header>

      <CartView />
    </main>
  );
}
