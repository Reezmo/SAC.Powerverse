"use client";

import { useState, useEffect } from "react";
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
  getAppSubmissions,
} from "@/lib/api/apps";
import { Badge } from "@/components/ui/badge";
import { BrainCircuit, Check, X, FileText } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

// Individual component so each card maintains its own processing state
function SubmissionCard({ submission }: { submission: any }) {
  const [status, setStatus] = useState<string>(
    submission.status || "pending_review",
  );
  const [summary, setSummary] = useState<string | null>(
    submission.aiSummary || null,
  );
  const [isProcessing, setIsProcessing] = useState(false);

  async function handleAnalyze() {
    setIsProcessing(true);
    const result = await analyzeSubmission(submission.id);
    setStatus(result.status);
    setSummary(result.aiSummary || "Extraction complete. Indicators mapped.");
    setIsProcessing(false);
  }

  async function handleApprove() {
    await approveSubmission(submission.id);
    setStatus("approved");
  }

  return (
    <Card className="border-l-4 border-l-blue-500">
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div>
            <CardTitle className="flex items-center gap-2 mb-1">
              <FileText className="h-5 w-5 text-blue-500" />
              {submission.entityName
                ? `${submission.entityName} - APP`
                : "Annual Performance Plan Submission"}
            </CardTitle>
            <CardDescription>
              Entity ID: {submission.entityId} • Submitted:{" "}
              {new Date(
                submission.submittedAt || submission.createdAt || Date.now(),
              ).toLocaleDateString()}
            </CardDescription>
          </div>
          <Badge variant={status === "approved" ? "default" : "secondary"}>
            {status.replace("_", " ").toUpperCase()}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4 pt-2 border-t mt-4">
        {(status === "pending_review" ||
          status === "submitted" ||
          status === "In Progress" ||
          status === "Not Started") && (
          <div className="flex flex-col items-start gap-4">
            <p className="text-sm">
              This document has been uploaded but its targets have not yet been
              mapped to the dashboard database.
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
            {/* ADD whitespace-pre-wrap right here below: */}
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
              <Check className="mr-2 h-4 w-4" /> Approve & Generate Dashboard
            </Button>
            <Button
              onClick={() => {
                rejectSubmission(submission.id, "Incomplete targets");
                setStatus("rejected");
              }}
              variant="destructive"
            >
              <X className="mr-2 h-4 w-4" /> Reject APP
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function SubmissionReviewPage() {
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAppSubmissions()
      .then((data) => {
        setSubmissions(Array.isArray(data) ? data : []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Inbox: APP Submissions</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Review entity performance plans and extract KPIs.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="space-y-4">
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      ) : submissions.length === 0 ? (
        <div className="rounded-xl border border-dashed p-12 text-center text-muted-foreground">
          No APP submissions found.
        </div>
      ) : (
        <div className="space-y-6">
          {submissions.map((sub) => (
            <SubmissionCard key={sub.id} submission={sub} />
          ))}
        </div>
      )}
    </div>
  );
}
