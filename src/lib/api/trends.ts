import { apiRequest, USE_MOCK_DATA } from "./client";
import { readSession } from "@/lib/auth/session";
import type { EntityTrendDTO, PortfolioTrendDTO } from "../types/schema";

/** Portfolio-wide submitted-vs-missed counts per reporting cycle. DSAC-staff only. */
export async function getPortfolioTrend(): Promise<PortfolioTrendDTO> {
  if (USE_MOCK_DATA) {
    return { cycles: [] };
  }
  const session = await readSession();
  if (!session?.canAccessPortfolio) {
    // entity_officer isn't authorized to call /api/dsac/trends — return an
    // empty series rather than a 403, matching the pattern in alerts.ts.
    return { cycles: [] };
  }
  return apiRequest<PortfolioTrendDTO>("/api/dsac/trends", session.token);
}

/** Submission-status trend across cycles for one entity. DSAC staff, or the
 * owning entity officer, may call this. */
export async function getEntityTrend(entityId: string): Promise<EntityTrendDTO | null> {
  if (USE_MOCK_DATA) {
    return null;
  }
  const session = await readSession();
  try {
    return await apiRequest<EntityTrendDTO>(`/api/dsac/entity/${entityId}/trend`, session?.token);
  } catch {
    return null;
  }
}
