"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";

export function LoginLink() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  if (pathname === "/login") {
    return null;
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
