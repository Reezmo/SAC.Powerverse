"use server";

import { redirect } from "next/navigation";
import { createSession, destroySession } from "./session";
import { TEST_CREDENTIALS } from "./roles";
import { API_BASE_URL, USE_MOCK_DATA } from "@/lib/api/client";

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

export async function loginWithCredentials(formData: FormData): Promise<{ error: string } | void> {
  const email = formData.get("email")?.toString() || "";
  const password = formData.get("password")?.toString() || "";

  let tokenToUse = "";
  let roleToUse = "";
  let entityIdToUse: string | null = null;

  if (USE_MOCK_DATA) {
    // Mock Matching Logic
    if (email === TEST_CREDENTIALS.thandi.email && password === TEST_CREDENTIALS.thandi.password) {
      roleToUse = "entity_officer";
      entityIdToUse = "1";
    } else if (email === TEST_CREDENTIALS.bianca.email && password === TEST_CREDENTIALS.bianca.password) {
      roleToUse = "entity_officer";
      entityIdToUse = "3"; // Triggers the "Pending APP" flow
    } else if (email === TEST_CREDENTIALS.sipho.email && password === TEST_CREDENTIALS.sipho.password) {
      roleToUse = "dsac_me";
    } else if (email === TEST_CREDENTIALS.exec.email && password === TEST_CREDENTIALS.exec.password) {
      roleToUse = "dsac_exec";
    } else {
      return { error: "Invalid credentials." };
    }
    tokenToUse = `mock-token-${Date.now()}`;
  } else {
    // Real API Logic
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
        cache: "no-store",
      });

      if (!response.ok) {
        return { error: "Invalid email or password." };
      }

      const { token } = (await response.json()) as LoginResponse;
      const claims = decodeJwtClaims(token);
      
      tokenToUse = token;
      roleToUse = claims.role;
      entityIdToUse = claims.entity_id ?? null;
    } catch {
      return { error: "Could not reach the API. Please try again later." };
    }
  }

  // Create session and route based on role
  await createSession(tokenToUse, roleToUse, entityIdToUse);
  const route = roleToUse === "entity_officer" ? "/dashboard" : "/portfolio";
  redirect(route);
}

export async function logout() {
  await destroySession();
  redirect("/login");
}