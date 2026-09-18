"use server";

import { apiRequest, USE_MOCK_DATA } from "./client";
import { readSession } from "@/lib/auth/session";
import type { AppSubmission, AppSubmissionSummary, AppSubmissionIndicator } from "../types/schema";

export async function listAppSubmissions(status?: string): Promise<AppSubmissionSummary[]> {
  if (USE_MOCK_DATA) {
    return [];
  }
  const session = await readSession();
  const query = status ? `?status=${encodeURIComponent(status)}` : "";
  return apiRequest<AppSubmissionSummary[]>(`/api/app-submissions${query}`, session?.token);
}

export async function uploadAppSubmission(formData: FormData): Promise<AppSubmission> {
  if (USE_MOCK_DATA) {
    const session = await readSession();
    if (session?.entityId === "3") {
      // Unlock Bianca's dashboard mock tasks instantly
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

export async function getSubmissionDetails(
  id: string,
): Promise<{ submission: AppSubmission; indicators: AppSubmissionIndicator[] }> {
  if (USE_MOCK_DATA) {
    return { submission: {} as AppSubmission, indicators: [] };
  }
  const session = await readSession();
  const submission = await apiRequest<AppSubmission & { indicators: AppSubmissionIndicator[] }>(
    `/api/app-submissions/${id}`,
    session?.token,
  );
  const { indicators, ...rest } = submission;
  return { submission: rest, indicators };
}

export async function analyzeSubmission(id: string): Promise<AppSubmission> {
  if (USE_MOCK_DATA) {
    await new Promise((resolve) => setTimeout(resolve, 1500));
    return { id, entityId: "1", fileUrl: "", uploadedAt: "", status: "ai_processed", aiSummary: "Mock AI extracted key granular tasks from the APP." };
  }
  const session = await readSession();
  return apiRequest<AppSubmission>(`/api/app-submissions/${id}/analyze`, session?.token, { method: 'POST' });
}

/** `keepIndicatorIds` are the app_indicators ids Sipho reviewed and chose to
 * keep — anything extracted but not in this list is discarded, not turned
 * into a task. An empty/missing list here discards everything. */
export async function approveSubmission(id: string, keepIndicatorIds: string[]): Promise<void> {
  if (USE_MOCK_DATA) return;
  const session = await readSession();
  return apiRequest(`/api/app-submissions/${id}/approve`, session?.token, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ keepIndicatorIds }),
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
