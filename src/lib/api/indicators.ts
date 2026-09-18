"use server";

import { apiRequest, USE_MOCK_DATA } from "./client";
import { readSession } from "@/lib/auth/session";
import type { AppIndicator, AppIndicatorQuarter, IndicatorSummary } from "../types/schema";

// Generate 35 mock tasks for Thandi
let MOCK_THANDI_TASKS: AppIndicator[] = Array.from({ length: 35 }, (_, i) => {
  const taskNames = [
    "Host Regional Cultural Workshops", "Distribute Local Arts Grants", 
    "Refurbish Heritage Sites", "Publish Annual Report", "Conduct Staff Training"
  ];
  let status: 'not_started' | 'in_progress' | 'completed' = 'not_started';
  if (i % 3 === 0) status = 'completed';
  else if (i % 2 === 0) status = 'in_progress';

  return {
    id: `mock-thandi-task-${i + 1}`,
    appSubmissionId: "mock-app-1",
    entityId: "1", 
    name: `${taskNames[i % taskNames.length]} (Phase ${Math.floor(i / 5) + 1})`,
    annualTarget: (i * 10) + 10,
    unit: "Events",
    isApproved: true,
    status: status,
    createdAt: new Date().toISOString()
  };
});

// Generate 5 mock tasks for Bianca
let MOCK_BIANCA_TASKS: AppIndicator[] = Array.from({ length: 5 }, (_, i) => ({
  id: `mock-bianca-task-${i + 1}`,
  appSubmissionId: "mock-app-2",
  entityId: "3", 
  name: `New Activated Language Initiative ${i + 1}`,
  annualTarget: 10,
  unit: "Programs",
  isApproved: true,
  status: "not_started",
  createdAt: new Date().toISOString()
}));

export async function getEntityIndicators(entityId: string, page = 1, pageSize = 10): Promise<{ data: AppIndicator[]; total: number }> {
  if (USE_MOCK_DATA) {
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    
    if (entityId === "1") {
      return { data: MOCK_THANDI_TASKS.slice(start, end), total: MOCK_THANDI_TASKS.length };
    }
    
    if (entityId === "3") {
      // Only return Bianca's tasks if the APP has been uploaded in this session
      const hasUploaded = (globalThis as any).__MOCK_BIANCA_UPLOADED;
      if (!hasUploaded) return { data: [], total: 0 };
      
      return { data: MOCK_BIANCA_TASKS.slice(start, end), total: MOCK_BIANCA_TASKS.length };
    }
    
    return { data: [], total: 0 };
  }
  const session = await readSession();
  return apiRequest(`/api/entities/${entityId}/indicators?page=${page}&pageSize=${pageSize}`, session?.token);
}

export async function submitQuarterProof(indicatorId: string, quarter: number, formData: FormData): Promise<AppIndicatorQuarter> {
  if (USE_MOCK_DATA) {
    await new Promise(resolve => setTimeout(resolve, 800)); 
    
    // Update local memory so status flips to completed instantly
    MOCK_THANDI_TASKS = MOCK_THANDI_TASKS.map(t => t.id === indicatorId ? { ...t, status: 'completed' } : t);
    MOCK_BIANCA_TASKS = MOCK_BIANCA_TASKS.map(t => t.id === indicatorId ? { ...t, status: 'completed' } : t);

    return { id: `mock-proof-${Date.now()}`, appIndicatorId: indicatorId, quarter, status: "completed" };
  }
  const session = await readSession();
  return apiRequest(`/api/indicators/${indicatorId}/quarters/${quarter}/proof`, session?.token, {
    method: 'POST',
    body: formData,
  });
}

// ==========================================
// RESTORED SIPHO OVERSIGHT FUNCTIONS
// ==========================================

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
      { entityId: "1", entityName: "Arts & Culture Trust", percentComplete: 65, percentRemaining: 35 },
      { entityId: "2", entityName: "National Heritage Council", percentComplete: 20, percentRemaining: 80 }
    ];
  }
  const session = await readSession();
  return apiRequest<IndicatorSummary[]>('/api/dsac/indicator-summary', session?.token);
} 