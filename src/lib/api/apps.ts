"use server";

import { apiRequest, USE_MOCK_DATA } from "./client";
import { readSession } from "@/lib/auth/session";
import { getEntities } from "./entities";
import type {
  AppSubmission,
  AppSubmissionSummary,
  AppSubmissionIndicator,
} from "../types/schema";

/** Resolves an entity's URL slug from its id, for redirecting Sipho to
 * /entities/{slug} right after approving that entity's APP submission. */
export async function getEntitySlug(entityId: string): Promise<string | null> {
  if (USE_MOCK_DATA) return null;
  const entities = await getEntities();
  const match = entities.find((e) => String(e.id) === entityId);
  return match && "slug" in match ? match.slug : null;
}

export async function listAppSubmissions(
  status?: string,
): Promise<AppSubmissionSummary[]> {
  if (USE_MOCK_DATA) {
    return [];
  }
  const session = await readSession();
  const query = status ? `?status=${encodeURIComponent(status)}` : "";

  // Every other app-submission operation below hits /api/app-submissions/...
  // — this list endpoint previously pointed at /api/Submissions, a
  // different (KPI reporting) table entirely, which is why it always
  // returned unrelated/empty data instead of actual APP submissions.
  return apiRequest<AppSubmissionSummary[]>(
    `/api/app-submissions${query}`,
    session?.token,
  );
}

export async function uploadAppSubmission(formData: FormData): Promise<AppSubmission> {
  if (USE_MOCK_DATA) {
    const session = await readSession();
    if (session?.entityId === "3") {
      (globalThis as any).__MOCK_BIANCA_UPLOADED = true;
    }
    
    await new Promise((resolve) => setTimeout(resolve, 800));
    return {
      id: `mock-app-${Date.now()}`,
      entityId: session?.entityId ?? "1",
      fileUrl: "mock://app.pdf",
      uploadedAt: new Date().toISOString(),
      status: "pending_review",
    };
  }
  const session = await readSession();
  return apiRequest<AppSubmission>('/api/app-submissions/upload', session?.token, {
    method: 'POST',
    body: formData,
  });
}

export async function getSubmissionDetails(id: string): Promise<{
  submission: AppSubmission;
  indicators: AppSubmissionIndicator[];
}> {
  if (USE_MOCK_DATA) {
    return { submission: {} as AppSubmission, indicators: [] };
  }
  const session = await readSession();
  const submission = await apiRequest<
    AppSubmission & { indicators: AppSubmissionIndicator[] }
  >(`/api/app-submissions/${id}`, session?.token);
  const { indicators, ...rest } = submission;
  return { submission: rest as AppSubmission, indicators };
}

export async function analyzeSubmission(id: string): Promise<AppSubmission> {
  if (USE_MOCK_DATA) {
    await new Promise((resolve) => setTimeout(resolve, 1500));
    return { id, entityId: "1", fileUrl: "", uploadedAt: "", status: "ai_processed", aiSummary: "Mock AI extracted key granular tasks from the APP." };
  }
  const session = await readSession();
  return apiRequest<AppSubmission>(`/api/app-submissions/${id}/analyze`, session?.token, { method: 'POST' });
}

export async function approveSubmission(id: string, keptIndicatorIds?: string[]): Promise<void> {
  if (USE_MOCK_DATA) return;
  const session = await readSession();
  
  const body = keptIndicatorIds ? JSON.stringify({ keepIndicatorIds: keptIndicatorIds }) : undefined;
  const headers = keptIndicatorIds ? { 'Content-Type': 'application/json' } : undefined;
  
  return apiRequest(`/api/app-submissions/${id}/approve`, session?.token, { 
    method: 'POST',
    headers,
    body
  });
}

export async function rejectSubmission(id: string, reason: string): Promise<void> {
  if (USE_MOCK_DATA) return;
  const session = await readSession();
  return apiRequest(`/api/app-submissions/${id}/reject`, session?.token, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ reason }),
  });
}