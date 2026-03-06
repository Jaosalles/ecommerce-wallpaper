"use client";

import { useAuth } from "@/context/auth-context";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

export function LoginLink() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { isAuthenticated, loading, logout } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  if (pathname === "/login") {
    return null;
  }

  async function handleLogout() {
    setIsLoggingOut(true);

    try {
      await logout();
    } finally {
      setIsLoggingOut(false);
      router.refresh();
    }
  }

  if (loading) {
    return null;
  }

  if (isAuthenticated) {
    return (
      <button
        type="button"
        onClick={handleLogout}
        disabled={isLoggingOut}
        className="site-btn rounded-md px-3 py-1.5 text-sm font-medium disabled:opacity-60"
      >
        {isLoggingOut ? "Saindo..." : "Sair"}
      </button>
    );
  }

  const search = searchParams.toString();
  const currentPath = search ? `${pathname}?${search}` : pathname;
  const loginHref = `/login?redirect=${encodeURIComponent(currentPath)}`;

  return (
    <Link
      href={loginHref}
      className="site-btn rounded-md px-3 py-1.5 text-sm font-medium"
    >
      Entrar
    </Link>
  );
}
