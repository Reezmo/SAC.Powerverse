"use client";

import { useEffect, useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Edit2, Trash2, Check } from "lucide-react";
import { FieldEditor } from "@/components/submit/FieldEditor";
import { loadLatestKpiFormSchema, saveKpiFormSchema } from "@/lib/api/kpi-form-actions";
import type { FieldDef } from "@/lib/types/schema";

export default function KPIBuilderPage() {
  const [formName, setFormName] = useState("Default KPI Form");
  const [fields, setFields] = useState<FieldDef[]>([]);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingField, setEditingField] = useState<FieldDef | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, startSaving] = useTransition();
  const [saveError, setSaveError] = useState<string | null>(null);
  const [justSaved, setJustSaved] = useState(false);

  useEffect(() => {
    loadLatestKpiFormSchema()
      .then((existing) => {
        if (existing) {
          setFields(existing.fields);
        }
      })
      .catch(() => {
        // No saved schema yet, or the load failed — start from an empty form
        // rather than blocking the page.
      })
      .finally(() => setIsLoading(false));
  }, []);

  function handleOpenNew() {
    setEditingField(null);
    setIsEditorOpen(true);
  }

  function handleOpenEdit(field: FieldDef) {
    setEditingField(field);
    setIsEditorOpen(true);
  }

  function handleSaveField(savedField: FieldDef) {
    setFields((prev) => {
      const exists = prev.some((f) => f.id === savedField.id);
      if (exists) {
        return prev.map((f) => (f.id === savedField.id ? savedField : f));
      }
      return [...prev, savedField];
    });
    setIsEditorOpen(false);
  }

  function handleDeleteField(fieldId: string) {
    setFields((prev) => prev.filter((f) => f.id !== fieldId));
  }

  function handleSaveForm() {
    setSaveError(null);
    setJustSaved(false);
    startSaving(async () => {
      try {
        await saveKpiFormSchema(formName, fields);
        setJustSaved(true);
        setTimeout(() => setJustSaved(false), 2500);
      } catch {
        setSaveError("Failed to save the form. Please try again.");
      }
    });
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <div className="flex-1 space-y-2">
          <h2 className="text-2xl font-bold tracking-tight">KPI Form Builder</h2>
          <p className="text-sm text-muted-foreground">
            Define the structured data requirements for entity submissions.
          </p>
          <div className="max-w-sm pt-1">
            <Label htmlFor="formName">Form name</Label>
            <Input
              id="formName"
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              className="mt-1"
            />
          </div>
        </div>
        <Button onClick={handleOpenNew}>
          <Plus className="mr-2 h-4 w-4" aria-hidden="true" /> Add Field
        </Button>
      </div>

      {isLoading ? (
        <div className="rounded-xl border border-dashed p-12 text-center text-muted-foreground">
          Loading...
        </div>
      ) : fields.length === 0 ? (
        <div className="rounded-xl border border-dashed p-12 text-center text-muted-foreground">
          No fields added yet. Click &quot;Add Field&quot; to start building your
          form schema.
        </div>
      ) : (
        <div className="space-y-3">
          {fields.map((field) => (
            <Card key={field.id} className="py-0">
              <CardContent className="flex items-center justify-between p-4">
                <div>
                  <p className="font-medium text-sm">
                    {field.label}{" "}
                    <span className="text-muted-foreground font-normal">({field.id})</span>
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Type: {field.type} {field.validation.required && "• Required"}
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="sm" onClick={() => handleOpenEdit(field)}>
                    <Edit2 className="h-4 w-4 mr-2" aria-hidden="true" /> Edit
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteField(field.id)}
                    aria-label={`Remove ${field.label}`}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" aria-hidden="true" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <div className="flex items-center gap-3 pt-2 border-t">
        <Button onClick={handleSaveForm} disabled={isSaving || fields.length === 0} className="mt-4">
          {isSaving ? "Saving..." : "Save Form"}
        </Button>
        {justSaved && (
          <span className="mt-4 flex items-center gap-1 text-sm text-emerald-600">
            <Check className="h-4 w-4" aria-hidden="true" /> Saved
          </span>
        )}
        {saveError && (
          <span role="alert" className="mt-4 text-sm text-destructive">
            {saveError}
          </span>
        )}
      </div>

      {isEditorOpen && (
        <FieldEditor
          key={editingField?.id ?? "new"}
          open={isEditorOpen}
          field={editingField}
          onSave={handleSaveField}
          onClose={() => setIsEditorOpen(false)}
        />
      )}
    </div>
  );
}
