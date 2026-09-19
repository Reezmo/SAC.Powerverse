"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { listAppSubmissions } from "@/lib/api/apps";
import { Badge } from "@/components/ui/badge";
import { BrainCircuit, FileText, ArrowRight } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

function SubmissionCard({ submission }: { submission: any }) {
  const status = submission.status || "pending_review";

  return (
    <Card className="border-l-4 border-l-blue-500 hover:border-l-blue-600 transition-colors">
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div>
            <CardTitle className="flex items-center gap-2 mb-1">
              <FileText className="h-5 w-5 text-blue-500" />
              {submission.entityName ? `${submission.entityName} - APP` : "Annual Performance Plan Submission"}
            </CardTitle>
            <CardDescription>
              Entity ID: {submission.entityId} • Submitted:{" "}
              {new Date(submission.uploadedAt || submission.createdAt || Date.now()).toLocaleDateString()}
            </CardDescription>
          </div>
          <Badge variant={status === "approved" ? "default" : "secondary"}>
            {status.replace("_", " ").toUpperCase()}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="pt-2 border-t mt-4">
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground flex items-center gap-2">
            {(status === "pending_review" || status === "ai_failed") && (
              <><BrainCircuit className="h-4 w-4" /> Ready for AI Extraction</>
            )}
            {status === "ai_processed" && (
              <><BrainCircuit className="h-4 w-4 text-emerald-500" /> Awaiting Human Approval</>
            )}
            {(status === "approved" || status === "rejected") && (
              <span>Decision Recorded</span>
            )}
          </div>
          <Button asChild variant={status === "ai_processed" || status === "pending_review" ? "default" : "outline"}>
            <Link href={`/submissions/${submission.id}`}>
              Review Submission <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default function SubmissionsInboxPage() {
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    listAppSubmissions()
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
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-40 w-full" />
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