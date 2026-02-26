import Link from "next/link";
import { AuthForm } from "@/components/auth-form";

type LoginPageProps = {
  searchParams?: Promise<{ redirect?: string }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = (await searchParams) ?? {};
  const redirect = params.redirect;
  const registerHref = redirect
    ? `/register?redirect=${encodeURIComponent(redirect)}`
    : "/register";

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-6 py-10">
      <AuthForm mode="login" redirectTo={redirect} />

      <p className="site-muted text-center text-sm">
        Ainda não tem conta?{" "}
        <Link href={registerHref} className="underline">
          Criar conta
        </Link>
      </p>
    </main>
  );
}
