"use server";

import { apiRequest, USE_MOCK_DATA } from "./client";
import { readSession } from "@/lib/auth/session";
import type { AppIndicator, AppIndicatorQuarter, IndicatorSummary } from "../types/schema";

// Generate mock tasks for Thandi (entityId: "1") to test pagination
let MOCK_THANDI_TASKS: AppIndicator[] = Array.from({ length: 35 }, (_, i) => {
  const taskNames = [
    "Host Regional Cultural Workshops", "Distribute Local Arts Grants", 
    "Refurbish Heritage Sites", "Publish Annual Report", "Conduct Staff Training", 
    "Audit Financial Statements", "Update IT Infrastructure", "Community Outreach Program"
  ];
  const units = ["Workshops", "ZAR", "Sites", "Reports", "People", "Audits", "Systems", "Events"];
  
  let status: 'not_started' | 'in_progress' | 'completed' = 'not_started';
  if (i % 3 === 0) status = 'completed';
  else if (i % 2 === 0) status = 'in_progress';

  return {
    id: `mock-task-${i + 1}`,
    appSubmissionId: "mock-app-1",
    entityId: "1", 
    name: `${taskNames[i % taskNames.length]} (Phase ${Math.floor(i / 8) + 1})`,
    annualTarget: (i * 12) + 10,
    unit: units[i % units.length],
    isApproved: true,
    status: status,
    createdAt: new Date(Date.now() - i * 86400000).toISOString()
  };
});

export async function getEntityIndicators(entityId: string, page = 1, pageSize = 10): Promise<{ data: AppIndicator[]; total: number }> {
  if (USE_MOCK_DATA) {
    if (entityId !== "1") return { data: [], total: 0 };

    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    return {
      data: MOCK_THANDI_TASKS.slice(start, end),
      total: MOCK_THANDI_TASKS.length
    };
  }
  const session = await readSession();
  return apiRequest(`/api/entities/${entityId}/indicators?page=${page}&pageSize=${pageSize}`, session?.token);
}

export async function submitQuarterProof(indicatorId: string, quarter: number, formData: FormData): Promise<AppIndicatorQuarter> {
  if (USE_MOCK_DATA) {
    await new Promise(resolve => setTimeout(resolve, 800)); 
    
    MOCK_THANDI_TASKS = MOCK_THANDI_TASKS.map(task => 
      task.id === indicatorId ? { ...task, status: 'completed' } : task
    );

    return { id: `mock-proof-${Date.now()}`, appIndicatorId: indicatorId, quarter, status: "completed" };
  }
  const session = await readSession();
  return apiRequest(`/api/indicators/${indicatorId}/quarters/${quarter}/proof`, session?.token, {
    method: 'POST',
    body: formData,
  });
}

export async function getIndicatorDetails(id: string): Promise<{ indicator: AppIndicator; quarters: AppIndicatorQuarter[] }> {
  if (USE_MOCK_DATA) {
    throw new Error("Mock data not implemented for indicator details");
  }
  const session = await readSession();
  return apiRequest(`/api/indicators/${id}`, session?.token);
}

export async function getIndicatorSummary(): Promise<IndicatorSummary[]> {
  if (USE_MOCK_DATA) {
    return [
      { entityId: "1", entityName: "Arts & Culture Trust", percentComplete: 65, percentRemaining: 35, totalIndicators: 10 },
      { entityId: "2", entityName: "National Heritage Council", percentComplete: 20, percentRemaining: 80, totalIndicators: 5 }
    ];
  }
  const session = await readSession();
  return apiRequest<IndicatorSummary[]>('/api/dsac/indicator-summary', session?.token);
}