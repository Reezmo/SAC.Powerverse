import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { CyclePointDTO } from "@/lib/types/schema";

const STATUS_DISPLAY: Record<CyclePointDTO["status"], { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  submitted: { label: "Submitted", variant: "default" },
  in_progress: { label: "In Progress", variant: "secondary" },
  not_started: { label: "Not Started", variant: "outline" },
  missed: { label: "Missed", variant: "destructive" },
};

export function EntityTrendTimeline({ cycles }: { cycles: CyclePointDTO[] }) {
  if (cycles.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Compliance Trend</CardTitle>
        <CardDescription>Submission status across reporting cycles.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-3">
          {cycles.map((cycle) => (
            <div key={cycle.cycleId} className="flex flex-col items-center gap-1.5 min-w-[6rem]">
              <Badge variant={STATUS_DISPLAY[cycle.status].variant} className="w-full justify-center">
                {STATUS_DISPLAY[cycle.status].label}
              </Badge>
              <span className="text-xs text-muted-foreground text-center">{cycle.cycleLabel}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
