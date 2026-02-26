import { clearAuthCookie } from "@/lib/auth";
import { ok } from "@/lib/api";
import { successMessages } from "@/lib/error-messages";

export async function POST() {
  await clearAuthCookie();
  return ok({ message: successMessages.auth.logout });
}
