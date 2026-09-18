import { apiRequest, USE_MOCK_DATA } from "./client";
import { MOCK_ALERTS } from "@/lib/data/mockEntities";
import type { AlertDTO } from "../types/schema";
import { readSession } from "@/lib/auth/session";

export type { AlertDTO };

export async function getAlerts(): Promise<AlertDTO[]> {
  if (USE_MOCK_DATA) {
    return MOCK_ALERTS;
  }
  const session = await readSession();
  if (!session?.canAccessPortfolio) {
    // entity_officer isn't authorized to call /api/alerts (DSAC-staff only) — return
    // an empty list instead of a 403, so entity layouts that render an alert badge
    // (via this same call) don't break for that role.
    return [];
  }
  return apiRequest<AlertDTO[]>(`/api/alerts`, session.token);
}
