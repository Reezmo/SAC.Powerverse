"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Building2 } from "lucide-react";

interface EntityOption {
  id: string;
  name: string;
}

export function EntitySwitcher({
  entities,
  activeEntityId,
}: {
  entities: EntityOption[];
  activeEntityId: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const newEntityId = e.target.value;
    const params = new URLSearchParams(searchParams.toString());
    params.set("entityId", newEntityId);
    params.delete("page"); // Reset pagination when switching entity
    router.push(`/dashboard?${params.toString()}`);
  }

  return (
    <div className="flex items-center gap-2">
      <Building2 className="h-4 w-4 text-muted-foreground shrink-0" />
      <select
        defaultValue={activeEntityId}
        className="h-9 rounded-md border border-input bg-background px-3 text-sm shadow-xs outline-none focus:ring-2 focus:ring-primary cursor-pointer"
        onChange={handleChange}
      >
        {entities.map((entity) => (
          <option key={entity.id} value={entity.id}>
            {entity.name}
          </option>
        ))}
      </select>
    </div>
  );
}