import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, XCircle, FileText } from "lucide-react";
import { getEntityBySlugOrThrow } from "@/lib/api/entities";

export default async function EntityDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const entity = await getEntityBySlugOrThrow(slug);

  if (!entity) {
    notFound();
  }

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
    </div>
  );
}
