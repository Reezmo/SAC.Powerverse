"use server";

import { apiRequest, USE_MOCK_DATA } from "./client";
import { readSession } from "@/lib/auth/session";
import type { KpiSubmissionInput } from "./submissions";

/** Persists a KPI submission for the signed-in entity officer's own entity.
 * Server action so the client-side KpiSubmissionForm can call it without
 * touching the session cookie directly. */
export async function submitKpiReport(input: KpiSubmissionInput): Promise<{ ok: true }> {
  if (USE_MOCK_DATA) {
    await new Promise((resolve) => setTimeout(resolve, 600));
    return { ok: true };
  }
  const session = await readSession();
  await apiRequest(`/api/submissions/kpi-report`, session?.token, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  return { ok: true };
}
