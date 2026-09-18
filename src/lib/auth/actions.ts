"use server";

import { redirect } from "next/navigation";
import { createSession, destroySession } from "./session";
import { isRoleKey, roles, DEMO_CREDENTIALS, type RoleKey } from "./roles";
import { API_BASE_URL, USE_MOCK_DATA, ApiError } from "@/lib/api/client";

interface LoginResponse {
  token: string;
  expiresAt: string;
}

interface JwtClaims {
  role: string;
  entity_id?: string;
}

function decodeJwtClaims(token: string): JwtClaims {
  const payload = token.split(".")[1];
  const normalized = payload.replace(/-/g, "+").replace(/_/g, "/");
  const json = Buffer.from(normalized, "base64").toString("utf-8");
  return JSON.parse(json) as JwtClaims;
}

export async function loginAs(role: string) {
  if (!isRoleKey(role)) {
    throw new Error(`Unknown role: ${role}`);
  }

  if (USE_MOCK_DATA) {
    const mockBackendRole = role === "thandi" ? "entity_officer" : role === "sipho" ? "dsac_me" : "dsac_exec";
    const mockEntityId = role === "thandi" ? "1" : null; 
    
    await createSession(`mock-token-${role}`, mockBackendRole, mockEntityId);
    redirect(roles[role as RoleKey].homePath);
  }

  const { email, password } = DEMO_CREDENTIALS[role as RoleKey];

  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
      cache: "no-store",
    });
  } catch {
    throw new ApiError("Could not reach the API to log in. Check NEXT_PUBLIC_API_URL.");
  }

  if (!response.ok) {
    throw new ApiError(`Login failed with status ${response.status}`, response.status);
  }

  const { token } = (await response.json()) as LoginResponse;
  const claims = decodeJwtClaims(token);

  await createSession(token, claims.role, claims.entity_id ?? null);
  redirect(roles[role as RoleKey].homePath);
}

export async function logout() {
  await destroySession();
  redirect("/login");
}