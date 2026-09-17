/**
 * Base URL for the C# backend. Set NEXT_PUBLIC_API_URL in `.env.local` once
 * the real API is available. Until then, `USE_MOCK_DATA` is true and every
 * function in `lib/api/*` returns data from `lib/data/mockEntities.ts`
 * instead of making a network request.
 */
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "";

export const USE_MOCK_DATA = API_BASE_URL.length === 0;

export class ApiError extends Error {
  status?: number;
  constructor(message: string, status?: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

export async function apiRequest<T>(path: string, init?: RequestInit): Promise<T> {
  if (!API_BASE_URL) {
    throw new ApiError(
      "NEXT_PUBLIC_API_URL is not set. Either configure it or call this through a mock-aware wrapper in lib/api/*."
    );
  }

  const url = path.startsWith("http") ? path : `${API_BASE_URL}${path}`;

  let response: Response;
  try {
    response = await fetch(url, { cache: "no-store", ...init });
  } catch {
    throw new ApiError(`Network error while requesting ${url}`, undefined);
  }

  if (!response.ok) {
    throw new ApiError(`Request failed for ${url}: ${response.status}`, response.status);
  }

  return response.json() as Promise<T>;
}
