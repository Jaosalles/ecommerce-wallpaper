"use client";

import { apiFetch, parseApiResponse } from "@/lib/client-api";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

export function AdminLogoutButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleLogout() {
    setLoading(true);

    try {
      const response = await apiFetch("/api/auth/logout", {
        method: "POST",
      });

      await parseApiResponse<{ message: string }>(response, {
        fallbackErrorMessage: "Não foi possível realizar logout",
      });
    } catch (errorValue) {
      if (errorValue instanceof Error) {
        toast.error(errorValue.message);
      } else {
        toast.error("Erro de conexão ao realizar logout");
      }
    } finally {
      router.push("/login");
      router.refresh();
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      disabled={loading}
      className="site-btn rounded-md px-3 py-2 text-sm font-medium disabled:opacity-60"
    >
      {loading ? "Saindo..." : "Sair"}
    </button>
  );
}
