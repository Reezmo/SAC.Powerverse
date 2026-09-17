import { apiRequest, USE_MOCK_DATA } from "./client";
import { MOCK_SUBMISSIONS, MOCK_SUBMISSION_SUMMARY } from "@/lib/data/mockEntities";
import type { SubmissionDTO } from "../types/schema";

export async function getSubmissions(entityId: string): Promise<SubmissionDTO[]> {
  if (USE_MOCK_DATA) {
    return MOCK_SUBMISSIONS.filter((s) => s.entity_id === entityId);
  }
  return apiRequest<SubmissionDTO[]>(`/api/submissions?entityId=${entityId}`);
}

/** Aggregate counts for the entity officer's dashboard summary cards. */
export async function getSubmissionSummary() {
  if (USE_MOCK_DATA) {
    return MOCK_SUBMISSION_SUMMARY;
  }
  return apiRequest<typeof MOCK_SUBMISSION_SUMMARY>(`/api/submissions/summary`);
}

export interface KpiSubmissionInput {
  jobsCreated: number;
  budgetSpent: number;
  varianceNotes?: string;
}

/** Persists a KPI submission. Mock mode simulates network latency and always succeeds. */
export async function submitKpiReport(input: KpiSubmissionInput): Promise<{ ok: true }> {
  if (USE_MOCK_DATA) {
    await new Promise((resolve) => setTimeout(resolve, 600));
    return { ok: true };
  }
  await apiRequest(`/api/submissions`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  return { ok: true };
}
