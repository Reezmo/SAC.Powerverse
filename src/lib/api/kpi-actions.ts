"use server";

import { apiRequest, USE_MOCK_DATA } from "./client";
import { readSession } from "@/lib/auth/session";
import { getEntities } from "@/lib/api/entities";
import { MOCK_ENTITIES } from "@/lib/data/mockEntities";

export interface SendKpiPayload {
  entityId: string;
  kpiName: string;
  unit: string;
  fiveYearTarget: number;
  formValues: string;
}

export async function getEntitiesForDropdown() {
  return await getEntities();
}

export async function sendKpiAction(
  data: SendKpiPayload,
): Promise<{ ok: true }> {
  if (USE_MOCK_DATA) {
    await new Promise((resolve) => setTimeout(resolve, 600));
    return { ok: true };
  }

  const session = await readSession();

  await apiRequest(`/api/Entities/${data.entityId}/kpis/send`, session?.token, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  return { ok: true };
}
