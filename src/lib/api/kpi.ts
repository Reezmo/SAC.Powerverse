import { apiRequest, USE_MOCK_DATA } from "./client";
import { readSession } from "@/lib/auth/session";
import type { EntityKpi } from "../types/schema";

export async function getEntityKpis(entityId: string): Promise<EntityKpi[]> {
  if (USE_MOCK_DATA) {
    return [];
  }
  const session = await readSession();
  return apiRequest<EntityKpi[]>(`/api/Entities/${entityId}/kpis`, session?.token);
}