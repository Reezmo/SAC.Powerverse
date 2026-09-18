"use server";

import { apiRequest, USE_MOCK_DATA } from "./client";
import { readSession } from "@/lib/auth/session";
import type { FieldDef } from "@/lib/types/schema";

export interface KpiFormSchemaDTO {
  id: string;
  name: string;
  schemaJson: string;
  isActive: boolean;
  createdAt: string;
}

interface StoredSchema {
  name: string;
  fields: FieldDef[];
}

/** Loads the most recently created active KPI form schema, if any. This
 * page edits a single schema at a time rather than managing a named list. */
export async function loadLatestKpiFormSchema(): Promise<{ id: string; fields: FieldDef[] } | null> {
  if (USE_MOCK_DATA) {
    return null;
  }

  const session = await readSession();
  const schemas = await apiRequest<KpiFormSchemaDTO[]>("/api/kpi-forms", session?.token);

  if (schemas.length === 0) {
    return null;
  }

  const latest = schemas[0];
  const parsed = JSON.parse(latest.schemaJson) as StoredSchema;
  return { id: latest.id, fields: parsed.fields };
}

/** Saves the current field set as a new KPI form schema version. */
export async function saveKpiFormSchema(name: string, fields: FieldDef[]): Promise<KpiFormSchemaDTO> {
  if (USE_MOCK_DATA) {
    await new Promise((resolve) => setTimeout(resolve, 400));
    return { id: "mock-schema", name, schemaJson: JSON.stringify({ name, fields }), isActive: true, createdAt: new Date().toISOString() };
  }

  const session = await readSession();
  const schemaJson: StoredSchema = { name, fields };

  return apiRequest<KpiFormSchemaDTO>("/api/kpi-forms", session?.token, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, schemaJson: JSON.stringify(schemaJson) }),
  });
}
