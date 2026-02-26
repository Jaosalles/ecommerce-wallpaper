"use client";

import { apiFetch } from "@/lib/client-api";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export function useSiteHeaderVisibility() {
  const pathname = usePathname();
  const isAdminLoginPath = pathname === "/admin-login";
  const isAdminPanelPath =
    pathname === "/admin" || pathname.startsWith("/admin/");
  const [hideHeader, setHideHeader] = useState(false);

  useEffect(() => {
    let active = true;

    async function checkAuthForAdmin() {
      if (isAdminLoginPath) {
        setHideHeader(true);
        return;
      }

      if (!isAdminPanelPath) {
        setHideHeader(false);
        return;
      }

      try {
        const response = await apiFetch("/api/auth/me", {
          method: "GET",
          cache: "no-store",
        });

        if (!active) {
          return;
        }

        setHideHeader(response.ok);
      } catch {
        if (!active) {
          return;
        }

        setHideHeader(false);
      }
    }

    checkAuthForAdmin();

    return () => {
      active = false;
    };
  }, [isAdminLoginPath, isAdminPanelPath]);

  return {
    hideHeader,
  };
}
