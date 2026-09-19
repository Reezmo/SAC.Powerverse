import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertCircle, FileUp } from "lucide-react";
import { getEntityIndicators } from "@/lib/api/indicators";
import { getEntities } from "@/lib/api/entities";
import { getEntityKpis } from "@/lib/api/kpi";
import { readSession } from "@/lib/auth/session";
import { EntitySwitcher } from "@/components/dashboard/EntitySwitcher";

export const dynamic = "force-dynamic";

interface PageProps {
  searchParams: Promise<{ page?: string; entityId?: string }>;
}

export default async function EntityDashboardPage({ searchParams }: PageProps) {
  const session = await readSession();
  const resolvedParams = searchParams ? await searchParams : {};
  const page = parseInt(resolvedParams.page || "1", 10);
  
  // 1. Fetch all entities
  const rawEntities = await getEntities();

  if (!rawEntities || rawEntities.length === 0) {
    return (
      <div className="p-6 text-center text-muted-foreground">
        No entities found in the database.
      </div>
    );
  }

  const entities = rawEntities.map((e) => ({ id: String(e.id), name: e.name }));

  // 2. Select targeted entity
  const targetEntityId = resolvedParams.entityId || session?.entityId;
  const activeEntity = entities.find((e) => e.id === String(targetEntityId)) || entities[0];

  // 3. Fetch Assigned KPIs directly from GET /api/Entities/{id}/kpis
  const assignedKpis = await getEntityKpis(activeEntity.id).catch(() => []);

  // 4. Fetch granular task data (paginated) and the full set for the
  // summary cards — the cards must reflect every task, not just the
  // current page, so this can't reuse the paginated response above.
  const [allIndicatorsResponse, indicatorsResponse] = await Promise.all([
    getEntityIndicators(activeEntity.id, 1, 1000).catch(() => null),
    getEntityIndicators(activeEntity.id, page, 10).catch(() => null)
  ]);

  const allIndicators = Array.isArray(allIndicatorsResponse) ? allIndicatorsResponse : (allIndicatorsResponse?.data || []);
  const summary = {
    notStarted: allIndicators.filter((i) => i.status === "not_started").length,
    inProgress: allIndicators.filter((i) => i.status === "in_progress").length,
    completed: allIndicators.filter((i) => i.status === "completed").length,
  };

  const indicators = Array.isArray(indicatorsResponse) ? indicatorsResponse : (indicatorsResponse?.data || []);
  const total = Array.isArray(indicatorsResponse)
    ? indicatorsResponse.length
    : (indicatorsResponse?.total || indicators.length);
  const totalPages = Math.ceil(total / 10);

  const isAppInactive = total === 0;

  return (
    <div className="space-y-8">
      {/* HEADER & DYNAMIC ENTITY SELECTOR */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-card p-4 rounded-xl border">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Entity Dashboard</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Viewing compliance and KPI performance metrics
          </p>
        </div>

        <EntitySwitcher entities={entities} activeEntityId={activeEntity.id} />
      </div>

      {/* OVERARCHING 5-YEAR KPI TRACKING */}
      <Card className="border-t-4 border-t-primary">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center justify-between">
            <span>5-Year Core KPIs</span>
            <Badge variant="outline" className="font-normal text-xs">
              {activeEntity.name}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {assignedKpis.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4">
              No core KPIs assigned to this entity yet. Use Sipho&apos;s panel to assign one.
            </p>
          ) : (
            <div className="space-y-4 pt-2">
              {assignedKpis.map((kpi) => (
                <div key={kpi.id} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
                  <div>
                    <p className="font-medium text-lg">{kpi.kpiName}</p>
                    <p className="text-sm text-muted-foreground">
                      Target: <span className="font-medium">{kpi.fiveYearTarget ?? "—"} {kpi.unit ?? ""}</span>
                    </p>
                  </div>
                  <Badge 
                    variant={kpi.status === "received" ? "default" : "secondary"} 
                    className="px-3 py-1 text-sm capitalize"
                  >
                    {kpi.status || "Pending APP"}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* CONDITIONAL GRANULAR TASK UI */}
      {isAppInactive ? (
        <Card className="border-amber-500 border-l-4 bg-amber-500/5">
          <CardHeader>
            <CardTitle className="text-amber-700 flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-amber-600" />
              Action Required: Upload Annual Performance Plan
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Sipho has assigned core 5-Year KPIs to <strong>{activeEntity.name}</strong>, but granular task tracking cannot begin until a signed APP is submitted. Once uploaded, AI will extract the granular tasks and populate this dashboard.
            </p>

            {assignedKpis.length > 0 && (
              <div className="rounded-lg border bg-background/80 p-4 space-y-2">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Assigned Core KPIs Requiring APP Alignment:
                </p>
                <div className="flex flex-wrap gap-2 pt-1">
                  {assignedKpis.map((kpi) => (
                    <Badge 
                      key={kpi.id} 
                      variant="outline" 
                      className="border-amber-500/40 bg-amber-500/10 text-amber-900 font-medium py-1 px-3 text-sm"
                    >
                      {kpi.kpiName} {kpi.fiveYearTarget ? `(Target: ${kpi.fiveYearTarget} ${kpi.unit ?? ""})` : ""}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            <div>
              <Button asChild className="bg-amber-600 hover:bg-amber-700 text-white gap-2">
                <Link href="/documents">
                  <FileUp className="h-4 w-4" /> Go to Documents & Upload APP
                </Link>
              </Button>
            </div>
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
                          <Button variant="outline" size="sm" asChild>
                            <Link href={`/dashboard/tasks/${ind.id}`}>View Task</Link>
                          </Button>
                        ) : (
                          <span className="text-sm text-muted-foreground">Done</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              
              {totalPages > 1 && (
                <div className="flex items-center justify-between pt-6 border-t mt-4">
                  <span className="text-sm text-muted-foreground">
                    Showing page {page} of {totalPages} ({total} total tasks)
                  </span>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" disabled={page <= 1} asChild>
                      <Link href={page > 1 ? `/dashboard?page=${page - 1}&entityId=${activeEntity.id}` : "#"}>Previous</Link>
                    </Button>
                    <Button variant="outline" size="sm" disabled={page >= totalPages} asChild>
                      <Link href={page < totalPages ? `/dashboard?page=${page + 1}&entityId=${activeEntity.id}` : "#"}>Next</Link>
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