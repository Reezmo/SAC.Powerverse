"use server";

import { apiRequest, USE_MOCK_DATA } from "./client";
import { readSession } from "@/lib/auth/session";
import type { AppIndicator, AppIndicatorQuarter, IndicatorSummary } from "../types/schema";

export async function getEntityIndicators(entityId: string, page = 1, pageSize = 10): Promise<{ data: AppIndicator[]; total: number }> {
  if (USE_MOCK_DATA) {
    return { data: [], total: 0 };
  }
  const session = await readSession();
  return apiRequest(`/api/entities/${entityId}/indicators?page=${page}&pageSize=${pageSize}`, session?.token);
}

export async function getIndicatorDetails(id: string): Promise<{ indicator: AppIndicator; quarters: AppIndicatorQuarter[] }> {
  if (USE_MOCK_DATA) {
    throw new Error("Mock data not implemented for indicator details");
  }
  const session = await readSession();
  return apiRequest(`/api/indicators/${id}`, session?.token);
}

export async function submitQuarterProof(indicatorId: string, quarter: number, formData: FormData): Promise<AppIndicatorQuarter> {
  if (USE_MOCK_DATA) {
    await new Promise(resolve => setTimeout(resolve, 800)); // simulate network latency
    return { id: "mock-quarter", appIndicatorId: indicatorId, quarter, status: "completed" };
  }
  const session = await readSession();
  return apiRequest(`/api/indicators/${indicatorId}/quarters/${quarter}/proof`, session?.token, {
    method: 'POST',
    body: formData,
  });
}

export async function getIndicatorSummary(): Promise<IndicatorSummary[]> {
  if (USE_MOCK_DATA) {
    return [
      { entityId: "1", entityName: "Arts & Culture Trust", percentComplete: 65, percentRemaining: 35 },
      { entityId: "2", entityName: "National Heritage Council", percentComplete: 20, percentRemaining: 80 }
    ];
  }
  const session = await readSession();
  return apiRequest<IndicatorSummary[]>('/api/dsac/indicator-summary', session?.token);
}