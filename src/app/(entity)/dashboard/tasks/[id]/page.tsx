import Link from "next/link";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, CheckCircle2, FileText } from "lucide-react";
import { getIndicatorDetails } from "@/lib/api/indicators";
import { QuarterProofForm } from "./QuarterProofForm";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function TaskDetailPage({ params }: PageProps) {
  const { id } = await params;
  const detail = await getIndicatorDetails(id).catch(() => null);

  if (!detail) {
    notFound();
  }

  const { indicator, quarters } = detail;
  const sortedQuarters = [...quarters].sort((a, b) => a.quarter - b.quarter);

  return (
    <div className="space-y-6 max-w-3xl">
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Back to Dashboard
      </Link>

      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">{indicator.name}</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Annual Target: <span className="font-medium">{indicator.annualTarget ?? "—"} {indicator.unit ?? ""}</span>
          </p>
        </div>
        <Badge
          variant={indicator.status === "completed" ? "default" : "secondary"}
          className="capitalize text-sm px-3 py-1"
        >
          {indicator.status.replace("_", " ")}
        </Badge>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Quarterly Progress</CardTitle>
          <CardDescription>
            Submit proof of completion for each quarter. All quarters must be completed to close out this task.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {sortedQuarters.length === 0 ? (
            <p className="text-sm text-muted-foreground">No quarterly breakdown available for this task.</p>
          ) : (
            sortedQuarters.map((q) => (
              <div key={q.id} className="rounded-lg border p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">Q{q.quarter}</span>
                    {q.quarterTarget != null && (
                      <span className="text-sm text-muted-foreground">Target: {q.quarterTarget}</span>
                    )}
                  </div>
                  <Badge variant={q.status === "completed" ? "default" : "outline"} className="capitalize">
                    {q.status === "completed" ? (
                      <span className="flex items-center gap-1">
                        <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" /> Completed
                      </span>
                    ) : (
                      "Not Started"
                    )}
                  </Badge>
                </div>

                {q.status === "completed" ? (
                  <div className="space-y-1 text-sm text-muted-foreground border-t pt-3">
                    {q.proofFileUrl && (
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-blue-500 shrink-0" aria-hidden="true" />
                        <a href={q.proofFileUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                          View submitted proof
                        </a>
                      </div>
                    )}
                    {q.proofNotes && <p>Notes: {q.proofNotes}</p>}
                    {q.completedAt && (
                      <p>Completed {new Date(q.completedAt).toLocaleDateString()}{q.completedBy ? ` by ${q.completedBy}` : ""}</p>
                    )}
                  </div>
                ) : (
                  <div className="border-t pt-3">
                    <QuarterProofForm indicatorId={indicator.id} quarter={q.quarter} />
                  </div>
                )}
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
