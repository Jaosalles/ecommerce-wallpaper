import { JwtPayload as JwtPayloadType } from "@/types";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

import { prisma } from "./prisma";

const JWT_COOKIE_NAME = "auth_token";
const JWT_EXPIRES_IN = "7d";

function getJwtSecret() {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error("JWT_SECRET não configurado");
  }

  return secret;
}

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 10);
}

export async function comparePassword(
  password: string,
  hashedPassword: string,
) {
  return bcrypt.compare(password, hashedPassword);
}

export function signToken(payload: { userId: string; email: string }) {
  return jwt.sign(payload, getJwtSecret(), {
    expiresIn: JWT_EXPIRES_IN,
  });
}

export function verifyToken(token: string): JwtPayloadType {
  return jwt.verify(token, getJwtSecret()) as JwtPayloadType;
}

export async function setAuthCookie(token: string) {
  const cookieStore = await cookies();

  cookieStore.set(JWT_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}

export async function clearAuthCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(JWT_COOKIE_NAME);
}

export async function getAuthTokenFromCookie() {
  const cookieStore = await cookies();
  return cookieStore.get(JWT_COOKIE_NAME)?.value;
}

type AuthenticatedUser = {
  id: string;
  email: string;
  role: "CUSTOMER" | "ADMIN";
};

export async function getAuthenticatedUserFromCookie(): Promise<AuthenticatedUser | null> {
  const token = await getAuthTokenFromCookie();

  if (!token) {
    return null;
  }

  try {
    const payload = verifyToken(token);

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        email: true,
        role: true,
      },
    });

    return user;
  } catch {
    return null;
  }
}

export async function isAdminFromCookie() {
  const user = await getAuthenticatedUserFromCookie();
  return user?.role === "ADMIN";
}

export function sanitizeUser<T extends { password?: string }>(user: T) {
  const safeUser = { ...user };
  delete safeUser.password;
  return safeUser;
}
