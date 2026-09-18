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

export async function sendKpiAction(data: SendKpiPayload): Promise<{ ok: true }> {
  if (USE_MOCK_DATA) {
    // Update local mock store in memory for mock testing
    const entity = MOCK_ENTITIES.find((e) => String(e.id) === String(data.entityId));
    if (entity) {
      entity.kpis.push({
        id: `kpi-${Date.now()}`,
        name: data.kpiName,
        target: `${data.fiveYearTarget} ${data.unit}`,
        actual: "0",
        onTrack: false,
      });
    }
    await new Promise((resolve) => setTimeout(resolve, 600));
    return { ok: true };
  }

  const session = await readSession();

  // 1. Create the KPI entry in the database
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

  // 2. Publish/send the created KPI to the entity
  await apiRequest(`/api/entities/${data.entityId}/kpis/send`, session?.token, {
    method: "POST",
  });

  return { ok: true };
}