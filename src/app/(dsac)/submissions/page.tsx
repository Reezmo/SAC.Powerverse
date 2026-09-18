"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { analyzeSubmission, approveSubmission, rejectSubmission } from "@/lib/api/apps";
import { Badge } from "@/components/ui/badge";
import { BrainCircuit, Check, X } from "lucide-react";

export default function SubmissionReviewPage({ params }: { params: { id: string } }) {
  const [status, setStatus] = useState<string>("pending_review");
  const [summary, setSummary] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  async function handleAnalyze() {
    setIsProcessing(true);
    const result = await analyzeSubmission(params.id);
    setStatus(result.status);
    setSummary(result.aiSummary || "Extraction complete. Indicators mapped.");
    setIsProcessing(false);
  }

  async function handleApprove() {
    await approveSubmission(params.id);
    setStatus("approved");
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Review APP Submission</h2>
        <Badge variant={status === 'approved' ? 'default' : 'secondary'}>{status}</Badge>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>AI Extraction</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {status === "pending_review" && (
            <Button onClick={handleAnalyze} disabled={isProcessing}>
              <BrainCircuit className="mr-2 h-4 w-4" />
              {isProcessing ? "Reading PDF..." : "Run AI Extraction"}
            </Button>
          )}

          {summary && (
            <div className="p-4 bg-muted rounded-md text-sm border-l-4 border-primary">
              <h4 className="font-bold mb-2">AI Summary & Extracted Tasks</h4>
              <p>{summary}</p>
            </div>
          )}

          {status === "ai_processed" && (
            <div className="flex gap-4 pt-4">
              <Button onClick={handleApprove} className="bg-emerald-600 hover:bg-emerald-700">
                <Check className="mr-2 h-4 w-4" /> Approve & Generate Dashboard
              </Button>
              <Button onClick={() => rejectSubmission(params.id, "Incomplete targets")} variant="destructive">
                <X className="mr-2 h-4 w-4" /> Reject APP
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}