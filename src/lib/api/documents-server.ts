import "server-only";
import { USE_MOCK_DATA, apiRequest } from "./client";
import type { DocumentSummaryDTO } from "../types/schema";
import { readSession } from "@/lib/auth/session";

export async function getDocuments(entityId: string): Promise<DocumentSummaryDTO[]> {
  if (USE_MOCK_DATA) {
    return [];
  }
  const session = await readSession();
  return apiRequest<DocumentSummaryDTO[]>(`/api/documents?entityId=${entityId}`, session?.token);
}
