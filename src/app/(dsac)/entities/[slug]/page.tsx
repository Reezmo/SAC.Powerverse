import Link from "next/link";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle2, XCircle, FileText } from "lucide-react";
import { getEntityBySlugOrThrow } from "@/lib/api/entities";
import { getEntityIndicators } from "@/lib/api/indicators";
import { getEntityTrend } from "@/lib/api/trends";
import { EntityTrendTimeline } from "./EntityTrendTimeline";

interface PageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string }>;
}

export default async function EntityDetailPage({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const resolvedSearchParams = searchParams ? await searchParams : {};
  const page = parseInt(resolvedSearchParams.page || "1", 10);
  const entity = await getEntityBySlugOrThrow(slug);

  if (!entity) {
    notFound();
  }

  let indicatorsFetchFailed = false;
  const [indicatorsResponse, trend] = await Promise.all([
    getEntityIndicators(entity.id, page, 10).catch((err) => {
      console.error("Failed to load entity indicators:", err);
      indicatorsFetchFailed = true;
      return null;
    }),
    getEntityTrend(entity.id),
  ]);
  const indicators = Array.isArray(indicatorsResponse) ? indicatorsResponse : (indicatorsResponse?.data || []);
  const total = Array.isArray(indicatorsResponse)
    ? indicatorsResponse.length
    : (indicatorsResponse?.total || indicators.length);
  const totalPages = Math.ceil(total / 10);

  const notStarted = indicators.filter((i) => i.status === "not_started").length;
  const inProgress = indicators.filter((i) => i.status === "in_progress").length;
  const completed = indicators.filter((i) => i.status === "completed").length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">{entity.name}</h2>
          <p className="text-sm text-muted-foreground">
            {entity.type === "public_entity" ? "Public Entity" : "NPO"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={entity.status === "Submitted" ? "default" : "secondary"}>{entity.status}</Badge>
          <Badge
            variant={entity.risk === "High" ? "destructive" : entity.risk === "Watch" ? "outline" : "secondary"}
          >
            {entity.risk} Risk
          </Badge>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>KPI Performance</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {entity.kpis.length === 0 ? (
              <p className="text-sm text-muted-foreground">No KPI data submitted for this cycle yet.</p>
            ) : (
              entity.kpis.map((kpi) => (
                <div key={kpi.id} className="flex items-center justify-between border-b pb-3 last:border-0 last:pb-0">
                  <div>
                    <p className="text-sm font-medium">{kpi.name}</p>
                    <p className="text-xs text-muted-foreground">
                      Target: {kpi.target ?? "—"} · Actual: {kpi.actual ?? "Not yet reported"}
                    </p>
                  </div>
                  {kpi.onTrack ? (
                    <CheckCircle2 className="h-5 w-5 text-emerald-500" aria-hidden="true" />
                  ) : (
                    <XCircle className="h-5 w-5 text-amber-500" aria-hidden="true" />
                  )}
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Documents</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {entity.documents.length === 0 ? (
              <p className="text-sm text-muted-foreground">No documents uploaded yet.</p>
            ) : (
              entity.documents.map((doc) => (
                <div key={doc.id} className="flex items-center gap-3">
                  <FileText className="h-4 w-4 text-blue-500 shrink-0" aria-hidden="true" />
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{doc.name}</p>
                    <p className="text-xs text-muted-foreground">
                      Uploaded {new Date(doc.uploadedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      {trend && trend.cycles.length > 0 && <EntityTrendTimeline cycles={trend.cycles} />}

      <div className="space-y-6">
        <h3 className="text-xl font-bold tracking-tight border-b pb-2">Granular Task Tracking</h3>

        {indicatorsFetchFailed ? (
          <p className="text-sm text-destructive">
            Could not load granular tasks for this entity. Try refreshing the page.
          </p>
        ) : indicators.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No granular tasks yet — these appear once an APP submission has been approved for this entity.
          </p>
        ) : (
          <>
            <div className="grid gap-4 md:grid-cols-3">
              <Card>
                <CardHeader className="pb-2"><CardTitle className="text-sm">Not Started</CardTitle></CardHeader>
                <CardContent><div className="text-2xl font-bold text-amber-500">{notStarted}</div></CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2"><CardTitle className="text-sm">In Progress</CardTitle></CardHeader>
                <CardContent><div className="text-2xl font-bold text-blue-500">{inProgress}</div></CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2"><CardTitle className="text-sm">Completed</CardTitle></CardHeader>
                <CardContent><div className="text-2xl font-bold text-emerald-500">{completed}</div></CardContent>
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
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {indicators.map((ind) => (
                      <TableRow key={ind.id}>
                        <TableCell className="font-medium">{ind.name}</TableCell>
                        <TableCell>{ind.annualTarget} {ind.unit}</TableCell>
                        <TableCell>
                          <Badge variant={ind.status === "completed" ? "default" : "secondary"}>
                            {ind.status.replace("_", " ")}
                          </Badge>
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
                        <Link href={page > 1 ? `/entities/${slug}?page=${page - 1}` : "#"}>Previous</Link>
                      </Button>
                      <Button variant="outline" size="sm" disabled={page >= totalPages} asChild>
                        <Link href={page < totalPages ? `/entities/${slug}?page=${page + 1}` : "#"}>Next</Link>
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}
