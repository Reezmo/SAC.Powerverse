"use client";

import { useState, use } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  analyzeSubmission,
  approveSubmission,
  rejectSubmission,
} from "@/lib/api/apps";
import { Badge } from "@/components/ui/badge";
import { BrainCircuit, Check, X, FileText, ArrowLeft } from "lucide-react";

export default function SubmissionReviewDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const { id } = use(params); // Unwraps the dynamic URL ID

  const [status, setStatus] = useState<string>("pending_review");
  const [summary, setSummary] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  async function handleAnalyze() {
    setIsProcessing(true);
    const result = await analyzeSubmission(id);
    setStatus(result.status);
    setSummary(result.aiSummary || "Extraction complete.");
    setIsProcessing(false);
  }

  async function handleApprove() {
    await approveSubmission(id);
    setStatus("approved");
    setTimeout(() => router.push("/submissions"), 1500); // Send them back to inbox
  }

  async function handleReject() {
    await rejectSubmission(id, "Incomplete targets");
    setStatus("rejected");
    setTimeout(() => router.push("/submissions"), 1500); // Send them back to inbox
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <Button
        variant="ghost"
        onClick={() => router.push("/submissions")}
        className="-ml-4 mb-2"
      >
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Inbox
      </Button>

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Review APP Submission</h2>
          <p className="text-sm text-muted-foreground mt-1">ID: {id}</p>
        </div>
        <Badge
          variant={
            status === "approved"
              ? "default"
              : status === "rejected"
                ? "destructive"
                : "secondary"
          }
        >
          {status.replace("_", " ").toUpperCase()}
        </Badge>
      </div>

      <Card className="border-l-4 border-l-blue-500">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-blue-500" />
            Annual Performance Plan Document
          </CardTitle>
          <CardDescription>Ready for AI metric extraction</CardDescription>
        </CardHeader>

        <CardContent className="space-y-4 pt-2 border-t mt-4">
          {status === "pending_review" && (
            <div className="flex flex-col items-start gap-4">
              <p className="text-sm">
                This document is ready to be analyzed against the active KPI
                schemas.
              </p>
              <Button onClick={handleAnalyze} disabled={isProcessing}>
                <BrainCircuit className="mr-2 h-4 w-4" />
                {isProcessing ? "AI is reading PDF..." : "Run AI Extraction"}
              </Button>
            </div>
          )}

          {summary && (
            <div className="p-4 bg-muted rounded-md text-sm border-l-4 border-primary mt-4">
              <h4 className="font-bold mb-2 flex items-center gap-2">
                <BrainCircuit className="h-4 w-4 text-primary" />
                AI Summary & Extracted Tasks
              </h4>
              <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                {summary}
              </p>
            </div>
          )}

          {status === "ai_processed" && (
            <div className="flex gap-4 pt-4 mt-2">
              <Button
                onClick={handleApprove}
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                <Check className="mr-2 h-4 w-4" /> Approve & Map to Dashboard
              </Button>
              <Button onClick={handleReject} variant="destructive">
                <X className="mr-2 h-4 w-4" /> Reject APP
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
