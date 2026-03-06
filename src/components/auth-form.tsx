"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "@/context/auth-context";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { AuthFields } from "@/components/auth-form/index";
import {
  AuthFormData,
  AuthFormProps,
  AuthSuccessPayload,
  normalizeRedirectPath,
} from "@/components/auth-form/index";
import { toast } from "sonner";
import { apiFetch, parseApiResponse } from "@/lib/client-api";
import { loginSchema, registerSchema } from "@/lib/validators";

export function AuthForm({
  mode,
  redirectTo,
  fallbackRedirectTo,
  requiredRole,
}: AuthFormProps) {
  const isLogin = mode === "login";
  const { refreshAuth } = useAuth();
  const router = useRouter();
  const [isNavigating, startNavigationTransition] = useTransition();
  const loginRedirectPath = normalizeRedirectPath(redirectTo);
  const loginFallbackPath = normalizeRedirectPath(fallbackRedirectTo);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<AuthFormData>({
    resolver: zodResolver(isLogin ? loginSchema : registerSchema),
    defaultValues: isLogin
      ? {
          email: "",
          password: "",
        }
      : {
          email: "",
          password: "",
          name: "",
          phone: "",
        },
  });

  async function onSubmit(values: AuthFormData) {
    const payload = isLogin
      ? {
          email: values.email,
          password: values.password,
          ...(requiredRole ? { requiredRole } : {}),
        }
      : {
          email: values.email,
          password: values.password,
          name: values.name ?? "",
          phone: values.phone || undefined,
        };

    try {
      const endpoint = isLogin ? "/api/auth/login" : "/api/auth/register";

      const response = await apiFetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await parseApiResponse<AuthSuccessPayload>(response, {
        fallbackErrorMessage: "Não foi possível concluir a autenticação",
      });

      const userPayload = data.user;

      toast.success(
        isLogin ? "Login realizado com sucesso" : "Conta criada com sucesso",
      );

      await refreshAuth();

      setTimeout(() => {
        startNavigationTransition(() => {
          if (isLogin) {
            const role = userPayload?.role;

            if (requiredRole && role !== requiredRole) {
              router.push(loginFallbackPath);
            } else {
              router.push(loginRedirectPath);
            }
          } else {
            router.push("/products");
          }

          router.refresh();
        });
      }, 700);
    } catch (errorValue) {
      if (errorValue instanceof Error) {
        toast.error(errorValue.message);
        return;
      }

      toast.error("Erro de conexão. Tente novamente.");
    }
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="site-surface mx-auto flex w-full max-w-md flex-col gap-4 rounded-lg border site-border p-6"
    >
      <h1 className="text-2xl font-semibold">
        {isLogin ? "Entrar na conta" : "Criar conta"}
      </h1>

      <AuthFields isLogin={isLogin} register={register} errors={errors} />

      <button
        type="submit"
        disabled={isSubmitting || isNavigating}
        className="site-btn mt-2 rounded-md px-4 py-2 text-sm font-medium disabled:opacity-60"
      >
        {isSubmitting
          ? "Enviando..."
          : isNavigating
            ? "Redirecionando..."
            : isLogin
              ? "Entrar"
              : "Criar conta"}
      </button>
    </form>
  );
}
