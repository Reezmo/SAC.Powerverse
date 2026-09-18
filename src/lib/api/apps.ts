"use server";

import { apiRequest, USE_MOCK_DATA } from "./client";
import { readSession } from "@/lib/auth/session";
import type { AppSubmission, AppIndicator } from "../types/schema";

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

export async function getSubmissionDetails(id: string): Promise<{ submission: AppSubmission; indicators: AppIndicator[] }> {
  if (USE_MOCK_DATA) {
    return { submission: {} as AppSubmission, indicators: [] };
  }
  const session = await readSession();
  return apiRequest(`/api/app-submissions/${id}`, session?.token);
}

export async function analyzeSubmission(id: string): Promise<AppSubmission> {
  if (USE_MOCK_DATA) {
    await new Promise((resolve) => setTimeout(resolve, 1500));
    return { id, entityId: "1", fileUrl: "", uploadedAt: "", status: "ai_processed", aiSummary: "Mock AI extracted key granular tasks from the APP." };
  }
  const session = await readSession();
  return apiRequest<AppSubmission>(`/api/app-submissions/${id}/analyze`, session?.token, { method: 'POST' });
}

export async function approveSubmission(id: string): Promise<void> {
  if (USE_MOCK_DATA) return;
  const session = await readSession();
  return apiRequest(`/api/app-submissions/${id}/approve`, session?.token, { method: 'POST' });
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