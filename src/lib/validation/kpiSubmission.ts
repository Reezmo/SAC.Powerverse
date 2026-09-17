import { z } from "zod";

export const kpiSubmissionSchema = z.object({
  jobsCreated: z.coerce
    .number({ error: "Enter a number" })
    .int("Must be a whole number")
    .min(0, "Can't be negative"),
  budgetSpent: z.coerce
    .number({ error: "Enter a number" })
    .min(0, "Can't be negative"),
  varianceNotes: z.string().max(1000, "Keep notes under 1000 characters").optional(),
});

/** Shape after zod parses/coerces the raw form input — what your submit handler receives. */
export type KpiSubmissionFormValues = z.output<typeof kpiSubmissionSchema>;
/** Shape of the raw, pre-coercion form fields — what react-hook-form's `useForm` is typed with. */
export type KpiSubmissionFormInput = z.input<typeof kpiSubmissionSchema>;
