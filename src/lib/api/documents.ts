// Pure, client-safe helpers and types for document uploads — no session or
// fetch access here, so this file can be imported from client components.
// Server-side data access (getDocuments) lives in documents-server.ts.

export type DocType =
  | "strategic_plan"
  | "app"
  | "operational_plan"
  | "annual_report"
  | "quarterly_report"
  | "financials";

const VALID_DOC_TYPES: DocType[] = [
  "strategic_plan",
  "app",
  "operational_plan",
  "annual_report",
  "quarterly_report",
  "financials",
];

/** Best-effort mapping from a free-text filename to one of the backend's 6
 * valid doc_type values — mirrors the UI's existing filename-based tagging,
 * but resolved to a real enum value the API will accept. */
export function inferDocType(fileName: string): DocType {
  const lower = fileName.toLowerCase();
  if (lower.includes("financ") || lower.includes("budget")) return "financials";
  if (lower.includes("annual")) return "annual_report";
  if (lower.includes("quarter")) return "quarterly_report";
  if (lower.includes("strategic")) return "strategic_plan";
  if (lower.includes("operational")) return "operational_plan";
  return "app";
}

export function isValidDocType(value: string): value is DocType {
  return (VALID_DOC_TYPES as string[]).includes(value);
}

export interface UploadDocumentResult {
  id: string;
  fileUrl: string;
  version: number;
}
