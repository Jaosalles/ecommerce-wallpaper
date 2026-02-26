import Link from "next/link";
import { AuthForm } from "@/components/auth-form";

type RegisterPageProps = {
  searchParams?: Promise<{ redirect?: string }>;
};

export default async function RegisterPage({
  searchParams,
}: RegisterPageProps) {
  const params = (await searchParams) ?? {};
  const redirect = params.redirect;
  const loginHref = redirect
    ? `/login?redirect=${encodeURIComponent(redirect)}`
    : "/login";

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-6 py-10">
      <AuthForm mode="register" />

      <p className="site-muted text-center text-sm">
        Já possui conta?{" "}
        <Link href={loginHref} className="underline">
          Entrar
        </Link>
      </p>
    </main>
  );
}
