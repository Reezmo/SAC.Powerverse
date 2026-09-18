"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getIndicatorDetails, submitQuarterProof } from "@/lib/api/indicators";
import { Check, UploadCloud } from "lucide-react";
import type { AppIndicatorQuarter } from "@/lib/types/schema";

export function ProofUploadDrawer({ indicatorId, taskName }: { indicatorId: string; taskName: string }) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoadingQuarters, setIsLoadingQuarters] = useState(false);
  const [quarters, setQuarters] = useState<AppIndicatorQuarter[]>([]);
  const [selectedQuarter, setSelectedQuarter] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    setIsLoadingQuarters(true);
    setError(null);
    getIndicatorDetails(indicatorId)
      .then((detail) => {
        const openQuarters = (detail?.quarters ?? []).filter((q) => q.status !== "completed");
        setQuarters(openQuarters);
        setSelectedQuarter(openQuarters[0]?.quarter ?? null);
      })
      .catch(() => setError("Could not load quarters for this task."))
      .finally(() => setIsLoadingQuarters(false));
  }, [isOpen, indicatorId]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (selectedQuarter === null) {
      setError("Select which quarter this proof is for.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    const formData = new FormData(e.currentTarget);

    try {
      await submitQuarterProof(indicatorId, selectedQuarter, formData);
      setIsSuccess(true);
      router.refresh();
      setTimeout(() => {
        setIsOpen(false);
        setIsSuccess(false);
      }, 2000);
    } catch {
      setError("Failed to submit proof. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (!isOpen) {
    return (
      <Button variant="outline" size="sm" onClick={() => setIsOpen(true)}>
        Upload Proof
      </Button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-xl bg-card p-6 shadow-lg">
        <h3 className="mb-2 text-lg font-bold">Submit Proof of Completion</h3>
        <p className="mb-4 text-sm text-muted-foreground">{taskName}</p>

        {isSuccess ? (
          <div className="flex items-center gap-2 text-emerald-600">
            <Check className="h-5 w-5" aria-hidden="true" />
            <p>Proof submitted successfully!</p>
          </div>
        ) : isLoadingQuarters ? (
          <p className="text-sm text-muted-foreground">Loading quarters...</p>
        ) : quarters.length === 0 ? (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              All quarters for this task are already complete.
            </p>
            <div className="flex justify-end">
              <Button type="button" variant="ghost" onClick={() => setIsOpen(false)}>
                Close
              </Button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 text-left">
            <div className="space-y-2">
              <Label htmlFor="quarter">Quarter</Label>
              <select
                id="quarter"
                className="h-9 w-full rounded-md border border-input bg-transparent px-2.5 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30"
                value={selectedQuarter ?? ""}
                onChange={(e) => setSelectedQuarter(Number(e.target.value))}
              >
                {quarters.map((q) => (
                  <option key={q.quarter} value={q.quarter}>
                    Q{q.quarter}
                    {q.quarterTarget != null ? ` — target ${q.quarterTarget}` : ""}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="file">Supporting Document</Label>
              <Input id="file" name="file" type="file" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes">Variance Notes</Label>
              <Input id="notes" name="notes" placeholder="Optional notes about this task..." />
            </div>
            {error && (
              <p role="alert" className="text-sm text-destructive">
                {error}
              </p>
            )}
            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="ghost" onClick={() => setIsOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                <UploadCloud className="mr-2 h-4 w-4" aria-hidden="true" />
                {isSubmitting ? "Uploading..." : "Submit Proof"}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
