"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UploadCloud } from "lucide-react";
import { submitQuarterProof } from "@/lib/api/indicators";

export function QuarterProofForm({ indicatorId, quarter }: { indicatorId: string; quarter: number }) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const formData = new FormData(e.currentTarget);

    try {
      await submitQuarterProof(indicatorId, quarter, formData);
      setIsSuccess(true);
      router.refresh();
    } catch {
      setError("Failed to submit proof. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isSuccess) {
    return (
      <p className="text-sm font-medium text-emerald-600">
        Proof submitted for Q{quarter} — this quarter is now marked complete.
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor={`file-q${quarter}`}>Supporting Document</Label>
        <Input id={`file-q${quarter}`} name="file" type="file" required />
      </div>
      <div className="space-y-2">
        <Label htmlFor={`notes-q${quarter}`}>Variance Notes</Label>
        <Input id={`notes-q${quarter}`} name="notes" placeholder="Optional notes about this quarter..." />
      </div>
      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}
      <Button type="submit" size="sm" disabled={isSubmitting}>
        <UploadCloud className="mr-2 h-4 w-4" aria-hidden="true" />
        {isSubmitting ? "Uploading..." : `Submit Proof for Q${quarter}`}
      </Button>
    </form>
  );
}
