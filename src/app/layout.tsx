import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { AppToaster } from "@/components/app-toaster";
import { SiteHeader } from "@/components/site-header";
import { AuthProvider } from "@/context/auth-context";
import { CartProvider } from "@/context/cart-context";
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
        <AuthProvider>
          <CartProvider>
            <div className="flex min-h-screen flex-col">
              <AppToaster />
              <SiteHeader />

              <div className="flex-1">{children}</div>

              <footer className="site-surface site-muted border-t site-border px-6 py-4 text-center text-sm">
                © {new Date().getFullYear()} Wallpaper Store
              </footer>
            </div>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
