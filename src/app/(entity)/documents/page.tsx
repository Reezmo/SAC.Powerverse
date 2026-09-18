import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { FileText } from "lucide-react";
import { DocumentUploader } from "@/components/documents/DocumentUploader";
import { AppUploadForm } from "@/components/submit/AppUploadForm";
import { readSession } from "@/lib/auth/session";
import { getEntities, getEntityBySlugOrThrow } from "@/lib/api/entities";
import { getEntityIndicators } from "@/lib/api/indicators";
import { USE_MOCK_DATA } from "@/lib/api/client";
import { MOCK_ENTITIES } from "@/lib/data/mockEntities";
import { inferDocType } from "@/lib/api/documents";

interface DisplayDoc {
  id: string;
  name: string;
  uploadedAt: string;
  tag: string;
}

interface AppHistoryEntry {
  id: string;
  date: string;
  status: "approved" | "rejected" | "pending";
  reason: string;
  file: string;
}

const DOC_TYPE_LABELS: Record<string, string> = {
  financials: "Financials",
  annual_report: "Annual Report",
  quarterly_report: "Quarterly Report",
  strategic_plan: "Strategic Plan",
  operational_plan: "Operational Plan",
  app: "Annual Performance Plan",
};

export default async function EntityDocumentsPage() {
  const session = await readSession();
  const entityId = String(session?.entityId || "1");

  if (!session?.entityId && !USE_MOCK_DATA) {
    redirect("/login");
  }

  const hasUploaded = entityId === "3" ? (globalThis as any).__MOCK_BIANCA_UPLOADED : false;
  const isAppActive = entityId === "1" || hasUploaded;

  // 1. Fetch general documents
  let documents: DisplayDoc[] = [];
  if (USE_MOCK_DATA) {
    const entity = MOCK_ENTITIES.find(e => e.id === entityId) || MOCK_ENTITIES[0];
    documents = entity.documents.map((d) => ({ 
      ...d, 
      tag: DOC_TYPE_LABELS[inferDocType(d.name)] ?? "Uncategorized" 
    }));
  } else {
    const entities = await getEntities();
    const own = entities.find((e) => e.id === entityId);
    if (own) {
      const detail = await getEntityBySlugOrThrow(own.slug);
      if (detail && "documents" in detail) {
        documents = detail.documents.map((d) => ({ 
          ...d, 
          tag: DOC_TYPE_LABELS[inferDocType(d.name)] ?? "Uncategorized" 
        }));
      }
    }
  }

  // 2. Mock APP Submission History (Explicitly typed as AppHistoryEntry array)
  let appHistory: AppHistoryEntry[] = [];
  
  if (entityId === "1") {
    appHistory = [
      { id: "app-2", date: "2026-09-01", status: "approved", reason: "Approved by DSAC. Tasks Extracted.", file: "APP_2026_Final.pdf" },
      { id: "app-1", date: "2026-08-15", status: "rejected", reason: "Missing demographic targets for Q4.", file: "APP_2026_Draft_v1.pdf" }
    ];
  } else if (entityId === "3" && hasUploaded) {
    appHistory = [
      { id: "app-3", date: "Just now", status: "pending", reason: "Pending AI Extraction & DSAC Review", file: "Bianca_APP.pdf" }
    ];
  }

  // 3. Fetch completed tasks to show "Task Evidence" linked proofs
  const indicatorsResponse = await getEntityIndicators(entityId, 1, 50).catch(() => null);
  const indicators = indicatorsResponse?.data || [];
  const completedTasks = indicators.filter((ind: any) => ind.status === 'completed');

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold tracking-tight">Documents & Submissions</h2>
      
      {/* Top Row: APP Upload & APP Submission History */}
      <div className="grid gap-6 lg:grid-cols-2">
        <AppUploadForm isAppActive={isAppActive} />

        <Card>
          <CardHeader>
            <CardTitle>APP Submission History</CardTitle>
            <CardDescription>Track your rejected and approved performance plans.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Document</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {appHistory.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center text-muted-foreground py-6">
                      No submission history found.
                    </TableCell>
                  </TableRow>
                ) : (
                  appHistory.map((entry) => (
                    <TableRow key={entry.id}>
                      <TableCell className="whitespace-nowrap">{entry.date}</TableCell>
                      <TableCell className="font-medium">
                        {entry.file}
                        <div className="text-xs text-muted-foreground mt-1">{entry.reason}</div>
                      </TableCell>
                      <TableCell>
                        {entry.status === "approved" && <Badge className="bg-emerald-500">Approved</Badge>}
                        {entry.status === "rejected" && <Badge variant="destructive">Rejected</Badge>}
                        {entry.status === "pending" && <Badge variant="outline" className="border-blue-500 text-blue-500">Pending</Badge>}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Middle Row: Task Evidence (Proof Documents) */}
      <Card>
        <CardHeader>
          <CardTitle>Task Evidence (Proof Documents)</CardTitle>
          <CardDescription>Documents securely linked as proof for completed granular tasks.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Granular Task Name</TableHead>
                <TableHead>Date Completed</TableHead>
                <TableHead>Evidence File</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {completedTasks.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} className="text-center text-muted-foreground py-6">
                    No task evidence uploaded yet.
                  </TableCell>
                </TableRow>
              ) : (
                completedTasks.map((task: any) => (
                  <TableRow key={task.id}>
                    <TableCell className="font-medium">{task.name}</TableCell>
                    <TableCell>{new Date(task.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 text-blue-600 hover:underline cursor-pointer">
                        <FileText className="h-4 w-4" />
                        <span>Proof_{task.id.split('-').pop()}.pdf</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Bottom Row: General Compliance Repository */}
      <DocumentUploader entityId={entityId} initialDocs={documents} />
    </div>
  );
}