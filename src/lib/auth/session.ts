import "server-only";
import { cookies } from "next/headers";
import { isRoleKey, roles, type RoleDefinition, type RoleKey } from "./roles";

export const SESSION_COOKIE = "sac_session";

/**
 * Demo-grade session storage: the role key lives in a plain cookie.
 *
 * This is intentionally simple so the app has *real* route protection and a
 * real logout, without inventing a bespoke auth backend. When the C# API is
 * wired up, replace `readSession`/`createSession` with calls to its auth
 * endpoint (issuing a proper signed/opaque session token) — every call site
 * in the app goes through this one module, so that's the only file that
 * needs to change.
 */
export async function readSession(): Promise<RoleDefinition | null> {
  const store = await cookies();
  const value = store.get(SESSION_COOKIE)?.value;
  if (!isRoleKey(value)) return null;
  return roles[value];
}

export async function createSession(role: RoleKey) {
  const store = await cookies();
  store.set(SESSION_COOKIE, role, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 8, // 8 hours
  });
}

export async function destroySession() {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
}
