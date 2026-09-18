"use server";

import { API_BASE_URL, USE_MOCK_DATA, ApiError } from "./client";
import { readSession } from "@/lib/auth/session";
import { inferDocType, type UploadDocumentResult } from "./documents";

/** Server action wrapper around the upload call, so the client-side
 * DocumentUploader component can trigger a real upload without needing
 * access to the httpOnly session cookie itself. */
export async function uploadDocumentAction(formData: FormData): Promise<UploadDocumentResult> {
  const file = formData.get("file");
  const entityId = formData.get("entityId");

  if (!(file instanceof File) || typeof entityId !== "string") {
    throw new Error("uploadDocumentAction requires a 'file' and an 'entityId' field.");
  }

  const docType = inferDocType(file.name);

  if (USE_MOCK_DATA) {
    await new Promise((resolve) => setTimeout(resolve, 500));
    return { id: `mock-${Date.now()}`, fileUrl: `mock://${file.name}`, version: 1 };
  }

  const session = await readSession();
  const upload = new FormData();
  upload.append("file", file);
  upload.append("entityId", entityId);
  upload.append("docType", docType);

  const response = await fetch(`${API_BASE_URL}/api/documents/upload`, {
    method: "POST",
    headers: session?.token ? { Authorization: `Bearer ${session.token}` } : undefined,
    body: upload,
  });

  if (!response.ok) {
    throw new ApiError(`Upload failed with status ${response.status}`, response.status);
  }

  return (await response.json()) as UploadDocumentResult;
}
