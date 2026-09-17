import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { UploadCloud, File, MessageSquare, CheckCircle } from "lucide-react";

export default function EntityDocumentsPage() {
  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="lg:col-span-2 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Document Repository</CardTitle>
            <CardDescription>Upload files. They will auto-tag to your active KPIs.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-xl border-2 border-dashed border-muted-foreground/25 bg-muted/20 p-12 text-center flex flex-col items-center justify-center gap-2">
              <UploadCloud className="h-10 w-10 text-muted-foreground" />
              <p className="text-sm font-medium">Drag & drop files or click to browse</p>
              <p className="text-xs text-muted-foreground">Supports PDF, XLSX, DOCX up to 50MB</p>
              <Button className="mt-4" variant="secondary">Select Files</Button>
            </div>

            <div className="mt-8 space-y-4">
              <h3 className="text-sm font-medium">Recent Uploads</h3>
              <div className="flex items-center justify-between rounded-lg border p-4 bg-card">
                <div className="flex items-center gap-4">
                  <File className="h-8 w-8 text-blue-500" />
                  <div>
                    <p className="text-sm font-medium">Q3_Financials_Signed.pdf</p>
                    <p className="text-xs text-muted-foreground">Uploaded 2 hours ago by Thandi</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <Badge variant="outline" className="text-xs">Auto-tagged: Job Creation</Badge>
                  <Button variant="ghost" size="icon"><MessageSquare className="h-4 w-4" /></Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Submission Checklist</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-emerald-500 mt-0.5" />
              <div>
                <p className="text-sm font-medium">Strategic Plan</p>
                <p className="text-xs text-muted-foreground">Approved</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="h-5 w-5 rounded-full border-2 border-amber-500 mt-0.5" />
              <div>
                <p className="text-sm font-medium">Annual Performance Plan</p>
                <p className="text-xs text-amber-500">Pending Upload</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}