"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { FieldDef, FieldOption, FieldType } from "@/lib/types/schema";

const TYPES: FieldType[] = [
  "text",
  "email",
  "tel",
  "za-id",
  "passport",
  "date",
  "select",
  "radio",
  "checkbox",
  "currency",
  "textarea",
];

const CHOICE_TYPES: FieldType[] = ["select", "radio"];

function optionsToText(options: FieldOption[] | undefined): string {
  return (options ?? [])
    .map((option) => `${option.value}|${option.label}`)
    .join("\n");
}

function textToOptions(text: string): FieldOption[] {
  return text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const separator = line.indexOf("|");
      if (separator === -1) return { value: line, label: line };
      return {
        value: line.slice(0, separator).trim(),
        label: line.slice(separator + 1).trim(),
      };
    });
}

export function FieldEditor({
  open,
  field,
  onSave,
  onClose,
}: {
  open: boolean;
  field: FieldDef | null;
  onSave: (field: FieldDef) => void;
  onClose: () => void;
}) {
  const [draft, setDraft] = useState<FieldDef>(
    field ?? { id: "", type: "text", label: "", validation: {} },
  );
  const [optionText, setOptionText] = useState(() =>
    optionsToText(field?.options),
  );
  const [error, setError] = useState<string | null>(null);

  if (!open) return null;

  const isNew = field === null;
  const needsOptions = CHOICE_TYPES.includes(draft.type);

  function handleSave() {
    if (!draft.label.trim()) {
      setError("Give the field a label");
      return;
    }
    if (!draft.id.trim()) {
      setError("Give the field an id");
      return;
    }
    setError(null);
    const options = needsOptions ? textToOptions(optionText) : undefined;
    onSave({
      ...draft,
      id: draft.id.trim(),
      label: draft.label.trim(),
      options,
    });
  }

  // Common Tailwind classes mapping to your shadcn input.tsx focus/error styles
  const inputBaseClasses =
    "w-full min-w-0 rounded-md border border-input bg-transparent px-2.5 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 md:text-sm dark:bg-input/30";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-lg rounded-xl bg-card p-6 shadow-lg overflow-y-auto max-h-[90vh]">
        <h3 className="mb-6 text-xl font-bold">
          {isNew ? "Add a field" : "Edit field"}
        </h3>

        <div className="space-y-5 text-left">
          <div className="space-y-2">
            <Label htmlFor="fieldLabel">Label</Label>
            <Input
              id="fieldLabel"
              value={draft.label}
              onChange={(e) => setDraft({ ...draft, label: e.target.value })}
              aria-invalid={error === "Give the field a label"}
              placeholder="e.g. Home Language"
            />
            <p className="text-xs text-muted-foreground">
              Shown above the input on the form.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="fieldId">Field id</Label>
            <Input
              id="fieldId"
              value={draft.id}
              onChange={(e) => setDraft({ ...draft, id: e.target.value })}
              disabled={!isNew}
              aria-invalid={error === "Give the field an id"}
              placeholder="e.g. homeLanguage"
            />
            <p className="text-xs text-muted-foreground">
              {isNew ? "A unique key." : "The id cannot be changed."}
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="fieldType">Type</Label>
            <select
              id="fieldType"
              className={`h-9 ${inputBaseClasses}`}
              value={draft.type}
              onChange={(e) =>
                setDraft({ ...draft, type: e.target.value as FieldType })
              }
            >
              {TYPES.map((type) => (
                <option
                  key={type}
                  value={type}
                  className="bg-background text-foreground"
                >
                  {type}
                </option>
              ))}
            </select>
          </div>

          {needsOptions && (
            <div className="space-y-2">
              <Label htmlFor="fieldOptions">Options</Label>
              <textarea
                id="fieldOptions"
                className={`min-h-[80px] py-2 ${inputBaseClasses}`}
                value={optionText}
                onChange={(e) => setOptionText(e.target.value)}
                rows={4}
              />
              <p className="text-xs text-muted-foreground">
                One option per line, written as <code>value|Label</code>. At
                least two are needed.
                <br />
                For example: <code>za-id|South African ID</code>
              </p>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="fieldHelperText">Helper text</Label>
            <Input
              id="fieldHelperText"
              value={draft.helperText ?? ""}
              onChange={(e) =>
                setDraft({ ...draft, helperText: e.target.value })
              }
            />
            <p className="text-xs text-muted-foreground">
              Optional guidance shown below the input.
            </p>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="fieldRequired"
              className="h-4 w-4 rounded border-input accent-primary"
              checked={Boolean(draft.validation.required)}
              onChange={(e) =>
                setDraft({
                  ...draft,
                  validation: {
                    ...draft.validation,
                    required: e.target.checked,
                  },
                })
              }
            />
            <Label
              htmlFor="fieldRequired"
              className="font-normal cursor-pointer"
            >
              Required field
            </Label>
          </div>

          {error && (
            <p
              role="alert"
              className="text-sm font-medium text-destructive mt-2"
            >
              {error}
            </p>
          )}
        </div>

        <div className="flex justify-end gap-2 pt-6 mt-6 border-t">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="button" onClick={handleSave}>
            {isNew ? "Add field" : "Save changes"}
          </Button>
        </div>
      </div>
    </div>
  );
}
