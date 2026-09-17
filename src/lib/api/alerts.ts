import { apiRequest, USE_MOCK_DATA } from "./client";
import { MOCK_ALERTS } from "@/lib/data/mockEntities";

export interface AlertDTO {
  id: string;
  entity: string;
  type: string;
  message: string;
  severity: "high" | "medium" | "low";
}

export async function getAlerts(): Promise<AlertDTO[]> {
  if (USE_MOCK_DATA) {
    return MOCK_ALERTS;
  }
  return apiRequest<AlertDTO[]>(`/api/alerts`);
}
