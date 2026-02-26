import Link from "next/link";
import { AuthForm } from "@/components/auth-form";

export default function LoginPage() {
  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-6 py-10">
      <AuthForm mode="login" />

      <p className="site-muted text-center text-sm">
        Ainda não tem conta?{" "}
        <Link href="/register" className="underline">
          Criar conta
        </Link>
      </p>
    </main>
  );
}
