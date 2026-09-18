import "server-only";
import { cookies } from "next/headers";
import { roles, roleKeyFromBackendRole, type RoleDefinition } from "./roles";

export const SESSION_COOKIE = "sac_session";

export interface Session extends RoleDefinition {
  token: string;
  entityId: string | null;
}

interface StoredSession {
  token: string;
  entityId: string | null;
  role: string; // backend role claim: entity_officer | dsac_me | dsac_exec
}

/**
 * Reads the signed-in user's session: the real JWT issued by the C# API's
 * POST /api/auth/login, plus their entity_id claim (null for DSAC staff),
 * stored together in an httpOnly cookie as JSON. `apiRequest` calls forward
 * `session.token` as a Bearer header on every authenticated request.
 */
export async function readSession(): Promise<Session | null> {
  const store = await cookies();
  const raw = store.get(SESSION_COOKIE)?.value;
  if (!raw) return null;

  let stored: StoredSession;
  try {
    stored = JSON.parse(raw) as StoredSession;
  } catch {
    return null;
  }

  const roleKey = roleKeyFromBackendRole(stored.role);
  if (!roleKey) return null;

  return { ...roles[roleKey], token: stored.token, entityId: stored.entityId };
}

export async function createSession(token: string, backendRole: string, entityId: string | null) {
  const store = await cookies();
  const value: StoredSession = { token, entityId, role: backendRole };
  store.set(SESSION_COOKIE, JSON.stringify(value), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 8, // 8 hours, matches the backend token's expiry
  });
}

export async function destroySession() {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
}
