import type { EntityType, SubmissionDTO } from "@/lib/types/schema";

export interface EntityRecord {
  id: string;
  slug: string;
  name: string;
  type: EntityType;
  createdAt: string;
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
    createdAt: "2021-01-15T00:00:00.000Z",
    status: "Submitted",
    risk: "Low",
    score: 92,
    kpis: [
      { id: "k1", name: "Job Creation", target: "400", actual: "421", onTrack: true },
      { id: "k2", name: "Budget Spend", target: "R 10.4M", actual: "R 9.8M", onTrack: true },
    ],
    documents: [
      { id: "d1", name: "Strategic_Plan_2026_2030.pdf", uploadedAt: "2026-01-15" },
      { id: "d2", name: "Annual_Report_2025.pdf", uploadedAt: "2026-03-31" },
      { id: "d3", name: "Operational_Plan_2026_Final.docx", uploadedAt: "2026-02-28" },
      { id: "d4", name: "Q1_Quarterly_Report.pdf", uploadedAt: "2026-04-10" },
      { id: "d5", name: "Q2_Quarterly_Report.pdf", uploadedAt: "2026-07-12" },
      { id: "d6", name: "Q3_Financials_Signed.pdf", uploadedAt: "2026-10-12" },
      { id: "d7", name: "Beneficiary_List_v2.xlsx", uploadedAt: "2026-10-10" },
    ],
  },
  {
    id: "2",
    slug: "national-heritage-council",
    name: "National Heritage Council",
    type: "public_entity",
    createdAt: "2021-02-01T00:00:00.000Z",
    status: "In Progress",
    risk: "Watch",
    score: 68,
    kpis: [
      { id: "k3", name: "Heritage Sites Restored", target: "12", actual: "8", onTrack: false },
    ],
    documents: [{ id: "d8", name: "Restoration_Progress_Q3.pdf", uploadedAt: "2026-10-08" }],
  },
  {
    id: "3",
    slug: "pan-south-african-language-board",
    name: "Pan South African Language Board",
    type: "public_entity",
    createdAt: "2021-01-20T00:00:00.000Z",
    status: "Not Started",
    risk: "High",
    score: 45,
    kpis: [{ id: "k4", name: "Language Programmes Launched", target: "6", actual: "0", onTrack: false }],
    documents: [
      { id: "d9", name: "Strategic_Plan_2025_2029.pdf", uploadedAt: "2025-01-10" },
      { id: "d10", name: "Annual_Report_2025.pdf", uploadedAt: "2026-03-29" },
    ],
  },
  {
    id: "4",
    slug: "market-theatre-foundation",
    name: "Market Theatre Foundation",
    type: "public_entity",
    createdAt: "2021-03-10T00:00:00.000Z",
    status: "Submitted",
    risk: "Low",
    score: 88,
    kpis: [{ id: "k5", name: "Theatre Productions", target: "15", actual: "16", onTrack: true }],
    documents: [{ id: "d11", name: "Production_Stats_2026.pdf", uploadedAt: "2026-10-11" }],
  },
  {
    id: "5",
    slug: "robben-island-museum",
    name: "Robben Island Museum",
    type: "public_entity",
    createdAt: "2021-04-15T00:00:00.000Z",
    status: "In Progress",
    risk: "Watch",
    score: 71,
    kpis: [{ id: "k6", name: "Visitor Footfall", target: "150000", actual: "110000", onTrack: false }],
    documents: [
      { id: "d12", name: "Strategic_Plan_2026.pdf", uploadedAt: "2026-02-14" },
      { id: "d13", name: "Q2_Financials.xlsx", uploadedAt: "2026-07-20" }
    ],
  },
  {
    id: "6",
    slug: "nelson-mandela-museum",
    name: "Nelson Mandela Museum",
    type: "public_entity",
    createdAt: "2021-05-22T00:00:00.000Z",
    status: "Submitted",
    risk: "Low",
    score: 95,
    kpis: [{ id: "k7", name: "Educational Tours", target: "50", actual: "55", onTrack: true }],
    documents: [
      { id: "d14", name: "Tours_Register.xlsx", uploadedAt: "2026-10-14" },
      { id: "d15", name: "Annual_Report_2025.pdf", uploadedAt: "2026-04-01" }
    ],
  },
  {
    id: "7",
    slug: "south-african-library-for-the-blind",
    name: "SA Library for the Blind",
    type: "public_entity",
    createdAt: "2021-06-11T00:00:00.000Z",
    status: "Not Started",
    risk: "High",
    score: 30,
    kpis: [{ id: "k8", name: "Braille Books Distributed", target: "10000", actual: "0", onTrack: false }],
    documents: [],
  },
  {
    id: "8",
    slug: "blind-sa-npo",
    name: "Blind SA",
    type: "npo",
    createdAt: "2022-01-10T00:00:00.000Z",
    status: "Submitted",
    risk: "Low",
    score: 85,
    kpis: [{ id: "k9", name: "Mobility Training Sessions", target: "200", actual: "215", onTrack: true }],
    documents: [{ id: "d16", name: "Training_Logs.pdf", uploadedAt: "2026-10-09" }],
  },
];

export function getEntityBySlug(slug: string): EntityRecord | undefined {
  return MOCK_ENTITIES.find((e) => e.slug === slug);
}

export const MOCK_SUBMISSIONS: SubmissionDTO[] = MOCK_ENTITIES.map((e) => ({
  id: `sub-${e.id}`,
  entityId: e.id,
  entityName: e.name,
  cycleId: "2026-q3",
  cycleLabel: "Q3 2026",
  status: e.status === "Submitted" ? "submitted" : e.status === "In Progress" ? "in_progress" : "not_started",
  submittedAt: e.status === "Submitted" ? "2026-10-12T09:00:00.000Z" : null,
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
    entity: "SA Library for the Blind",
    type: "Critical Delay",
    message: "Zero targets recorded for the current cycle.",
    severity: "high" as const,
  },
  {
    id: "a3",
    entity: "Robben Island Museum",
    type: "Variance Warning",
    message: "Visitor footfall trending 26% below target.",
    severity: "medium" as const,
  },
];

export const MOCK_SUBMISSION_SUMMARY = {
  inProgress: 14,
  notStarted: 6,
  completed: 28, 
  daysUntilDeadline: 15,
  beneficiaries: 18400,
  jobsCreated: 421,
};

export const MOCK_CHECKLIST = [
  { id: "c1", label: "Strategic Plan", status: "done" as const, note: "Approved" },
  { id: "c2", label: "Annual Performance Plan", status: "pending" as const, note: "Pending Upload" },
  { id: "c3", label: "Financials Attached", status: "pending" as const, note: "Pending Upload" },
];