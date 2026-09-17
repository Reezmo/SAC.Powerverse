import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 text-center px-4">
      <p className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">404</p>
      <h1 className="text-2xl font-bold">We couldn&apos;t find that page</h1>
      <p className="text-sm text-muted-foreground max-w-sm">
        The entity, submission, or page you&apos;re looking for doesn&apos;t exist or may have moved.
      </p>
      <Button asChild>
        <Link href="/">Back to safety</Link>
      </Button>
    </div>
  );
}
