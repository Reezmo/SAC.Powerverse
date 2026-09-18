import { apiRequest, USE_MOCK_DATA } from "./client";
import { MOCK_SUBMISSIONS, MOCK_SUBMISSION_SUMMARY } from "@/lib/data/mockEntities";
import type { SubmissionDTO, SubmissionSummaryDTO } from "../types/schema";
import { readSession } from "@/lib/auth/session";

export async function getSubmissions(entityId: string): Promise<SubmissionDTO[]> {
  if (USE_MOCK_DATA) {
    return MOCK_SUBMISSIONS.filter((s) => s.entityId === entityId);
  }
  const session = await readSession();
  return apiRequest<SubmissionDTO[]>(`/api/submissions?entityId=${entityId}`, session?.token);
}

/** Aggregate counts for the entity officer's dashboard summary cards. */
export async function getSubmissionSummary(): Promise<SubmissionSummaryDTO> {
  if (USE_MOCK_DATA) {
    return MOCK_SUBMISSION_SUMMARY;
  }
  const session = await readSession();
  return apiRequest<SubmissionSummaryDTO>(`/api/submissions/summary`, session?.token);
}

export interface KpiSubmissionInput {
  jobsCreated: number;
  budgetSpent: number;
  varianceNotes?: string;
}
