"use server";

import { apiRequest, USE_MOCK_DATA } from "./client";
import { readSession } from "@/lib/auth/session";
import { getEntities } from "@/lib/api/entities";

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

/** Creates a KPI for the entity, then immediately marks it (and any other
 * draft KPIs for that entity) as sent — matching the "Assign KPI to Entity"
 * modal's single-step UX. The backend models this as two calls: create
 * (POST /api/entities/{id}/kpis) then send (POST /api/entities/{id}/kpis/send,
 * no body — it just flips already-created draft KPIs to "sent"). */
export async function sendKpiAction(data: SendKpiPayload): Promise<{ ok: true }> {
  if (USE_MOCK_DATA) {
    await new Promise((resolve) => setTimeout(resolve, 600));
    return { ok: true };
  }

  const session = await readSession();

  await apiRequest(`/api/entities/${data.entityId}/kpis`, session?.token, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      kpis: [
        {
          kpiName: data.kpiName,
          unit: data.unit,
          fiveYearTarget: data.fiveYearTarget,
          formValues: data.formValues,
        },
      ],
    }),
  });

  await apiRequest(`/api/entities/${data.entityId}/kpis/send`, session?.token, {
    method: "POST",
  });

  return { ok: true };
}
