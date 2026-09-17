import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="lg:col-span-2">
        <Skeleton className="h-96 w-full" />
      </div>
      <Skeleton className="h-56 w-full" />
    </div>
  );
}
