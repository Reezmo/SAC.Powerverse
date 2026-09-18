import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle } from "lucide-react";
import { DocumentUploader } from "@/components/documents/DocumentUploader";
import { readSession } from "@/lib/auth/session";
import { getEntities, getEntityBySlugOrThrow } from "@/lib/api/entities";
import { MOCK_CHECKLIST, MOCK_ENTITIES } from "@/lib/data/mockEntities";
import { USE_MOCK_DATA } from "@/lib/api/client";

interface DisplayDoc {
  id: string;
  name: string;
  uploadedAt: string;
  tag: string;
}

export default async function EntityDocumentsPage() {
  if (USE_MOCK_DATA) {
    const [entity] = MOCK_ENTITIES;
    return renderPage(
      entity.id,
      entity.documents.map((d) => ({ ...d, tag: "Auto-tagged: On file" }))
    );
  }

  const session = await readSession();
  if (!session?.entityId) {
    redirect("/login");
  }

  // We only have the entity id from the session claim, not the slug, so
  // list-then-find avoids adding a slug-less "by id" API just for this.
  const entities = await getEntities();
  const own = entities.find((e) => e.id === session.entityId);
  if (!own) {
    return renderPage(session.entityId, []);
  }

  const detail = await getEntityBySlugOrThrow(own.slug);
  const documents: DisplayDoc[] =
    detail && "documents" in detail
      ? detail.documents.map((d) => ({ ...d, tag: "Auto-tagged: On file" }))
      : [];

  return renderPage(session.entityId, documents);
}

function renderPage(entityId: string, initialDocs: DisplayDoc[]) {
  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="lg:col-span-2">
        <DocumentUploader entityId={entityId} initialDocs={initialDocs} />
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
