import { describe, expect, it } from "vitest";
import { kpiSubmissionSchema } from "@/lib/validation/kpiSubmission";

describe("kpiSubmissionSchema", () => {
  it("accepts a valid submission", () => {
    const result = kpiSubmissionSchema.safeParse({
      jobsCreated: "12",
      budgetSpent: "150000",
      varianceNotes: "On track",
    });
    expect(result.success).toBe(true);
  });

  it("rejects negative jobs created", () => {
    const result = kpiSubmissionSchema.safeParse({ jobsCreated: "-1", budgetSpent: "0" });
    expect(result.success).toBe(false);
  });

  it("rejects non-numeric input", () => {
    const result = kpiSubmissionSchema.safeParse({ jobsCreated: "abc", budgetSpent: "0" });
    expect(result.success).toBe(false);
  });

  it("allows variance notes to be omitted", () => {
    const result = kpiSubmissionSchema.safeParse({ jobsCreated: "5", budgetSpent: "100" });
    expect(result.success).toBe(true);
  });
});
