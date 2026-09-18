"use client";

import { useRef, useState, useTransition, type DragEvent } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { UploadCloud, FileText, ExternalLink, X } from "lucide-react";
import { uploadDocumentAction } from "@/lib/api/documents-actions";
import { inferDocType } from "@/lib/api/documents";

interface UploadedDoc {
  id: string;
  name: string;
  uploadedAt: string;
  tag: string;
}

const ACCEPTED_TYPES = [".pdf", ".xlsx", ".docx"];
const MAX_SIZE_BYTES = 50 * 1024 * 1024; 

const DOC_TYPE_LABELS: Record<string, string> = {
  financials: "Financials",
  annual_report: "Annual Report",
  quarterly_report: "Quarterly Report",
  strategic_plan: "Strategic Plan",
  operational_plan: "Operational Plan",
  app: "Annual Performance Plan",
};

function tagFor(fileName: string): string {
  return DOC_TYPE_LABELS[inferDocType(fileName)] ?? "Pending Tag";
}

export function DocumentUploader({ entityId, initialDocs }: { entityId: string; initialDocs: UploadedDoc[] }) {
  const [docs, setDocs] = useState<UploadedDoc[]>(initialDocs);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [previewDoc, setPreviewDoc] = useState<UploadedDoc | null>(null);
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
        setError(`"${file.name}" isn't a supported file type.`);
        continue;
      }
      if (file.size > MAX_SIZE_BYTES) {
        setError(`"${file.name}" is larger than 50MB.`);
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
          <CardTitle>Official Compliance Repository</CardTitle>
          <CardDescription>
            Upload your Strategic Plans, Annual Performance Plans, Operational Plans, Annual Reports, Quarterly Reports, and Financials here for DSAC review.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Uploader Area */}
          <div
            role="button"
            tabIndex={0}
            onClick={() => inputRef.current?.click()}
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            className={`rounded-xl border-2 border-dashed p-12 text-center flex flex-col items-center justify-center gap-2 cursor-pointer transition-colors ${
              isDragging ? "border-primary bg-primary/5" : "border-muted-foreground/25 bg-muted/20"
            }`}
          >
            <UploadCloud className="h-10 w-10 text-muted-foreground" aria-hidden="true" />
            <p className="text-sm font-medium">
              {isPending ? "Uploading..." : "Drag & drop files or click to browse"}
            </p>
            <p className="text-xs text-muted-foreground">Supports PDF, XLSX, DOCX up to 50MB</p>
            <Button type="button" className="mt-4" variant="secondary" disabled={isPending} onClick={(e) => { e.stopPropagation(); inputRef.current?.click(); }}>
              Select Files
            </Button>
            <input ref={inputRef} type="file" multiple accept={ACCEPTED_TYPES.join(",")} className="sr-only" onChange={(e) => handleFiles(e.target.files)} />
          </div>

          {error && <p className="mt-3 text-sm text-destructive">{error}</p>}

          {/* Uploaded Documents Table */}
          <div className="mt-8 space-y-4">
            <h3 className="text-sm font-medium">Uploaded Documents</h3>
            {docs.length === 0 ? (
              <div className="rounded-md border p-8 text-center text-sm text-muted-foreground">
                No documents uploaded yet.
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Document Name</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Date Uploaded</TableHead>
                      <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {docs.map((doc) => (
                      <TableRow key={doc.id}>
                        <TableCell className="font-medium max-w-[250px] truncate">
                          <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4 text-blue-500 shrink-0" />
                            <span className="truncate" title={doc.name}>{doc.name}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="font-normal whitespace-nowrap">
                            {doc.tag}
                          </Badge>
                        </TableCell>
                        <TableCell className="whitespace-nowrap text-muted-foreground">
                          {doc.uploadedAt}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-blue-600 hover:text-blue-800" 
                            onClick={() => setPreviewDoc(doc)}
                          >
                            View <ExternalLink className="ml-1 h-3 w-3" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Full-Screen Document Preview Modal */}
      {previewDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm transition-all">
          <div className="flex h-[85vh] w-full max-w-5xl flex-col overflow-hidden rounded-xl bg-background shadow-2xl">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b px-6 py-4">
              <div>
                <h3 className="font-bold text-lg">{previewDoc.name}</h3>
                <p className="text-sm text-muted-foreground">
                  {previewDoc.tag} • Uploaded {previewDoc.uploadedAt}
                </p>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setPreviewDoc(null)}>
                <X className="h-6 w-6" />
              </Button>
            </div>
            
            {/* Modal Body / Viewer Area */}
            <div className="flex-1 bg-muted/40 p-6 flex flex-col items-center justify-center">
              <FileText className="h-24 w-24 text-muted-foreground/30 mb-6" />
              <p className="text-muted-foreground text-center max-w-md mb-2">
                SharePoint integration is pending.
              </p>
              <p className="text-sm text-muted-foreground text-center max-w-lg">
                In the live production environment, clicking this file will stream the actual document preview securely via the Microsoft Graph API, right here inside the browser.
              </p>
              <Button className="mt-8" variant="outline" onClick={() => setPreviewDoc(null)}>
                Close Preview
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}