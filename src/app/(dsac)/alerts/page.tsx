import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertTriangle, BellRing } from "lucide-react";

export default function DSACAlertsPage() {
  const alerts = [
    { id: 1, entity: "Pan South African Language Board", type: "T-minus 5 Escalation", message: "No submission activity detected. Deadline approaching.", severity: "high" },
    { id: 2, entity: "National Heritage Council", type: "Incomplete Data", message: "Job creation target submitted without supporting evidence.", severity: "medium" },
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold tracking-tight">Risk & Escalations</h2>
      
      <div className="grid gap-4">
        {alerts.map((alert) => (
          <Card key={alert.id} className="border-l-4 border-l-destructive">
            <CardHeader className="py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {alert.severity === "high" ? <AlertTriangle className="h-5 w-5 text-destructive" /> : <BellRing className="h-5 w-5 text-amber-500" />}
                  <CardTitle className="text-base">{alert.entity}</CardTitle>
                </div>
                <Badge variant={alert.severity === "high" ? "destructive" : "secondary"}>{alert.type}</Badge>
              </div>
            </CardHeader>
            <CardContent className="flex items-center justify-between py-2 pb-4">
              <p className="text-sm text-muted-foreground">{alert.message}</p>
              <Button size="sm" variant="outline">Follow Up</Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}