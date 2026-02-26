import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "E-Commerce Wallpaper",
  description: "Plataforma de wallpapers digitais",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <div className="flex min-h-screen flex-col">
          <header className="site-surface border-b site-border">
            <div className="border-b site-border px-6 py-2 text-xs">
              <div className="site-muted mx-auto flex w-full max-w-6xl flex-wrap items-center justify-center gap-x-4 gap-y-1">
                <span>Frete grátis</span>
                <span>Meios de pagamento</span>
                <span>Compra segura</span>
                <span>Troca e devoluções</span>
              </div>
            </div>

            <div className="px-6 py-4">
              <div className="mx-auto flex w-full max-w-6xl items-center justify-between">
                <Link href="/" className="text-lg font-semibold tracking-wide">
                  Wallpaper Store
                </Link>

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
                  <Link href="/admin" className="hover:underline">
                    Admin
                  </Link>
                  <Link href="/#sobre" className="hover:underline">
                    Sobre
                  </Link>
                </nav>
              </div>
            </div>
          </header>

          <div className="flex-1">{children}</div>

          <footer className="site-surface site-muted border-t site-border px-6 py-4 text-center text-sm">
            © {new Date().getFullYear()} Wallpaper Store
          </footer>
        </div>
      </body>
    </html>
  );
}
