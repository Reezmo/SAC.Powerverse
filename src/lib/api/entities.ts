import { apiRequest, USE_MOCK_DATA } from "./client";
import { MOCK_ENTITIES, getEntityBySlug, type EntityRecord } from "@/lib/data/mockEntities";
import type { EntityPortfolioDTO, EntityDetailDTO } from "../types/schema";
import { readSession } from "@/lib/auth/session";

/** All entities in the current reporting cycle, for the DSAC portfolio view
 * (or a single-entity list, for an entity_officer). */
export async function getEntities(): Promise<EntityPortfolioDTO[] | EntityRecord[]> {
  if (USE_MOCK_DATA) {
    return MOCK_ENTITIES;
  }
  const session = await readSession();
  return apiRequest<EntityPortfolioDTO[]>(`/api/entities`, session?.token);
}

/** A single entity by its URL slug (e.g. "arts-culture-trust"), or null if not found. */
export async function getEntityBySlugOrThrow(slug: string): Promise<EntityDetailDTO | EntityRecord | null> {
  if (USE_MOCK_DATA) {
    return getEntityBySlug(slug) ?? null;
  }
  const session = await readSession();
  try {
    return await apiRequest<EntityDetailDTO>(`/api/entities/${slug}`, session?.token);
  } catch {
    return null;
  }
}
