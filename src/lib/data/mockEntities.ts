import type { EntityDTO, SubmissionDTO } from "@/lib/types/schema";

// ---------------------------------------------------------------------------
// Single source of truth for demo data.
//
// This intentionally mirrors the shape of `EntityDTO` / `SubmissionDTO` from
// `lib/types/schema.ts` so that swapping `lib/api/*` from mock data to the
// real C# backend later requires no changes to the pages/hooks that consume
// it — only `USE_MOCK_DATA` (see `lib/api/client.ts`) needs to flip.
// ---------------------------------------------------------------------------

export interface EntityRecord extends EntityDTO {
  slug: string;
  status: "Submitted" | "In Progress" | "Not Started";
  risk: "Low" | "Watch" | "High";
  score: number;
  kpis: { id: string; name: string; target: string; actual: string; onTrack: boolean }[];
  documents: { id: string; name: string; uploadedAt: string }[];
}

export const MOCK_ENTITIES: EntityRecord[] = [
  {
    id: "1",
    slug: "arts-culture-trust",
    name: "Arts & Culture Trust",
    type: "public_entity",
    created_at: "2024-01-15T00:00:00.000Z",
    status: "Submitted",
    risk: "Low",
    score: 92,
    kpis: [
      { id: "k1", name: "Job Creation", target: "400", actual: "421", onTrack: true },
      { id: "k2", name: "Budget Spend", target: "R 10.4M", actual: "R 6.8M", onTrack: false },
    ],
    documents: [
      { id: "d1", name: "Q3_Financials_Signed.pdf", uploadedAt: "2026-10-12" },
      { id: "d2", name: "Beneficiary_List_v2.xlsx", uploadedAt: "2026-10-10" },
    ],
  },
  {
    id: "2",
    slug: "national-heritage-council",
    name: "National Heritage Council",
    type: "public_entity",
    created_at: "2024-02-01T00:00:00.000Z",
    status: "In Progress",
    risk: "Watch",
    score: 68,
    kpis: [
      { id: "k1", name: "Heritage Sites Restored", target: "12", actual: "8", onTrack: false },
      { id: "k2", name: "Budget Spend", target: "R 4.2M", actual: "R 2.9M", onTrack: true },
    ],
    documents: [{ id: "d1", name: "Restoration_Progress_Q3.pdf", uploadedAt: "2026-10-08" }],
  },
  {
    id: "3",
    slug: "pan-south-african-language-board",
    name: "Pan South African Language Board",
    type: "public_entity",
    created_at: "2024-01-20T00:00:00.000Z",
    status: "Not Started",
    risk: "High",
    score: 45,
    kpis: [{ id: "k1", name: "Language Programmes Launched", target: "6", actual: "0", onTrack: false }],
    documents: [],
  },
];

export function getEntityBySlug(slug: string): EntityRecord | undefined {
  return MOCK_ENTITIES.find((e) => e.slug === slug);
}

export const MOCK_SUBMISSIONS: SubmissionDTO[] = MOCK_ENTITIES.map((e) => ({
  id: `sub-${e.id}`,
  entity_id: e.id,
  cycle_id: "2026-q3",
  status:
    e.status === "Submitted" ? "submitted" : e.status === "In Progress" ? "in_progress" : "not_started",
  submitted_at: e.status === "Submitted" ? "2026-10-12T09:00:00.000Z" : null,
}));

export const MOCK_ALERTS = [
  {
    id: "a1",
    entity: "Pan South African Language Board",
    type: "T-minus 5 Escalation",
    message: "No submission activity detected. Deadline approaching.",
    severity: "high" as const,
  },
  {
    id: "a2",
    entity: "National Heritage Council",
    type: "Incomplete Data",
    message: "Job creation target submitted without supporting evidence.",
    severity: "medium" as const,
  },
];

export const MOCK_SUBMISSION_SUMMARY = {
  inProgress: 7,
  notStarted: 3,
  completed: 12,
  daysUntilDeadline: 15,
  beneficiaries: 18400,
  jobsCreated: 421,
};

export const MOCK_CHECKLIST = [
  { id: "c1", label: "Strategic Plan", status: "done" as const, note: "Approved" },
  { id: "c2", label: "Annual Performance Plan", status: "pending" as const, note: "Pending Upload" },
  { id: "c3", label: "Financials Attached", status: "pending" as const, note: "Pending Upload" },
];
