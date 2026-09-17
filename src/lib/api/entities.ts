import { apiRequest } from './client';
import type { EntityDTO } from '../types/schema';

// Fetching from your C# backend
export async function getEntities(): Promise<EntityDTO[]> {
  // Update this URL later when your C# backend is ready
  return apiRequest<EntityDTO[]>(`https://your-csharp-api.com/api/entities`);
}