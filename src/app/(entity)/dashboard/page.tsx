import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { getEntityIndicators } from "@/lib/api/indicators";
import { getSubmissionSummary } from "@/lib/api/submissions";
import { readSession } from "@/lib/auth/session";
import { ProofUploadDrawer } from "./ProofUploadDrawer";

export default async function EntityDashboardPage({ searchParams }: { searchParams: { page?: string } }) {
  const session = await readSession();
  const page = parseInt(searchParams.page || "1", 10);
  
  // Fetch overarching metrics and granular AI-extracted tasks
  // We remove the strict { data: indicators } destructuring to prevent crashes
  const [summary, indicatorsResponse] = await Promise.all([
    getSubmissionSummary(),
    getEntityIndicators(session?.entityId ?? "", page, 10).catch(() => null)
  ]);

  // Safely extract the array whether the API returned { data: [...] } or just [...]
  const indicators = Array.isArray(indicatorsResponse) 
    ? indicatorsResponse 
    : (indicatorsResponse?.data || []);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold tracking-tight">Granular Task Tracking</h2>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">Not Started</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold text-amber-500">{summary.notStarted}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">In Progress</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold text-blue-500">{summary.inProgress}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">Completed</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold text-emerald-500">{summary.completed}</div></CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>APP Indicators (Extracted Tasks)</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Task Name</TableHead>
                <TableHead>Target</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {indicators.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground h-24">
                    No tasks extracted yet.
                  </TableCell>
                </TableRow>
              ) : (
                indicators.map((ind) => (
                  <TableRow key={ind.id}>
                    <TableCell className="font-medium">{ind.name}</TableCell>
                    <TableCell>{ind.annualTarget} {ind.unit}</TableCell>
                    <TableCell>
                      <Badge variant={ind.status === 'completed' ? 'default' : 'secondary'}>
                        {ind.status.replace('_', ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <ProofUploadDrawer indicatorId={ind.id} taskName={ind.name} />
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}