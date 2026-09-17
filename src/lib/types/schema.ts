// src/lib/types/schema.ts

// These represent the JSON payloads you expect from the C# API
export type EntityType = 'public_entity' | 'npo';
export type UserRole = 'entity_officer' | 'dsac_me' | 'dsac_exec';

export interface EntityDTO {
  id: string;
  name: string;
  type: EntityType;
  created_at: string; // Dates from a C# API usually arrive as ISO strings
}

export interface KPITargetDTO {
  id: string;
  entity_id: string;
  cycle_id: string;
  kpi_name: string;
  target_value: number | null;
  unit: string | null;
}

export interface SubmissionDTO {
  id: string;
  entity_id: string;
  cycle_id: string;
  status: 'not_started' | 'in_progress' | 'submitted' | 'missed';
  submitted_at: string | null;
}