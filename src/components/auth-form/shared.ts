import { loginSchema, registerSchema } from "@/lib/validators";
import { z } from "zod";

export type AuthFormMode = "login" | "register";

export type AuthFormProps = {
  mode: AuthFormMode;
  redirectTo?: string;
  fallbackRedirectTo?: string;
  requiredRole?: "ADMIN" | "CUSTOMER";
};

export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
export type AuthFormData = LoginFormData &
  Partial<Pick<RegisterFormData, "name" | "phone">>;

export type AuthSuccessPayload = {
  user?: {
    role?: "CUSTOMER" | "ADMIN";
  };
};

export function normalizeRedirectPath(redirectTo?: string) {
  if (
    !redirectTo ||
    !redirectTo.startsWith("/") ||
    redirectTo.startsWith("//")
  ) {
    return "/products";
  }

  return redirectTo;
}
