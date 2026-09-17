import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle } from "lucide-react";
import { DocumentUploader } from "@/components/documents/DocumentUploader";
import { getEntities } from "@/lib/api/entities";
import { MOCK_CHECKLIST } from "@/lib/data/mockEntities";

export default async function EntityDocumentsPage() {
  // Demo mode has a single logged-in entity; in the real API this would be
  // scoped to the signed-in entity's id via the session.
  const [entity] = await getEntities();

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="lg:col-span-2">
        <DocumentUploader initialDocs={entity.documents.map((d) => ({ ...d, tag: "Auto-tagged: On file" }))} />
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Submission Checklist</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {MOCK_CHECKLIST.map((item) => (
              <div key={item.id} className="flex items-start gap-3">
                {item.status === "done" ? (
                  <CheckCircle className="h-5 w-5 text-emerald-500 mt-0.5" aria-hidden="true" />
                ) : (
                  <div className="h-5 w-5 rounded-full border-2 border-amber-500 mt-0.5" aria-hidden="true" />
                )}
                <div>
                  <p className="text-sm font-medium">{item.label}</p>
                  <p className={`text-xs ${item.status === "done" ? "text-muted-foreground" : "text-amber-500"}`}>
                    {item.note}
                  </p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
