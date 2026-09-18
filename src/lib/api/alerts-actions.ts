"use server";

import { apiRequest, USE_MOCK_DATA } from "./client";
import { readSession } from "@/lib/auth/session";
import type { AlertDTO } from "../types/schema";

/** Marks an alert as followed up by creating a real task against the entity
 * (backed by POST /api/tasks) — not just local UI state. Server action so
 * the client-side AlertsList component can call it without touching the
 * session cookie directly. */
export async function followUpOnAlert(alert: AlertDTO): Promise<{ ok: true }> {
  if (USE_MOCK_DATA) {
    await new Promise((resolve) => setTimeout(resolve, 300));
    return { ok: true };
  }
  const session = await readSession();
  await apiRequest(`/api/tasks`, session?.token, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      description: `Follow up: ${alert.type} — ${alert.entity}. ${alert.message}`,
    }),
  });
  return { ok: true };
}
