import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, CheckCircle2, Clock, Users, Briefcase } from "lucide-react";
import { getSubmissionSummary } from "@/lib/api/submissions";

export default async function EntityDashboardPage() {
  const summary = await getSubmissionSummary();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight">Q3 2026 Overview</h2>
        <Badge variant="destructive" className="flex items-center gap-1 py-1">
          <Clock className="h-4 w-4" aria-hidden="true" /> {summary.daysUntilDeadline} Days Until Deadline
        </Badge>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            <Clock className="h-4 w-4 text-blue-500" aria-hidden="true" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.inProgress} KPIs</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Not Started</CardTitle>
            <AlertTriangle className="h-4 w-4 text-amber-500" aria-hidden="true" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.notStarted} KPIs</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-emerald-500" aria-hidden="true" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.completed} KPIs</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Demographics & Job Creation</CardTitle>
          </CardHeader>
          <CardContent className="flex gap-8">
            <div className="flex flex-col gap-2">
              <span className="flex items-center gap-2 text-sm text-muted-foreground">
                <Users className="h-4 w-4" aria-hidden="true" /> Beneficiaries
              </span>
              <span className="text-3xl font-bold">{summary.beneficiaries.toLocaleString()}</span>
            </div>
            <div className="flex flex-col gap-2">
              <span className="flex items-center gap-2 text-sm text-muted-foreground">
                <Briefcase className="h-4 w-4" aria-hidden="true" /> Jobs Created
              </span>
              <span className="text-3xl font-bold">{summary.jobsCreated.toLocaleString()}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
