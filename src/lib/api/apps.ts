"use server";

import { apiRequest, USE_MOCK_DATA } from "./client";
import { readSession } from "@/lib/auth/session";
import type { AppSubmission, AppSubmissionIndicator } from "../types/schema";

export async function getAppSubmissions(): Promise<any[]> {
  if (USE_MOCK_DATA) return [];
  const session = await readSession();
  return apiRequest<any[]>("/api/Submissions", session?.token);
}

export async function uploadAppSubmission(
  formData: FormData,
): Promise<AppSubmission> {
  if (USE_MOCK_DATA) {
    const session = await readSession();
    if (session?.entityId === "3") {
      (globalThis as any).__MOCK_BIANCA_UPLOADED = true;
    }

    await new Promise((resolve) => setTimeout(resolve, 800));
    return {
      id: `mock-app-${Date.now()}`,
      entityId: session?.entityId ?? "1",
      fileUrl: "mock://app.pdf",
      uploadedAt: new Date().toISOString(),
      status: "pending_review",
    };
  }
  const session = await readSession();
  try {
    return await apiRequest<AppSubmission>(
      "/api/app-submissions/upload",
      session?.token,
      {
        method: "POST",
        body: formData,
      },
    );
  } catch (err) {
    // TEMP: surface the real failure reason instead of Next.js's redacted
    // production digest, to diagnose a live upload bug. Revert once fixed.
    const detail = err instanceof Error ? err.message : String(err);
    console.error("uploadAppSubmission failed:", detail);
    throw new Error(`DEBUG uploadAppSubmission: ${detail}`);
  }
}

export async function getSubmissionDetails(id: string): Promise<{
  submission: AppSubmission;
  indicators: AppSubmissionIndicator[];
}> {
  if (USE_MOCK_DATA) {
    return { submission: {} as AppSubmission, indicators: [] };
  }
  const session = await readSession();
  const submission = await apiRequest<
    AppSubmission & { indicators: AppSubmissionIndicator[] }
  >(`/api/app-submissions/${id}`, session?.token);
  const { indicators, ...rest } = submission;
  return { submission: rest as AppSubmission, indicators };
}

// ==========================================
// AI EXTRACTION ENGINE
// ==========================================
export async function analyzeSubmission(id: string): Promise<AppSubmission> {
  const apiKey = process.env.AI_API_KEY;

  // 1. THE FALLBACK (Realistic Hackathon Demo Data)
  if (!apiKey) {
    console.warn(
      "⚠️ AI_API_KEY not found. Running mock AI indicator extraction.",
    );
    await new Promise((resolve) => setTimeout(resolve, 2500));

    return {
      id: id,
      status: "ai_processed",
      aiSummary:
        "APP document parsed successfully. Extracted the following Indicator Outcomes:\n\n• Outcome 1: Increased community participation in heritage programmes (Target: 5,000 individuals)\n• Outcome 2: Preservation and restoration of provincial heritage sites (Target: 12 sites)\n• Outcome 3: Job opportunities created through arts initiatives (Target: 450 jobs)\n\nIndicators have been successfully mapped to the overarching DSAC schema and are ready for dashboard tracking.",
    } as AppSubmission;
  }

  // 2. THE REAL AI CALL (Runs once you add the key)
  try {
    const documentText =
      "Simulated text content from the uploaded Annual Performance Plan PDF...";

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content:
              "You are an expert M&E compliance assistant for the Department of Sport, Arts and Culture. Extract the core 'Indicator Outcomes' and their exact Targets from the provided Annual Performance Plan (APP) text. Return the result as a clean, bulleted summary.",
          },
          {
            role: "user",
            content: documentText,
          },
        ],
        temperature: 0.1,
      }),
    });

    if (!response.ok) throw new Error(`AI API failed: ${response.statusText}`);

    const data = await response.json();
    const aiSummaryText = data.choices[0].message.content;

    return {
      id: id,
      status: "ai_processed",
      aiSummary: aiSummaryText,
    } as AppSubmission;
  } catch (error) {
    console.error("AI Extraction Error:", error);
    throw new Error("Failed to process document with AI.");
  }
}

export async function approveSubmission(id: string): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 800));
}

export async function rejectSubmission(
  id: string,
  reason: string,
): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 800));
}
