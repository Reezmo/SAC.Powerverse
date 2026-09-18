import { redirect } from "next/navigation";

/**
 * Base URL for the C# backend. Set NEXT_PUBLIC_API_URL in `.env.local` (and
 * in Vercel's project env vars) once the real API is available. Until then,
 * `USE_MOCK_DATA` is true and every function in `lib/api/*` returns data
 * from `lib/data/mockEntities.ts` instead of making a network request.
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

/**
 * `token` is the caller's JWT (from `readSession()`), forwarded as a Bearer
 * header. Every authenticated endpoint on the C# API requires this — pass it
 * explicitly rather than reading cookies here, so this file stays usable
 * from both server and (future) client contexts.
 */
export async function apiRequest<T>(path: string, token?: string, init?: RequestInit): Promise<T> {
  if (!API_BASE_URL) {
    throw new ApiError(
      "NEXT_PUBLIC_API_URL is not set. Either configure it or call this through a mock-aware wrapper in lib/api/*."
    );
  }

  const url = path.startsWith("http") ? path : `${API_BASE_URL}${path}`;

  const headers = new Headers(init?.headers);
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  let response: Response;
  try {
    response = await fetch(url, { cache: "no-store", ...init, headers });
  } catch {
    throw new ApiError(`Network error while requesting ${url}`, undefined);
  }

  // Self-healing: If the backend rejects the token (e.g., stale mock cookie, expired JWT), 
  // immediately kick the user back to the login page to re-authenticate.
  if (response.status === 401) {
    redirect("/login");
  }

  if (!response.ok) {
    throw new ApiError(`Request failed for ${url}: ${response.status}`, response.status);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}