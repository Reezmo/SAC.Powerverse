"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UploadCloud, FileText, CheckCircle2, X } from "lucide-react";
import { uploadAppSubmission } from "@/lib/api/apps";

export function AppUploadForm({
  entityId,
  isAppActive = false,
}: {
  entityId: string;
  isAppActive?: boolean;
}) {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [success, setSuccess] = useState(isAppActive);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = e.target.files?.[0];
    if (!selected) return;

    if (selected.type !== "application/pdf") {
      setError("Please upload a PDF document for AI extraction.");
      setFile(null);
      return;
    }

    setError(null);
    setFile(selected);
  }

  async function handleUpload() {
    if (!file) return;
    
    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("entityId", entityId);

    try {
      await uploadAppSubmission(formData);
      setSuccess(true);
      setFile(null);
      router.refresh(); // Tells Next.js to reload the page data and unlock the KPI section
    } catch {
      setError("Failed to upload the APP. Please try again.");
    } finally {
      setIsUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  // If the APP is already active (Thandi) or just uploaded successfully (Bianca)
  if (success) {
    return (
      <Card className="border-l-4 border-l-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20">
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            <div className="p-2 bg-emerald-100 dark:bg-emerald-900 rounded-full">
              <CheckCircle2 className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-emerald-800 dark:text-emerald-300">
                APP Submitted & Active
              </h3>
              <p className="text-sm text-emerald-700 dark:text-emerald-400 mt-1">
                Your Annual Performance Plan has been successfully processed. AI has extracted your granular tasks, which are now tracking on your dashboard. Your Quarterly KPI entry is unlocked.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-l-4 border-l-blue-500">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" /> Submit Annual Performance Plan (APP)
        </CardTitle>
        <CardDescription>
          Upload your signed APP in PDF format. AI will extract your granular tasks for tracking.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-start gap-4">
          <input
            ref={inputRef}
            type="file"
            accept=".pdf,application/pdf"
            className="sr-only"
            onChange={handleFileChange}
          />
          
          {!file ? (
            <Button 
              type="button" 
              variant="outline"
              onClick={() => inputRef.current?.click()} 
              className="w-full h-24 border-dashed"
            >
              <div className="flex flex-col items-center gap-2 text-muted-foreground">
                <UploadCloud className="h-6 w-6" />
                <span>Click to browse for PDF</span>
              </div>
            </Button>
          ) : (
            <div className="flex w-full items-center justify-between rounded-md border p-3">
              <div className="flex items-center gap-2 overflow-hidden">
                <FileText className="h-5 w-5 text-blue-500 flex-shrink-0" />
                <span className="truncate text-sm font-medium">{file.name}</span>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setFile(null)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}

          {file && (
            <Button 
              type="button" 
              onClick={handleUpload} 
              disabled={isUploading}
              className="w-full"
            >
              {isUploading ? "Uploading..." : "Confirm & Upload APP"}
            </Button>
          )}

          {error && <p className="text-sm text-destructive">{error}</p>}
        </div>
      </CardContent>
    </Card>
  );
}