"use client";

import { useEffect, useState, useTransition } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BrainCircuit, Check, X } from "lucide-react";
import {
  analyzeSubmission,
  approveSubmission,
  getSubmissionDetails,
  rejectSubmission,
} from "@/lib/api/apps";
import type { AppSubmission, AppSubmissionIndicator } from "@/lib/types/schema";

export default function SubmissionReviewPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const id = params.id;

  const [submission, setSubmission] = useState<AppSubmission | null>(null);
  const [indicators, setIndicators] = useState<AppSubmissionIndicator[]>([]);
  const [keptIds, setKeptIds] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [isAnalyzing, startAnalyzing] = useTransition();
  const [isDeciding, startDeciding] = useTransition();
  const [rejectReason, setRejectReason] = useState("");
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getSubmissionDetails(id)
      .then(({ submission, indicators }) => {
        setSubmission(submission);
        setIndicators(indicators);
        setKeptIds(new Set(indicators.map((i) => i.id)));
      })
      .catch(() => setError("Could not load this submission."))
      .finally(() => setIsLoading(false));
  }, [id]);

  function handleAnalyze() {
    setError(null);
    startAnalyzing(async () => {
      try {
        const result = await analyzeSubmission(id);
        setSubmission(result);
        const { indicators: fresh } = await getSubmissionDetails(id);
        setIndicators(fresh);
        setKeptIds(new Set(fresh.map((i) => i.id)));
      } catch {
        setError("AI analysis failed. Please try again.");
      }
    });
  }

  function toggleKeep(indicatorId: string) {
    setKeptIds((prev) => {
      const next = new Set(prev);
      if (next.has(indicatorId)) {
        next.delete(indicatorId);
      } else {
        next.add(indicatorId);
      }
      return next;
    });
  }

  function handleApprove() {
    setError(null);
    startDeciding(async () => {
      try {
        await approveSubmission(id, Array.from(keptIds));
        router.push("/submissions");
      } catch {
        setError("Approval failed. Please try again.");
      }
    });
  }

  function handleReject() {
    if (!rejectReason.trim()) {
      setError("Give a reason so the entity knows what to fix.");
      return;
    }
    setError(null);
    startDeciding(async () => {
      try {
        await rejectSubmission(id, rejectReason.trim());
        router.push("/submissions");
      } catch {
        setError("Rejection failed. Please try again.");
      }
    });
  }

  if (isLoading) {
    return <p className="text-sm text-muted-foreground">Loading...</p>;
  }

  if (!submission) {
    return <p className="text-sm text-destructive">Submission not found.</p>;
  }

  const status = submission.status;

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Review APP Submission</h2>
        <Badge variant={status === "approved" ? "default" : "secondary"}>{status}</Badge>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>AI Extraction</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {status === "pending_review" && (
            <Button onClick={handleAnalyze} disabled={isAnalyzing}>
              <BrainCircuit className="mr-2 h-4 w-4" aria-hidden="true" />
              {isAnalyzing ? "Reading PDF..." : "Run AI Extraction"}
            </Button>
          )}

          {status === "ai_failed" && (
            <div className="space-y-3">
              <p className="text-sm text-destructive">{submission.aiSummary}</p>
              <Button onClick={handleAnalyze} disabled={isAnalyzing}>
                <BrainCircuit className="mr-2 h-4 w-4" aria-hidden="true" />
                {isAnalyzing ? "Retrying..." : "Retry AI Extraction"}
              </Button>
            </div>
          )}

          {submission.aiSummary && status !== "ai_failed" && (
            <div className="p-4 bg-muted rounded-md text-sm border-l-4 border-primary">
              <h4 className="font-bold mb-2">AI Summary</h4>
              <p>{submission.aiSummary}</p>
            </div>
          )}

          {status === "ai_processed" && indicators.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium">
                Extracted Indicators — uncheck any the AI got wrong before approving
              </h4>
              <div className="rounded-md border divide-y">
                {indicators.map((indicator) => (
                  <label
                    key={indicator.id}
                    className="flex items-center gap-3 p-3 text-sm cursor-pointer hover:bg-muted/40"
                  >
                    <input
                      type="checkbox"
                      className="h-4 w-4 rounded border-input accent-primary"
                      checked={keptIds.has(indicator.id)}
                      onChange={() => toggleKeep(indicator.id)}
                    />
                    <div className="flex-1">
                      <p className="font-medium">{indicator.name}</p>
                      <p className="text-xs text-muted-foreground">
                        Target: {indicator.annualTarget ?? "—"} {indicator.unit ?? ""}
                      </p>
                    </div>
                    <Badge
                      variant={indicator.matchConfidence === "matched" ? "default" : "outline"}
                      className="text-xs"
                    >
                      {indicator.matchConfidence ?? "unmatched"}
                    </Badge>
                  </label>
                ))}
              </div>
            </div>
          )}

          {status === "ai_processed" && indicators.length === 0 && (
            <p className="text-sm text-muted-foreground">
              No indicators were extracted from this document.
            </p>
          )}

          {status === "ai_processed" && (
            <div className="space-y-3 pt-4 border-t">
              {showRejectForm && (
                <div className="space-y-2">
                  <textarea
                    className="w-full min-h-[80px] rounded-md border border-input bg-transparent px-2.5 py-2 text-sm shadow-xs outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30"
                    placeholder="Explain what the entity needs to fix..."
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                  />
                </div>
              )}

              <div className="flex gap-4">
                <Button
                  onClick={handleApprove}
                  disabled={isDeciding}
                  className="bg-emerald-600 hover:bg-emerald-700"
                >
                  <Check className="mr-2 h-4 w-4" aria-hidden="true" /> Approve & Generate Dashboard
                </Button>
                {showRejectForm ? (
                  <Button onClick={handleReject} disabled={isDeciding} variant="destructive">
                    <X className="mr-2 h-4 w-4" aria-hidden="true" /> Confirm Reject
                  </Button>
                ) : (
                  <Button onClick={() => setShowRejectForm(true)} variant="destructive">
                    <X className="mr-2 h-4 w-4" aria-hidden="true" /> Reject APP
                  </Button>
                )}
              </div>
            </div>
          )}

          {error && (
            <p role="alert" className="text-sm text-destructive">
              {error}
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
