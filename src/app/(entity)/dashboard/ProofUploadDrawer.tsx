// src/app/(entity)/dashboard/ProofUploadDrawer.tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { submitQuarterProof } from "@/lib/api/indicators";
import { Check, UploadCloud } from "lucide-react";

export function ProofUploadDrawer({ indicatorId, taskName }: { indicatorId: string; taskName: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsSubmitting(true);
    
    const formData = new FormData(e.currentTarget);
    // Hardcoded quarter 1 for this example; in a full implementation, you'd select the quarter
    await submitQuarterProof(indicatorId, 1, formData);
    
    setIsSubmitting(false);
    setIsSuccess(true);
    setTimeout(() => {
      setIsOpen(false);
      setIsSuccess(false);
    }, 2000);
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
            <Check className="h-5 w-5" />
            <p>Proof submitted successfully!</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 text-left">
            <div className="space-y-2">
              <Label htmlFor="proofFile">Supporting Document</Label>
              <Input id="proofFile" name="proofFile" type="file" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes">Variance Notes</Label>
              <Input id="notes" name="notes" placeholder="Optional notes about this task..." />
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="ghost" onClick={() => setIsOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                <UploadCloud className="mr-2 h-4 w-4" />
                {isSubmitting ? "Uploading..." : "Submit Proof"}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}