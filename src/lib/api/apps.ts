// src/lib/api/apps.ts
"use server";

import { apiRequest } from "./client";
import { readSession } from "@/lib/auth/session";
import type { AppSubmission, AppIndicator } from "../types/schema";

export async function uploadAppSubmission(formData: FormData): Promise<AppSubmission> {
  const session = await readSession();
  return apiRequest<AppSubmission>('/api/app-submissions/upload', session?.token, {
    method: 'POST',
    body: formData,
  });
}

export async function getSubmissionDetails(id: string): Promise<{ submission: AppSubmission; indicators: AppIndicator[] }> {
  const session = await readSession();
  return apiRequest(`/api/app-submissions/${id}`, session?.token);
}

export async function analyzeSubmission(id: string): Promise<AppSubmission> {
  const session = await readSession();
  return apiRequest<AppSubmission>(`/api/app-submissions/${id}/analyze`, session?.token, { method: 'POST' });
}

export async function approveSubmission(id: string): Promise<void> {
  const session = await readSession();
  return apiRequest(`/api/app-submissions/${id}/approve`, session?.token, { method: 'POST' });
}

export async function rejectSubmission(id: string, reason: string): Promise<void> {
  const session = await readSession();
  return apiRequest(`/api/app-submissions/${id}/reject`, session?.token, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ reason }),
  });
}   