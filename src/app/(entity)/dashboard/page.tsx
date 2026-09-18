import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getEntityIndicators } from "@/lib/api/indicators";
import { getSubmissionSummary } from "@/lib/api/submissions";
import { getEntities, getEntityBySlugOrThrow } from "@/lib/api/entities";
import { readSession } from "@/lib/auth/session";
import { ProofUploadDrawer } from "./ProofUploadDrawer";

export default async function EntityDashboardPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  const session = await readSession();
  const resolvedParams = await searchParams;
  const page = parseInt(resolvedParams.page || "1", 10);
  
  // Fetch overarching entity data for the 5-Year KPIs
  const entities = await getEntities();
  const ownEntity = entities.find(e => e.id === session?.entityId);
  const detail = ownEntity ? await getEntityBySlugOrThrow(ownEntity.slug) : null;

  // Fetch granular task data
  const [summary, indicatorsResponse] = await Promise.all([
    getSubmissionSummary(),
    getEntityIndicators(session?.entityId ?? "", page, 10).catch(() => null)
  ]);

  const indicators = Array.isArray(indicatorsResponse) ? indicatorsResponse : (indicatorsResponse?.data || []);
  const total = !Array.isArray(indicatorsResponse) && indicatorsResponse?.total ? indicatorsResponse.total : indicators.length;
  const totalPages = Math.ceil(total / 10);
  
  // If zero tasks exist, we assume the APP has not been uploaded/approved yet
  const isAppInactive = total === 0;

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold tracking-tight">Entity Dashboard</h2>
      </div>

      {/* OVERARCHING 5-YEAR KPI TRACKING */}
      {detail && "kpis" in detail && detail.kpis.length > 0 && (
        <Card className="border-t-4 border-t-primary">
          <CardHeader className="pb-2">
            <CardTitle>5-Year Core KPIs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 pt-2">
              {detail.kpis.map((kpi) => (
                <div key={kpi.id} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
                  <div>
                    <p className="font-medium text-lg">{kpi.name}</p>
                    <p className="text-sm text-muted-foreground">
                      Target: <span className="font-medium">{kpi.target}</span> • Actual: {kpi.actual ?? "0"}
                    </p>
                  </div>
                  <Badge variant={kpi.onTrack ? "default" : "destructive"} className="px-3 py-1 text-sm">
                    {kpi.onTrack ? "On Track" : "Needs Attention"}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* CONDITIONAL GRANULAR TASK UI */}
      {isAppInactive ? (
        <Card className="border-amber-500 border-l-4 bg-amber-500/5">
          <CardHeader>
            <CardTitle className="text-amber-700">Action Required: Upload Annual Performance Plan</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Sipho has assigned your 5-Year KPIs, but granular task tracking cannot begin until you submit your APP. 
              Once uploaded, AI will extract your tasks and automatically populate your dashboard.
            </p>
            <Button asChild className="bg-amber-600 hover:bg-amber-700">
              <Link href="/documents">Go to Submit Page</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          <h3 className="text-xl font-bold tracking-tight border-b pb-2">Granular Task Tracking</h3>
          
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
              <CardTitle>AI Extracted Tasks</CardTitle>
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
                  {indicators.map((ind) => (
                    <TableRow key={ind.id}>
                      <TableCell className="font-medium">{ind.name}</TableCell>
                      <TableCell>{ind.annualTarget} {ind.unit}</TableCell>
                      <TableCell>
                        <Badge variant={ind.status === 'completed' ? 'default' : 'secondary'}>
                          {ind.status.replace('_', ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        {ind.status !== 'completed' ? (
                          <ProofUploadDrawer indicatorId={ind.id} taskName={ind.name} />
                        ) : (
                          <span className="text-sm text-muted-foreground">Done</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              
              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between pt-6 border-t mt-4">
                  <span className="text-sm text-muted-foreground">
                    Showing page {page} of {totalPages} ({total} total tasks)
                  </span>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" disabled={page <= 1} asChild>
                      <Link href={page > 1 ? `/dashboard?page=${page - 1}` : "#"}>Previous</Link>
                    </Button>
                    <Button variant="outline" size="sm" disabled={page >= totalPages} asChild>
                      <Link href={page < totalPages ? `/dashboard?page=${page + 1}` : "#"}>Next</Link>
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}