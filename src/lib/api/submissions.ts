import { apiRequest } from './client';
import type { SubmissionDTO } from '../types/schema';

// Fetching from your C# backend
export async function getSubmissions(entityId: string): Promise<SubmissionDTO[]> {
  return apiRequest<SubmissionDTO[]>(`https://your-csharp-api.com/api/submissions?entityId=${entityId}`);
}