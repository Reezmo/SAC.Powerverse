import { apiRequest, USE_MOCK_DATA } from "./client";
import { MOCK_ENTITIES, getEntityBySlug, type EntityRecord } from "@/lib/data/mockEntities";
import type { EntityDTO } from "../types/schema";

/** All entities in the current reporting cycle, for the DSAC portfolio view. */
export async function getEntities(): Promise<EntityRecord[]> {
  if (USE_MOCK_DATA) {
    return MOCK_ENTITIES;
  }
  return apiRequest<EntityDTO[]>(`/api/entities`) as Promise<EntityRecord[]>;
}

/** A single entity by its URL slug (e.g. "arts-culture-trust"), or null if not found. */
export async function getEntityBySlugOrThrow(slug: string): Promise<EntityRecord | null> {
  if (USE_MOCK_DATA) {
    return getEntityBySlug(slug) ?? null;
  }
  try {
    return (await apiRequest<EntityRecord>(`/api/entities/${slug}`)) ?? null;
  } catch {
    return null;
  }
}
