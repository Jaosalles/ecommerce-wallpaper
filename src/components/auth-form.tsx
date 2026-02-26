"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { loginSchema, registerSchema } from "@/lib/validators";
import { z } from "zod";

type AuthFormMode = "login" | "register";

type AuthFormProps = {
  mode: AuthFormMode;
  redirectTo?: string;
  fallbackRedirectTo?: string;
  requiredRole?: "ADMIN" | "CUSTOMER";
};

type LoginFormData = z.infer<typeof loginSchema>;
type RegisterFormData = z.infer<typeof registerSchema>;
type AuthSuccessPayload = {
  user?: {
    role?: "CUSTOMER" | "ADMIN";
  };
};

function normalizeRedirectPath(redirectTo?: string) {
  if (
    !redirectTo ||
    !redirectTo.startsWith("/") ||
    redirectTo.startsWith("//")
  ) {
    return "/products";
  }

  return redirectTo;
}

export function AuthForm({
  mode,
  redirectTo,
  fallbackRedirectTo,
  requiredRole,
}: AuthFormProps) {
  const isLogin = mode === "login";
  const router = useRouter();
  const loginRedirectPath = normalizeRedirectPath(redirectTo);
  const loginFallbackPath = normalizeRedirectPath(fallbackRedirectTo);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData | RegisterFormData>({
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

  async function onSubmit(values: LoginFormData | RegisterFormData) {
    const payload = isLogin
      ? {
          email: values.email,
          password: values.password,
        }
      : {
          email: values.email,
          password: values.password,
          name: (values as RegisterFormData).name,
          phone: (values as RegisterFormData).phone || undefined,
        };

    try {
      const endpoint = isLogin ? "/api/auth/login" : "/api/auth/register";

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = (await response.json()) as {
        success: boolean;
        error?: string;
        data?: AuthSuccessPayload;
        message?: string;
        code?: string;
      };

      const userPayload = data.data?.user;

      if (!response.ok || !data.success) {
        toast.error(data.error ?? "Não foi possível concluir a autenticação");
        return;
      }

      toast.success(
        isLogin ? "Login realizado com sucesso" : "Conta criada com sucesso",
      );

      setTimeout(() => {
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
      }, 700);
    } catch {
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

      {!isLogin ? (
        <>
          <label className="text-sm font-medium" htmlFor="name">
            Nome
          </label>
          <input
            id="name"
            {...register("name" as const)}
            className="site-input rounded-md px-3 py-2 text-sm outline-none"
          />
          {errors.name ? (
            <p className="text-sm text-red-500">{errors.name.message}</p>
          ) : null}

          <label className="text-sm font-medium" htmlFor="phone">
            Telefone (opcional)
          </label>
          <input
            id="phone"
            {...register("phone" as const)}
            className="site-input rounded-md px-3 py-2 text-sm outline-none"
          />
          {errors.phone ? (
            <p className="text-sm text-red-500">{errors.phone.message}</p>
          ) : null}
        </>
      ) : null}

      <label className="text-sm font-medium" htmlFor="email">
        Email
      </label>
      <input
        id="email"
        type="email"
        {...register("email")}
        className="site-input rounded-md px-3 py-2 text-sm outline-none"
      />
      {errors.email ? (
        <p className="text-sm text-red-500">{errors.email.message}</p>
      ) : null}

      <label className="text-sm font-medium" htmlFor="password">
        Senha
      </label>
      <input
        id="password"
        type="password"
        {...register("password")}
        className="site-input rounded-md px-3 py-2 text-sm outline-none"
      />
      {errors.password ? (
        <p className="text-sm text-red-500">{errors.password.message}</p>
      ) : null}

      <button
        type="submit"
        disabled={isSubmitting}
        className="site-btn mt-2 rounded-md px-4 py-2 text-sm font-medium disabled:opacity-60"
      >
        {isSubmitting ? "Enviando..." : isLogin ? "Entrar" : "Criar conta"}
      </button>
    </form>
  );
}
