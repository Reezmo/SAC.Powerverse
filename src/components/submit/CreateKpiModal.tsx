"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Check } from "lucide-react";
import { sendKpiAction, getEntitiesForDropdown } from "@/lib/api/kpi-actions";
import { loadLatestKpiFormSchema } from "@/lib/api/kpi-form-actions";
import { DynamicFieldInput } from "./DynamicFieldInput";
import type { FieldDef } from "@/lib/types/schema";

export function CreateKpiModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const [entities, setEntities] = useState<{ id: string; name: string }[]>([]);
  const [schemaFields, setSchemaFields] = useState<FieldDef[]>([]);
  const [isLoadingSchema, setIsLoadingSchema] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      getEntitiesForDropdown().then(setEntities).catch(console.error);
      setIsLoadingSchema(true);
      loadLatestKpiFormSchema()
        .then((schema) => setSchemaFields(schema?.fields ?? []))
        .catch(() => setSchemaFields([]))
        .finally(() => setIsLoadingSchema(false));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const formData = new FormData(e.currentTarget);

    // Build formValues from whatever the saved KPI form schema defines,
    // rather than a fixed set of checkboxes — this makes the schema built
    // in the KPI Form Builder (/kpi-builder) the actual reporting
    // requirements sent to the entity for this KPI.
    const formConfig: Record<string, string | boolean> = {};
    for (const field of schemaFields) {
      formConfig[field.id] = field.type === "checkbox" ? formData.get(field.id) === "on" : String(formData.get(field.id) ?? "");
    }

    const payload = {
      entityId: formData.get("entityId") as string,
      kpiName: formData.get("kpiName") as string,
      unit: formData.get("unit") as string,
      fiveYearTarget: Number(formData.get("fiveYearTarget")),
      formValues: JSON.stringify(formConfig),
    };

    try {
      await sendKpiAction(payload);

      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        onClose();
      }, 2000);
    } catch (err) {
      setError("Failed to send KPI to entity");
    } finally {
      setIsSubmitting(false);
    }
  }

  const inputBaseClasses =
    "w-full min-w-0 rounded-md border border-input bg-transparent px-2.5 py-1 text-base shadow-xs outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 md:text-sm dark:bg-input/30";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-lg rounded-xl bg-card p-6 shadow-lg overflow-y-auto max-h-[90vh]">
        <h3 className="mb-6 text-xl font-bold">Assign KPI to Entity</h3>

        {isSuccess ? (
          <div className="flex flex-col items-center justify-center py-8 text-emerald-600 gap-3">
            <div className="h-12 w-12 rounded-full bg-emerald-100 flex items-center justify-center">
              <Check className="h-6 w-6" aria-hidden="true" />
            </div>
            <p className="font-medium">KPI assigned and sent successfully!</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 text-left">
            <div className="space-y-2">
              <Label htmlFor="entityId">Target Entity</Label>
              <select
                id="entityId"
                name="entityId"
                className={`h-9 ${inputBaseClasses}`}
                required
              >
                <option value="">Select an entity...</option>
                {entities.map((entity) => (
                  <option
                    key={entity.id}
                    value={entity.id}
                    className="bg-background text-foreground"
                  >
                    {entity.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="kpiName">KPI Name</Label>
              <Input
                id="kpiName"
                name="kpiName"
                placeholder="e.g. Heritage Sites Restored"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="unit">Unit of Measure</Label>
                <Input
                  id="unit"
                  name="unit"
                  placeholder="e.g. Count, ZAR, %"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="fiveYearTarget">5-Year Target</Label>
                <Input
                  id="fiveYearTarget"
                  name="fiveYearTarget"
                  type="number"
                  placeholder="e.g. 50"
                  required
                />
              </div>
            </div>

            {/* Reporting requirements come from the schema built in the KPI
                Form Builder, so what Sipho designs there is exactly what
                the entity officer fills in for this KPI. */}
            <div className="space-y-3 pt-2 border-t mt-4">
              <Label>Reporting Requirements</Label>
              {isLoadingSchema ? (
                <p className="text-xs text-muted-foreground">Loading form schema...</p>
              ) : schemaFields.length === 0 ? (
                <p className="text-xs text-muted-foreground">
                  No KPI form schema has been built yet. Visit the KPI Form Builder to
                  define what entities must report for this KPI, or send it now with
                  no additional reporting requirements.
                </p>
              ) : (
                <div className="space-y-4 bg-muted/20 p-4 rounded-lg border">
                  {schemaFields.map((field) => (
                    <DynamicFieldInput key={field.id} field={field} />
                  ))}
                </div>
              )}
            </div>

            {error && (
              <p
                role="alert"
                className="text-sm font-medium text-destructive pt-2"
              >
                {error}
              </p>
            )}

            <div className="flex justify-end gap-2 pt-4 border-t mt-6">
              <Button
                type="button"
                variant="ghost"
                onClick={onClose}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Sending..." : "Send KPI"}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
