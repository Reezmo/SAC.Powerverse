import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { getEntities } from "@/lib/api/entities";
import { getEntityKpis } from "@/lib/api/kpi";
import { listAppSubmissions } from "@/lib/api/apps";
import type { EntityPortfolioDTO } from "@/lib/types/schema";

export const dynamic = "force-dynamic";

type RosterStatus =
  | "no_kpi"
  | "kpi_sent"
  | "app_pending"
  | "app_processing"
  | "app_rejected"
  | "active";

const STATUS_DISPLAY: Record<RosterStatus, { label: string; variant: "outline" | "secondary" | "default" | "destructive" }> = {
  no_kpi: { label: "No KPI Sent", variant: "outline" },
  kpi_sent: { label: "Awaiting APP", variant: "secondary" },
  app_pending: { label: "APP Pending Review", variant: "secondary" },
  app_processing: { label: "AI Processing", variant: "secondary" },
  app_rejected: { label: "APP Rejected", variant: "destructive" },
  active: { label: "Active", variant: "default" },
};

interface RosterRow {
  entityId: string;
  name: string;
  slug: string;
  type: string;
  status: RosterStatus;
}

export default async function DSACRosterPage() {
  const rawEntities = await getEntities();
  const entities = rawEntities as EntityPortfolioDTO[];

  const [submissions, kpisByEntity] = await Promise.all([
    listAppSubmissions().catch(() => []),
    Promise.all(
      entities.map((e) =>
        getEntityKpis(String(e.id))
          .catch(() => [])
          .then((kpis) => [String(e.id), kpis] as const),
      ),
    ).then((pairs) => new Map(pairs)),
  ]);

  const rows: RosterRow[] = entities.map((entity) => {
    const entityId = String(entity.id);
    const kpis = kpisByEntity.get(entityId) ?? [];
    const entitySubmissions = submissions.filter((s) => s.entityId === entityId);
    // Most recent submission, if any — sorted by uploadedAt descending.
    const latestSubmission = [...entitySubmissions].sort((a, b) =>
      b.uploadedAt.localeCompare(a.uploadedAt),
    )[0];

    let status: RosterStatus;
    if (kpis.length === 0) {
      status = "no_kpi";
    } else if (!latestSubmission) {
      status = "kpi_sent";
    } else if (latestSubmission.status === "approved") {
      status = "active";
    } else if (latestSubmission.status === "rejected") {
      status = "app_rejected";
    } else if (latestSubmission.status === "ai_processed") {
      status = "app_processing";
    } else {
      status = "app_pending";
    }

    return {
      entityId,
      name: entity.name,
      slug: entity.slug,
      type: entity.type === "npo" ? "NPO" : "Public Entity",
      status,
    };
  });

  const publicEntities = rows.filter((r) => r.type === "Public Entity");
  const npos = rows.filter((r) => r.type === "NPO");
  const counts = rows.reduce(
    (acc, r) => {
      acc[r.status] = (acc[r.status] ?? 0) + 1;
      return acc;
    },
    {} as Record<RosterStatus, number>,
  );

  function RosterTable({ rows }: { rows: RosterRow[] }) {
    return (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Entity</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.length === 0 ? (
            <TableRow>
              <TableCell colSpan={3} className="text-center text-muted-foreground py-6">
                No entities in this category.
              </TableCell>
            </TableRow>
          ) : (
            rows.map((row) => (
              <TableRow key={row.entityId}>
                <TableCell className="font-medium">{row.name}</TableCell>
                <TableCell>
                  <Badge variant={STATUS_DISPLAY[row.status].variant}>
                    {STATUS_DISPLAY[row.status].label}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Link href={`/entities/${row.slug}`} className="text-sm text-blue-600 hover:underline">
                    View
                  </Link>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Entity Roster</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Every Public Entity and NPO's progress through the KPI → APP → active-tracking pipeline.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-6">
        {(Object.keys(STATUS_DISPLAY) as RosterStatus[]).map((key) => (
          <Card key={key}>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-medium text-muted-foreground">
                {STATUS_DISPLAY[key].label}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{counts[key] ?? 0}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Public Entities</CardTitle>
          <CardDescription>{publicEntities.length} total</CardDescription>
        </CardHeader>
        <CardContent>
          <RosterTable rows={publicEntities} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>NPOs</CardTitle>
          <CardDescription>{npos.length} total</CardDescription>
        </CardHeader>
        <CardContent>
          <RosterTable rows={npos} />
        </CardContent>
      </Card>
    </div>
  );
}
