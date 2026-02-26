import { getAuthenticatedUserFromCookie } from "@/lib/auth";
import { authz } from "@/lib/authz/facade";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

function normalizeRedirectPath(pathname: string | null | undefined) {
  if (!pathname || !pathname.startsWith("/") || pathname.startsWith("//")) {
    return "/products";
  }

  return pathname;
}

function getPathFromReferer(referer: string | null) {
  if (!referer) {
    return null;
  }

  try {
    const url = new URL(referer);
    return `${url.pathname}${url.search}`;
  } catch {
    return null;
  }
}

async function resolveReturnToPath() {
  const requestHeaders = await headers();

  return normalizeRedirectPath(
    getPathFromReferer(requestHeaders.get("referer")),
  );
}

export async function ensureAdminLayoutAccess() {
  const user = await getAuthenticatedUserFromCookie();
  const returnToPath = await resolveReturnToPath();

  if (!user) {
    const params = new URLSearchParams({
      redirect: "/admin",
      returnTo: returnToPath,
    });

    redirect(`/admin-login?${params.toString()}`);
  }

  if (!authz.can(user, "product:create")) {
    redirect(returnToPath);
  }
}
