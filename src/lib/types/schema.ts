// src/lib/types/schema.ts
//
// These mirror the exact JSON shapes returned by the C# API
// (DsacReporting.Api). ASP.NET Core's default JSON serialization is
// camelCase, so these types use camelCase to match — not the snake_case of
// the underlying Postgres columns.

export type EntityType = "public_entity" | "npo";
export type UserRole = "entity_officer" | "dsac_me" | "dsac_exec";
export type SubmissionStatusValue = "Submitted" | "In Progress" | "Not Started";
export type RiskLevel = "Low" | "Watch" | "High";


/** GET /api/entities — one row per entity, for the portfolio table. */
export interface EntityPortfolioDTO {
  id: string;
  slug: string;
  name: string;
  type: EntityType;
  createdAt: string;
  status: SubmissionStatusValue;
  risk: RiskLevel;
  score: number;
}

export interface KpiRollupDTO {
  id: string;
  name: string;
  target: string | null;
  actual: string | null;
  onTrack: boolean;
}

export interface DocumentSummaryDTO {
  id: string;
  name: string;
  uploadedAt: string;
}

/** GET /api/entities/{slug} — portfolio row plus KPI rollup and documents. */
export interface EntityDetailDTO extends EntityPortfolioDTO {
  kpis: KpiRollupDTO[];
  documents: DocumentSummaryDTO[];
}

export interface KPITargetDTO {
  id: string;
  entityId: string;
  cycleId: string;
  kpiName: string;
  targetValue: number | null;
  unit: string | null;
}

/** GET /api/submissions — one row per submission (SubmissionSummaryDto on the backend). */
export interface SubmissionDTO {
  id: string;
  entityId: string;
  entityName: string;
  cycleId: string;
  cycleLabel: string;
  status: "not_started" | "in_progress" | "submitted" | "missed";
  submittedAt: string | null;
}

/** GET /api/submissions/summary — dashboard stat cards. */
export interface SubmissionSummaryDTO {
  inProgress: number;
  notStarted: number;
  completed: number;
  daysUntilDeadline: number | null;
  beneficiaries: number;
  jobsCreated: number;
}

/** GET /api/alerts */
export interface AlertDTO {
  id: string;
  entity: string;
  type: string;
  message: string;
  severity: "high" | "medium" | "low";
}

export interface KpiFormSchema {
  id: string;
  name: string;
  schemaJson: string;
  createdBy?: string;
  createdAt: string;
  isActive: boolean;
}

export interface EntityKpi {
  id: string;
  entityId: string;
  formSchemaId?: string;
  kpiName: string;
  unit?: string;
  fiveYearTarget?: number;
  formValues: string;
  status: 'draft' | 'sent' | 'received';
  createdBy?: string;
  createdAt: string;
  sentAt?: string;
  receivedAt?: string;
}

export interface AppSubmission {
  id: string;
  entityId: string;
  fileUrl: string;
  uploadedBy?: string;
  uploadedAt: string;
  status: 'pending_review' | 'ai_failed' | 'ai_processed' | 'approved' | 'rejected';
  aiSummary?: string;
  aiProcessedAt?: string;
  aiProcessedBy?: string;
  reviewedBy?: string;
  reviewedAt?: string;
  rejectionReason?: string;
}

export interface AppIndicatorQuarter {
  id: string;
  appIndicatorId: string;
  quarter: number;
  quarterTarget?: number;
  status: 'not_started' | 'completed';
  proofFileUrl?: string;
  proofNotes?: string;
  completedBy?: string;
  completedAt?: string;
}

export interface AppIndicator {
  id: string;
  appSubmissionId: string;
  entityId: string;
  entityKpiId?: string;
  name: string;
  annualTarget?: number;
  unit?: string;
  matchConfidence?: 'matched' | 'unmatched' | 'manual';
  isApproved: boolean;
  status: 'not_started' | 'in_progress' | 'completed';
  createdAt: string;
}

export interface IndicatorSummary {
  entityId: string;
  entityName: string;
  percentComplete: number;
  percentRemaining: number;
}