import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckSquare } from "lucide-react";
import { KpiSubmissionForm } from "@/components/submit/KpiSubmissionForm";
import { MOCK_CHECKLIST } from "@/lib/data/mockEntities";

export default function EntitySubmitPage() {
  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="lg:col-span-2 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Quarterly APP Status - Q3 2026</CardTitle>
          </CardHeader>
          <CardContent>
            <KpiSubmissionForm />
          </CardContent>
        </Card>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <CheckSquare className="h-5 w-5" aria-hidden="true" /> Checklist
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {MOCK_CHECKLIST.map((item) => (
              <div key={item.id} className="flex items-center gap-2 text-sm">
                <span
                  role="img"
                  aria-label={item.status === "done" ? "Complete" : "Pending"}
                  className={`h-4 w-4 rounded-full border ${
                    item.status === "done" ? "border-emerald-500 bg-emerald-500/20" : "border-amber-500"
                  }`}
                />
                <span>{item.label}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
