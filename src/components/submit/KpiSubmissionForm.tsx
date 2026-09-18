"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { CheckCircle2 } from "lucide-react";
import { kpiSubmissionSchema, type KpiSubmissionFormInput, type KpiSubmissionFormValues } from "@/lib/validation/kpiSubmission";
import { submitKpiReport } from "@/lib/api/submissions-actions";

export function KpiSubmissionForm() {
  const [submitState, setSubmitState] = useState<"idle" | "success" | "error">("idle");

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<KpiSubmissionFormInput, unknown, KpiSubmissionFormValues>({
    resolver: zodResolver(kpiSubmissionSchema),
    defaultValues: { jobsCreated: "" as unknown as number, budgetSpent: "" as unknown as number, varianceNotes: "" },
  });

  async function onSubmit(values: KpiSubmissionFormValues) {
    setSubmitState("idle");
    try {
      await submitKpiReport(values);
      setSubmitState("success");
      reset();
    } catch {
      setSubmitState("error");
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <div className="grid gap-2">
        <Label htmlFor="jobs">Job Creation (Actual)</Label>
        <Input
          id="jobs"
          type="number"
          placeholder="Enter number of jobs created"
          aria-invalid={!!errors.jobsCreated}
          aria-describedby={errors.jobsCreated ? "jobs-error" : undefined}
          {...register("jobsCreated")}
        />
        {errors.jobsCreated && (
          <p id="jobs-error" role="alert" className="text-xs text-destructive">
            {errors.jobsCreated.message}
          </p>
        )}
      </div>

      <div className="grid gap-2">
        <Label htmlFor="budget">Budget Spent (ZAR)</Label>
        <Input
          id="budget"
          type="number"
          placeholder="e.g. 1500000"
          aria-invalid={!!errors.budgetSpent}
          aria-describedby={errors.budgetSpent ? "budget-error" : undefined}
          {...register("budgetSpent")}
        />
        {errors.budgetSpent && (
          <p id="budget-error" role="alert" className="text-xs text-destructive">
            {errors.budgetSpent.message}
          </p>
        )}
      </div>

      <div className="grid gap-2">
        <Label htmlFor="notes">Variance Notes</Label>
        <Input
          id="notes"
          placeholder="Explain any deviations from target"
          aria-invalid={!!errors.varianceNotes}
          aria-describedby={errors.varianceNotes ? "notes-error" : undefined}
          {...register("varianceNotes")}
        />
        {errors.varianceNotes && (
          <p id="notes-error" role="alert" className="text-xs text-destructive">
            {errors.varianceNotes.message}
          </p>
        )}
      </div>

      <Button type="submit" className="w-full mt-4" disabled={isSubmitting}>
        {isSubmitting ? "Saving..." : "Save KPI Submission"}
      </Button>

      <div aria-live="polite">
        {submitState === "success" && (
          <p className="flex items-center gap-2 text-sm text-emerald-600">
            <CheckCircle2 className="h-4 w-4" aria-hidden="true" /> Submission saved.
          </p>
        )}
        {submitState === "error" && (
          <p role="alert" className="text-sm text-destructive">
            Something went wrong saving your submission. Please try again.
          </p>
        )}
      </div>
    </form>
  );
}
