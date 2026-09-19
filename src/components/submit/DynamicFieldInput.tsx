import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { FieldDef } from "@/lib/types/schema";

const inputBaseClasses =
  "w-full min-w-0 rounded-md border border-input bg-transparent px-2.5 py-1 text-base shadow-xs outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 md:text-sm dark:bg-input/30";

const NATIVE_INPUT_TYPES: Record<string, string> = {
  text: "text",
  email: "email",
  tel: "tel",
  "za-id": "text",
  passport: "text",
  date: "date",
  currency: "number",
};

/** Renders a single form control for a KPI form schema field, keyed by
 * `field.id` so the submitting form's FormData carries the schema's own
 * field ids straight through as the KPI's `formValues`. */
export function DynamicFieldInput({ field }: { field: FieldDef }) {
  const required = Boolean(field.validation.required);

  return (
    <div className="space-y-2">
      <Label htmlFor={field.id}>
        {field.label}
        {required && <span className="text-destructive ml-0.5">*</span>}
      </Label>

      {field.type === "textarea" ? (
        <textarea
          id={field.id}
          name={field.id}
          required={required}
          className={`min-h-[80px] py-2 ${inputBaseClasses}`}
        />
      ) : field.type === "select" ? (
        <select id={field.id} name={field.id} required={required} className={`h-9 ${inputBaseClasses}`}>
          <option value="">Select...</option>
          {field.options?.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      ) : field.type === "radio" ? (
        <div className="flex flex-wrap gap-4 pt-1">
          {field.options?.map((opt) => (
            <label key={opt.value} className="flex items-center gap-2 text-sm cursor-pointer">
              <input type="radio" name={field.id} value={opt.value} required={required} className="h-4 w-4 accent-primary" />
              {opt.label}
            </label>
          ))}
        </div>
      ) : field.type === "checkbox" ? (
        <label className="flex items-center gap-2 text-sm cursor-pointer">
          <input type="checkbox" id={field.id} name={field.id} className="h-4 w-4 rounded border-input accent-primary" />
          {field.helperText || "Yes"}
        </label>
      ) : (
        <Input
          id={field.id}
          name={field.id}
          type={NATIVE_INPUT_TYPES[field.type] ?? "text"}
          required={required}
        />
      )}

      {field.helperText && field.type !== "checkbox" && (
        <p className="text-xs text-muted-foreground">{field.helperText}</p>
      )}
    </div>
  );
}
