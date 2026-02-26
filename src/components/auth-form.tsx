"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

type AuthFormMode = "login" | "register";

type AuthFormProps = {
  mode: AuthFormMode;
};

export function AuthForm({ mode }: AuthFormProps) {
  const isLogin = mode === "login";
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const endpoint = isLogin ? "/api/auth/login" : "/api/auth/register";

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
          ...(isLogin ? {} : { name, phone: phone || undefined }),
        }),
      });

      const data = (await response.json()) as {
        success: boolean;
        error?: string;
      };

      if (!response.ok || !data.success) {
        setError(data.error ?? "Não foi possível concluir a autenticação");
        return;
      }

      setSuccess(
        isLogin ? "Login realizado com sucesso" : "Conta criada com sucesso",
      );

      setTimeout(() => {
        router.push("/products");
        router.refresh();
      }, 700);
    } catch {
      setError("Erro de conexão. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
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
            value={name}
            onChange={(event) => setName(event.target.value)}
            required
            className="site-input rounded-md px-3 py-2 text-sm outline-none"
          />

          <label className="text-sm font-medium" htmlFor="phone">
            Telefone (opcional)
          </label>
          <input
            id="phone"
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
            className="site-input rounded-md px-3 py-2 text-sm outline-none"
          />
        </>
      ) : null}

      <label className="text-sm font-medium" htmlFor="email">
        Email
      </label>
      <input
        id="email"
        type="email"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        required
        className="site-input rounded-md px-3 py-2 text-sm outline-none"
      />

      <label className="text-sm font-medium" htmlFor="password">
        Senha
      </label>
      <input
        id="password"
        type="password"
        value={password}
        onChange={(event) => setPassword(event.target.value)}
        required
        className="site-input rounded-md px-3 py-2 text-sm outline-none"
      />

      <button
        type="submit"
        disabled={loading}
        className="site-btn mt-2 rounded-md px-4 py-2 text-sm font-medium disabled:opacity-60"
      >
        {loading ? "Enviando..." : isLogin ? "Entrar" : "Criar conta"}
      </button>

      {error ? (
        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
      ) : null}
      {success ? (
        <p className="text-sm text-emerald-600 dark:text-emerald-400">
          {success}
        </p>
      ) : null}
    </form>
  );
}
