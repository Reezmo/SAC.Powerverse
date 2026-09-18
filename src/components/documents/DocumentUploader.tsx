"use client";

import { useRef, useState, useTransition, type DragEvent } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { UploadCloud, File, MessageSquare } from "lucide-react";
import { uploadDocumentAction } from "@/lib/api/documents-actions";
import { inferDocType } from "@/lib/api/documents";

interface UploadedDoc {
  id: string;
  name: string;
  uploadedAt: string;
  tag: string;
}

const ACCEPTED_TYPES = [".pdf", ".xlsx", ".docx"];
const MAX_SIZE_BYTES = 50 * 1024 * 1024; // 50MB, matches the copy on this page

const DOC_TYPE_LABELS: Record<string, string> = {
  financials: "Auto-tagged: Financials",
  annual_report: "Auto-tagged: Annual Report",
  quarterly_report: "Auto-tagged: Quarterly Report",
  strategic_plan: "Auto-tagged: Strategic Plan",
  operational_plan: "Auto-tagged: Operational Plan",
  app: "Auto-tagged: Annual Performance Plan",
};

function tagFor(fileName: string): string {
  return DOC_TYPE_LABELS[inferDocType(fileName)] ?? "Auto-tagged: Pending review";
}

export function DocumentUploader({ entityId, initialDocs }: { entityId: string; initialDocs: UploadedDoc[] }) {
  const [docs, setDocs] = useState<UploadedDoc[]>(initialDocs);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isPending, startTransition] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);

  function uploadOne(file: File) {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("entityId", entityId);

    startTransition(async () => {
      try {
        await uploadDocumentAction(formData);
        setDocs((prev) => [
          { id: `${file.name}-${Date.now()}`, name: file.name, uploadedAt: "Just now", tag: tagFor(file.name) },
          ...prev,
        ]);
      } catch {
        setError(`Failed to upload "${file.name}". Please try again.`);
      }
    });
  }

  function handleFiles(fileList: FileList | null) {
    if (!fileList || fileList.length === 0) return;
    setError(null);

    for (const file of Array.from(fileList)) {
      const hasValidExtension = ACCEPTED_TYPES.some((ext) => file.name.toLowerCase().endsWith(ext));
      if (!hasValidExtension) {
        setError(`"${file.name}" isn't a supported file type (PDF, XLSX, DOCX).`);
        continue;
      }
      if (file.size > MAX_SIZE_BYTES) {
        setError(`"${file.name}" is larger than the 50MB limit.`);
        continue;
      }
      uploadOne(file);
    }
  }

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setIsDragging(false);
    handleFiles(event.dataTransfer.files);
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Document Repository</CardTitle>
          <CardDescription>Upload files. They will auto-tag to your active KPIs.</CardDescription>
        </CardHeader>
        <CardContent>
          <div
            role="button"
            tabIndex={0}
            onClick={() => inputRef.current?.click()}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                inputRef.current?.click();
              }
            }}
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            className={`rounded-xl border-2 border-dashed p-12 text-center flex flex-col items-center justify-center gap-2 cursor-pointer transition-colors ${
              isDragging ? "border-primary bg-primary/5" : "border-muted-foreground/25 bg-muted/20"
            }`}
            aria-label="Upload documents"
          >
            <UploadCloud className="h-10 w-10 text-muted-foreground" aria-hidden="true" />
            <p className="text-sm font-medium">
              {isPending ? "Uploading..." : "Drag & drop files or click to browse"}
            </p>
            <p className="text-xs text-muted-foreground">Supports PDF, XLSX, DOCX up to 50MB</p>
            <Button
              type="button"
              className="mt-4"
              variant="secondary"
              disabled={isPending}
              onClick={(e) => {
                e.stopPropagation();
                inputRef.current?.click();
              }}
            >
              Select Files
            </Button>
            <input
              ref={inputRef}
              type="file"
              multiple
              accept={ACCEPTED_TYPES.join(",")}
              className="sr-only"
              onChange={(e) => handleFiles(e.target.files)}
            />
          </div>

          {error && (
            <p role="alert" className="mt-3 text-sm text-destructive">
              {error}
            </p>
          )}

          <div className="mt-8 space-y-4">
            <h3 className="text-sm font-medium">Recent Uploads</h3>
            {docs.length === 0 ? (
              <p className="text-sm text-muted-foreground">No documents uploaded yet.</p>
            ) : (
              docs.map((doc) => (
                <div key={doc.id} className="flex items-center justify-between rounded-lg border p-4 bg-card">
                  <div className="flex items-center gap-4 min-w-0">
                    <File className="h-8 w-8 text-blue-500 shrink-0" aria-hidden="true" />
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{doc.name}</p>
                      <p className="text-xs text-muted-foreground">Uploaded {doc.uploadedAt} by Thandi</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 shrink-0">
                    <Badge variant="outline" className="text-xs">
                      {doc.tag}
                    </Badge>
                    <Button variant="ghost" size="icon" aria-label={`Comment on ${doc.name}`}>
                      <MessageSquare className="h-4 w-4" aria-hidden="true" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
