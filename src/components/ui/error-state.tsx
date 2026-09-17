"use client";

import { Button } from "@/components/ui/button";
import { AlertOctagon } from "lucide-react";

export function ErrorState({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 rounded-xl border border-dashed p-12 text-center">
      <AlertOctagon className="h-8 w-8 text-destructive" aria-hidden="true" />
      <div>
        <h2 className="font-semibold">Something went wrong</h2>
        <p className="text-sm text-muted-foreground mt-1">
          {error.message || "An unexpected error occurred while loading this page."}
        </p>
      </div>
      <Button onClick={reset} variant="outline">
        Try again
      </Button>
    </div>
  );
}
