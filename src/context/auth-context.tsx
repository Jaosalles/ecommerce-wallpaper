"use client";

import { apiFetch, parseApiResponse } from "@/lib/client-api";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

type AuthUser = {
  id: string;
  email: string;
  name: string;
  role: "CUSTOMER" | "ADMIN";
  phone?: string | null;
  avatar?: string | null;
};

type AuthContextValue = {
  user: AuthUser | null;
  isAuthenticated: boolean;
  loading: boolean;
  refreshAuth: () => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

type AuthProviderProps = {
  children: React.ReactNode;
};

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshAuth = useCallback(async () => {
    setLoading(true);

    try {
      const response = await apiFetch("/api/auth/me", {
        method: "GET",
        cache: "no-store",
      });

      const data = await parseApiResponse<{ user: AuthUser }>(response, {
        fallbackErrorMessage: "",
      });

      setUser(data.user);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refreshAuth();
  }, [refreshAuth]);

  const logout = useCallback(async () => {
    const response = await apiFetch("/api/auth/logout", {
      method: "POST",
    });

    await parseApiResponse<{ message: string }>(response, {
      fallbackErrorMessage: "Não foi possível sair",
    });

    setUser(null);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      loading,
      refreshAuth,
      logout,
    }),
    [user, loading, refreshAuth, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth deve ser usado dentro de AuthProvider");
  }

  return context;
}
