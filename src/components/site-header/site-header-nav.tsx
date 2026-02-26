import { LoginLink } from "@/components/login-link";
import Link from "next/link";

export function SiteHeaderNav() {
  return (
    <nav className="flex items-center gap-4 text-sm">
      <Link href="/" className="hover:underline">
        Home
      </Link>
      <Link href="/products" className="hover:underline">
        Produtos
      </Link>
      <Link href="/cart" className="hover:underline">
        Carrinho
      </Link>
      <LoginLink />
      <Link href="/#sobre" className="hover:underline">
        Sobre
      </Link>
    </nav>
  );
}
